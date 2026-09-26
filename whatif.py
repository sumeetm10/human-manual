"""Build one "What if...?" Short for The Human Manual.

    python whatif.py flash         build into out/
    python whatif.py --list

Lines, numbers and scenes come from whatifs.py (written by hand); this only
turns them into a video: acted voice, WhatIf render, music, metadata.
"""
import argparse
import hashlib
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
import mix  # noqa: E402
import narrate  # noqa: E402
import seo  # noqa: E402
from whatifs import WHATIFS  # noqa: E402

REMOTION = ROOT / "remotion"
JOBS = ROOT / "jobs"
OUT = ROOT / "out"
CTA = ["Subscribe for more what ifs.", "Which what if next? Subscribe and tell me.",
       "Subscribe to find out what your body can survive."]
KIND = {"hook": "question", "fact": "reveal"}


def render(comp, props_path, out_path):
    r = subprocess.run(["node", "scripts/render.mjs", comp, str(props_path), str(out_path)],
                       cwd=REMOTION, capture_output=True, text=True)
    if r.returncode != 0 or not Path(out_path).exists():
        raise RuntimeError(f"render failed: {(r.stderr or r.stdout)[-600:]}")


def make(key, date=None):
    w = WHATIFS[key]
    date = date or datetime.now().strftime("%Y-%m-%d")
    job = JOBS / f"{date}-whatif-{key}"
    job.mkdir(parents=True, exist_ok=True)
    closing = CTA[int(hashlib.md5(key.encode()).hexdigest(), 16) % len(CTA)]
    lines = [text for _, _, text in w["beats"]] + [closing]
    beats = [dict(opts, scene=scene, line=i) for i, (scene, opts, _) in enumerate(w["beats"])]
    beats.append({"scene": "cta", "line": len(lines) - 1})
    for i, l in enumerate(lines, 1):
        print(f"      {i:2d}. {l}")
    kinds = [KIND.get(scene, "list") for scene, _, _ in w["beats"]] + ["cta"]
    vo, voice = narrate.narrate(lines, kinds, job, style="whatif")
    secs = round(vo[-1]["end"] + 1.0, 2)
    props = {"title": w["title"], "emoji": w["emoji"], "vo": vo, "beats": beats,
             "cta": {"fromLine": len(lines) - 1, "text": "for more what ifs"},
             "durationInSeconds": secs}
    props_path = job / "props.json"
    props_path.write_text(json.dumps(props, ensure_ascii=False), encoding="utf-8")
    print(f"[render] {secs:.1f}s")
    silent = job / "silent.mp4"
    render("WhatIf", props_path, silent)

    import score
    bed = job / "score.wav"
    score.build_score(bed, secs + 0.5, tone="curious", seed=len(key) + 7)
    OUT.mkdir(exist_ok=True)
    final = OUT / f"{date}-whatif-{key}.mp4"
    mix.mix(silent, voice, bed, final, bed_db=-9)

    title = w["title"].title().replace("'S", "'s") + f" {w['emoji']}"
    found = seo.suggestions(w["title"].lower().rstrip("?")[:40])
    meta = {
        "kind": "whatif", "file": str(final), "slug": key, "date": date, "title": title[:100],
        "description": (f"{w['title']}\n\n" + "\n".join(f"- {l}" for l in lines[1:-1])
                        + "\n\nWhat should we test on the human body next? Tell me in the comments."
                        "\n\n#whatif #humanbody #science #shorts"),
        "tags": list(dict.fromkeys(w["tags"] + [s for s in found][:4]
                                   + ["what if", "human body", "science facts", "shorts"])),
        "lines": lines,
    }
    (job / "meta.json").write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[done  ] {final}  ({mix.duration(final):.1f}s)")
    return meta


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser()
    ap.add_argument("key", nargs="?", choices=list(WHATIFS))
    ap.add_argument("--list", action="store_true")
    a = ap.parse_args()
    if a.list or not a.key:
        print("\n".join(WHATIFS))
    else:
        make(a.key)
