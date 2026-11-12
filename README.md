# Resource Reflector 🪞

I built this application because my browser tabs were constantly cluttered, my personal notes were scattered across different proprietary apps, and I wanted a quiet digital corner to save links without a cloud tech company logging my habits. 

Resource Reflector runs completely local-first. It requires no login accounts, handles no remote servers, logs zero analytics telemetry, and stores your data safely inside your browser's own protected memory database (IndexedDB).

👉 **Live Workspace:** https://itsnubaid07.github.io/ResourceReflector/

## ⚡ The System Utility: `linkharvest.py`
To bypass browser security isolation restrictions (CORS blocks) and check link validity before saving, I wrote a dedicated command-line console tool: `linkharvest.py`.

### How to use the data pipeline:
1. Copy any destination website URL link from your browser tab to your clipboard.
2. Open your terminal window and run the engine script: `python linkharvest.py`
3. The script tests the host server, checks for dead error responses, pulls the page title, harvests the description metadata, and copies a clean text block payload back into your clipboard.
4. Go to the Resource Reflector browser window tab, select the **Title** box, and hit paste (`Ctrl + V`). The built-in JavaScript lines parse the fields instantly.

## Why this exists
* **Zero Noise:** No cloud loading wheels, no pop-ups, and no upgrade premium prompts.
* **Offline Independence:** Operates completely inside your local browser sandbox. Even if your laptop goes completely offline in a remote field, your entries are perfectly accessible. 
* **Data Vault Control:** Features a simple backup utility so you can dump your entire database into an exportable `.json` file anytime and move it between machines.
* **Handcrafted Style:** Built with a typewriter monospaced palette and a bold green accent theme inspired by flag heritage.

## The Architecture
Built purely out of raw, fast web standards. No heavy frameworks, no massive dependencies, and no bloated modules:
* Semantic HTML5 Layouts
* High-Contrast CSS3 Variables
* Vanilla Prototypal JavaScript (ES6)
* Python 3 Core Script (`requests`, `beautifulsoup4`, `pyperclip`)
* Local Browser Transactional IndexedDB

---
Handcrafted out of personal necessity by Nubaid 
