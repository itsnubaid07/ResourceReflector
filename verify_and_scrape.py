import sys
import requests
from bs4 import BeautifulSoup
import pyperclip

# Balanced Terminal Slate (Directly maps to your custom CSS palette weights)
TXT_RESET   = "\033[0m"
TXT_BOLD    = "\033[1m"
TXT_CHAR    = "\033[38;5;235m"  # Editorial Ink Charcoal
TXT_GREEN   = "\033[38;5;29m"   # Deep Flag Green Fill 
TXT_RED     = "\033[38;5;124m"  # Deep Rust Red for server faults
TXT_AMBER   = "\033[38;5;172m"  # Warm Warning Amber
TXT_CLAY    = "\033[38;5;244m"  # Muted Clay Structural Text

def audit_and_harvest():
    # 1. Grab raw URL text directly out of your system RAM clipboard buffer
    source_url = pyperclip.paste().strip()

    if not source_url.startswith(("http://", "https://")):
        sys.stderr.write(f"\n{TXT_RED}✗ VALIDATION FAILURE: Clipboard string lacks valid web protocols.{TXT_RESET}\n")
        sys.stderr.write(f"{TXT_CLAY}Current clipboard reads: '{source_url}'{TXT_RESET}\n\n")
        return

    sys.stdout.write(f"\n{TXT_CHAR}── dynamic audit gateway ──────────────────────────────{TXT_RESET}\n")
    sys.stdout.write(f" 🛰 Target: {source_url}\n")
    sys.stdout.write(" ⏳ Evaluating server health flags...\n")

    try:
        # 2. Forge a human browser footprint header to walk straight past automated scraping walls
        spoofed_identity = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        # Pulling down HTML payload stream bytes
        network_response = requests.get(source_url, timeout=7, headers=spoofed_identity)
        server_flag = network_response.status_code
        
        # 3. Defensive Gatekeeping: Catch explicit routing failures before they touch your memory database
        if server_flag != 200:
            sys.stderr.write(f"\n{TXT_RED}🚨 SERVER AUDIT ALERT: Destination is unstable or protected.{TXT_RESET}\n")
            
            diagnostic_registry = {
                400: "Bad Request (Malformed framework structure or invalid parameters)",
                401: "Unauthorized (Protected endpoint requires authentication keys)",
                403: "Forbidden (Host server rejects automated or unverified clients)",
                404: "Not Found (The directory target does not exist on this domain)",
                410: "Gone (Resource has been permanently expunged from host server)",
                500: "Internal Server Error (Remote database or web engine crashed)"
            }
            
            explanation = diagnostic_registry.get(server_flag, "Unmapped network routing anomaly")
            sys.stderr.write(f" 👉 HTTP Code {server_flag} ➔ {explanation}\n")
            sys.stderr.write(f"{TXT_RED}Aborting harvest. Saving this link is highly discouraged.{TXT_RESET}\n\n")
            return

        sys.stdout.write(f"  {TXT_GREEN}✓ network stable{TXT_RESET} ➔ Handshake verified with HTTP Status 200 OK.\n")
        sys.stdout.write(f" 🕵️ Parsing document markers and structural HTML maps...\n")

        # 4. Scavenger Phase: Transform raw markup text into an organized XML structural tree
        html_tree = BeautifulSoup(network_response.text, 'html.parser')

        # Locate clean inner document title string
        extracted_title = "Untitled Reflection"
        if html_tree.title and html_tree.title.string:
            extracted_title = html_tree.title.string.strip()

        # Locate clean inner descriptive metadata text strings
        extracted_summary = "No profile descriptions declared by site web developer."
        meta_search = html_tree.find("meta", attrs={"name": "description"}) or html_tree.find("meta", attrs={"property": "og:description"})
        if meta_search and meta_search.get("content"):
            extracted_summary = meta_search.get("content").strip()

        sys.stdout.write(f"  {TXT_GREEN}✓ data harvested{TXT_RESET}\n")
        sys.stdout.write(f"    {TXT_CHAR}Title:{TXT_RESET} {extracted_title}\n")
        sys.stdout.write(f"    {TXT_CHAR}Summary:{TXT_RESET} {extracted_summary}\n")
        sys.stdout.write(f"{TXT_CHAR}───────────────────────────────────────────────────────{TXT_RESET}\n")

        # 5. Compile the validated, harvested dataset into your clean frontend form inputs structure
        deposit_payload = (
            f"Title: {extracted_title}\n"
            f"URL: {source_url}\n"
            f"Summary: {extracted_summary}\n"
            f"Tags: verified, scraped"
        )
        
        # Inject the parsed dataset packet right back into your operating system clipboard string
        pyperclip.copy(deposit_payload)
        
        sys.stdout.write(f"\n {TXT_GREEN}🎉 Complete! Verified archive payload copied to clipboard.{TXT_RESET}\n")
        sys.stdout.write("    You can now paste it directly into your Resource Reflector workspace.\n\n")

    except requests.Timeout:
        sys.stderr.write(f"\n{TXT_RED}🚨 ROUTING BREAKDOWN: Connection timeout limit hit. Host server dead.{TXT_RESET}\n\n")
    except requests.ConnectionError:
        sys.stderr.write(f"\n{TXT_RED}🚨 ROUTING BREAKDOWN: DNS query resolution failed. Non-existent domain address.{TXT_RESET}\n\n")
    except Exception as break_error:
        sys.stderr.write(f"\n{TXT_RED}🚨 CRITICAL PROCESS FAULT: Unexpected script crash ➔ {str(break_error)}{TXT_RESET}\n\n")

if __name__ == "__main__":
    audit_and_harvest()
