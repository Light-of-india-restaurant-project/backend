// remove-duplicates.js — Remove duplicate menu items and categories from MongoDB
// Usage: MONGODB_URI="your-connection-string" node scripts/remove-duplicates.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || process.env.DB_URI;

if (!MONGODB_URI) {
  console.error('❌ Please set MONGODB_URI or DB_URI environment variable');
  process.exit(1);
}

async function removeDuplicates() {
  console.log('🔍 Finding and removing duplicate menu data...\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();

    // --- Deduplicate Menu Categories ---
    console.log('📁 Deduplicating categories...');
    const categories = await db.collection('menucategories').find({}).sort({ createdAt: 1 }).toArray();
    const seenCategories = new Map();
    const catDuplicateIds = [];

    for (const cat of categories) {
      const key = cat.name;
      if (seenCategories.has(key)) {
        catDuplicateIds.push(cat._id);
      } else {
        seenCategories.set(key, cat._id);
      }
    }

    if (catDuplicateIds.length > 0) {
      const catResult = await db.collection('menucategories').deleteMany({ _id: { $in: catDuplicateIds } });
      console.log(`   ✅ Removed ${catResult.deletedCount} duplicate categories`);
    } else {
      console.log('   ✅ No duplicate categories found');
    }

    // Build a map from old category IDs to the kept category IDs (by name)
    // So we can update menu items that reference deleted categories
    const remainingCategories = await db.collection('menucategories').find({}).toArray();
    const categoryNameToId = new Map();
    for (const cat of remainingCategories) {
      categoryNameToId.set(cat.name, cat._id);
    }

    // --- Deduplicate Menu Items ---
    console.log('\n🍽️  Deduplicating menu items...');
    const items = await db.collection('menuitems').find({}).sort({ createdAt: 1 }).toArray();
    const seenItems = new Map();
    const itemDuplicateIds = [];

    for (const item of items) {
      // Use name + price as the unique key (same dish with same price = duplicate)
      const key = `${item.name}__${item.price}`;
      if (seenItems.has(key)) {
        itemDuplicateIds.push(item._id);
      } else {
        seenItems.set(key, item._id);
      }
    }

    if (itemDuplicateIds.length > 0) {
      const itemResult = await db.collection('menuitems').deleteMany({ _id: { $in: itemDuplicateIds } });
      console.log(`   ✅ Removed ${itemResult.deletedCount} duplicate menu items`);
    } else {
      console.log('   ✅ No duplicate menu items found');
    }

    // --- Update menu items that reference deleted categories ---
    console.log('\n🔗 Fixing category references on remaining items...');
    const remainingItems = await db.collection('menuitems').find({}).toArray();
    const validCatIds = new Set(remainingCategories.map(c => c._id.toString()));
    let fixedCount = 0;

    for (const item of remainingItems) {
      if (item.category && !validCatIds.has(item.category.toString())) {
        // This item references a deleted category, try to find the kept one
        // We need to look up what category name this was - check all original categories
        const originalCat = categories.find(c => c._id.toString() === item.category.toString());
        if (originalCat && categoryNameToId.has(originalCat.name)) {
          await db.collection('menuitems').updateOne(
            { _id: item._id },
            { $set: { category: categoryNameToId.get(originalCat.name) } }
          );
          fixedCount++;
        }
      }
    }
    console.log(`   ✅ Fixed ${fixedCount} category references`);

    // --- Summary ---
    const finalCats = await db.collection('menucategories').countDocuments();
    const finalItems = await db.collection('menuitems').countDocuments();
    console.log(`\n📊 Final counts:`);
    console.log(`   Categories: ${finalCats}`);
    console.log(`   Menu Items: ${finalItems}`);
    console.log('\n✨ Deduplication complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

removeDuplicates();
