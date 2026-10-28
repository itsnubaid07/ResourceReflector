# Resource Reflector 🪞

I built this because my browser tabs were constantly cluttered, my personal notes were scattered across proprietary apps, and I wanted a quiet digital corner to hold things without a tech company tracking my reading habits. 

Resource Reflector is a calm, local-first workspace for your browser. It doesn't require an account, it uses no servers, logs zero telemetry, and stores absolutely no tracking cookies. It just holds onto your links, thoughts, and files using your browser's own protected memory storage (IndexedDB).

👉 **Live Space:** https://github.io

## ⚡ The Out-of-the-Box Extension: Diagnostic Scraper Gateway
To bypass browser CORS isolation limits and prevent dead links from polluting the local database, this repository includes an independent Python command-line ecosystem utility: `verify_and_scrape.py`.

### How it works:
1. **Copy:** Copy any raw URL link to your operating system clipboard.
2. **Audit:** Execute `python verify_and_scrape.py` inside your system terminal window.
3. **Analyze:** Python intercepts the link, spoofs browser headers to pass bot-walls, checks for server status errors (**400, 403, 404, 410, 500**), and extracts the page's HTML `<title>` and `<meta>` description text fields.
4. **Harvest:** If stable, it packages a clean, pre-tagged data block straight back into your clipboard buffer.
5. **Deposit:** Simply click inside the Resource Reflector `Title` input form and hit Paste. The application's intelligent clipboard listener automatically unpacks the payload, populates the fields, and sets the format strictly to **🔗 Link**.

## Why this exists
* **Zero Noise:** No cloud synchronization loading wheels, no pop-ups, no notification alerts, and no upgrade paywalls.
* **Privacy by Default:** Your code lives entirely inside your sandbox. If your laptop goes completely offline in a remote field, your reflections are perfectly accessible. They live with you.
* **Intelligent Data Ownership:** Features a local data vault engine so you can pack up your whole database into an offline JSON backup file anytime and migrate it between browsers.
* **Handcrafted Aesthetic:** Designed with a soft, analog paper cardstock texture and anchored by a deep green visual alignment inspired by flag heritage.

## The Architecture
Built purely out of raw, fast web standards. No heavy frameworks, no massive dependencies, and no bloated node modules:
* Semantic HTML5 Structures
* Custom Modular CSS3 Variables
* Vanilla JavaScript Engine (ES6+)
* Python 3 Extension Layer (`requests`, `beautifulsoup4`, `pyperclip`)
* Local Browser IndexedDB

---
Handcrafted out of personal necessity by Nubaid. Clarity first.
