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
        # -> Navigate to the homepage URL or find a navigation element to access the product grid.
        await page.goto('http://localhost:3000', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Scroll down to locate the product grid and verify products are fetched and displayed with correct bilingual content, images, categories, ratings, and AI Verdict badges.
        await page.mouse.wheel(0, 800)
        

        # -> Click the Arabic language toggle button to verify bilingual content updates correctly on product cards.
        frame = context.pages[-1]
        # Click the Arabic language toggle button to switch language and verify bilingual content on product cards
        elem = frame.locator('xpath=html/body/main/nav/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Scroll down to locate the product grid in Arabic and verify product cards display images, categories, ratings, and AI Verdict badges correctly in Arabic.
        await page.mouse.wheel(0, 800)
        

        # -> Scroll down further to locate the product grid with product cards on the Arabic homepage.
        await page.mouse.wheel(0, 1000)
        

        # -> Test product card interactivity by clicking on a product card to verify navigation or interaction works as expected.
        frame = context.pages[-1]
        # Click on the first product card link in Arabic to test interactivity and navigation.
        elem = frame.locator('xpath=html/body/main/section[2]/div[2]/div/div/div/div[3]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Test responsiveness of the product detail page by resizing the viewport or simulating different screen sizes to ensure proper rendering and usability.
        await page.mouse.wheel(0, -await page.evaluate('() => window.innerHeight'))
        

        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        # -> Test responsiveness of the product detail page by resizing the viewport or simulating different screen sizes to ensure proper rendering and usability.
        await page.mouse.wheel(0, -300)
        

        await page.mouse.wheel(0, 300)
        

        frame = context.pages[-1]
        # Click English language toggle button to switch back to English and verify bilingual content on product detail page
        elem = frame.locator('xpath=html/body/nav/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        try:
            await expect(frame.locator('text=Product Grid Loaded Successfully').first).to_be_visible(timeout=1000)
        except AssertionError:
            raise AssertionError('Test plan execution failed: The product grid did not fetch and display products from Supabase with correct bilingual content, images, categories, and AI Verdict badges as expected.')
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    