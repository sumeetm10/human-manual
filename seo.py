"""YouTube's own search suggestions - what people really type. A failed lookup
costs nothing: callers fall back to their fixed tags."""
import json
import urllib.parse
import urllib.request


def suggestions(query):
    url = ("https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q="
           + urllib.parse.quote(query))
    try:
        with urllib.request.urlopen(url, timeout=8) as r:
            data = json.loads(r.read().decode("utf-8", "replace"))
        return [s for s in data[1] if isinstance(s, str)]
    except Exception:
        return []
