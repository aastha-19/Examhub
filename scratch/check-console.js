const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Listen for console events
    page.on('console', msg => {
        console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
    });
    
    // Listen for page errors
    page.on('pageerror', error => {
        console.log(`[PAGE ERROR]: ${error.message}`);
    });
    
    // Listen for failed responses
    page.on('response', response => {
        if (!response.ok()) {
            console.log(`[NETWORK FAIL] ${response.status()} ${response.url()}`);
        }
    });

    console.log("Navigating to http://localhost:5173 ...");
    try {
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
        console.log("Navigation successful. Logging in...");
        
        await page.type('input[type="email"]', 'test@example.com');
        await page.type('input[type="password"]', 'Test@123');
        await Promise.all([
          page.click('button[type="submit"]'),
          page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {})
        ]);
        console.log("Login submitted, waiting a bit...");
        await new Promise(r => setTimeout(r, 2000));
        
    } catch (e) {
        console.log(`[ERROR]: ${e.message}`);
    }

    await browser.close();
})();
