"""The Human Manual, daily: one "What if...?" and one food journey.

    python run.py whatif            build and post the next what-if
    python run.py food              build and post the next food journey
    python run.py whatif --test     build only; post nothing, move nothing on
    python run.py nightly           build BOTH of the coming Nepal day's videos and
                                    schedule them on YouTube for 08:00 and 18:00
    python run.py status

Exit codes: 0 posted (or already posted today), 2 held (no login),
3 failed. A topic that fails twice is skipped. Each slot has backup triggers
in the cloud, so a second run that finds today's video up just stops.
"""
import json
import shutil
import subprocess
import sys
import time
import traceback
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
STATE = ROOT / "data" / "state.json"

# order: the formats that broke out first (vidIQ outliers, 2026-09-26)
WHATIF_ORDER = ["flash", "light", "no-sleep", "space", "ocean", "mars", "black-hole", "water"]
FOOD_ORDER = ["banana", "cucumber", "egg", "kiwi", "apple", "watermelon"]


def load_state():
    if STATE.exists():
        return json.loads(STATE.read_text(encoding="utf-8"))
    return {"whatif_next": 0, "food_next": 0, "history": []}


def save_state(s):
    STATE.parent.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps(s, indent=2, ensure_ascii=False), encoding="utf-8")


def verify(path):
    p = Path(path)
    if not p.exists() or p.stat().st_size < 500_000:
        return "file missing or too small"
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type:format=duration",
                        "-of", "json", str(p)], capture_output=True, text=True)
    info = json.loads(r.stdout or "{}")
    kinds = {s.get("codec_type") for s in info.get("streams", [])}
    secs = float(info.get("format", {}).get("duration", 0))
    if not {"video", "audio"} <= kinds:
        return f"streams present: {sorted(kinds)}"
    if not 10 <= secs <= 75:
        return f"duration {secs:.1f}s outside 10-75s"
    return None


def cleanup(days=3):
    cutoff = time.time() - days * 86400
    for d in (ROOT / "jobs").glob("*"):
        if d.is_dir() and d.stat().st_mtime < cutoff:
            shutil.rmtree(d, ignore_errors=True)


def build(kind, key):
    if kind == "whatif":
        import whatif
        return whatif.make(key)
    import body
    return body.make(key)


NEPAL = timedelta(hours=5, minutes=45)
PUBLISH = {"whatif": (8, 0), "food": (18, 0)}             # Nepal time, exact


def run(kind, test=False, publish_at=None, day=None):
    import upload_hm
    order = WHATIF_ORDER if kind == "whatif" else FOOD_ORDER
    s = load_state()
    nxt = f"{kind}_next"
    i = s.get(nxt, 0) % len(order)
    key = order[i]
    if test:
        meta = build(kind, key)
        problem = verify(meta["file"])
        print(f"[test  ] {meta['title']} -> {meta['file']}: {problem or 'looks fine'}")
        return 3 if problem else 0
    if not upload_hm.ready():
        print("[hold  ] no login yet - nothing built, the topic waits")
        return 2
    today = datetime.now().strftime("%Y-%m-%d")
    if any(h.get("kind") == kind and h.get("youtube_id") and
           (h.get("for_day") == day if day else h.get("date", "").startswith(today))
           for h in s["history"]):
        print(f"[skip  ] {kind} for {day or today} is already up or scheduled")
        return 0
    fails = s.setdefault("fails", {})
    fkey = f"{kind}:{key}"
    entry = {"date": datetime.now().strftime("%Y-%m-%d %H:%M"), "kind": kind, "title": key}
    if day:
        entry["for_day"] = day

    def failed(why):
        fails[fkey] = fails.get(fkey, 0) + 1
        entry["error"] = why
        s["history"].append(entry)
        if fails[fkey] >= 2:
            s[nxt] = i + 1
            print(f"[skip  ] {kind} '{key}' failed twice - moving on")
        save_state(s)
        print(f"[FAIL  ] {why}")
        return 3

    try:
        meta = build(kind, key)
    except (Exception, SystemExit) as e:
        traceback.print_exc()
        return failed(f"build: {type(e).__name__}: {str(e)[:160]}")
    entry.update(title=meta["title"], file=meta["file"])
    problem = verify(meta["file"])
    if problem:
        return failed(f"check: {problem}")
    try:
        entry["youtube_id"] = upload_hm.upload(meta["file"], meta, "public", publish_at=publish_at)
        if publish_at:
            entry["publish_at"] = publish_at.strftime("%Y-%m-%d %H:%M UTC")
    except Exception as e:
        return failed(f"upload: {type(e).__name__}: {str(e)[:160]}")
    fails.pop(fkey, None)
    s[nxt] = i + 1
    s["history"].append(entry)
    save_state(s)
    cleanup()
    return 0


def nightly():
    """Both videos for the Nepal day now starting, scheduled to the minute."""
    now = datetime.now(timezone.utc)
    day = (now + NEPAL).date()
    worst = 0
    for kind in ("whatif", "food"):
        h, m = PUBLISH[kind]
        at = datetime(day.year, day.month, day.day, h, m, tzinfo=timezone.utc) - NEPAL
        print(f"=== {kind} for {day} at {h:02d}:{m:02d} Nepal")
        worst = max(worst, run(kind, publish_at=at, day=day.isoformat()))
    return worst


def status():
    s = load_state()
    print(f"next what-if : {WHATIF_ORDER[s.get('whatif_next', 0) % len(WHATIF_ORDER)]}")
    print(f"next food    : {FOOD_ORDER[s.get('food_next', 0) % len(FOOD_ORDER)]}")
    for h in s["history"][-6:]:
        print(f"  {h['date']}  {h['kind']:6}  {h.get('youtube_id') or h.get('error', '?'):14}  {h['title']}")


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    what = sys.argv[1] if len(sys.argv) > 1 else "status"
    if what == "status":
        status()
        sys.exit(0)
    if what == "nightly":
        sys.exit(nightly())
    if what not in ("whatif", "food"):
        sys.exit("usage: python run.py whatif|food|nightly|status [--test]")
    sys.exit(run(what, test="--test" in sys.argv))
