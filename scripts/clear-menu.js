// clear-menu.js — Drops all menu items and categories from MongoDB directly
// Usage: node scripts/clear-menu.js
// Requires: MONGODB_URI env var or uses default localhost

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/my-app-production';

async function clearMenu() {
  console.log('🗑️  Clearing all menu data...');
  console.log(`   Connecting to: ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}\n`);

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();

    // Delete all menu items
    const itemResult = await db.collection('menuitems').deleteMany({});
    console.log(`  ✅ Deleted ${itemResult.deletedCount} menu items`);

    // Delete all menu categories
    const catResult = await db.collection('menucategories').deleteMany({});
    console.log(`  ✅ Deleted ${catResult.deletedCount} menu categories`);

    console.log('\n✨ Menu data cleared successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

clearMenu();
