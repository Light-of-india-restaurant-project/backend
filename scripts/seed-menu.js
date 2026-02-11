const http = require('http');

const API_BASE = 'http://localhost:3000/api/v1/menu';

// Helper function to make HTTP requests
const makeRequest = (method, path, data) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

// Categories to create
const categories = [
  { name: 'Starters', icon: '🥗', sortOrder: 1 },
  { name: 'Main Course', icon: '🍛', sortOrder: 2 },
  { name: 'Lamb Dishes', icon: '🍖', sortOrder: 3 },
  { name: 'Vegetarian', icon: '🥬', sortOrder: 4 },
  { name: 'Dal / Lentils', icon: '🫘', sortOrder: 5 },
  { name: 'Biryani', icon: '🍚', sortOrder: 6 },
  { name: 'Salads', icon: '🥗', sortOrder: 7 },
  { name: 'Kids Menu', icon: '👶', sortOrder: 8 },
  { name: 'Indian Breads & Extras', icon: '🫓', sortOrder: 9 },
  { name: 'Chinese Starters', icon: '🥡', sortOrder: 10 },
  { name: 'Chinese Main Course', icon: '🍜', sortOrder: 11 },
  { name: 'Desserts', icon: '🍨', sortOrder: 12 },
  { name: 'Drinks', icon: '🥤', sortOrder: 13 },
];

