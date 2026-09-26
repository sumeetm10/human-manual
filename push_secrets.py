"""Copy the two secrets the cloud needs from this laptop to GitHub, without
printing them.

    python push_secrets.py

Uses The Human Manual's existing login (../token_health.json, read only) and
the GEMINI_API_KEY environment variable. Values go straight into the
repository's encrypted secrets.
"""
import os
import subprocess
import sys

import upload_hm

REPO = "sumeetm10/human-manual"


def put(name, value):
    r = subprocess.run(["gh", "secret", "set", name, "-R", REPO], input=value, text=True,
                       capture_output=True)
    print(f"[secret] {name}: " + ("saved" if r.returncode == 0 else "FAILED " + (r.stderr or "")[:200]))
    return r.returncode == 0


if __name__ == "__main__":
    os.environ.pop("YT_TOKEN_JSON", None)
    who = upload_hm.assert_correct_channel()           # never push a login for another channel
    print(f"[login ] {who['title']}")
    ok = put("YT_TOKEN_JSON", upload_hm.credentials().to_json())
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    ok = (put("GEMINI_API_KEY", key) if key else False) and ok
    print("done - the next scheduled run will post" if ok else "some secrets are missing")
    sys.exit(0 if ok else 1)
