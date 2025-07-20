import puppeteer from 'puppeteer';
import fs from 'fs/promises';

const CACHE_FILE_PATH = 'events.json';

const scrapeAndSaveEvents = async () => {
  console.log('▶️ Starting to scrape events from Visit Qatar...');
  try {
    // Launch browser in non-headless mode for debugging (set to true later if needed)
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Set a realistic user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Navigate with increased timeout and wait for network idle
    await page.goto('https://visitqatar.com/intl-en/events-calendar', { 
      waitUntil: 'networkidle2', 
      timeout: 60000 
    });

    // Wait for event cards to load (using the correct selector)
    await page.waitForFunction(() => document.querySelectorAll('.vq-event-card').length > 0, { timeout: 60000 });

    // Simulate scrolling to trigger lazy-loaded content
    await page.evaluate(() => {
      window.scrollBy(0, document.body.scrollHeight);
      return new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds after scroll
    });

    // Extract event data
    const events = await page.evaluate(() => {
      const eventElements = document.querySelectorAll('.vq-event-card');
      return Array.from(eventElements).map(el => {
        const title = el.querySelector('.vq-card-title a')?.textContent.trim() || 'No title';
        const date = el.querySelector('.vq-event-dates')?.textContent.trim() || 'No date';
        const description = el.querySelector('.vq-card-text')?.textContent.trim() || 'No description';
        let imageUrl = el.querySelector('.vq-card-img img')?.src || 'No image available';
        let link = el.querySelector('.vq-card-title a')?.href || 'No link available';

        // Convert relative URLs to absolute
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = 'https://visitqatar.com' + imageUrl;
        }
        if (link && !link.startsWith('http')) {
          link = 'https://visitqatar.com' + link;
        }

        // Return only valid events
        if (title && title !== 'No title') {
          return { title, date, description, imageUrl, link };
        }
        return null;
      }).filter(event => event !== null);
    });

    if (events.length === 0) {
      console.error('❌ Warning: No events were found. Check the selectors or page structure.');
    } else {
      console.log(`ℹ️ Found ${events.length} events.`);
    }

    // Save events to JSON file
    await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(events, null, 2));
    console.log(`✅ Successfully saved ${events.length} events to ${CACHE_FILE_PATH}`);

    await browser.close();
  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
  }
};

scrapeAndSaveEvents();