"""Upload to The Human Manual - and only that channel.

The login comes from, in order: the YT_TOKEN_JSON secret (GitHub), this
folder's token_hm.json, or the older pipeline's ../token_health.json (pickle,
read only - it is never rewritten, so that pipeline cannot break). Every upload
checks the channel name first.

    python upload_hm.py --whoami     which channel this login posts to
"""
import argparse
import json
import os
import pickle
import sys
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

ROOT = Path(__file__).resolve().parent
TOKEN = ROOT / "token_hm.json"
LEGACY = ROOT.parent / "token_health.json"
EXPECTED = "The Human Manual"


def _norm(name):
    return "".join(ch for ch in (name or "").lower() if ch.isalnum())


def credentials():
    env = os.environ.get("YT_TOKEN_JSON", "").strip()
    if env:
        info = json.loads(env)
        creds = Credentials.from_authorized_user_info(info, info.get("scopes"))
    elif TOKEN.exists():
        info = json.loads(TOKEN.read_text(encoding="utf-8"))
        creds = Credentials.from_authorized_user_info(info, info.get("scopes"))
    elif LEGACY.exists():
        creds = pickle.loads(LEGACY.read_bytes())
    else:
        raise RuntimeError("no login: set YT_TOKEN_JSON or keep ../token_health.json")
    if not creds.valid and creds.refresh_token:
        creds.refresh(Request())                  # in memory only
    return creds


def ready():
    return bool(os.environ.get("YT_TOKEN_JSON", "").strip()) or TOKEN.exists() or LEGACY.exists()


def whoami():
    yt = build("youtube", "v3", credentials=credentials(), cache_discovery=False)
    items = yt.channels().list(part="snippet,statistics", mine=True).execute().get("items") or []
    if not items:
        return None
    c = items[0]
    return {"title": c["snippet"]["title"], "handle": c["snippet"].get("customUrl", ""),
            "videos": c["statistics"].get("videoCount", "?")}


def assert_correct_channel():
    who = whoami()
    if not who or _norm(EXPECTED) not in _norm(who["title"]):
        raise RuntimeError(f"login is for '{who and who['title']}', not '{EXPECTED}'")
    return who


def _clamp_tags(tags, budget=460):
    out, used = [], 0
    for t in tags or []:
        t = str(t).strip()
        cost = len(t) + (2 if " " in t else 0) + 1
        if t and used + cost <= budget:
            out.append(t)
            used += cost
    return out


def _clean(text):
    """YouTube rejects a title or description containing < or > (HTTP 400,
    'invalid video description') - it cost AtlasOnFoot a day on 2026-09-26."""
    return str(text).replace("<", "").replace(">", "\u2192")


def upload(path, meta, privacy="public", publish_at=None):
    """publish_at (aware UTC datetime): upload now as private and let YouTube
    publish it at exactly that minute - GitHub's timer can run hours late."""
    meta = dict(meta, title=_clean(meta["title"]), description=_clean(meta["description"]))
    who = assert_correct_channel()
    print(f"[upload] target channel: {who['title']} {who['handle']}")
    yt = build("youtube", "v3", credentials=credentials(), cache_discovery=False)
    body = {"snippet": {"title": meta["title"][:100], "description": meta["description"][:5000],
                        "tags": _clamp_tags(meta.get("tags")), "categoryId": "27",
                        "defaultLanguage": "en", "defaultAudioLanguage": "en"},
            "status": {"privacyStatus": privacy, "selfDeclaredMadeForKids": False}}
    if publish_at is not None:
        import datetime as _dt
        if publish_at > _dt.datetime.now(_dt.timezone.utc) + _dt.timedelta(minutes=5):
            body["status"].update(privacyStatus="private",
                                  publishAt=publish_at.strftime("%Y-%m-%dT%H:%M:%S.000Z"))
            print(f"[upload] scheduled for {publish_at:%Y-%m-%d %H:%M} UTC")
    req = yt.videos().insert(part="snippet,status", body=body,
                             media_body=MediaFileUpload(str(path), chunksize=-1, resumable=True,
                                                        mimetype="video/mp4"))
    resp = None
    while resp is None:
        _, resp = req.next_chunk()
    print(f"[upload] {meta['title']} -> https://youtu.be/{resp['id']}")
    return resp["id"]


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--whoami", action="store_true")
    a = ap.parse_args()
    w = whoami()
    if not w:
        sys.exit("this login has no channel")
    print(f"  channel : {w['title']}\n  handle  : {w['handle']}\n  videos  : {w['videos']}")
    print(f"  {'MATCH' if _norm(EXPECTED) in _norm(w['title']) else 'WRONG CHANNEL'} (expected '{EXPECTED}')")
