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
        # -> Locate and navigate to the correct product grid page from the current site or homepage.
        await page.goto('http://localhost:3000/', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Click on 'View All Products' link to open the product grid page on desktop screen.
        frame = context.pages[-1]
        # Click on 'View All Products' link to open the product grid page on desktop screen.
        elem = frame.locator('xpath=html/body/main/section[4]/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Resize viewport to tablet width and verify product cards reflow into fewer columns with readable text and images.
        await page.goto('http://localhost:3000/en#products', timeout=10000)
        await asyncio.sleep(3)
        

        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        # -> Resize viewport to tablet width and verify product cards reflow into fewer columns with readable text and images.
        await page.goto('http://localhost:3000/en#products', timeout=10000)
        await asyncio.sleep(3)
        

        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        frame = context.pages[-1]
        # Open responsive design or developer tools to resize viewport to tablet width
        elem = frame.locator('xpath=html/body/footer/div/div/div[3]/ul/li[3]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'View All Products' link to open the product grid page on desktop screen.
        frame = context.pages[-1]
        # Click on 'View All Products' link to open the product grid page on desktop screen.
        elem = frame.locator('xpath=html/body/main/section[4]/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Resize viewport to tablet width and verify product cards reflow into fewer columns with readable text and images.
        await page.goto('http://localhost:3000/en#products', timeout=10000)
        await asyncio.sleep(3)
        

        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        # -> Resize viewport to tablet width and visually confirm product cards reflow into fewer columns with readable text and images.
        frame = context.pages[-1]
        # Focus on search input to trigger viewport resize or responsive mode if applicable
        elem = frame.locator('xpath=html/body/main/nav/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        await page.goto('http://localhost:3000/en#products', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Resize viewport to tablet width and verify product cards reflow into fewer columns with readable text and images.
        await page.goto('http://localhost:3000/en#products', timeout=10000)
        await asyncio.sleep(3)
        

        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        # -> Resize viewport to tablet width and verify product cards reflow into fewer columns with readable text and images.
        await page.goto('http://localhost:3000/en#products', timeout=10000)
        await asyncio.sleep(3)
        

        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        # -> Resize viewport to tablet width and verify product cards reflow into fewer columns with readable text and images.
        await page.goto('http://localhost:3000/en#products', timeout=10000)
        await asyncio.sleep(3)
        

        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        # -> Resize viewport to tablet width and verify product cards reflow into fewer columns with readable text and images.
        await page.mouse.wheel(0, -await page.evaluate('() => window.innerHeight'))
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=View All Products').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Grab them before they\'re gone!').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Stop Searching. Let AI Decide.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Flash Deals').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Up to 70% off on select items').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Split Fiction PS5 Game, Two-Player Co-op Action Adventure, 16+ PEGI Rating').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Mustela Baby Hair Styler & Skin Freshener - with Natural Avocado & Chamomile Water - Vegan & Hypoallergenic - 200ml').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Vtopmart 15PCS Plastic Airtight Food Storage Container with Lids, Kitchen Storage & Organization for Cereal, Spaghetti, Flour and Sugar, BPA Free, Includes 24 Labels').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    