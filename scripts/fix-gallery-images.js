const mongoose = require('mongoose');

async function fixImages() {
  await mongoose.connect('mongodb+srv://abishek:abishek@cluster0.q0wshjh.mongodb.net/light-of-india?retryWrites=true&w=majority&appName=Cluster0');
  const db = mongoose.connection.db;
  
  // Fix broken images with working Unsplash URLs
  const fixes = [
    {
      title: 'Masala Scallops',
      newUrl: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80' // seafood
    },
    {
      title: 'Truffle Paneer Tikka',
      newUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80' // paneer
    }
  ];
  
  for (const fix of fixes) {
    const result = await db.collection('galleryimages').updateOne(
      { title: fix.title },
      { $set: { imageUrl: fix.newUrl } }
    );
    console.log(`${fix.title}: ${result.modifiedCount ? 'Fixed' : 'Not found'}`);
  }
  
  await mongoose.disconnect();
  console.log('Done!');
}

fixImages();
