import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = express();
const port = 5001; // You can use any available port

app.use(cors());
app.use(express.json());

// API endpoint to get the events
app.get('/api/events', async (req, res) => {
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

    res.json(events);
  } catch (error) {
    console.error('Scraping Error:', error.message);
    res.status(500).send('Error fetching events');
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});