"""The Human Manual - "What happens inside your body when you eat X?"

    python body.py banana            build one video into out/
    python body.py --list            the foods it can make

The format that breaks out in this niche (vidIQ outliers, 2026-09-26): a food's
journey through the body, 20-40 s - "...when you eat a cherry" 6.6M views on a
4,100-subscriber channel. Here the journey is drawn in code (Remotion,
BodyJourney.tsx), like the Atlas On Foot walks.

A health channel cannot guess. Every line and number below is written by hand
from standard sources - USDA FoodData Central for nutrients, Mayo Clinic's
digestion timeline (6-8 hours through stomach and small intestine, about 36
hours through the colon) - and no model writes or changes them. Numbers are
rounded and said with "about".
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

REMOTION = ROOT / "remotion"
JOBS = ROOT / "jobs"
OUT = ROOT / "out"

# The journey is the same for every food; the stops' timing follows Mayo Clinic.
TIMES = {"mouth": "0 SEC", "esophagus": "10 SEC", "small": "6 HOURS", "large": "1-2 DAYS"}
LABELS = {"mouth": "MOUTH", "esophagus": "ESOPHAGUS", "stomach": "STOMACH",
          "small": "SMALL INTESTINE", "large": "LARGE INTESTINE"}

FOODS = {
    "banana": {
        "emoji": "\U0001F34C", "article": "a banana", "bolus": "#f2cf5b", "stomach_time": "1 HOUR",
        "lines": {
            "hook": "What actually happens inside your body when you eat a banana?",
            "mouth": "Your teeth mash it, and saliva starts breaking down its starch.",
            "esophagus": "Muscles squeeze it down to your stomach in under 10 seconds.",
            "stomach": "Stomach acid churns it into a thick paste in about an hour.",
            "small": "Around 6 hours in, its sugars and potassium pass into your blood.",
            "large": "Its fiber can spend a day or more in your gut, feeding trillions of bacteria.",
            "payoff": "And one banana gives you about 420 milligrams of potassium.",
        },
        "fact": {"big": "420 mg", "small": "potassium in one banana"},   # USDA: 422 mg, medium
        "tags": ["banana", "banana benefits", "potassium", "eating banana"],
    },
    "apple": {
        "emoji": "\U0001F34E", "article": "an apple", "bolus": "#e8c56a", "stomach_time": "1 HOUR",
        "lines": {
            "hook": "What actually happens inside your body when you eat an apple?",
            "mouth": "Crunch. Your teeth shred it, and saliva coats every piece.",
            "esophagus": "Muscles squeeze it down to your stomach in under 10 seconds.",
            "stomach": "Stomach acid churns it into a thick paste in about an hour.",
            "small": "Around 6 hours in, its natural sugars pass into your blood.",
            "large": "Its fiber reaches your large intestine, where gut bacteria feast on it.",
            "payoff": "One apple with its skin has about 4 grams of fiber.",
        },
        "fact": {"big": "4 g", "small": "fiber in one apple, skin on"},    # USDA: 4.4 g, medium
        "tags": ["apple", "apple benefits", "fiber", "eating apple"],
    },
    "egg": {
        "emoji": "\U0001F95A", "article": "an egg", "bolus": "#f4e3a1", "stomach_time": "2 HOURS",
        "lines": {
            "hook": "What actually happens inside your body when you eat an egg?",
            "mouth": "You chew it in seconds. It is soft, so your teeth barely work.",
            "esophagus": "Muscles squeeze it down to your stomach in under 10 seconds.",
            "stomach": "Your stomach needs about two hours to break down its protein.",
            "small": "Around 6 hours in, amino acids from that protein pass into your blood.",
            "large": "Eggs have no fiber, so almost nothing is left for your large intestine.",
            "payoff": "One large egg gives you about 6 grams of protein.",
        },
        "fact": {"big": "6 g", "small": "protein in one large egg"},       # USDA: 6.3 g
        "tags": ["egg", "egg benefits", "protein", "eating eggs"],
    },
    "watermelon": {
        "emoji": "\U0001F349", "article": "watermelon", "bolus": "#f06a6a", "stomach_time": "1 HOUR",
        "lines": {
            "hook": "What actually happens inside your body when you eat watermelon?",
            "mouth": "It's so juicy, your teeth barely have to work.",
            "esophagus": "Muscles squeeze it down to your stomach in under 10 seconds.",
            "stomach": "Being mostly water, it slips through your stomach quickly.",
            "small": "Its water and natural sugars soak into your blood.",
            "large": "What little fiber it has moves on to feed your gut bacteria.",
            "payoff": "About 92 percent of a watermelon is water.",
        },
        "fact": {"big": "92%", "small": "of a watermelon is water"},       # USDA: 91.45 g / 100 g
        "tags": ["watermelon", "watermelon benefits", "hydration", "eating watermelon"],
    },
    "kiwi": {
        "emoji": "\U0001F95D", "article": "a kiwi", "bolus": "#9ccf4d", "stomach_time": "1 HOUR",
        "lines": {
            "hook": "What actually happens inside your body when you eat a kiwi?",
            "mouth": "Your teeth crush it, tiny black seeds and all.",
            "esophagus": "Muscles squeeze it down to your stomach in under 10 seconds.",
            "stomach": "An enzyme inside kiwi, called actinidin, helps your stomach break down protein.",
            "small": "Around 6 hours in, its vitamin C passes into your blood.",
            "large": "Its fiber moves on to your large intestine and feeds your gut bacteria.",
            "payoff": "One kiwi gives you about 70 percent of the vitamin C you need in a day.",
        },
        "fact": {"big": "70%", "small": "of a day's vitamin C in one kiwi"},  # USDA 64 mg; DV 90 mg
        "tags": ["kiwi", "kiwi benefits", "vitamin c", "eating kiwi"],
    },
    "cucumber": {
        "emoji": "\U0001F952", "article": "a cucumber", "bolus": "#9fd67a", "stomach_time": "1 HOUR",
        "lines": {
            "hook": "What actually happens inside your body when you eat a cucumber?",
            "mouth": "Crunch. Your teeth break it into watery pieces.",
            "esophagus": "Muscles squeeze it down to your stomach in under 10 seconds.",
            "stomach": "Being mostly water, it moves through your stomach quickly.",
            "small": "Its water and a little potassium pass into your blood.",
            "large": "Most of its fiber is in the skin, and it feeds your gut bacteria.",
            "payoff": "About 95 percent of a cucumber is water.",
        },
        "fact": {"big": "95%", "small": "of a cucumber is water"},         # USDA: 95.2 g / 100 g
        "tags": ["cucumber", "cucumber benefits", "hydration", "eating cucumber"],
    },
}
TITLE_NAME = {"banana": "A Banana", "apple": "An Apple", "egg": "An Egg", "watermelon": "Watermelon",
              "kiwi": "A Kiwi", "cucumber": "A Cucumber"}
ORDER = ["hook", "mouth", "esophagus", "stomach", "small", "large", "payoff"]
CTA = ["Subscribe for more of your body's secrets.", "Subscribe to see what the next food does.",
       "Subscribe for more inside your body."]
KINDS = {"hook": "question", "payoff": "reveal", "cta": "cta"}


def _lines(key, food):
    lines = [food["lines"][k] for k in ORDER]
    cta = CTA[int(hashlib.md5(key.encode()).hexdigest(), 16) % len(CTA)]
    return lines + [cta]


def _stages(food):
    stages = []
    for i, k in enumerate(ORDER):
        st = {"line": i, "kind": k}
        if k in LABELS:
            st["label"] = LABELS[k]
            st["counter"] = food["stomach_time"] if k == "stomach" else TIMES[k]
        if k == "payoff":
            st["fact"] = food["fact"]
        stages.append(st)
    stages.append({"line": len(ORDER), "kind": "cta"})
    return stages


def render(props_path, out_path):
    r = subprocess.run(["node", "scripts/render.mjs", "BodyJourney", str(props_path), str(out_path)],
                       cwd=REMOTION, capture_output=True, text=True)
    if r.returncode != 0 or not Path(out_path).exists():
        raise RuntimeError(f"render failed: {(r.stderr or r.stdout)[-600:]}")


def make(key, date=None):
    food = FOODS[key]
    date = date or datetime.now().strftime("%Y-%m-%d")
    job = JOBS / f"{date}-{key}"
    job.mkdir(parents=True, exist_ok=True)
    lines = _lines(key, food)
    for i, l in enumerate(lines, 1):
        print(f"      {i:2d}. {l}")
    kinds = [KINDS.get(k, "list") for k in ORDER] + ["cta"]
    vo, voice = narrate.narrate(lines, kinds, job, style="body")
    secs = round(vo[-1]["end"] + 1.0, 2)
    props = {"food": {"name": key, "emoji": food["emoji"], "bolus": food["bolus"]},
             "vo": vo, "stages": _stages(food), "title": "What happens inside you?",
             "cta": {"fromLine": len(lines) - 1, "text": "for more body facts"},
             "durationInSeconds": secs}
    props_path = job / "props.json"
    props_path.write_text(json.dumps(props, ensure_ascii=False), encoding="utf-8")
    print(f"[render] {secs:.1f}s")
    silent = job / "silent.mp4"
    render(props_path, silent)

    import score
    bed = job / "score.wav"
    score.build_score(bed, secs + 0.5, tone="curious", seed=len(key))
    OUT.mkdir(exist_ok=True)
    final = OUT / f"{date}-body-{key}.mp4"
    mix.mix(silent, voice, bed, final, bed_db=-9)

    meta = {
        "kind": "food", "file": str(final), "slug": key, "date": date,
        "title": f"What Happens Inside Your Body When You Eat {TITLE_NAME[key]}? {food['emoji']}",
        "description": (f"{lines[0]} Follow {food['article']} from your first bite to your gut, "
                        f"step by step.\n\n" + "\n".join(f"- {l}" for l in lines[1:-1])
                        + "\n\nWhich food should we follow next? Tell me in the comments.\n\n"
                        "#health #humanbody #shorts #digestion #nutrition"),
        "tags": [f"what happens when you eat {food['article']}", f"what happens inside your body "
                 f"when you eat {food['article']}", "digestion", "digestive system",
                 "human body", "health facts", "nutrition", *food["tags"], "shorts"],
        "lines": lines,
    }
    (job / "meta.json").write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[done  ] {final}  ({mix.duration(final):.1f}s)")
    return meta


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser()
    ap.add_argument("food", nargs="?", choices=list(FOODS))
    ap.add_argument("--list", action="store_true")
    a = ap.parse_args()
    if a.list or not a.food:
        print("\n".join(FOODS))
    else:
        make(a.food)
