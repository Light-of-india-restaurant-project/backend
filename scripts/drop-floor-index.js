const mongoose = require('mongoose');
require('dotenv').config();

async function dropIndexes() {
  // Connect using DB_URI with my-app-development as database name (same as server config)
  const uri = process.env.DB_URI;
  const dbName = 'my-app-development';
  
  console.log('Connecting to MongoDB database:', dbName);
  await mongoose.connect(uri, { dbName });
  console.log('Connected to MongoDB');
  
  // Drop old floor index
  try {
    await mongoose.connection.collection('floors').dropIndex('floorNumber_1');
    console.log('Successfully dropped floors floorNumber_1 index');
  } catch (err) {
    if (err.code === 27) {
      console.log('floors floorNumber_1 index does not exist (already dropped)');
    } else {
      console.error('Error dropping floors index:', err.message);
    }
  }
  
  // Drop old table name_1 index
  try {
    await mongoose.connection.collection('tables').dropIndex('name_1');
    console.log('Successfully dropped tables name_1 index');
  } catch (err) {
    if (err.code === 27) {
      console.log('tables name_1 index does not exist (already dropped)');
    } else {
      console.error('Error dropping tables index:', err.message);
    }
  }
  
  // List floors indexes
  console.log('\n--- Floors Indexes ---');
  try {
    const floorIndexes = await mongoose.connection.collection('floors').indexes();
    console.log(JSON.stringify(floorIndexes, null, 2));
  } catch (err) {
    console.log('Could not list floors indexes:', err.message);
  }
  
  // List tables indexes
  console.log('\n--- Tables Indexes ---');
  try {
    const tableIndexes = await mongoose.connection.collection('tables').indexes();
    console.log(JSON.stringify(tableIndexes, null, 2));
  } catch (err) {
    console.log('Could not list tables indexes:', err.message);
  }
  
  await mongoose.disconnect();
  console.log('\nDone');
}

dropIndexes().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
