import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const port = 5001;

const DATA_FILE_PATH = path.join(process.cwd(), 'events.json');

app.use(cors());
app.use(express.json());

app.get('/api/events', async (req, res) => {
  console.log(`Request received. Attempting to read from ${DATA_FILE_PATH}`);
  try {
    const fileContents = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const events = JSON.parse(fileContents);
    res.json(events);
  } catch (error) {
    console.error('❌ Could not read events.json:', error.message);
    res.status(500).send('Error: Could not read the events data file. Please run `node scrape.js` first.');
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});