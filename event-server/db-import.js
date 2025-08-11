import fs from 'fs/promises';
import sql from 'mssql';
import path from 'path';

// SQL Server connection configuration
const config = {
  server: 'localhost', // Try localhost first
  database: 'EventManagement2', // Your database name
  options: {
    encrypt: false, // Set to false for local SQL Server
    trustServerCertificate: true,
    enableArithAbort: true,
    trustedConnection: true, // Use Windows Authentication
    instanceName: 'SQLEXPRESS' // Add instance name if using SQL Server Express
  }
};

// Path to the events.json file
const DATA_FILE_PATH = path.join(process.cwd(), 'events.json');

async function importEventsToDatabase() {
  let pool;
  
  try {
    console.log('Reading events.json file...');
    const fileContents = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const events = JSON.parse(fileContents);
    
    console.log(`Found ${events.length} events to import.`);
    
    // Connect to SQL Server
    console.log('Connecting to SQL Server...');
    pool = await sql.connect(config);
    
    console.log('Connected successfully!');
    
    // Remove duplicates based on title and date
    const uniqueEvents = [];
    const seen = new Set();
    
    for (const event of events) {
      const key = `${event.title}-${event.date}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueEvents.push(event);
      }
    }
    
    console.log(`Importing ${uniqueEvents.length} unique events (removed ${events.length - uniqueEvents.length} duplicates)...`);
    
    // Clear existing data (optional - uncomment if you want to replace all data)
    // await pool.request().query('DELETE FROM Events');
    
    let importedCount = 0;
    
    // Insert events one by one
    for (const event of uniqueEvents) {
      try {
        const request = pool.request();
        
        // Add parameters to prevent SQL injection
        request.input('title', sql.NVarChar(255), event.title);
        request.input('eventDate', sql.NVarChar(100), event.date);
        request.input('description', sql.NVarChar(sql.MAX), event.description || null);
        request.input('imageUrl', sql.NVarChar(500), event.imageUrl || null);
        request.input('eventLink', sql.NVarChar(500), event.link || null);
        
        await request.query(`
          INSERT INTO Events (Title, EventDate, Description, ImageUrl, EventLink)
          VALUES (@title, @eventDate, @description, @imageUrl, @eventLink)
        `);
        
        importedCount++;
        console.log(`✅ Imported: ${event.title}`);
        
      } catch (insertError) {
        console.error(`❌ Error importing "${event.title}":`, insertError.message);
      }
    }
    
    console.log(`\n🎉 Successfully imported ${importedCount} out of ${uniqueEvents.length} events to database!`);
    
  } catch (error) {
    console.error('❌ Error importing events to database:', error.message);
    console.error('Full error:', error);
  } finally {
    // Close the connection
    if (pool) {
      await pool.close();
      console.log('Database connection closed.');
    }
  }
}

// Run the import function
importEventsToDatabase();
