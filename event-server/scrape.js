import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';

const CACHE_FILE_PATH = 'events.json';

const scrapeAndSaveEvents = async () => {
  console.log('▶️  Starting to scrape events from Visit Qatar...');
  try {
    const { data } = await axios.get('https://visitqatar.com/intl-en/events-calendar');
    const $ = cheerio.load(data);
    const events = [];

    $('.calendar-item').each((i, el) => {
      const event = {
        title: $(el).find('.calendar-item__title').text().trim(),
        date: $(el).find('.calendar-item__date').text().trim(),
        description: $(el).find('.calendar-item__description').text().trim(),
        imageUrl: `https://visitqatar.com${$(el).find('.calendar-item__image img').attr('src')}`,
        link: `https://visitqatar.com${$(el).find('a').attr('href')}`
      };
      events.push(event);
    });

    // Write the scraped data to the cache file
    await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(events, null, 2));
    console.log(`✅ Successfully saved ${events.length} events to ${CACHE_FILE_PATH}`);
  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
  }
};

// Run the function
scrapeAndSaveEvents();