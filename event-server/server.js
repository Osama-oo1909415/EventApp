import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises'; // Import the file system module

const app = express();
const port = 5001;

const CACHE_FILE_PATH = 'events.json';
const CACHE_DURATION_HOURS = 24; // How long to keep the cache before refreshing (in hours)

app.use(cors());
app.use(express.json());

/**
 * Scrapes the Visit Qatar website, saves the events to events.json, and returns them.
 */
const scrapeAndCacheEvents = async () => {
  console.log('Scraping new events from Visit Qatar...');
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
    console.log(`✅ Successfully scraped and saved ${events.length} events to ${CACHE_FILE_PATH}`);
    return events;
  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
    throw error; // Propagate the error
  }
};

// API endpoint to get the events
app.get('/api/events', async (req, res) => {
  try {
    // Check if the cache file exists
    const stats = await fs.stat(CACHE_FILE_PATH).catch(() => null);

    if (!stats) {
      console.log('Cache file not found. Scraping new data...');
      const events = await scrapeAndCacheEvents();
      return res.json(events);
    }

    const fileAgeHours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);

    if (fileAgeHours > CACHE_DURATION_HOURS) {
      console.log(`Cache is older than ${CACHE_DURATION_HOURS} hours. Scraping new data...`);
      const events = await scrapeAndCacheEvents();
      return res.json(events);
    }

    // If cache is fresh, read and return the file
    console.log('Serving events from fresh cache.');
    const cachedData = await fs.readFile(CACHE_FILE_PATH, 'utf-8');
    return res.json(JSON.parse(cachedData));

  } catch (error) {
    console.error('Error in /api/events:', error.message);
    // If scraping fails, try to serve stale data from cache if it exists
    try {
      const cachedData = await fs.readFile(CACHE_FILE_PATH, 'utf-8');
      console.log('Serving stale events from cache due to an error.');
      return res.json(JSON.parse(cachedData));
    } catch (cacheError) {
      return res.status(500).send('Error fetching events and cache is unavailable.');
    }
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});