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
        # -> Navigate to the root or home page to find a valid page that renders the required components or find a way to render components with sample data.
        await page.goto('http://localhost:3000/', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Interact with Navbar language toggle button and Buy Now button on a ProductCard to verify interactive functionality.
        frame = context.pages[-1]
        # Click Navbar language toggle button (العربية) to test language switch
        elem = frame.locator('xpath=html/body/main/nav/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click Buy Now button in Hero section to test button functionality
        elem = frame.locator('xpath=html/body/main/section/div[2]/div[2]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on another Buy Now button on a different ProductCard to verify interactive functionality, then toggle language back to English and verify UI updates.
        frame = context.pages[-1]
        # Click Buy Now button on Apple Pencil ProductCard to test interaction
        elem = frame.locator('xpath=html/body/main/section[6]/div[3]/div[2]/div/div[3]/div[2]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click Navbar language toggle button 'English' to switch language back to English
        elem = frame.locator('xpath=html/body/main/nav/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Switch to the valid product listing tab at http://localhost:3000/en to continue testing the Navbar, Hero, and ProductCard components.
        await page.goto('http://localhost:3000/en', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Interact with a Buy Now button on a ProductCard to verify interactive functionality, then toggle language to Arabic and verify UI updates accordingly.
        frame = context.pages[-1]
        # Click Buy Now button on Apple Pencil ProductCard to test interaction
        elem = frame.locator('xpath=html/body/main/section[6]/div[3]/div[2]/div/div[3]/div[2]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click Navbar language toggle button 'العربية' to switch language to Arabic
        elem = frame.locator('xpath=html/body/div/header/div/div[3]/div[2]/div[2]/div/ul/li/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=العربية').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=English').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Apple Pencil (USB-C)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=No featured offers available').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=See All Buying Options').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Deliver to Dubai, Al Barsha').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Mac Accessories').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=iPhone Accessories').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=iPad Accessories').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Apple Watch Accessories').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Apple TV Accessories').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=AirPods Accessories').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    