import asyncio
from playwright.async_api import async_playwright

async def verify_widget():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="msedge")
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        page.on("console", lambda msg: print(f"[Browser Console] {msg.text}"))

        screens = ["dashboard", "skills", "profile"]
        for s in screens:
            url = f"http://localhost:3000/{s}"
            await page.goto(url, wait_until="networkidle")
            await page.wait_for_timeout(1000)
            
            # Check trigger button
            btn = page.locator('button[aria-label*="Disha AI"]')
            is_visible = await btn.is_visible()
            print(f"Screen /{s}: Disha button visible? {is_visible}")
            assert is_visible, f"Disha button not visible on /{s}"

        # On Profile screen, open the widget
        print("Opening Disha widget on /profile...")
        await page.locator('button[aria-label*="Disha AI"]').click()
        await page.wait_for_timeout(500)
        
        panel = page.locator('aside[aria-label="Disha AI Chat Window"]')
        panel_visible = await panel.is_visible()
        print(f"Panel visible after click? {panel_visible}")
        assert panel_visible

        # Check header
        header_text = await page.locator('aside[aria-label="Disha AI Chat Window"]').inner_text()
        print("Header contains Disha?", "Disha" in header_text)

        # Type message and send
        input_box = page.locator('input[placeholder*="Ask Disha"]')
        await input_box.fill("What is my biggest skill gap and how should I address it?")
        await page.locator('button[aria-label="Send Message to Disha"]').click()

        print("Waiting for Disha response...")
        # Wait for assistant response to complete (typing indicator gone and at least 3 messages)
        for i in range(30):
            await page.wait_for_timeout(1000)
            typing_indicator = page.locator('text=Disha is analyzing')
            typing = await typing_indicator.count()
            msg_count = await page.locator('aside[aria-label="Disha AI Chat Window"] p').count()
            if typing == 0 and msg_count >= 3:
                print(f"Got completed response after ~{i+1}s! (Messages: {msg_count})")
                break

        # Get all messages
        all_text = await page.locator('aside[aria-label="Disha AI Chat Window"]').inner_text()
        print("--- DISHA CHAT CONTENT ---")
        safe_text = all_text.encode('ascii', errors='replace').decode('ascii')
        print(safe_text)
        print("--------------------------")

        # Take screenshot
        screenshot_path = "C:/Users/kisha/.gemini/antigravity/brain/f7a29496-893d-440c-baf8-187fc6e72b30/disha_chat_screenshot.png"
        await page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}!")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_widget())
