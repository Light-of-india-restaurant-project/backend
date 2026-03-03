// remove-duplicates.js — Remove duplicate menu items and categories using mongoose
// Usage: node scripts/remove-duplicates.js

const mongoose = require('mongoose');

const DB_URI = 'mongodb+srv://abishek:abishek@cluster0.q0wshjh.mongodb.net/light-of-india?retryWrites=true&w=majority&appName=Cluster0';

async function removeDuplicates() {
  console.log('Connecting to database...\n');
  await mongoose.connect(DB_URI);
  const db = mongoose.connection.db;

  // --- Deduplicate Menu Categories ---
  console.log('Deduplicating categories...');
  const categories = await db.collection('menucategories').find({}).sort({ createdAt: 1 }).toArray();
  const seenCats = new Map();
  const catDupIds = [];

  for (const cat of categories) {
    if (seenCats.has(cat.name)) {
      catDupIds.push(cat._id);
    } else {
      seenCats.set(cat.name, cat._id);
    }
  }

  if (catDupIds.length > 0) {
    const r = await db.collection('menucategories').deleteMany({ _id: { $in: catDupIds } });
    console.log(`  Removed ${r.deletedCount} duplicate categories`);
  } else {
    console.log('  No duplicate categories found');
  }

  // --- Deduplicate Menu Items ---
  console.log('\nDeduplicating menu items...');
  const items = await db.collection('menuitems').find({}).sort({ createdAt: 1 }).toArray();
  const seenItems = new Map();
  const itemDupIds = [];

  for (const item of items) {
    const key = `${item.name}__${item.price}`;
    if (seenItems.has(key)) {
      itemDupIds.push(item._id);
    } else {
      seenItems.set(key, item._id);
    }
  }

  if (itemDupIds.length > 0) {
    const r = await db.collection('menuitems').deleteMany({ _id: { $in: itemDupIds } });
    console.log(`  Removed ${r.deletedCount} duplicate menu items`);
  } else {
    console.log('  No duplicate menu items found');
  }

  // --- Fix category references ---
  console.log('\nFixing category references...');
  const remainingCats = await db.collection('menucategories').find({}).toArray();
  const catNameToId = new Map();
  for (const c of remainingCats) catNameToId.set(c.name, c._id);
  const validIds = new Set(remainingCats.map(c => c._id.toString()));

  const remainingItems = await db.collection('menuitems').find({}).toArray();
  let fixed = 0;
  for (const item of remainingItems) {
    if (item.category && !validIds.has(item.category.toString())) {
      const orig = categories.find(c => c._id.toString() === item.category.toString());
      if (orig && catNameToId.has(orig.name)) {
        await db.collection('menuitems').updateOne(
          { _id: item._id },
          { $set: { category: catNameToId.get(orig.name) } }
        );
        fixed++;
      }
    }
  }
  console.log(`  Fixed ${fixed} category references`);

  // --- Summary ---
  const finalCats = await db.collection('menucategories').countDocuments();
  const finalItems = await db.collection('menuitems').countDocuments();
  console.log(`\nFinal counts: ${finalCats} categories, ${finalItems} items`);
  console.log('Done!');

  await mongoose.disconnect();
}

removeDuplicates().catch(err => { console.error(err); process.exit(1); });
