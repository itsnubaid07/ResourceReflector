import sys
import requests
from bs4 import BeautifulSoup
import pyperclip

# Simple terminal color indicators
C_RESET = "\033[0m"
C_BLUE  = "\033[34m"
C_GREEN = "\033[32m"
C_RED   = "\033[31m"

def harvest():
    # Grab link string straight out of clipboard RAM
    url = pyperclip.paste().strip()

    if not url.startswith(("http://", "https://")):
        sys.stderr.write(f"\n{C_RED}[!] Error: Clipboard doesn't contain a valid web URL link!{C_RESET}\n\n")
        return

    sys.stdout.write(f"\n{C_BLUE}>> linkharvest.py active: Testing link availability...{C_RESET}\n")
    sys.stdout.write(f"   Target URL: {url}\n")

    try:
        # Standard user footprint to avoid quick bot blocks
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        res = requests.get(url, timeout=5, headers=headers)
        
        # Simple health check block (200 is successful connection)
        if res.status_code != 200:
            sys.stderr.write(f"\n{C_RED}[!] Server Error: Host responded with HTTP status code {res.status_code}{C_RESET}\n\n")
            return

        sys.stdout.write(f"   {C_GREEN}[+] Handshake complete. Scraping page details...{C_RESET}\n")
        
        # Use beautifulsoup to read raw HTML tags
        soup = BeautifulSoup(res.text, 'html.parser')

        # Find document title
        title = "Untitled Website"
        if soup.title and soup.title.string:
            title = soup.title.string.strip()

        # Find description overview tag
        desc = "No site summary text available."
        meta = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
        if meta and meta.get("content"):
            desc = meta.get("content").strip()

        # Build clean plaintext data blocks for script.js deconstructor loops
        packet = f"Title: {title}\nURL: {url}\nSummary: {desc}"
        
        # Overwrite clipboard string with finished packet data
        pyperclip.copy(packet)
        
        sys.stdout.write(f"\n{C_GREEN}[++] Success: Metadata package copied to clipboard.{C_RESET}\n")
        sys.stdout.write("    Go to your browser form tab and press paste (Ctrl+V) directly.\n\n")

    except requests.Timeout:
        sys.stderr.write(f"\n{C_RED}[!] Network Failure: Connection request timed out.{C_RESET}\n\n")
    except requests.ConnectionError:
        sys.stderr.write(f"\n{C_RED}[!] Network Failure: Unable to locate target host server name.{C_RESET}\n\n")
    except Exception as e:
        sys.stderr.write(f"\n{C_RED}[!] Runtime Error Encountered: {str(e)}{C_RESET}\n\n")

if __name__ == "__main__":
    harvest()
