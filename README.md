# 📰 NewsFlash — Real-Time News Web App

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-3.0-black?style=flat-square&logo=flask)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Mobile Ready](https://img.shields.io/badge/Mobile-Ready-orange?style=flat-square)

A modern, mobile-first news web app built with **Python Flask** and **Vanilla JS**. Fetches real-time headlines from [NewsAPI](https://newsapi.org), with category filtering, search, bookmarks, dark mode, and a breaking news carousel.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔴 Breaking News | Auto-scrolling carousel of top 5 live headlines |
| 🔍 Smart Search | Search by keyword, country name, or Indian state |
| 🗂️ Categories | Business, Entertainment, Health, Science, Sports, Technology, Politics |
| 🔖 Bookmarks | Save articles locally (persists across sessions) |
| 🌙 Dark Mode | Toggle light/dark theme, saved in localStorage |
| 📱 Mobile-First | Works perfectly on phones via WiFi (same network) |
| ⚡ Caching | 5-minute in-memory cache to avoid redundant API calls |
| 🔗 Link-Safe | Uses native `<a>` tags — no popup blocking on mobile |

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/NewsFlash.git
cd NewsFlash
```

### 2. Create a virtual environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set up your API key
```bash
cp .env.example .env
```
Then open `.env` and replace `your_newsapi_key_here` with your key from [newsapi.org](https://newsapi.org/register) (free plan available).

### 5. Run the app
```bash
python app.py
```

Open **http://localhost:5000** in your browser.  
To test on your phone (same WiFi), open **http://\<YOUR_PC_IP\>:5000**

---

## 📁 Project Structure

```
NewsFlash/
├── app.py                  # Flask backend & API routes
├── requirements.txt        # Python dependencies
├── .env.example            # Environment variable template
├── .gitignore
├── templates/
│   └── index.html          # Single-page HTML shell
└── static/
    ├── css/
    │   └── style.css       # Full design system (dark/light)
    └── js/
        └── News_app.js     # All frontend logic
```

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `NEWS_API_KEY` | Your API key from [newsapi.org](https://newsapi.org) |

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore`.

---

## 🛠️ Tech Stack

- **Backend** — Python, Flask
- **Frontend** — HTML5, Vanilla CSS, Vanilla JavaScript
- **API** — [NewsAPI.org](https://newsapi.org)
- **Fonts** — Google Fonts (Inter)

---

## 📸 Screenshots

> _Add screenshots here after deployment_

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙌 Acknowledgements

- [NewsAPI](https://newsapi.org) for the free news data API
- [Google Fonts](https://fonts.google.com) for the Inter typeface
