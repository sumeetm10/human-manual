# The Human Manual

The code behind **The Human Manual** YouTube channel: "What if...?" Shorts told
through the human body, and "what happens inside your body when you eat X"
journeys - both drawn in code (Remotion), no stock footage.

**All rights reserved.** Public to be seen, not used - see [LICENSE](LICENSE).
To ask for permission, open an issue titled "Permission request".

Every fact is written by hand (`whatifs.py`, `body.py`), rounded, and said
with "about"; no model writes or changes a number.

GitHub Actions ([post.yml](.github/workflows/post.yml)) posts a what-if around
02:23 UTC and a food journey around 12:23 UTC. Secrets: `GEMINI_API_KEY`
(acted voice) and `YT_TOKEN_JSON` (the channel login).
