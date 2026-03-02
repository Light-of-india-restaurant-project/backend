const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/my-app-production';

// Define Gallery Schema - must match backend model name "GalleryImage"
const galleryImageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleNl: { type: String, required: true },
  alt: { type: String, required: true },
  altNl: { type: String, required: true },
  category: { type: String, enum: ['food', 'ambiance'], required: true },
  imageUrl: { type: String, required: true },
  section: { type: Number, enum: [1, 2], required: true },
  isFeatured: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const GalleryImage = mongoose.model('GalleryImage', galleryImageSchema);

// Sample gallery images - using placeholder URLs
// These can be replaced with actual image URLs or base64 data later
const galleryImages = [
  // ===================== SECTION 1 =====================
  // Featured (Large) Image
  {
    title: 'Main Dining Hall',
    titleNl: 'Grote Eetzaal',
    alt: 'Elegant Dining Room',
    altNl: 'Elegante Eetkamer',
    category: 'ambiance',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    section: 1,
    isFeatured: true,
    sortOrder: 1,
    isActive: true,
  },
  // Side Images (2)
  {
    title: 'Butter Chicken',
    titleNl: 'Boter Kip',
    alt: 'Signature Butter Chicken',
    altNl: 'Kenmerkende Boter Kip',
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80',
    section: 1,
    isFeatured: false,
    sortOrder: 2,
    isActive: true,
  },
  {
    title: 'Heated Terrace',
    titleNl: 'Verwarmd Terras',
    alt: 'Heated Terrace Evening',
    altNl: 'Verwarmd Terras Avond',
    category: 'ambiance',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    section: 1,
    isFeatured: false,
    sortOrder: 3,
    isActive: true,
  },
  // Bottom Row (3)
  {
    title: 'Gilafi Seekh Kebab',
    titleNl: 'Gilafi Seekh Kebab',
    alt: 'Gilafi Seekh Kebab',
    altNl: 'Gilafi Seekh Kebab',
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80',
    section: 1,
    isFeatured: false,
    sortOrder: 4,
    isActive: true,
  },
  {
    title: 'Private Dining',
    titleNl: 'Privé Dining',
    alt: 'Private Dining Room',
    altNl: 'Privé Eetkamer',
    category: 'ambiance',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    section: 1,
    isFeatured: false,
    sortOrder: 5,
    isActive: true,
  },
  {
    title: 'Tandoori Halibut',
    titleNl: 'Tandoori Heilbot',
    alt: 'Tandoori Halibut',
    altNl: 'Tandoori Heilbot',
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&q=80',
    section: 1,
    isFeatured: false,
    sortOrder: 6,
    isActive: true,
  },

  // ===================== SECTION 2 =====================
  // Featured (Large) Image
  {
    title: 'The Lounge Bar',
    titleNl: 'De Lounge Bar',
    alt: 'Bar & Lounge Area',
    altNl: 'Bar & Lounge Ruimte',
    category: 'ambiance',
    imageUrl: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80',
    section: 2,
    isFeatured: true,
    sortOrder: 1,
    isActive: true,
  },
  // Side Images (2)
  {
    title: 'Hyderabadi Biryani',
    titleNl: 'Hyderabadi Biryani',
    alt: 'Lamb Biryani',
    altNl: 'Lams Biryani',
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1633945274417-271a7a421f1e?w=800&q=80',
    section: 2,
    isFeatured: false,
    sortOrder: 2,
    isActive: true,
  },
  {
    title: 'Culinary Artistry',
    titleNl: 'Culinaire Kunst',
    alt: 'Chef Preparing Dish',
    altNl: 'Chef Bereidt Gerecht',
    category: 'ambiance',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
    section: 2,
    isFeatured: false,
    sortOrder: 3,
    isActive: true,
  },
  // Bottom Row (3)
  {
    title: 'Masala Scallops',
    titleNl: 'Masala Coquilles',
    alt: 'Seared Scallops',
    altNl: 'Aangebraden Coquilles',
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1579783483458-83d02f5d2d5e?w=800&q=80',
    section: 2,
    isFeatured: false,
    sortOrder: 4,
    isActive: true,
  },
  {
    title: 'Dal Makhani',
    titleNl: 'Dal Makhani',
    alt: 'Dal Makhani',
    altNl: 'Dal Makhani',
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80',
    section: 2,
    isFeatured: false,
    sortOrder: 5,
    isActive: true,
  },
  {
    title: 'Truffle Paneer Tikka',
    titleNl: 'Truffel Paneer Tikka',
    alt: 'Truffle Paneer',
    altNl: 'Truffel Paneer',
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80',
    section: 2,
    isFeatured: false,
    sortOrder: 6,
    isActive: true,
  },
  // Extra Row for Section 2 (3 more images)
  {
    title: 'Lamb Rogan Josh',
    titleNl: 'Lams Rogan Josh',
    alt: 'Lamb Rogan Josh',
    altNl: 'Lams Rogan Josh',
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
    section: 2,
    isFeatured: false,
    sortOrder: 7,
    isActive: true,
  },
  {
    title: 'Chicken Tikka',
    titleNl: 'Kip Tikka',
    alt: 'Chicken Tikka Masala',
    altNl: 'Kip Tikka Masala',
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
    section: 2,
    isFeatured: false,
    sortOrder: 8,
    isActive: true,
  },
  {
    title: 'Restaurant Ambiance',
    titleNl: 'Restaurant Sfeer',
    alt: 'Warm Restaurant Interior',
    altNl: 'Warm Restaurant Interieur',
    category: 'ambiance',
    imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80',
    section: 2,
    isFeatured: false,
    sortOrder: 9,
    isActive: true,
  },
];

async function seedGallery() {
  console.log('🖼️  Seeding Gallery...');
  console.log('📦 Connecting to MongoDB:', MONGODB_URI);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check current count
    const existingCount = await GalleryImage.countDocuments();
    console.log(`📊 Existing gallery images: ${existingCount}`);

    if (existingCount > 0) {
      console.log('🗑️  Clearing existing gallery images...');
      await GalleryImage.deleteMany({});
    }

    // Insert all images
    const result = await GalleryImage.insertMany(galleryImages);
    console.log(`✅ Inserted ${result.length} gallery images`);

    // Summary
    const section1Count = galleryImages.filter(i => i.section === 1).length;
    const section2Count = galleryImages.filter(i => i.section === 2).length;
    console.log(`\n📋 Summary:`);
    console.log(`   Section 1: ${section1Count} images (1 featured + 2 side + 3 bottom)`);
    console.log(`   Section 2: ${section2Count} images (1 featured + 2 side + 3 bottom + 3 extra row)`);

  } catch (error) {
    console.error('❌ Error seeding gallery:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Gallery seeding complete!');
  }
}

seedGallery();
