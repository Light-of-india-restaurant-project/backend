const mongoose = require("mongoose");

async function seed() {
  await mongoose.connect("mongodb+srv://abishek:abishek@cluster0.q0wshjh.mongodb.net/my-app-development?retryWrites=true&w=majority&appName=Cluster0");
  console.log("Connected to MongoDB (my-app-development)");
  
  const db = mongoose.connection.db;
  
  const packs = [
    {
      name: "Classic Indian Feast",
      description: "A perfect introduction to Indian cuisine with our most popular dishes. Includes butter chicken, dal makhani, vegetable biryani, naan bread, and raita.",
      descriptionNl: "Een perfecte kennismaking met de Indiase keuken met onze populairste gerechten. Inclusief butter chicken, dal makhani, groente biryani, naanbrood en raita.",
      category: "mixed",
      pricePerPerson: 24.95,
      minPeople: 10,
      menuItems: [],
      image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
      isActive: true,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Vegetarian Delight",
      description: "A wholesome vegetarian spread featuring paneer tikka, palak paneer, chana masala, vegetable biryani, assorted naan, and fresh salad.",
      descriptionNl: "Een gezond vegetarisch buffet met paneer tikka, palak paneer, chana masala, groente biryani, diverse naan en verse salade.",
      category: "vegetarian",
      pricePerPerson: 22.50,
      minPeople: 10,
      menuItems: [],
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800",
      isActive: true,
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Royal Tandoori Selection",
      description: "Premium tandoori specialties including lamb chops, chicken tikka, seekh kebab, tandoori prawns, with mint chutney and fresh naan.",
      descriptionNl: "Premium tandoori specialiteiten inclusief lamskoteletten, chicken tikka, seekh kebab, tandoori garnalen, met munt chutney en verse naan.",
      category: "non-vegetarian",
      pricePerPerson: 32.95,
      minPeople: 15,
      menuItems: [],
      image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800",
      isActive: true,
      sortOrder: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Corporate Lunch Box",
      description: "Individual lunch boxes perfect for meetings. Each box contains chicken curry or paneer, rice, naan, salad, and dessert.",
      descriptionNl: "Individuele lunchboxen perfect voor vergaderingen. Elke box bevat kip curry of paneer, rijst, naan, salade en dessert.",
      category: "mixed",
      pricePerPerson: 18.50,
      minPeople: 8,
      menuItems: [],
      image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800",
      isActive: true,
      sortOrder: 4,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Grand Celebration Package",
      description: "Our premium package for special occasions. Features lamb biryani, butter chicken, mixed grill platter, paneer dishes, variety of breads, desserts and drinks.",
      descriptionNl: "Ons premium pakket voor speciale gelegenheden. Met lams biryani, butter chicken, mixed grill schotel, paneer gerechten, diverse broden, desserts en drankjes.",
      category: "mixed",
      pricePerPerson: 45.00,
      minPeople: 20,
      menuItems: [],
      image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800",
      isActive: true,
      sortOrder: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  // Clear existing packs and insert new ones
  await db.collection("cateringpacks").deleteMany({});
  const result = await db.collection("cateringpacks").insertMany(packs);
  console.log("Inserted", result.insertedCount, "catering packs");
  
  // Verify
  const count = await db.collection("cateringpacks").countDocuments();
  console.log("Total packs in database:", count);
  
  await mongoose.disconnect();
  console.log("Done!");
}

seed().catch(console.error);
