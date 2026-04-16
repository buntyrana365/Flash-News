# app.py — Flask News App Backend
# Run: python app.py  |  Then open http://localhost:5000 in browser or phone (same WiFi)

from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv
from functools import lru_cache
import time

load_dotenv()

app = Flask(__name__)

# ── Configuration ──────────────────────────────────────────────────────────────
API_KEY  = os.getenv("NEWS_API_KEY")
if not API_KEY:
    raise RuntimeError("NEWS_API_KEY not set. Copy .env.example → .env and add your key.")
BASE_URL = "https://newsapi.org/v2"

# Country name → ISO 2-letter code (for top-headlines endpoint)
COUNTRY_MAP = {
    "india": "in",   "usa": "us",   "united states": "us",
    "uk": "gb",      "united kingdom": "gb", "canada": "ca",
    "australia": "au","germany": "de","france": "fr",
    "japan": "jp",   "china": "cn", "russia": "ru",
    "brazil": "br",  "italy": "it", "spain": "es",
    "mexico": "mx",  "argentina": "ar", "netherlands": "nl",
    "norway": "no",  "portugal": "pt",  "saudi arabia": "sa",
    "south africa": "za", "south korea": "kr", "sweden": "se",
    "switzerland": "ch",  "turkey": "tr",      "ukraine": "ua",
    "uae": "ae",     "united arab emirates": "ae", "pakistan": "pk",
    "bangladesh": "bd","nigeria": "ng", "egypt": "eg","israel": "il",
    "singapore": "sg","malaysia": "my","indonesia": "id","philippines": "ph",
}

# Simple in-memory cache { key: (timestamp, data) }
_cache: dict = {}
CACHE_TTL = 300  # 5 minutes

def cached_get(url: str, params: dict) -> dict:
    """GET with simple 5-minute in-memory cache."""
    key = url + str(sorted(params.items()))
    entry = _cache.get(key)
    if entry and (time.time() - entry[0]) < CACHE_TTL:
        return entry[1]
    resp = requests.get(url, params=params, timeout=10)
    data = resp.json()
    _cache[key] = (time.time(), data)
    return data


# ── Page route ─────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")


# ── API: Top Headlines ──────────────────────────────────────────────────────────
@app.route("/api/headlines")
def headlines():
    country   = request.args.get("country",  "us")
    category  = request.args.get("category", "")
    page      = request.args.get("page",     1,  type=int)
    page_size = request.args.get("pageSize", 20, type=int)

    params = {"country": country, "page": page, "pageSize": page_size, "apiKey": API_KEY}
    if category:
        params["category"] = category

    try:
        data = cached_get(f"{BASE_URL}/top-headlines", params)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e), "articles": [], "totalResults": 0}), 500


# ── API: Search (country name or keyword) ──────────────────────────────────────
@app.route("/api/search")
def search():
    q         = request.args.get("q",        "")
    sort_by   = request.args.get("sortBy",   "popularity")
    page      = request.args.get("page",     1,  type=int)
    page_size = request.args.get("pageSize", 20, type=int)

    if not q:
        return jsonify({"articles": [], "totalResults": 0})

    country_code = COUNTRY_MAP.get(q.strip().lower())

    try:
        if country_code:
            # Country query → top-headlines with country code
            params = {"country": country_code, "page": page,
                      "pageSize": page_size, "apiKey": API_KEY}
            data = cached_get(f"{BASE_URL}/top-headlines", params)
        else:
            # State / keyword → everything endpoint
            params = {"q": q, "sortBy": sort_by, "language": "en",
                      "page": page, "pageSize": page_size, "apiKey": API_KEY}
            data = cached_get(f"{BASE_URL}/everything", params)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e), "articles": [], "totalResults": 0}), 500


# ── API: Breaking News (top 5 headlines) ───────────────────────────────────────
@app.route("/api/breaking")
def breaking():
    try:
        data = cached_get(f"{BASE_URL}/top-headlines",
                          {"country": "us", "pageSize": 5, "apiKey": API_KEY})
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e), "articles": []}), 500


# ── Run ────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n[OK] NewsApp Python server starting...")
    print("[>>] Open in browser:      http://localhost:5000")
    print("[>>] On phone (same WiFi): http://<YOUR_PC_IP>:5000\n")
    app.run(debug=True, host="0.0.0.0", port=5000)
