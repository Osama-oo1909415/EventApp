import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const port = 5001;

const DATA_FILE_PATH = path.join(process.cwd(), 'events.json');

app.use(cors());
app.use(express.json());

// API endpoint to get the events from the JSON file
app.get('/api/events', async (req, res) => {
  console.log(`Request received. Reading from ${DATA_FILE_PATH}`);
  try {
    // Read the events.json file
    const fileContents = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const events = JSON.parse(fileContents);
    res.json(events);
  } catch (error) {
    console.error('❌ Could not read events.json:', error.message);
    res.status(500).send('Error: Could not read the events data file. Please run the scrape script first.');
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
  console.log('This server will only serve data from events.json.');
});