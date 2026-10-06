import time
import sys
from playwright.sync_api import sync_playwright

def run_test():
    print("Starting Playwright UI Verification...")
    with sync_playwright() as p:
        # Launch installed system browser (msedge or chrome)
        browser = None
        for channel in ["msedge", "chrome"]:
            try:
                browser = p.chromium.launch(channel=channel, headless=True)
                print(f"Launched browser channel: {channel}")
                break
            except Exception as e:
                print(f"Failed to launch {channel}: {e}")
        
        if not browser:
            print("ERROR: Could not launch browser")
            sys.exit(1)

        page = browser.new_page()
        
        # Track console messages
        page.on("console", lambda msg: print(f"[Browser Console {msg.type}]: {msg.text}"))
        
        # Track API network calls
        api_calls = []
        def log_request(req):
            if "/api/" in req.url:
                api_calls.append(f"{req.method} {req.url}")
                print(f"[API Request] {req.method} {req.url}")
        page.on("request", log_request)

        # 1. Open Assessments Page
        print("\n--- 1. Navigating to http://localhost:5173/assessments ---")
        page.goto("http://localhost:5173/assessments")
        page.wait_for_timeout(2000)

        # Verify Hub rendered
        hub_title = page.locator("h1").inner_text()
        print(f"Hub H1: {hub_title}")
        assert "Baseline Discovery" in hub_title or "Competency" in hub_title

        # Check assessments loaded
        cards = page.locator(".typography-h2").all_inner_texts()
        print("Assessment titles found:", cards)

        # 2. Click "Discover Baseline"
        print("\n--- 2. Entering Onboarding ---")
        discover_btn = page.locator("button:has-text('Discover Baseline'), button:has-text('Begin Baseline Discovery')").first
        discover_btn.click()
        page.wait_for_timeout(1000)

        # Confirm Onboarding Screen
        onboarding_header = page.locator("h2").first.inner_text()
        print(f"Onboarding Header: {onboarding_header}")

        # 3. Click "Begin Baseline Assessment"
        print("\n--- 3. Starting Assessment Attempt ---")
        begin_btn = page.locator("button:has-text('Begin Baseline Assessment'), button:has-text('Begin Assessment')").first
        begin_btn.click()
        page.wait_for_timeout(2000)

        # Check Active workspace rendered
        active_title = page.locator("header").inner_text()
        print(f"Header bar: {active_title}")

        # Answer 6 questions
        for q_num in range(1, 7):
            print(f"\n--- Question {q_num} of 6 (URL: {page.url}) ---")
            page.wait_for_timeout(1000)
            
            # Print current question text
            q_heading = page.locator("main h2").inner_text()
            print(f"Q{q_num} Text: {q_heading}")

            if q_num == 1:
                # Select uncertainty option on question 1!
                print("Selecting uncertainty option on Q1...")
                unsure_btn = page.locator("button:has-text('No penalty · counts as data')").first
                unsure_btn.click()
                print("Clicked uncertainty option!")
            else:
                # Select first regular answer choice (button with text-left inside main)
                print(f"Selecting first choice for Q{q_num}...")
                option_btn = page.locator("main button.text-left").first
                option_btn.click()
                print("Clicked choice button!")

            page.wait_for_timeout(800)
            
            # Check save indicator
            save_text = page.locator("header").inner_text()
            print(f"Save status after Q{q_num}: {[line for line in save_text.splitlines() if 'Draft' in line or 'Saving' in line]}")

            # Click footer navigation button
            if q_num < 6:
                next_btn = page.locator("footer button:has-text('Save & Continue')").first
                print(f"Clicking 'Save & Continue' on Q{q_num}...")
                next_btn.click()
            else:
                print("Final Question: Submitting via 'Move to Growth Plan'...")
                submit_btn = page.locator("footer button:has-text('Move to Growth Plan')").first
                submit_btn.click()

        # 4. Wait for Results Screen
        print("\n--- 4. Waiting for Assessment Results Screen ---")
        page.wait_for_timeout(3000)

        results_heading = page.locator("h1").inner_text()
        print(f"Results H1: {results_heading}")
        assert "Personal Growth" in results_heading or "Roadmap" in results_heading

        # Check capability list items
        caps = page.locator("span.font-bold.text-slate-800").all_inner_texts()
        print(f"Discovered Capabilities ({len(caps)}): {caps}")

        # Check growth opportunities
        opps = page.locator(".rounded-xl.border-slate-100").count()
        print(f"Opportunities/Strengths boxes rendered: {opps}")

        # 5. STEP 3 VERIFICATION: Navigate to SkillsView WITHOUT page reload!
        print("\n--- 5. Step 3 Check: Navigating to SkillsView WITHOUT reload ---")
        skills_nav = page.locator("nav a[href='/skills'], aside a[href='/skills'], button:has-text('Skills')").first
        skills_nav.click()
        page.wait_for_timeout(2000)

        current_url = page.url
        print(f"Current URL: {current_url}")
        assert "/skills" in current_url

        # Check rendered skills
        skills_headings = page.locator("h3, h2").all_inner_texts()
        print(f"Skills displayed on /skills: {len(skills_headings)} elements found")

        # 6. Step 3 Check: Navigate to Dashboard WITHOUT page reload!
        print("\n--- 6. Step 3 Check: Navigating to Dashboard WITHOUT reload ---")
        dash_nav = page.locator("nav a[href='/dashboard'], aside a[href='/dashboard'], button:has-text('Dashboard')").first
        dash_nav.click()
        page.wait_for_timeout(2000)

        dash_url = page.url
        print(f"Current URL: {dash_url}")
        assert "/dashboard" in dash_url

        # Check KPI metrics row
        kpis = page.locator(".typography-display, .text-2xl, .text-3xl").all_inner_texts()
        print("Dashboard KPI stats displayed:", kpis)

        # Check tree widget score
        tree_score = page.locator("aside").inner_text()
        print("Sidebar tree excerpt:", [l for l in tree_score.splitlines() if "%" in l or "Senior" in l])

        print("\n==========================================")
        print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!")
        print("Total API Calls observed during flow:")
        for c in set(api_calls):
            print(f"  - {c}")
        print("==========================================")
        
        browser.close()

if __name__ == "__main__":
    run_test()
