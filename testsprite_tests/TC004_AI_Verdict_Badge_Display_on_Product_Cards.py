import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000/C:\Users\U\Desktop\PROJECTS\MY PROJECTS\Amazon-Websit-Project-", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Navigate to the product grid page with AI Verdict badges by finding a clickable element or using a known URL.
        await page.goto('http://localhost:3000/products', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Look for any UI elements or actions to load or display the product grid with AI Verdict badges.
        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        # -> Check for any UI elements, filters, or language toggles that might reveal or load the product grid with AI Verdict badges.
        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        # -> Navigate to the home or main page to find a link or menu to the product grid with AI Verdict badges.
        await page.goto('http://localhost:3000', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Scroll down to locate product cards and check for AI Verdict badges such as 'AI Recommended' or percentage match badges.
        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        # -> Inspect product cards for presence of 'AI Recommended' badges or percentage match badges like '98% Match'.
        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        # -> Verify that the badges 'AI Recommended' or percentage matches appear correctly on product cards and check bilingual badge display by toggling language.
        frame = context.pages[-1]
        # Click the Arabic language toggle button to check bilingual badge display.
        elem = frame.locator('xpath=html/body/main/nav/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=AI Recommended').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=98% Match').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=مدعوم بتحليل الذكاء الاصطناعي').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    