// Dine-in menu items
const dineInItems = [
  // STARTERS
  { name: 'Mulligatawny Soup', price: 7.50, description: 'Hearty spiced lentil and vegetable soup with aromatic curry notes.', category: 'Starters', isVegetarian: true, sortOrder: 1 },
  { name: 'Chargrilled Tomato Basil Broth', price: 7.50, description: 'Smoky roasted tomato and basil soup with a creamy, crisp garnish.', category: 'Starters', isVegetarian: true, sortOrder: 2 },
  { name: 'Sweetcorn Soup', price: 7.50, description: 'Rich creamy sweetcorn blended with subtle spices for a comforting start.', category: 'Starters', isVegetarian: true, sortOrder: 3 },
  { name: 'Dahi Bhalla', price: 8.50, description: 'Light lentil dumplings soaked in chilled yogurt with tangy chutneys.', category: 'Starters', isVegetarian: true, sortOrder: 4 },
  { name: 'Papdi Chaat', price: 8.50, description: 'Crispy wafers topped with spiced potatoes, chilled yogurt and chutneys.', category: 'Starters', isVegetarian: true, sortOrder: 5 },
  { name: 'Pani Puri', price: 7.50, description: 'Crispy hollow balls filled with spicy potato and served with tangy mint-tamarind water.', category: 'Starters', isVegetarian: true, sortOrder: 6 },
  { name: 'Pani Puri Shot (alcoholic)', price: 8.50, description: 'Pani puri served with a refreshing boozy twist on mint and tamarind water.', category: 'Starters', isVegetarian: true, sortOrder: 7 },
  { name: 'Lawrence Road Ki Aloo Tikki', price: 6.50, description: 'Golden fried spiced potato patties with cooling chutneys.', category: 'Starters', isVegetarian: true, sortOrder: 8 },
  { name: 'Sev Dahi Puri', price: 7.50, description: 'Crispy puris filled with spiced potatoes, yogurt and crunchy sev.', category: 'Starters', isVegetarian: true, sortOrder: 9 },
  { name: 'Samosa Veg', price: 6.00, description: '2 x samosa pieces served with tangy sauces.', category: 'Starters', isVegetarian: true, sortOrder: 10 },
  { name: 'Samosa Chaat', price: 7.50, description: 'Samosa pieces topped with chickpeas and tangy sauces.', category: 'Starters', isVegetarian: true, sortOrder: 11 },
  { name: 'Onion Bhaji', price: 6.00, description: 'Crispy fried onion fritters served with chutney.', category: 'Starters', isVegetarian: true, sortOrder: 12 },
  { name: 'Chicken Kathi Roll', price: 9.00, description: 'Seasoned grilled chicken wrapped in warm, soft flatbread.', category: 'Starters', isVegetarian: false, sortOrder: 13 },
  { name: 'Classic Tandoori Chicken', price: 7.50, description: 'Tender half chicken marinated in traditional spices and clay-oven roasted.', category: 'Starters', isVegetarian: false, sortOrder: 14 },
  { name: 'Tangri Kebab', price: 12.50, description: 'Juicy chicken leg pieces marinated in ginger-garlic and lemon.', category: 'Starters', isVegetarian: false, sortOrder: 15 },
  { name: 'Murgh Afgani (Starter)', price: 13.50, description: 'Chicken marinated in cashew paste grilled to juicy perfection.', category: 'Starters', isVegetarian: false, sortOrder: 16 },
  { name: 'Tandoori Prawn (Starter)', price: 14.50, description: 'Plump prawns marinated in Indian spices and grilled in tandoor.', category: 'Starters', isVegetarian: false, sortOrder: 17 },
  { name: 'LOI Chicken Tikka', price: 13.50, description: 'Tender chicken chunks marinated overnight and perfectly grilled.', category: 'Starters', isVegetarian: false, sortOrder: 18 },
  { name: 'Chicken 65', price: 12.50, description: 'Crispy spiced chicken with a tangy South Indian spice kick.', category: 'Starters', isVegetarian: false, sortOrder: 19 },
  { name: 'Koliwala Prawns', price: 14.50, description: 'Crispy Mumbai-style spiced prawns fried to golden perfection.', category: 'Starters', isVegetarian: false, sortOrder: 20 },
  { name: 'Malai Broccoli', price: 11.99, description: 'Broccoli marinated in cheese and yogurt then roasted.', category: 'Starters', isVegetarian: true, sortOrder: 21 },
  { name: 'Reshmi Khumb', price: 13.99, description: 'Soft cheese-stuffed mushrooms fried to a golden crisp.', category: 'Starters', isVegetarian: true, sortOrder: 22 },
  { name: 'Corn and Jalapeño Harabhara', price: 13.50, description: 'Sweetcorn and jalapeño bites with melted cheese and mint chutney.', category: 'Starters', isVegetarian: true, sortOrder: 23 },
  { name: 'Basil Garlic Paneer Tikka', price: 14.99, description: 'Paneer cubes marinated in basil garlic spices and grilled tender.', category: 'Starters', isVegetarian: true, sortOrder: 24 },

  // MAIN COURSE
  { name: 'Old Delhi Butter Chicken', price: 19.50, description: 'Creamy tomato gravy with succulent pieces of grilled chicken.', category: 'Main Course', isVegetarian: false, sortOrder: 1 },
  { name: 'Chicken Saag', price: 19.50, description: 'Chicken simmered in rich spinach-based curry sauce.', category: 'Main Course', isVegetarian: false, sortOrder: 2 },
  { name: 'Chicken Lababdar', price: 19.50, description: 'Grilled chicken chunks in a rich tomato and cream curry.', category: 'Main Course', isVegetarian: false, sortOrder: 3 },
  { name: 'Chicken Chettinad', price: 19.50, description: 'Spicy South Indian chicken curry with bold aromatic spices.', category: 'Main Course', isVegetarian: false, isSpicy: true, sortOrder: 4 },
  { name: 'Chicken Tikka Jalfrezi', price: 19.50, description: 'Stir-fried chicken with peppers and mild spices.', category: 'Main Course', isVegetarian: false, sortOrder: 5 },
  { name: 'Chicken Madras', price: 19.50, description: 'Hot South Indian chicken curry with bold spices.', category: 'Main Course', isVegetarian: false, isSpicy: true, sortOrder: 6 },
  { name: 'Chicken Vindaloo', price: 19.50, description: 'Fiery Goan-style chicken curry with tangy vinegar flavours.', category: 'Main Course', isVegetarian: false, isSpicy: true, sortOrder: 7 },
  { name: 'Chicken Balti', price: 19.50, description: 'Tender chicken cooked with tomatoes and aromatic Balti spices.', category: 'Main Course', isVegetarian: false, sortOrder: 8 },
  { name: 'Chicken Dhansak', price: 19.50, description: 'Chicken cooked in lentils with mild spices for a sweet-sour flavour.', category: 'Main Course', isVegetarian: false, sortOrder: 9 },
  { name: 'Chicken Kadhai', price: 19.50, description: 'Chicken simmered with bell peppers and traditional Indian spices.', category: 'Main Course', isVegetarian: false, sortOrder: 10 },
  { name: 'Mixed Grill', price: 26.50, description: "A chef's selection of grilled meats and kebabs served sizzling.", category: 'Main Course', isVegetarian: false, sortOrder: 11 },
  { name: 'Grilled Lamb Chops', price: 22.50, description: 'Marinated lamb chops chargrilled and served with mint chutney.', category: 'Main Course', isVegetarian: false, sortOrder: 12 },
  { name: 'Tandoori Chicken (Main)', price: 18.50, description: 'Classic clay-oven roasted chicken seasoned with spices and herbs.', category: 'Main Course', isVegetarian: false, sortOrder: 13 },
  { name: 'Chicken Tikka (Main)', price: 19.50, description: 'Tender pieces of chicken marinated in spices and grilled.', category: 'Main Course', isVegetarian: false, sortOrder: 14 },
  { name: 'Seekh Kebab (Main)', price: 22.50, description: 'Minced spiced meat skewers grilled to juicy perfection.', category: 'Main Course', isVegetarian: false, sortOrder: 15 },
  { name: 'Murgh Afghani (Main)', price: 23.50, description: 'Succulent chicken marinated in creamy spices and oven roasted.', category: 'Main Course', isVegetarian: false, sortOrder: 16 },
  { name: 'Goan Fish Curry', price: 22.50, description: 'Tangy coconut and tamarind fish curry with coastal spices.', category: 'Main Course', isVegetarian: false, sortOrder: 17 },
  { name: 'Prawn Kadai', price: 24.50, description: 'Prawns cooked in a rich spiced tomato and pepper gravy.', category: 'Main Course', isVegetarian: false, sortOrder: 18 },
  { name: 'Tandoori Prawn (Main)', price: 28.50, description: 'Large prawns seasoned and grilled in the tandoor.', category: 'Main Course', isVegetarian: false, sortOrder: 19 },

  // LAMB DISHES
  { name: 'Lamb Rogan Josh', price: 22.50, description: 'Tender lamb simmered in rich Kashmiri spices.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 1 },
  { name: 'Lamb Saag', price: 22.50, description: 'Lamb pieces cooked in seasoned spinach and curry gravy.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 2 },
  { name: 'Lamb Kadai', price: 22.50, description: 'Lamb cooked with tomatoes, onions and traditional spices.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 3 },
  { name: 'Lamb Balti', price: 22.50, description: 'Lamb cooked in aromatic Balti-style sauce.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 4 },
  { name: 'Lamb Madras', price: 22.50, description: 'Hot South Indian lamb curry with bold spices.', category: 'Lamb Dishes', isVegetarian: false, isSpicy: true, sortOrder: 5 },
  { name: 'Lamb Vindaloo', price: 22.50, description: 'Spicy Goan-style lamb curry with tangy vinegar flavours.', category: 'Lamb Dishes', isVegetarian: false, isSpicy: true, sortOrder: 6 },
  { name: 'Lamb Jalfrezi', price: 22.50, description: 'Spicy stir-fried lamb with peppers, onions and aromatic spices.', category: 'Lamb Dishes', isVegetarian: false, isSpicy: true, sortOrder: 7 },

  // VEGETARIAN (Dal & Paneer for Dine-in)
  { name: 'Amritsari Tadka Wali Dal', price: 10.50, description: 'Yellow lentils tempered with mustard seeds and spices.', category: 'Dal / Lentils', isVegetarian: true, sortOrder: 1 },
  { name: 'Dal Makhni', price: 12.50, description: 'Creamy black lentils slow simmered with aromatic spices.', category: 'Dal / Lentils', isVegetarian: true, sortOrder: 2 },
  
  { name: 'Paneer Makhni', price: 16.50, description: 'Soft cottage cheese cubes in rich creamy tomato sauce.', category: 'Vegetarian', isVegetarian: true, sortOrder: 1 },
  { name: 'Palak Paneer', price: 16.50, description: 'Paneer cooked in seasoned spinach gravy.', category: 'Vegetarian', isVegetarian: true, sortOrder: 2 },
  { name: 'Paneer Lababdar', price: 16.50, description: 'Paneer cubes simmered in rich tomato-cream curry.', category: 'Vegetarian', isVegetarian: true, sortOrder: 3 },
  { name: 'Paneer Jalfrezi', price: 16.50, description: 'Paneer stir-fried with spices, peppers and onions.', category: 'Vegetarian', isVegetarian: true, sortOrder: 4 },
  { name: 'Shahi Paneer', price: 16.50, description: 'Paneer in a creamy, aromatic royal sauce.', category: 'Vegetarian', isVegetarian: true, sortOrder: 5 },
  { name: 'Bhindi Do Pyaza', price: 18.50, description: 'Okra sautéed with onions and spices.', category: 'Vegetarian', isVegetarian: true, sortOrder: 6 },
  { name: 'Smoked Baingan Bharta', price: 14.50, description: 'Smoked eggplant mashed with spices and herbs.', category: 'Vegetarian', isVegetarian: true, sortOrder: 7 },
  { name: 'Alu Baingan Masala', price: 14.50, description: 'Potato and eggplant cooked in rich spiced tomato gravy.', category: 'Vegetarian', isVegetarian: true, sortOrder: 8 },
  { name: 'Chana Masala', price: 14.50, description: 'Chickpeas cooked in traditional North Indian spices.', category: 'Vegetarian', isVegetarian: true, sortOrder: 9 },
  { name: 'Nizam Subzi Handi', price: 16.50, description: 'Assorted vegetables cooked with aromatic spices.', category: 'Vegetarian', isVegetarian: true, sortOrder: 10 },
  { name: 'Alu Gobi', price: 14.50, description: 'Cauliflower and potatoes sautéed with cumin, turmeric and aromatic spices.', category: 'Vegetarian', isVegetarian: true, sortOrder: 11 },

  // BIRYANI
  { name: 'Hyderabadi Chicken Dum Biryani', price: 18.50, description: 'Aromatic basmati rice slow-cooked with spiced chicken and saffron.', category: 'Biryani', isVegetarian: false, sortOrder: 1 },
  { name: 'Royal Awadhi Lamb Biryani', price: 21.50, description: 'Fragrant long-grain rice layered with tender lamb and aromatic spices.', category: 'Biryani', isVegetarian: false, sortOrder: 2 },
  { name: 'Vegetable Biryani', price: 17.50, description: 'Seasoned basmati rice with mixed vegetables and herbs.', category: 'Biryani', isVegetarian: true, sortOrder: 3 },
  { name: 'Prawn Biryani', price: 24.50, description: 'Spiced basmati rice layered with succulent prawns.', category: 'Biryani', isVegetarian: false, sortOrder: 4 },

  // SALADS
  { name: 'Garden Green Salad', price: 4.50, description: 'Fresh mixed greens tossed with crisp vegetables.', category: 'Salads', isVegetarian: true, sortOrder: 1 },
  { name: "It's Greek to Me", price: 9.50, description: 'Mediterranean salad with chickpeas, olives, dates and feta in honey balsamic.', category: 'Salads', isVegetarian: true, sortOrder: 2 },
  { name: 'Grilled Chicken with Tomato Cucumber Salad', price: 7.50, description: 'Juicy grilled chicken over fresh greens with tomato and cucumber.', category: 'Salads', isVegetarian: false, sortOrder: 3 },
  { name: 'Garden of Caesar', price: 7.50, description: 'Crisp romaine with parmesan, bacon crisps and creamy Caesar dressing.', category: 'Salads', isVegetarian: false, sortOrder: 4 },
  { name: 'Masala Onion', price: 2.50, description: 'Sliced onions tossed with tangy spices.', category: 'Salads', isVegetarian: true, sortOrder: 5 },

  // KIDS MENU
  { name: 'Chicken Nuggets with French Fries or Rice', price: 7.50, description: 'Crispy chicken nuggets served with golden fries or steaming rice.', category: 'Kids Menu', isVegetarian: false, sortOrder: 1 },
  { name: 'Chicken Malai Tikka & French Fries', price: 7.50, description: 'Juicy, seasoned chicken malai tikka paired with crispy French fries.', category: 'Kids Menu', isVegetarian: false, sortOrder: 2 },
  { name: 'French Fries', price: 3.50, description: 'Classic crisp golden fries, lightly seasoned.', category: 'Kids Menu', isVegetarian: true, sortOrder: 3 },

  // INDIAN BREADS & EXTRAS
  { name: 'Tandoori Roti', price: 3.50, description: 'Traditional whole wheat flatbread baked in a clay oven.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 1 },
  { name: 'Plain Naan', price: 3.75, description: 'Soft leavened bread.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 2 },
  { name: 'Butter Naan', price: 4.50, description: 'Soft leavened bread brushed with rich butter.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 3 },
  { name: 'Garlic Naan', price: 4.75, description: 'Warm naan infused with roasted garlic.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 4 },
  { name: 'Chilli Garlic Naan', price: 4.75, description: 'Spicy garlic naan with a hint of chilli heat.', category: 'Indian Breads & Extras', isVegetarian: true, isSpicy: true, sortOrder: 5 },
  { name: 'Aloo Kulcha', price: 5.50, description: 'Flatbread stuffed with spiced mashed potatoes.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 6 },
  { name: 'Signature Cheese & Jalapeño Kulcha', price: 5.50, description: 'Flatbread filled with melted cheese and jalapeños.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 7 },
  { name: 'Chicken Naan', price: 6.50, description: 'Soft naan filled with seasoned chicken chunks.', category: 'Indian Breads & Extras', isVegetarian: false, sortOrder: 8 },
  { name: 'Raita', price: 3.50, description: 'Cooling yogurt accompaniment.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 9 },
  { name: 'Steamed Rice', price: 4.50, description: 'Fluffy steamed basmati rice.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 10 },
  { name: 'Pulao Rice', price: 4.50, description: 'Basmati rice seasoned with cumin seeds.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 11 },
  { name: 'Papadum', price: 3.75, description: 'Crispy lentil wafers served with chutneys.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 12 },

  // DESSERTS
  { name: 'Chocolate Brownie', price: 7.50, description: 'Warm chocolate brownie with a rich gooey center.', category: 'Desserts', isVegetarian: true, sortOrder: 1 },
  { name: 'Chocolate Lava Cake', price: 7.50, description: 'Indulgent molten chocolate cake served warm.', category: 'Desserts', isVegetarian: true, sortOrder: 2 },
  { name: 'Ananas Kesari / Pineapple Kesari', price: 7.50, description: 'Sweet semolina dessert with pineapple and fragrant spices.', category: 'Desserts', isVegetarian: true, sortOrder: 3 },
  { name: 'Amrakhand', price: 6.50, description: 'Creamy mango-yogurt dessert with aromatic spices.', category: 'Desserts', isVegetarian: true, sortOrder: 4 },
  { name: 'Ras Malai', price: 6.50, description: 'Soft cheese dumplings in sweet creamy milk.', category: 'Desserts', isVegetarian: true, sortOrder: 5 },
  { name: 'Gulab Jamun', price: 6.50, description: 'Golden fried milk dumplings soaked in sugar syrup.', category: 'Desserts', isVegetarian: true, sortOrder: 6 },
  { name: 'Ice Cream — Vanilla', price: 5.50, description: 'Creamy classic vanilla ice cream.', category: 'Desserts', isVegetarian: true, sortOrder: 7 },
  { name: 'Ice Cream — Strawberry', price: 5.50, description: 'Fresh strawberry ice cream with vibrant flavour.', category: 'Desserts', isVegetarian: true, sortOrder: 8 },
  { name: 'Ice Cream — Chocolate', price: 5.50, description: 'Rich chocolate ice cream for chocoholics.', category: 'Desserts', isVegetarian: true, sortOrder: 9 },
  { name: 'Ice Cream — Mango', price: 5.50, description: 'Tropical mango ice cream with fruity sweetness.', category: 'Desserts', isVegetarian: true, sortOrder: 10 },
  { name: 'Light of India Ice Cream Combination', price: 10.50, description: 'Assorted premium scoops of favourite ice cream flavours.', category: 'Desserts', isVegetarian: true, sortOrder: 11 },

  // CHINESE STARTERS
  { name: 'Country Style Fried Chicken Wings', price: 10.50, description: 'Crispy garlic-marinated wings with spicy dipping sauce.', category: 'Chinese Starters', isVegetarian: false, sortOrder: 1 },
  { name: 'Sriracha Fish Chili', price: 12.50, description: 'Fish sautéed in fiery sriracha chilli sauce with peppers.', category: 'Chinese Starters', isVegetarian: false, isSpicy: true, sortOrder: 2 },
  { name: 'Burnt Garlic Lemon Chili Fish', price: 12.50, description: 'Fish tossed with smoky garlic, zesty lemon and chilli.', category: 'Chinese Starters', isVegetarian: false, isSpicy: true, sortOrder: 3 },
  { name: 'Coated Shallow Fried Fish', price: 12.50, description: 'Panko-crusted fish served with homemade tartar.', category: 'Chinese Starters', isVegetarian: false, sortOrder: 4 },
  { name: 'Tempura Fried Prawn', price: 12.50, description: 'Light tempura prawns with sweet chilli sauce.', category: 'Chinese Starters', isVegetarian: false, sortOrder: 5 },
  { name: 'Chicken Drumstick (Chinese)', price: 12.50, description: 'Drumstick pieces sautéed with scallions and chilli.', category: 'Chinese Starters', isVegetarian: false, sortOrder: 6 },
  { name: 'ChinaTown Chili Chicken', price: 12.50, description: 'Classic chilli chicken with peppers and onions.', category: 'Chinese Starters', isVegetarian: false, isSpicy: true, sortOrder: 7 },
  { name: 'Thai Flavored Lemon Chili Cottage Cheese', price: 12.50, description: 'Paneer infused with Thai spices and lemon chilli.', category: 'Chinese Starters', isVegetarian: true, isSpicy: true, sortOrder: 8 },
  { name: 'Mushroom Chili (Chinese)', price: 10.50, description: 'Button mushrooms stir-fried with peppers and chillies.', category: 'Chinese Starters', isVegetarian: true, isSpicy: true, sortOrder: 9 },
  { name: 'Honey Chili Potato', price: 10.50, description: 'Potatoes tossed in sweet honey chilli sauce.', category: 'Chinese Starters', isVegetarian: true, sortOrder: 10 },

  // CHINESE MAIN COURSE
  { name: 'Hakka Noodles — Veg', price: 12.50, description: 'Stir-fried noodles with fresh vegetables in light soy glaze.', category: 'Chinese Main Course', isVegetarian: true, sortOrder: 1 },
  { name: 'Hakka Noodles — Chicken', price: 14.50, description: 'Stir-fried noodles with chicken and crisp vegetables.', category: 'Chinese Main Course', isVegetarian: false, sortOrder: 2 },
  { name: 'Hakka Noodles — Seafood', price: 15.50, description: 'Stir-fried noodles with seafood and vibrant wok flavours.', category: 'Chinese Main Course', isVegetarian: false, sortOrder: 3 },
  { name: 'Spicy Basil Fried Rice — Veg', price: 12.50, description: 'Fried rice with fragrant basil and garden vegetables.', category: 'Chinese Main Course', isVegetarian: true, sortOrder: 4 },
  { name: 'Spicy Basil Fried Rice — Chicken', price: 14.50, description: 'Fried rice with succulent chicken and aromatic basil.', category: 'Chinese Main Course', isVegetarian: false, sortOrder: 5 },
  { name: 'Spicy Basil Fried Rice — Seafood', price: 15.50, description: 'Fried rice with mixed seafood and bold basil aroma.', category: 'Chinese Main Course', isVegetarian: false, sortOrder: 6 },
  { name: 'Three Pepper Chili Chicken with Gravy', price: 12.50, description: 'Chicken in a bold three pepper chilli sauce.', category: 'Chinese Main Course', isVegetarian: false, isSpicy: true, sortOrder: 7 },
  { name: 'Chicken Black Pepper Sauce with Gravy', price: 12.50, description: 'Chicken sautéed in cracked black pepper sauce.', category: 'Chinese Main Course', isVegetarian: false, sortOrder: 8 },
  { name: 'Three Pepper Chili Paneer with Gravy', price: 12.50, description: 'Paneer cubes in spicy three pepper sauce.', category: 'Chinese Main Course', isVegetarian: true, isSpicy: true, sortOrder: 9 },
  { name: 'Mushroom Chili Garlic with Gravy', price: 11.50, description: 'Mushrooms tossed in rich garlic chilli gravy.', category: 'Chinese Main Course', isVegetarian: true, isSpicy: true, sortOrder: 10 },
];

// Take-away menu items (different prices)
const takeawayItems = [
  // INDIAN STARTERS
  { name: 'Papdi Chaat', price: 7.25, description: 'Crispy wafers topped with potatoes, yogurt and tangy chutney.', category: 'Starters', isVegetarian: true, sortOrder: 1 },
  { name: 'Lawrence Road Ki Aloo Tikki', price: 5.50, description: 'Seasoned potato patties served with cooling chutneys.', category: 'Starters', isVegetarian: true, sortOrder: 2 },
  { name: 'Veg Samosa', price: 5.00, description: '2 x crispy pastry triangles stuffed with spiced vegetables.', category: 'Starters', isVegetarian: true, sortOrder: 3 },
  { name: 'Samosa Chaat', price: 6.50, description: 'Samosa pieces topped with chickpeas, tangy yogurt and chutney.', category: 'Starters', isVegetarian: true, sortOrder: 4 },
  { name: 'Onion Bhaji', price: 5.00, description: 'Crispy onion fritters lightly spiced and golden brown.', category: 'Starters', isVegetarian: true, sortOrder: 5 },
  { name: 'Chicken 65', price: 10.50, description: 'Crispy spiced chicken with a tangy southern Indian seasoning.', category: 'Starters', isVegetarian: false, sortOrder: 6 },
  { name: 'Honey Chili Potato', price: 9.00, description: 'Golden potato strips tossed in a sweet and spicy honey chilli sauce.', category: 'Starters', isVegetarian: true, sortOrder: 7 },
  { name: 'Tandoori Chicken Starter', price: 8.50, description: 'Succulent chicken pieces marinated in tandoori spices and oven roasted.', category: 'Starters', isVegetarian: false, sortOrder: 8 },
  { name: 'Chicken Tikka Starter', price: 9.50, description: 'Tender chicken pieces marinated and grilled with aromatic spices.', category: 'Starters', isVegetarian: false, sortOrder: 9 },
  { name: 'Seekh Kebab', price: 10.50, description: 'Minced spiced meat skewers grilled to juicy perfection.', category: 'Starters', isVegetarian: false, sortOrder: 10 },

  // INDIAN MAIN COURSE
  { name: 'Butter Chicken', price: 16.50, description: 'Tender chicken simmered in a creamy tomato sauce with mild spices.', category: 'Main Course', isVegetarian: false, sortOrder: 1 },
  { name: 'Chicken Saag', price: 16.50, description: 'Chicken pieces cooked in a rich seasoned spinach gravy.', category: 'Main Course', isVegetarian: false, sortOrder: 2 },
  { name: 'Chicken Tikka Masala', price: 16.50, description: 'Grilled chicken cubes in a spiced creamy tomato masala sauce.', category: 'Main Course', isVegetarian: false, sortOrder: 3 },
  { name: 'Chicken Madras', price: 16.50, description: 'Hot South Indian chicken curry with bold and robust spices.', category: 'Main Course', isVegetarian: false, isSpicy: true, sortOrder: 4 },
  { name: 'Chicken Vindaloo', price: 16.50, description: 'Fiery Goan-style chicken curry with tangy vinegar and spices.', category: 'Main Course', isVegetarian: false, isSpicy: true, sortOrder: 5 },
  { name: 'Tandoori Chicken', price: 16.50, description: 'Classic clay-oven roasted chicken with signature spices and herbs.', category: 'Main Course', isVegetarian: false, sortOrder: 6 },
  { name: 'Chicken Tikka', price: 16.50, description: 'Tender pieces of marinated chicken grilled to juicy perfection.', category: 'Main Course', isVegetarian: false, sortOrder: 7 },

  // LAMB DISHES
  { name: 'Lamb Rogan Josh', price: 18.50, description: 'Slow-cooked lamb in aromatic Kashmiri curry spices.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 1 },
  { name: 'Lamb Kadai', price: 18.50, description: 'Lamb cooked with onions, tomatoes and bold traditional spices.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 2 },
  { name: 'Lamb Madras', price: 18.50, description: 'Hot South Indian lamb curry with a spicy, tangy punch.', category: 'Lamb Dishes', isVegetarian: false, isSpicy: true, sortOrder: 3 },
  { name: 'Lamb Vindaloo', price: 18.50, description: 'Spicy Goan-style lamb curry with rich vinegar heat.', category: 'Lamb Dishes', isVegetarian: false, isSpicy: true, sortOrder: 4 },
  { name: 'Lamb Qorma', price: 18.50, description: 'Lamb in a creamy, mildly spiced traditional qorma gravy.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 5 },

  // VEGETARIAN
  { name: 'Paneer Makhni', price: 14.00, description: 'Soft cottage cheese cubes in a rich, creamy tomato gravy.', category: 'Vegetarian', isVegetarian: true, sortOrder: 1 },
  { name: 'Palak Paneer', price: 14.00, description: 'Paneer cooked in a velvety seasoned spinach sauce.', category: 'Vegetarian', isVegetarian: true, sortOrder: 2 },
  { name: 'Paneer Jalfrezi', price: 12.25, description: 'Paneer stir-fried with mixed peppers in a spiced sauce.', category: 'Vegetarian', isVegetarian: true, sortOrder: 3 },
  { name: 'Shahi Paneer', price: 12.25, description: 'Paneer in a luxurious creamy and mildly aromatic sauce.', category: 'Vegetarian', isVegetarian: true, sortOrder: 4 },
  { name: 'Bhindi Masala', price: 14.50, description: 'Okra sautéed with onions, tomatoes and traditional spices.', category: 'Vegetarian', isVegetarian: true, sortOrder: 5 },
  { name: 'Alu Baingan Masala', price: 12.50, description: 'Potato and eggplant cooked in spiced tomato gravy.', category: 'Vegetarian', isVegetarian: true, sortOrder: 6 },
  { name: 'Chana Masala', price: 12.50, description: 'Chickpeas simmered in a spiced North Indian curry.', category: 'Vegetarian', isVegetarian: true, sortOrder: 7 },
  { name: 'Mixed Vegetables', price: 12.50, description: 'Assorted garden vegetables cooked with mild Indian spices.', category: 'Vegetarian', isVegetarian: true, sortOrder: 8 },

  // DAL / LENTILS
  { name: 'Dal Tadka', price: 8.50, description: 'Yellow lentils tempered with spices and aromatic seasonings.', category: 'Dal / Lentils', isVegetarian: true, sortOrder: 1 },
  { name: 'Dal Makhni', price: 10.50, description: 'Creamy black lentils slow-cooked with traditional spices.', category: 'Dal / Lentils', isVegetarian: true, sortOrder: 2 },

  // BIRYANIS
  { name: 'Hyderabadi Chicken Dum Biryani', price: 14.75, description: 'Aromatic basmati rice slow-cooked with spiced chicken and saffron.', category: 'Biryani', isVegetarian: false, sortOrder: 1 },
  { name: 'Vegetable Biryani', price: 12.50, description: 'Fragrant basmati rice layered with mixed vegetables and spices.', category: 'Biryani', isVegetarian: true, sortOrder: 2 },
  { name: 'Prawn Biryani', price: 18.75, description: 'Flavoursome rice layered with succulent spiced prawns.', category: 'Biryani', isVegetarian: false, sortOrder: 3 },
  { name: 'Royal Awadhi Lamb Biryani', price: 16.75, description: 'Fragrant long-grain rice layered with tender lamb and aromatic spices.', category: 'Biryani', isVegetarian: false, sortOrder: 4 },

  // SIDES & BREADS
  { name: 'Plain Naan', price: 2.75, description: 'Soft leavened bread — perfect with curries.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 1 },
  { name: 'Butter Naan', price: 3.75, description: 'Warm naan brushed with rich butter.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 2 },
  { name: 'Garlic Naan', price: 4.00, description: 'Fluffy naan infused with roasted garlic.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 3 },
  { name: 'Aloo Kulcha', price: 4.50, description: 'Stuffed flatbread with spiced mashed potatoes.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 4 },
  { name: 'Cheese Naan', price: 4.75, description: 'Soft leavened bread with melted cheese.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 5 },
  { name: 'Steamed Rice', price: 3.75, description: 'Fluffy steamed basmati rice — great with any dish.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 6 },
  { name: 'Pulao Rice', price: 3.75, description: 'Basmati rice tempered with aromatic spices.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 7 },
  { name: 'Raita', price: 2.50, description: 'Cooling yogurt with choice of toppings.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 8 },

  // CHINESE / FUSION
  { name: 'China Town Chili Chicken', price: 10.50, description: 'Fiery Indian-Chinese chili chicken with peppers and onions.', category: 'Chinese Starters', isVegetarian: false, isSpicy: true, sortOrder: 1 },
  { name: 'Tempura Fried Prawn', price: 10.50, description: 'Light tempura prawns served with sweet chilli dipping sauce.', category: 'Chinese Starters', isVegetarian: false, sortOrder: 2 },
  { name: 'Mushroom Chili (Chinese)', price: 10.50, description: 'Stir-fried mushrooms with peppers in a tangy chilli glaze.', category: 'Chinese Starters', isVegetarian: true, isSpicy: true, sortOrder: 3 },
  { name: 'Sriracha Fish Chili', price: 10.50, description: 'Wok-fried fish pieces in bold sriracha chilli sauce with peppers.', category: 'Chinese Starters', isVegetarian: false, isSpicy: true, sortOrder: 4 },
  { name: 'Crunchy Chicken Wings', price: 10.50, description: 'Crispy garlic-marinated chicken wings with spicy dipping sauce.', category: 'Chinese Starters', isVegetarian: false, sortOrder: 5 },

  // CHINESE MAIN COURSE
  { name: 'Hakka Noodles — Veg', price: 12.50, description: 'Stir-fried noodles with crisp veggies in savory sauce.', category: 'Chinese Main Course', isVegetarian: true, sortOrder: 1 },
  { name: 'Hakka Noodles — Chicken', price: 14.50, description: 'Stir-fried noodles with chicken and fresh vegetables.', category: 'Chinese Main Course', isVegetarian: false, sortOrder: 2 },
  { name: 'Spicy Basil Fried Rice — Veg', price: 12.50, description: 'Basil-infused fried rice with mixed vegetables.', category: 'Chinese Main Course', isVegetarian: true, sortOrder: 3 },
  { name: 'Spicy Basil Fried Rice — Chicken', price: 14.50, description: 'Basil fried rice with succulent chicken pieces.', category: 'Chinese Main Course', isVegetarian: false, sortOrder: 4 },
  { name: 'Three Pepper Chili Chicken with Gravy', price: 12.50, description: 'Chicken in a bold three-pepper Indian-Chinese sauce.', category: 'Chinese Main Course', isVegetarian: false, isSpicy: true, sortOrder: 5 },
  { name: 'Mushroom Chili Garlic with Gravy', price: 11.50, description: 'Mushrooms tossed in rich garlic chilli gravy.', category: 'Chinese Main Course', isVegetarian: true, isSpicy: true, sortOrder: 6 },

  // KIDS' FAVORITES
  { name: 'Chicken Nuggets with French Fries or Rice', price: 6.50, description: 'Crispy chicken nuggets with choice of fries or rice.', category: 'Kids Menu', isVegetarian: false, sortOrder: 1 },
  { name: 'Chicken Malai Tikka & French Fries', price: 6.50, description: 'Juicy chicken malai tikka paired with golden fries.', category: 'Kids Menu', isVegetarian: false, sortOrder: 2 },
  { name: 'French Fries', price: 3.00, description: 'Classic crispy fries, lightly seasoned.', category: 'Kids Menu', isVegetarian: true, sortOrder: 3 },

  // DESSERTS
  { name: 'Ras Malai', price: 5.50, description: 'Soft cheese dumplings in sweet creamy milk syrup.', category: 'Desserts', isVegetarian: true, sortOrder: 1 },
  { name: 'Gulab Jamun', price: 5.50, description: 'Golden fried milk dumplings soaked in sweet syrup.', category: 'Desserts', isVegetarian: true, sortOrder: 2 },
  { name: 'Mango Lassi', price: 3.50, description: 'Refreshing sweet mango yogurt drink with a hint of cardamom.', category: 'Desserts', isVegetarian: true, sortOrder: 3 },

  // DRINKS
  { name: 'Coca-Cola', price: 2.75, description: 'Chilled classic cola drink.', category: 'Drinks', isVegetarian: true, sortOrder: 1 },
  { name: 'Coca-Cola Light', price: 2.75, description: 'Zero sugar cola option.', category: 'Drinks', isVegetarian: true, sortOrder: 2 },
  { name: 'Ice Tea', price: 2.75, description: 'Chilled iced tea — sweet and refreshing.', category: 'Drinks', isVegetarian: true, sortOrder: 3 },
  { name: 'Fanta', price: 2.75, description: 'Fruit-flavoured soft drink.', category: 'Drinks', isVegetarian: true, sortOrder: 4 },
  { name: 'Spa Red', price: 2.75, description: 'Sparkling mineral water — crisp and fizzy.', category: 'Drinks', isVegetarian: true, sortOrder: 5 },
  { name: 'Spa Blue', price: 2.75, description: 'Still mineral water — refreshing and pure.', category: 'Drinks', isVegetarian: true, sortOrder: 6 },
];

async function seedDatabase() {
  console.log('🌱 Starting menu seed...\n');

  // Step 1: Create categories
  console.log('📁 Creating categories...');
  const categoryMap = {};

  for (const category of categories) {
    try {
      const result = await makeRequest('POST', 'http://localhost:3000/api/v1/menu/categories', category);
      if (result.status === 201 || result.status === 200) {
        categoryMap[category.name] = result.data.data?._id || result.data._id || result.data.category?._id;
        console.log(`  ✅ ${category.name}`);
      } else if (result.status === 409 || result.data?.message?.includes('already exists')) {
        // Category exists, fetch it
        const getResult = await makeRequest('GET', 'http://localhost:3000/api/v1/menu/categories');
        const existingCat = getResult.data.data?.find(c => c.name === category.name);
        if (existingCat) {
          categoryMap[category.name] = existingCat._id;
          console.log(`  ⏭️  ${category.name} (already exists)`);
        }
      } else {
        console.log(`  ❌ ${category.name}: ${result.data?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`  ❌ ${category.name}: ${error.message}`);
    }
  }

  // Fetch all categories to ensure we have IDs
  const catResult = await makeRequest('GET', 'http://localhost:3000/api/v1/menu/categories');
  if (catResult.data?.data) {
    for (const cat of catResult.data.data) {
      categoryMap[cat.name] = cat._id;
    }
  }

  console.log('\n📋 Category IDs:', Object.keys(categoryMap).length, 'categories');

  // Step 2: Create dine-in items
  console.log('\n🍽️  Creating DINE-IN menu items...');
  let dineInCount = 0;
  for (const item of dineInItems) {
    const categoryId = categoryMap[item.category];
    if (!categoryId) {
      console.log(`  ⚠️  Skipping "${item.name}" - category "${item.category}" not found`);
      continue;
    }

    try {
      const itemData = {
        name: item.name,
        price: item.price,
        description: item.description,
        category: categoryId,
        menuType: 'dine-in',
        isVegetarian: item.isVegetarian || false,
        isSpicy: item.isSpicy || false,
        sortOrder: item.sortOrder || 0,
        isActive: true,
      };

      const result = await makeRequest('POST', 'http://localhost:3000/api/v1/menu/items', itemData);
      if (result.status === 201 || result.status === 200) {
        dineInCount++;
        process.stdout.write(`\r  ✅ Created ${dineInCount} dine-in items...`);
      } else {
        console.log(`\n  ❌ ${item.name}: ${result.data?.message || JSON.stringify(result.data)}`);
      }
    } catch (error) {
      console.log(`\n  ❌ ${item.name}: ${error.message}`);
    }
  }
  console.log(`\n  ✅ Total: ${dineInCount} dine-in items created`);

  // Step 3: Create take-away items
  console.log('\n📦 Creating TAKE-AWAY menu items...');
  let takeawayCount = 0;
  for (const item of takeawayItems) {
    const categoryId = categoryMap[item.category];
    if (!categoryId) {
      console.log(`  ⚠️  Skipping "${item.name}" - category "${item.category}" not found`);
      continue;
    }

    try {
      const itemData = {
        name: item.name,
        price: item.price,
        description: item.description,
        category: categoryId,
        menuType: 'takeaway',
        isVegetarian: item.isVegetarian || false,
        isSpicy: item.isSpicy || false,
        sortOrder: item.sortOrder || 0,
        isActive: true,
      };

      const result = await makeRequest('POST', 'http://localhost:3000/api/v1/menu/items', itemData);
      if (result.status === 201 || result.status === 200) {
        takeawayCount++;
        process.stdout.write(`\r  ✅ Created ${takeawayCount} take-away items...`);
      } else {
        console.log(`\n  ❌ ${item.name}: ${result.data?.message || JSON.stringify(result.data)}`);
      }
    } catch (error) {
      console.log(`\n  ❌ ${item.name}: ${error.message}`);
    }
  }
  console.log(`\n  ✅ Total: ${takeawayCount} take-away items created`);

  console.log('\n✨ Seed completed!');
  console.log(`   📁 Categories: ${Object.keys(categoryMap).length}`);
  console.log(`   🍽️  Dine-in items: ${dineInCount}`);
  console.log(`   📦 Take-away items: ${takeawayCount}`);
  console.log(`   📊 Total items: ${dineInCount + takeawayCount}`);
}

seedDatabase().catch(console.error);
