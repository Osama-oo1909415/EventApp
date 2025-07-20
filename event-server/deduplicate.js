const fs = require('fs');
const path = require('path');

// Read the events.json file
const eventsFilePath = path.join(__dirname, 'events.json');
const events = JSON.parse(fs.readFileSync(eventsFilePath, 'utf8'));

// Create a Map to track unique events
const uniqueEvents = new Map();

// Filter out duplicates by creating a key from title + date
events.forEach((event) => {
  const key = `${event.title}${event.date}`;
  if (!uniqueEvents.has(key)) {
    uniqueEvents.set(key, event);
  }
});

// Convert Map values back to array
const deduplicatedEvents = Array.from(uniqueEvents.values());

// Add unique IDs to each event
const eventsWithIds = deduplicatedEvents.map((event, index) => ({
  id: `event-${index + 1}`,
  ...event
}));

// Write the deduplicated events back to the file
fs.writeFileSync(
  eventsFilePath,
  JSON.stringify(eventsWithIds, null, 2),
  'utf8'
);

console.log(`Removed ${events.length - deduplicatedEvents.length} duplicate events.`);
console.log(`Added unique IDs to ${deduplicatedEvents.length} events.`);
