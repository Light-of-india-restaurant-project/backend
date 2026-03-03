// remove-duplicates.js — Remove duplicate menu items and categories
// Usage: node scripts/remove-duplicates.js
// Uses mongoose (already installed) — no extra dependencies needed

const mongoose = require('mongoose');

const DB_URI = 'mongodb+srv://abishek:abishek@cluster0.q0wshjh.mongodb.net/light-of-india?retryWrites=true&w=majority&appName=Cluster0';

async function removeDuplicates() {
  await mongoose.connect(DB_URI);
  const db = mongoose.connection.db;

  // Count before
  const beforeCats = await db.collection('menucategories').countDocuments();
  const beforeItems = await db.collection('menuitems').countDocuments();
  console.log('BEFORE:', beforeCats, 'categories,', beforeItems, 'items');

  // --- Deduplicate categories by name (keep first, delete rest) ---
  const allCats = await db.collection('menucategories').find({}).sort({ createdAt: 1 }).toArray();
  const seenCatNames = new Set();
  const catIdsToDelete = [];
  for (const cat of allCats) {
    if (seenCatNames.has(cat.name)) {
      catIdsToDelete.push(cat._id);
    } else {
      seenCatNames.add(cat.name);
    }
  }
  if (catIdsToDelete.length > 0) {
    await db.collection('menucategories').deleteMany({ _id: { $in: catIdsToDelete } });
    console.log('Deleted', catIdsToDelete.length, 'duplicate categories');
  }

  // --- Deduplicate items by name + menuType (keep first, delete rest) ---
  const allItems = await db.collection('menuitems').find({}).sort({ createdAt: 1 }).toArray();
  const seenItemKeys = new Set();
  const itemIdsToDelete = [];
  for (const item of allItems) {
    const key = item.name + '||' + (item.menuType || 'both');
    if (seenItemKeys.has(key)) {
      itemIdsToDelete.push(item._id);
    } else {
      seenItemKeys.add(key);
    }
  }
  if (itemIdsToDelete.length > 0) {
    await db.collection('menuitems').deleteMany({ _id: { $in: itemIdsToDelete } });
    console.log('Deleted', itemIdsToDelete.length, 'duplicate items');
  }

  // --- Fix items pointing to deleted category IDs ---
  const keptCats = await db.collection('menucategories').find({}).toArray();
  const nameToKeptId = {};
  keptCats.forEach(c => { nameToKeptId[c.name] = c._id; });
  const validCatIds = new Set(keptCats.map(c => c._id.toString()));
  const remainingItems = await db.collection('menuitems').find({}).toArray();
  let fixed = 0;
  for (const item of remainingItems) {
    if (item.category && !validCatIds.has(item.category.toString())) {
      const origCat = allCats.find(c => c._id.toString() === item.category.toString());
      if (origCat && nameToKeptId[origCat.name]) {
        await db.collection('menuitems').updateOne(
          { _id: item._id },
          { $set: { category: nameToKeptId[origCat.name] } }
        );
        fixed++;
      }
    }
  }
  if (fixed > 0) console.log('Fixed', fixed, 'category references');

  // Count after
  const afterCats = await db.collection('menucategories').countDocuments();
  const afterItems = await db.collection('menuitems').countDocuments();
  console.log('AFTER:', afterCats, 'categories,', afterItems, 'items');

  await mongoose.disconnect();
  console.log('Done!');
}

removeDuplicates().catch(e => { console.error(e); process.exit(1); });
