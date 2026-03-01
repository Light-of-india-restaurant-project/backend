const http = require('http');
const { MongoClient } = require('mongodb');

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/my-app-production';
const API_BASE = `http://localhost:${PORT}/api/v1/menu`;

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

// ===================== CATEGORIES =====================
const categories = [
  { name: 'Starters', icon: '🥗', sortOrder: 1 },
  { name: 'Main Course', icon: '🍛', sortOrder: 2 },
  { name: 'Lamb Dishes', icon: '🍖', sortOrder: 3 },
  { name: 'Seafood & Grill', icon: '🔥', sortOrder: 4 },
  { name: 'Vegetarian', icon: '🥬', sortOrder: 5 },
  { name: 'Dal / Lentils', icon: '🫘', sortOrder: 6 },
  { name: 'Biryani', icon: '🍚', sortOrder: 7 },
  { name: 'Salads', icon: '🥗', sortOrder: 8 },
  { name: 'Kids Menu', icon: '👶', sortOrder: 9 },
  { name: 'Indian Breads & Extras', icon: '🫓', sortOrder: 10 },
  { name: 'Chinese Starters', icon: '🥡', sortOrder: 11 },
  { name: 'Chinese Main Course', icon: '🍜', sortOrder: 12 },
  { name: 'Desserts', icon: '🍨', sortOrder: 13 },
  { name: 'Drinks', icon: '🥤', sortOrder: 14 },
];

// ===================== DINE-IN MENU (from 01_Dine-in-menu.pdf) =====================
const dineInItems = [
  // STARTERS (items 1-24)
  { name: 'Mulligatawny Soup', price: 7.50, description: 'Hearty spiced lentil and vegetable soup with aromatic curry notes.', descriptionNl: 'Hartverwarmende gekruide linzen- en groentesoep met aromatische kerriekruiden.', category: 'Starters', isVegetarian: true, sortOrder: 1 },
  { name: 'Chargrilled Tomato Basil Broth (v)', price: 7.50, description: 'Smoky roasted tomato and basil soup with a creamy, crisp garnish.', descriptionNl: 'Rokerige geroosterde tomaat-basilicumsoep met een romige, knapperige garnering.', category: 'Starters', isVegetarian: true, sortOrder: 2 },
  { name: 'Sweetcorn Soup (v/nv)', price: 7.50, description: 'Rich creamy sweetcorn blended with subtle spices for a comforting start.', descriptionNl: 'Rijke romige zoete maïssoep gemengd met subtiele kruiden voor een hartelijke start.', category: 'Starters', isVegetarian: true, sortOrder: 3 },
  { name: 'Dahi Bhalla', price: 8.50, description: 'Light lentil dumplings soaked in chilled yogurt with tangy chutneys.', descriptionNl: 'Lichte linzenballetjes gedrenkt in gekoelde yoghurt met pittige chutneys.', category: 'Starters', isVegetarian: true, sortOrder: 4 },
  { name: 'Papdi Chaat', price: 8.50, description: 'Crispy wafers topped with spiced potatoes, chilled yogurt and chutneys.', descriptionNl: 'Krokante wafeltjes met gekruide aardappelen, gekoelde yoghurt en chutneys.', category: 'Starters', isVegetarian: true, sortOrder: 5 },
  { name: 'Pani Puri', price: 7.50, description: 'Crispy hollow balls filled with spicy potato and served with tangy mint-tamarind water.', descriptionNl: 'Krokante holle balletjes gevuld met pittige aardappel en geserveerd met pittig munt-tamarinde water.', category: 'Starters', isVegetarian: true, sortOrder: 6 },
  { name: 'Pani Puri Shot (alcoholic)', price: 8.50, description: 'Pani puri served with a refreshing boozy twist on mint and tamarind water.', descriptionNl: 'Pani puri geserveerd met een verfrissende alcoholische twist van munt en tamarinde.', category: 'Starters', isVegetarian: true, sortOrder: 7 },
  { name: 'Lawrence Road Ki Aloo Tikki', price: 6.50, description: 'Golden fried spiced potato patties with cooling chutneys.', descriptionNl: 'Goudkleurige gefrituurde gekruide aardappelpatties met verkoelende chutneys.', category: 'Starters', isVegetarian: true, sortOrder: 8 },
  { name: 'Sev Dahi Puri', price: 7.50, description: 'Crispy puris filled with spiced potatoes, yogurt and crunchy sev.', descriptionNl: "Krokante puri's gevuld met gekruide aardappelen, yoghurt en knapperige sev.", category: 'Starters', isVegetarian: true, sortOrder: 9 },
  { name: 'Samosa Veg', price: 6.00, description: '2 x samosa pieces served with tangy sauces.', descriptionNl: '2 samosa stukken geserveerd met pittige sauzen.', category: 'Starters', isVegetarian: true, sortOrder: 10 },
  { name: 'Samosa Chaat', price: 7.50, description: 'Samosa pieces topped with chickpeas and tangy sauces.', descriptionNl: 'Samosa stukken bedekt met kikkererwten en pittige sauzen.', category: 'Starters', isVegetarian: true, sortOrder: 11 },
  { name: 'Onion Bhaji', price: 6.00, description: 'Crispy fried onion fritters served with chutney.', descriptionNl: 'Krokante gefrituurde uienfritters geserveerd met chutney.', category: 'Starters', isVegetarian: true, sortOrder: 12 },
  { name: 'Chicken Kathi Roll', price: 9.00, description: 'Seasoned grilled chicken wrapped in warm, soft flatbread.', descriptionNl: 'Gekruide gegrilde kip gewikkeld in warm, zacht platbrood.', category: 'Starters', isVegetarian: false, sortOrder: 13 },
  { name: 'Classic Tandoori Chicken', price: 7.50, description: 'Tender half chicken marinated in traditional spices and clay-oven roasted.', descriptionNl: 'Malse halve kip gemarineerd in traditionele kruiden en geroosterd in een klei-oven.', category: 'Starters', isVegetarian: false, sortOrder: 14 },
  { name: 'Tangri Kebab', price: 12.50, description: 'Juicy chicken leg pieces marinated in ginger-garlic and lemon.', descriptionNl: 'Sappige kippenbouten gemarineerd in gember-knoflook en citroen.', category: 'Starters', isVegetarian: false, sortOrder: 15 },
  { name: 'Murgh Afgani (Starter)', price: 13.50, description: 'Chicken marinated in cashew paste grilled to juicy perfection.', descriptionNl: 'Kip gemarineerd in cashewpasta en gegrild tot perfecte sappigheid.', category: 'Starters', isVegetarian: false, sortOrder: 16 },
  { name: 'Tandoori Prawn (Starter)', price: 14.50, description: 'Plump prawns marinated in Indian spices and grilled in tandoor.', descriptionNl: 'Vlezige garnalen gemarineerd in Indiase kruiden en gegrild in de tandoor.', category: 'Starters', isVegetarian: false, sortOrder: 17 },
  { name: 'LOI Chicken Tikka', price: 13.50, description: 'Tender chicken chunks marinated overnight and perfectly grilled.', descriptionNl: 'Malse kipstukken een nacht gemarineerd en perfect gegrild.', category: 'Starters', isVegetarian: false, sortOrder: 18 },
  { name: 'Chicken 65', price: 12.50, description: 'Crispy spiced chicken with a tangy South Indian spice kick.', descriptionNl: 'Krokante gekruide kip met een pittige Zuid-Indiase smaakkick.', category: 'Starters', isVegetarian: false, sortOrder: 19 },
  { name: 'Koliwala Prawns', price: 14.50, description: 'Crispy Mumbai-style spiced prawns fried to golden perfection.', descriptionNl: 'Krokante garnalen in Mumbai-stijl gekruid en goudbruin gefrituurd.', category: 'Starters', isVegetarian: false, sortOrder: 20 },
  { name: 'Malai Broccoli', price: 11.99, description: 'Broccoli marinated in cheese and yogurt then roasted.', descriptionNl: 'Broccoli gemarineerd in kaas en yoghurt en vervolgens geroosterd.', category: 'Starters', isVegetarian: true, sortOrder: 21 },
  { name: 'Reshmi Khumb', price: 13.99, description: 'Soft cheese-stuffed mushrooms fried to a golden crisp.', descriptionNl: 'Zachte kaasgevulde champignons gefrituurd tot een gouden krokantheid.', category: 'Starters', isVegetarian: true, sortOrder: 22 },
  { name: 'Corn and Jalapeño Harabhara', price: 13.50, description: 'Sweetcorn and jalapeño bites with melted cheese and mint chutney.', descriptionNl: 'Zoete maïs en jalapeño hapjes met gesmolten kaas en muntechutney.', category: 'Starters', isVegetarian: true, sortOrder: 23 },
  { name: 'Basil Garlic Paneer Tikka', price: 14.99, description: 'Paneer cubes marinated in basil garlic spices and grilled tender.', descriptionNl: 'Paneerblokjes gemarineerd in basilicum-knoflookkruiden en mals gegrild.', category: 'Starters', isVegetarian: true, sortOrder: 24 },

  // MAIN COURSE — Chicken (items 25-34)
  { name: 'Old Delhi Butter Chicken', price: 19.50, description: 'Creamy tomato gravy with succulent pieces of grilled chicken.', descriptionNl: 'Romige tomatensaus met sappige stukjes gegrilde kip.', category: 'Main Course', isVegetarian: false, sortOrder: 1 },
  { name: 'Chicken Saag', price: 19.50, description: 'Chicken simmered in rich spinach-based curry sauce.', descriptionNl: 'Kip gestoofd in een rijke spinazie-curry.', category: 'Main Course', isVegetarian: false, sortOrder: 2 },
  { name: 'Chicken Lababdar', price: 19.50, description: 'Grilled chicken chunks in a rich tomato and cream curry.', descriptionNl: 'Gegrilde kippenblokjes in een rijke tomaten-roomcurry.', category: 'Main Course', isVegetarian: false, sortOrder: 3 },
  { name: 'Chicken Chettinad', price: 19.50, description: 'Spicy South Indian chicken curry with bold aromatic spices.', descriptionNl: 'Pittige Zuid-Indiase kipcurry met krachtige aromatische kruiden.', category: 'Main Course', isVegetarian: false, isSpicy: true, sortOrder: 4 },
  { name: 'Chicken Tikka Jalfrezi', price: 19.50, description: 'Stir-fried chicken with peppers and mild spices.', descriptionNl: 'Roergebakken kip met paprika en milde kruiden.', category: 'Main Course', isVegetarian: false, sortOrder: 5 },
  { name: 'Chicken Madras', price: 19.50, description: 'Hot South Indian chicken curry with bold spices.', descriptionNl: 'Heet Zuid-Indiase kipgerecht met krachtige kruiden.', category: 'Main Course', isVegetarian: false, isSpicy: true, sortOrder: 6 },
  { name: 'Chicken Vindaloo', price: 19.50, description: 'Fiery Goan-style chicken curry with tangy vinegar flavours.', descriptionNl: 'Vurige Goaanse kipcurry met een pittige azijnsmaak.', category: 'Main Course', isVegetarian: false, isSpicy: true, isDoubleSpicy: true, sortOrder: 7 },
  { name: 'Chicken Balti', price: 19.50, description: 'Tender chicken cooked with tomatoes and aromatic Balti spices.', descriptionNl: 'Malse kip gekookt met tomaten en aromatische Balti-kruiden.', category: 'Main Course', isVegetarian: false, sortOrder: 8 },
  { name: 'Chicken Dhansak', price: 19.50, description: 'Chicken cooked in lentils with mild spices for a sweet-sour flavour.', descriptionNl: 'Kip gekookt met linzen en milde kruiden voor een zoet-zure smaak.', category: 'Main Course', isVegetarian: false, sortOrder: 9 },
  { name: 'Chicken Kadhai', price: 19.50, description: 'Chicken simmered with bell peppers and traditional Indian spices.', descriptionNl: 'Kip gestoofd met paprika en traditionele Indiase kruiden.', category: 'Main Course', isVegetarian: false, sortOrder: 10 },

  // LAMB DISHES (items 35-41)
  { name: 'Lamb Rogan Josh', price: 22.50, description: 'Tender lamb simmered in rich Kashmiri spices.', descriptionNl: 'Malse lamsvlees gestoofd in rijke Kashmiri-kruiden.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 1 },
  { name: 'Lamb Saag', price: 22.50, description: 'Lamb pieces cooked in seasoned spinach and curry gravy.', descriptionNl: 'Lamsstukken gestoofd in gekruide spinazie-curry.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 2 },
  { name: 'Lamb Kadai', price: 22.50, description: 'Lamb cooked with tomatoes, onions and traditional spices.', descriptionNl: 'Lam gekookt met tomaten, uien en traditionele kruiden.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 3 },
  { name: 'Lamb Balti', price: 22.50, description: 'Lamb cooked in aromatic Balti-style sauce.', descriptionNl: 'Lam gekookt in een aromatische Balti-saus.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 4 },
  { name: 'Lamb Madras', price: 22.50, description: 'Hot South Indian lamb curry with bold spices.', descriptionNl: 'Heet Zuid-Indiase lamscurry met krachtige kruiden.', category: 'Lamb Dishes', isVegetarian: false, isSpicy: true, sortOrder: 5 },
  { name: 'Lamb Vindaloo', price: 22.50, description: 'Spicy Goan-style lamb curry with tangy vinegar flavours.', descriptionNl: 'Pittige Goaanse lamscurry met een pittige azijnsmaak.', category: 'Lamb Dishes', isVegetarian: false, isSpicy: true, isDoubleSpicy: true, sortOrder: 6 },
  { name: 'Lamb Jalfrezi', price: 22.50, description: 'Spicy stir-fried lamb with peppers, onions and aromatic spices.', descriptionNl: 'Pittig roergebakken lam met paprika, ui en aromatische kruiden.', category: 'Lamb Dishes', isVegetarian: false, isSpicy: true, sortOrder: 7 },

  // SEAFOOD & GRILL (items 42-50)
  { name: 'Mixed Grill', price: 26.50, description: "A chef's selection of grilled meats and kebabs served sizzling.", descriptionNl: "Een chef's selectie van gegrild vlees en kebabs geserveerd sissend heet.", category: 'Seafood & Grill', isVegetarian: false, sortOrder: 1 },
  { name: 'Grilled Lamb Chops', price: 22.50, description: 'Marinated lamb chops chargrilled and served with mint chutney.', descriptionNl: 'Gemarineerde lamskoteletten gegrild en geserveerd met muntechutney.', category: 'Seafood & Grill', isVegetarian: false, sortOrder: 2 },
  { name: 'Tandoori Chicken (Main)', price: 18.50, description: 'Classic clay-oven roasted chicken seasoned with spices and herbs.', descriptionNl: 'Klassieke kip geroosterd in klei-oven met kruiden en specerijen.', category: 'Seafood & Grill', isVegetarian: false, sortOrder: 3 },
  { name: 'Chicken Tikka (Main)', price: 19.50, description: 'Tender pieces of chicken marinated in spices and grilled.', descriptionNl: 'Malse kipstukken gemarineerd in kruiden en gegrild.', category: 'Seafood & Grill', isVegetarian: false, sortOrder: 4 },
  { name: 'Seekh Kebab', price: 22.50, description: 'Minced spiced meat skewers grilled to juicy perfection.', descriptionNl: 'Gehakt spiesjes gekruid en gegrild tot sappige perfectie.', category: 'Seafood & Grill', isVegetarian: false, sortOrder: 5 },
  { name: 'Murgh Afghani (Main)', price: 23.50, description: 'Succulent chicken marinated in creamy spices and oven roasted.', descriptionNl: 'Sappige kip gemarineerd in romige kruiden en geroosterd in de oven.', category: 'Seafood & Grill', isVegetarian: false, sortOrder: 6 },
  { name: 'Goan Fish Curry', price: 22.50, description: 'Tangy coconut and tamarind fish curry with coastal spices.', descriptionNl: 'Pittige kokos-tamarinde viscurry met kustkruiden.', category: 'Seafood & Grill', isVegetarian: false, sortOrder: 7 },
  { name: 'Prawn Kadai', price: 24.50, description: 'Prawns cooked in a rich spiced tomato and pepper gravy.', descriptionNl: 'Garnalen gekookt in een rijke gekruide tomaten-pepersaus.', category: 'Seafood & Grill', isVegetarian: false, sortOrder: 8 },
  { name: 'Tandoori Prawn (Main)', price: 28.50, description: 'Large prawns seasoned and grilled in the tandoor.', descriptionNl: 'Grote garnalen gekruid en gegrild in de tandoor.', category: 'Seafood & Grill', isVegetarian: false, sortOrder: 9 },

  // DAL / LENTILS (items 51-52)
  { name: 'Amritsari Tadka Wali Dal', price: 10.50, description: 'Yellow lentils tempered with mustard seeds and spices.', descriptionNl: 'Gele linzen getemperd met mosterdzaad en kruiden.', category: 'Dal / Lentils', isVegetarian: true, sortOrder: 1 },
  { name: 'Dal Makhni', price: 12.50, description: 'Creamy black lentils slow simmered with aromatic spices.', descriptionNl: 'Romige zwarte linzen langzaam gesudderd met aromatische kruiden.', category: 'Dal / Lentils', isVegetarian: true, sortOrder: 2 },

  // VEGETARIAN (items 53-63)
  { name: 'Paneer Makhni', price: 16.50, description: 'Soft cottage cheese cubes in rich creamy tomato sauce.', descriptionNl: 'Malse paneerblokjes in een rijke romige tomatensaus.', category: 'Vegetarian', isVegetarian: true, sortOrder: 1 },
  { name: 'Palak Paneer', price: 16.50, description: 'Paneer cooked in seasoned spinach gravy.', descriptionNl: 'Paneer gestoofd in gekruide spinaziesaus.', category: 'Vegetarian', isVegetarian: true, sortOrder: 2 },
  { name: 'Paneer Lababdar', price: 16.50, description: 'Paneer cubes simmered in rich tomato-cream curry.', descriptionNl: 'Paneerblokjes gestoofd in rijke tomaat-roomcurry.', category: 'Vegetarian', isVegetarian: true, sortOrder: 3 },
  { name: 'Paneer Jalfrezi', price: 16.50, description: 'Paneer stir-fried with spices, peppers and onions.', descriptionNl: 'Paneer roergebakken met kruiden, paprika en ui.', category: 'Vegetarian', isVegetarian: true, sortOrder: 4 },
  { name: 'Shahi Paneer', price: 16.50, description: 'Paneer in a creamy, aromatic royal sauce.', descriptionNl: 'Paneer in een romige, aromatische romige saus.', category: 'Vegetarian', isVegetarian: true, sortOrder: 5 },
  { name: 'Bhindi Do Pyaza', price: 18.50, description: 'Okra sautéed with onions and spices.', descriptionNl: 'Okra geroerbakt met ui en kruiden.', category: 'Vegetarian', isVegetarian: true, sortOrder: 6 },
  { name: 'Smoked Baingan Bharta', price: 14.50, description: 'Smoked eggplant mashed with spices and herbs.', descriptionNl: 'Gerookte aubergine geprakt met kruiden en specerijen.', category: 'Vegetarian', isVegetarian: true, sortOrder: 7 },
  { name: 'Alu Baingan Masala', price: 14.50, description: 'Potato and eggplant cooked in rich spiced tomato gravy.', descriptionNl: 'Aardappel en aubergine gekookt in een rijke gekruide tomatensaus.', category: 'Vegetarian', isVegetarian: true, sortOrder: 8 },
  { name: 'Chana Masala', price: 14.50, description: 'Chickpeas cooked in traditional North Indian spices.', descriptionNl: 'Kikkererwten gekookt in traditionele Noord-Indiase kruiden.', category: 'Vegetarian', isVegetarian: true, sortOrder: 9 },
  { name: 'Nizam Subzi Handi', price: 16.50, description: 'Assorted vegetables cooked with aromatic spices.', descriptionNl: 'Gemengde groenten gekookt met aromatische kruiden.', category: 'Vegetarian', isVegetarian: true, sortOrder: 10 },
  { name: 'Alu Gobi', price: 14.50, description: 'Cauliflower and potatoes sautéed with cumin, turmeric and aromatic spices.', descriptionNl: 'Bloemkool en aardappelen gesauteerd met komijn, kurkuma en aromatische kruiden.', category: 'Vegetarian', isVegetarian: true, sortOrder: 11 },

  // BIRYANI (items 64-67)
  { name: 'Hyderabadi Chicken Dum Biryani', price: 18.50, description: 'Aromatic basmati rice slow-cooked with spiced chicken and saffron (Pulao Rice included).', descriptionNl: 'Aromatische basmatirijst langzaam gegaard met gekruide kip en saffraan (pulaorijst inbegrepen).', category: 'Biryani', isVegetarian: false, sortOrder: 1 },
  { name: 'Royal Awadhi Lamb Biryani', price: 21.50, description: 'Fragrant long-grain rice layered with tender lamb and aromatic spices (Pulao Rice included).', descriptionNl: 'Geurige langkorrelrijst in lagen met mals lamsvlees en aromatische kruiden (pulaorijst inbegrepen).', category: 'Biryani', isVegetarian: false, sortOrder: 2 },
  { name: 'Vegetable Biryani', price: 17.50, description: 'Seasoned basmati rice with mixed vegetables and herbs (Pulao Rice included).', descriptionNl: 'Gekruide basmatirijst met gemengde groenten en kruiden (pulaorijst inbegrepen).', category: 'Biryani', isVegetarian: true, sortOrder: 3 },
  { name: 'Prawn Biryani', price: 24.50, description: 'Spiced basmati rice layered with succulent prawns (Pulao Rice included).', descriptionNl: 'Gekruide basmatirijst in lagen met sappige garnalen (pulaorijst inbegrepen).', category: 'Biryani', isVegetarian: false, sortOrder: 4 },

  // SALADS (items 68-72)
  { name: 'Garden Green Salad', price: 4.50, description: 'Fresh mixed greens tossed with crisp vegetables.', descriptionNl: 'Verse gemengde groene salade met knapperige groenten.', category: 'Salads', isVegetarian: true, sortOrder: 1 },
  { name: "It's Greek to Me", price: 9.50, description: 'Mediterranean salad with chickpeas, olives, dates and feta in honey balsamic.', descriptionNl: 'Mediterrane salade met kikkererwten, olijven, dadels en feta in honing-balsamico dressing.', category: 'Salads', isVegetarian: true, sortOrder: 2 },
  { name: 'Grilled Chicken with Tomato Cucumber Salad', price: 7.50, description: 'Juicy grilled chicken over fresh greens with tomato and cucumber.', descriptionNl: 'Sappige gegrilde kip op verse groene salade met tomaat en komkommer.', category: 'Salads', isVegetarian: false, sortOrder: 3 },
  { name: 'Garden of Caesar', price: 7.50, description: 'Crisp romaine with parmesan, bacon crisps and creamy Caesar dressing.', descriptionNl: 'Knapperige romaine sla met Parmezaan, baconcroutons en romige Caesar dressing.', category: 'Salads', isVegetarian: false, sortOrder: 4 },
  { name: 'Masala Onion', price: 2.50, description: 'Sliced onions tossed with tangy spices.', descriptionNl: 'Gesneden uien gemengd met pittige kruiden.', category: 'Salads', isVegetarian: true, sortOrder: 5 },

  // KIDS MENU (items 73-75)
  { name: 'Chicken Nuggets with French Fries or Rice', price: 7.50, description: 'Crispy chicken nuggets served with golden fries or steaming rice.', descriptionNl: 'Krokante kipnuggets geserveerd met goudgele frietjes of gestoomde rijst.', category: 'Kids Menu', isVegetarian: false, sortOrder: 1 },
  { name: 'Chicken Malai Tikka & French Fries', price: 7.50, description: 'Juicy, seasoned chicken malai tikka paired with crispy French fries.', descriptionNl: 'Sappige gekruide chicken malai tikka geserveerd met knapperige frietjes.', category: 'Kids Menu', isVegetarian: false, sortOrder: 2 },
  { name: 'French Fries', price: 3.50, description: 'Classic crisp golden fries, lightly seasoned.', descriptionNl: 'Klassieke knapperige goudgele frietjes, licht gekruid.', category: 'Kids Menu', isVegetarian: true, sortOrder: 3 },

  // INDIAN BREADS & EXTRAS (items 76-87)
  { name: 'Tandoori Roti', price: 3.50, description: 'Traditional whole wheat flatbread baked in a clay oven.', descriptionNl: 'Traditioneel volkoren platbrood gebakken in een kleioven.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 1 },
  { name: 'Plain Naan', price: 3.75, description: 'Soft leavened bread.', descriptionNl: 'Zacht gerezen brood.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 2 },
  { name: 'Butter Naan', price: 4.50, description: 'Soft leavened bread brushed with rich butter.', descriptionNl: 'Zacht gerezen brood ingesmeerd met rijke boter.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 3 },
  { name: 'Garlic Naan', price: 4.75, description: 'Warm naan infused with roasted garlic.', descriptionNl: 'Warme naan verrijkt met geroosterde knoflook.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 4 },
  { name: 'Chilli Garlic Naan', price: 4.75, description: 'Spicy garlic naan with a hint of chilli heat.', descriptionNl: 'Pittige knoflooknaan met een vleugje chili.', category: 'Indian Breads & Extras', isVegetarian: true, isSpicy: true, sortOrder: 5 },
  { name: 'Aloo Kulcha', price: 5.50, description: 'Flatbread stuffed with spiced mashed potatoes.', descriptionNl: 'Platbrood gevuld met gekruide aardappelpuree.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 6 },
  { name: 'Signature Cheese & Jalapeño Kulcha', price: 5.50, description: 'Flatbread filled with melted cheese and jalapeños.', descriptionNl: "Platbrood gevuld met gesmolten kaas en jalapeño's.", category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 7 },
  { name: 'Chicken Naan', price: 6.50, description: 'Soft naan filled with seasoned chicken chunks.', descriptionNl: 'Zachte naan gevuld met gekruide kipstukjes.', category: 'Indian Breads & Extras', isVegetarian: false, sortOrder: 8 },
  { name: 'Raita', price: 3.50, description: 'Cooling yogurt accompaniment.', descriptionNl: 'Verfrissende yoghurtsaus.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 9 },
  { name: 'Steamed Rice', price: 4.50, description: 'Fluffy steamed basmati rice.', descriptionNl: 'Luchtige gestoomde basmatirijst.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 10 },
  { name: 'Pulao Rice', price: 4.50, description: 'Basmati rice seasoned with cumin seeds.', descriptionNl: 'Basmatirijst gekruid met komijnzaad.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 11 },
  { name: 'Papadum', price: 3.75, description: 'Crispy lentil wafers served with chutneys.', descriptionNl: 'Knapperige linzenwafels geserveerd met chutneys.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 12 },

  // DESSERTS (items 88-98)
  { name: 'Chocolate Brownie', price: 7.50, description: 'Warm chocolate brownie with a rich gooey center.', descriptionNl: 'Warme chocoladebrownie met een rijke, smeuïge kern.', category: 'Desserts', isVegetarian: true, sortOrder: 1 },
  { name: 'Chocolate Lava Cake', price: 7.50, description: 'Indulgent molten chocolate cake served warm.', descriptionNl: 'Verleidelijke lava-chocoladetaart geserveerd warm.', category: 'Desserts', isVegetarian: true, sortOrder: 2 },
  { name: 'Ananas Kesari / Pineapple Kesari', price: 7.50, description: 'Sweet semolina dessert with pineapple and fragrant spices.', descriptionNl: 'Zoet griesmeeldessert met ananas en geurige specerijen.', category: 'Desserts', isVegetarian: true, sortOrder: 3 },
  { name: 'Amrakhand', price: 6.50, description: 'Creamy mango-yogurt dessert with aromatic spices.', descriptionNl: 'Romig mango-yoghurt dessert met aromatische kruiden.', category: 'Desserts', isVegetarian: true, sortOrder: 4 },
  { name: 'Ras Malai', price: 6.50, description: 'Soft cheese dumplings in sweet creamy milk.', descriptionNl: 'Zachte kaasknoedels in zoete romige melk.', category: 'Desserts', isVegetarian: true, sortOrder: 5 },
  { name: 'Gulab Jamun', price: 6.50, description: 'Golden fried milk dumplings soaked in sugar syrup.', descriptionNl: 'Goudgebakken melkknoedels geweekt in suikersiroop.', category: 'Desserts', isVegetarian: true, sortOrder: 6 },
  { name: 'Ice Cream — Vanilla', price: 5.50, description: 'Creamy classic vanilla ice cream.', descriptionNl: 'Romig klassieke vanille-ijs.', category: 'Desserts', isVegetarian: true, sortOrder: 7 },
  { name: 'Ice Cream — Strawberry', price: 5.50, description: 'Fresh strawberry ice cream with vibrant flavour.', descriptionNl: 'Vers aardbeienijs met levendige smaak.', category: 'Desserts', isVegetarian: true, sortOrder: 8 },
  { name: 'Ice Cream — Chocolate', price: 5.50, description: 'Rich chocolate ice cream for chocoholics.', descriptionNl: 'Rijk chocolade-ijs voor chocoholics.', category: 'Desserts', isVegetarian: true, sortOrder: 9 },
  { name: 'Ice Cream — Mango', price: 5.50, description: 'Tropical mango ice cream with fruity sweetness.', descriptionNl: 'Tropisch mango-ijs met fruitige zoetheid.', category: 'Desserts', isVegetarian: true, sortOrder: 10 },
  { name: 'Light of India Ice Cream Combination', price: 10.50, description: 'Assorted premium scoops of favourite ice cream flavours.', descriptionNl: 'Assortiment premium bolletjes van favoriete ijssmaken.', category: 'Desserts', isVegetarian: true, sortOrder: 11 },

  // CHINESE FUSION — STARTERS (items 101-110)
  { name: 'Country Style Fried Chicken Wings', price: 10.50, description: 'Crispy garlic-marinated wings with spicy dipping sauce.', descriptionNl: 'Knapperige vleugels gemarineerd in knoflook, geserveerd met pittige dipsaus.', category: 'Chinese Starters', isVegetarian: false, sortOrder: 1 },
  { name: 'Sriracha Fish Chili', price: 12.50, description: 'Fish sautéed in fiery sriracha chilli sauce with peppers.', descriptionNl: 'Vis gebakken in een vurige sriracha-chillisaus met paprika.', category: 'Chinese Starters', isVegetarian: false, isSpicy: true, sortOrder: 2 },
  { name: 'Burnt Garlic Lemon Chili Fish', price: 12.50, description: 'Fish tossed with smoky garlic, zesty lemon and chilli.', descriptionNl: 'Vis geroerd met rokerige knoflook, pittige citroen en chili.', category: 'Chinese Starters', isVegetarian: false, isSpicy: true, sortOrder: 3 },
  { name: 'Coated Shallow Fried Fish', price: 12.50, description: 'Panko-crusted fish served with homemade tartar.', descriptionNl: 'Vis met panko-korst geserveerd met zelfgemaakte tartaar.', category: 'Chinese Starters', isVegetarian: false, sortOrder: 4 },
  { name: 'Tempura Fried Prawn', price: 12.50, description: 'Light tempura prawns with sweet chilli sauce.', descriptionNl: 'Lichte tempura-garnalen met zoete chilisaus.', category: 'Chinese Starters', isVegetarian: false, sortOrder: 5 },
  { name: 'Chicken Drumstick (Chinese)', price: 12.50, description: 'Drumstick pieces sautéed with scallions and chilli.', descriptionNl: 'Kippenbouten gebakken met bosui en chili.', category: 'Chinese Starters', isVegetarian: false, isSpicy: true, sortOrder: 6 },
  { name: 'ChinaTown Chili Chicken', price: 12.50, description: 'Classic chilli chicken with peppers and onions.', descriptionNl: 'Klassieke chilikip met paprika en uien.', category: 'Chinese Starters', isVegetarian: false, isSpicy: true, sortOrder: 7 },
  { name: 'Thai Flavored Lemon Chili Cottage Cheese', price: 12.50, description: 'Paneer infused with Thai spices and lemon chilli.', descriptionNl: 'Paneer doordrenkt met Thaise kruiden en citroen-chili.', category: 'Chinese Starters', isVegetarian: true, isSpicy: true, sortOrder: 8 },
  { name: 'Mushroom Chili (Chinese)', price: 10.50, description: 'Button mushrooms stir-fried with peppers and chillies.', descriptionNl: 'Kastanjechampignons geroerbakt met paprika en chilipepers.', category: 'Chinese Starters', isVegetarian: true, isSpicy: true, sortOrder: 9 },
  { name: 'Honey Chili Potato', price: 10.50, description: 'Potatoes tossed in sweet honey chilli sauce.', descriptionNl: 'Aardappelen gemengd in een zoete honing-chilisaus.', category: 'Chinese Starters', isVegetarian: true, sortOrder: 10 },

  // CHINESE FUSION — MAIN COURSE (items 111-120)
  { name: 'Hakka Noodles — Veg', price: 12.50, description: 'Stir-fried noodles with fresh vegetables in light soy glaze.', descriptionNl: 'Roergebakken noedels met verse groenten in een lichte sojaglazuur.', category: 'Chinese Main Course', isVegetarian: true, sortOrder: 1 },
  { name: 'Hakka Noodles — Chicken', price: 14.50, description: 'Stir-fried noodles with chicken and crisp vegetables.', descriptionNl: 'Roergebakken noedels met kip en knapperige groenten.', category: 'Chinese Main Course', isVegetarian: false, sortOrder: 2 },
  { name: 'Hakka Noodles — Seafood', price: 15.50, description: 'Stir-fried noodles with seafood and vibrant wok flavours.', descriptionNl: 'Roergebakken noedels met zeevruchten en levendige woksmaken.', category: 'Chinese Main Course', isVegetarian: false, sortOrder: 3 },
  { name: 'Spicy Basil Fried Rice — Veg', price: 12.50, description: 'Fried rice with fragrant basil and garden vegetables.', descriptionNl: 'Gebakken rijst met geurige basilicum en tuin groenten.', category: 'Chinese Main Course', isVegetarian: true, sortOrder: 4 },
  { name: 'Spicy Basil Fried Rice — Chicken', price: 14.50, description: 'Fried rice with succulent chicken and aromatic basil.', descriptionNl: 'Gebakken rijst met sappige kip en aromatische basilicum.', category: 'Chinese Main Course', isVegetarian: false, sortOrder: 5 },
  { name: 'Spicy Basil Fried Rice — Seafood', price: 15.50, description: 'Fried rice with mixed seafood and bold basil aroma.', descriptionNl: 'Gebakken rijst met gemengde zeevruchten en uitgesproken basilicum aroma.', category: 'Chinese Main Course', isVegetarian: false, sortOrder: 6 },
  { name: 'Three Pepper Chili Chicken with Gravy', price: 12.50, description: 'Chicken in a bold three pepper chilli sauce.', descriptionNl: 'Kip in een pittige chilisaus van drie soorten peper.', category: 'Chinese Main Course', isVegetarian: false, isSpicy: true, sortOrder: 7 },
  { name: 'Chicken Black Pepper Sauce with Gravy', price: 12.50, description: 'Chicken sautéed in cracked black pepper sauce.', descriptionNl: 'Kip gebakken in een saus van grof zwarte peper.', category: 'Chinese Main Course', isVegetarian: false, sortOrder: 8 },
  { name: 'Three Pepper Chili Paneer with Gravy', price: 12.50, description: 'Paneer cubes in spicy three pepper sauce.', descriptionNl: 'Paneerblokjes in een pittige chilisaus van drie pepers.', category: 'Chinese Main Course', isVegetarian: true, isSpicy: true, sortOrder: 9 },
  { name: 'Mushroom Chili Garlic with Gravy', price: 11.50, description: 'Mushrooms tossed in rich garlic chilli gravy.', descriptionNl: 'Champignons geroerbakt in een rijke knoflook-chilisaus.', category: 'Chinese Main Course', isVegetarian: true, isSpicy: true, sortOrder: 10 },
];

// ===================== TAKEAWAY MENU (from 02_take-away-delivery-menu.pdf) =====================
const takeawayItems = [
  // INDIAN STARTERS (items 1-10)
  { name: 'Papdi Chaat', price: 7.25, description: 'Crispy wafers topped with potatoes, yogurt and tangy chutney.', descriptionNl: 'Knapperige wafeltjes met aardappelen, yoghurt en pittige chutney.', category: 'Starters', isVegetarian: true, sortOrder: 101 },
  { name: 'Lawrence Road Ki Aloo Tikki', price: 5.50, description: 'Seasoned potato patties served with cooling chutneys.', descriptionNl: 'Gekruide aardappelpatties geserveerd met verkoelende chutneys.', category: 'Starters', isVegetarian: true, sortOrder: 102 },
  { name: 'Veg Samosa', price: 5.00, description: '2 x crispy pastry triangles stuffed with spiced vegetables.', descriptionNl: '2 x knapperige deegdriehoeken gevuld met gekruide groenten.', category: 'Starters', isVegetarian: true, sortOrder: 103 },
  { name: 'Samosa Chaat', price: 6.50, description: 'Samosa pieces topped with chickpeas, tangy yogurt and chutney.', descriptionNl: 'Samosastukken bedekt met kikkererwten, pittige yoghurt en chutney.', category: 'Starters', isVegetarian: true, sortOrder: 104 },
  { name: 'Onion Bhaji', price: 5.00, description: 'Crispy onion fritters lightly spiced and golden brown.', descriptionNl: 'Knapperige uienfritters licht gekruid en goudbruin gebakken.', category: 'Starters', isVegetarian: true, sortOrder: 105 },
  { name: 'Chicken 65', price: 10.50, description: 'Crispy spiced chicken with a tangy southern Indian seasoning.', descriptionNl: 'Krokante gekruide kip met een pittige Zuid-Indiase smaak.', category: 'Starters', isVegetarian: false, sortOrder: 106 },
  { name: 'Honey Chili Potato', price: 9.00, description: 'Golden potato strips tossed in a sweet and spicy honey chilli sauce.', descriptionNl: 'Gouden aardappelreepjes gemengd in een zoete en pittige honing-chilisaus.', category: 'Starters', isVegetarian: true, sortOrder: 107 },
  { name: 'Tandoori Chicken Starter', price: 8.50, description: 'Succulent chicken pieces marinated in tandoori spices and oven roasted.', descriptionNl: 'Sappige kipstukken gemarineerd in tandoorikruiden en in de oven geroosterd.', category: 'Starters', isVegetarian: false, sortOrder: 108 },
  { name: 'Chicken Tikka Starter', price: 9.50, description: 'Tender chicken pieces marinated and grilled with aromatic spices.', descriptionNl: 'Malse kipstukken gemarineerd en gegrild met aromatische kruiden.', category: 'Starters', isVegetarian: false, sortOrder: 109 },
  { name: 'Seekh Kebab', price: 10.50, description: 'Minced spiced meat skewers grilled to juicy perfection.', descriptionNl: 'Gehakt gekruide vleesspiesjes gegrild tot sappige perfectie.', category: 'Starters', isVegetarian: false, sortOrder: 110 },

  // MAIN COURSE — Chicken (items 11-17)
  { name: 'Butter Chicken', price: 16.50, description: 'Tender chicken simmered in a creamy tomato sauce with mild spices.', descriptionNl: 'Malse kip gestoofd in een romige tomatensaus met milde kruiden.', category: 'Main Course', isVegetarian: false, sortOrder: 101 },
  { name: 'Chicken Saag', price: 16.50, description: 'Chicken pieces cooked in a rich seasoned spinach gravy.', descriptionNl: 'Kipstukken gekookt in een rijke, gekruide spinaziesaus.', category: 'Main Course', isVegetarian: false, sortOrder: 102 },
  { name: 'Chicken Tikka Masala', price: 16.50, description: 'Grilled chicken cubes in a spiced creamy tomato masala sauce.', descriptionNl: 'Gegrilde kipblokjes in een gekruide romige tomaten-masalasaus.', category: 'Main Course', isVegetarian: false, sortOrder: 103 },
  { name: 'Chicken Madras', price: 16.50, description: 'Hot South Indian chicken curry with bold and robust spices.', descriptionNl: 'Pittige Zuid-Indiase kipcurry met sterke en robuuste kruiden.', category: 'Main Course', isVegetarian: false, isSpicy: true, sortOrder: 104 },
  { name: 'Chicken Vindaloo', price: 16.50, description: 'Fiery Goan-style chicken curry with tangy vinegar and spices.', descriptionNl: 'Vurige Goaanse kipcurry met pittige azijn en specerijen.', category: 'Main Course', isVegetarian: false, isSpicy: true, isDoubleSpicy: true, sortOrder: 105 },
  { name: 'Tandoori Chicken', price: 16.50, description: 'Classic clay-oven roasted chicken with signature spices and herbs.', descriptionNl: 'Klassieke kip geroosterd in klei-oven met kenmerkende kruiden.', category: 'Main Course', isVegetarian: false, sortOrder: 106 },
  { name: 'Chicken Tikka', price: 16.50, description: 'Tender pieces of marinated chicken grilled to juicy perfection.', descriptionNl: 'Malse gemarineerde kipstukjes gegrild tot sappige perfectie.', category: 'Main Course', isVegetarian: false, sortOrder: 107 },

  // LAMB DISHES (items 18-22)
  { name: 'Lamb Rogan Josh', price: 18.50, description: 'Slow-cooked lamb in aromatic Kashmiri curry spices.', descriptionNl: 'Langzaam gegaard lamsvlees met aromatische Kashmiri-currykruiden.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 101 },
  { name: 'Lamb Kadai', price: 18.50, description: 'Lamb cooked with onions, tomatoes and bold traditional spices.', descriptionNl: 'Lam gekookt met uien, tomaten en uitgesproken traditionele kruiden.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 102 },
  { name: 'Lamb Madras', price: 18.50, description: 'Hot South Indian lamb curry with a spicy, tangy punch.', descriptionNl: 'Pittige Zuid-Indiase lamscurry met een gekruide, frisse smaak.', category: 'Lamb Dishes', isVegetarian: false, isSpicy: true, sortOrder: 103 },
  { name: 'Lamb Vindaloo', price: 18.50, description: 'Spicy Goan-style lamb curry with rich vinegar heat.', descriptionNl: 'Pittige Goaanse lamscurry met rijke azijnhitte.', category: 'Lamb Dishes', isVegetarian: false, isSpicy: true, isDoubleSpicy: true, sortOrder: 104 },
  { name: 'Lamb Qorma', price: 18.50, description: 'Lamb in a creamy, mildly spiced traditional qorma gravy.', descriptionNl: 'Lam in een romige, mild gekruide traditionele qorma-saus.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 105 },

  // VEGETARIAN (items 23-30)
  { name: 'Paneer Makhni', price: 14.00, description: 'Soft cottage cheese cubes in a rich, creamy tomato gravy.', descriptionNl: 'Malse blokjes cottage-kaas in een rijke, romige tomatengratin.', category: 'Vegetarian', isVegetarian: true, sortOrder: 101 },
  { name: 'Palak Paneer', price: 14.00, description: 'Paneer cooked in a velvety seasoned spinach sauce.', descriptionNl: 'Paneer gekookt in een fluweelachtige, gekruide spinaziesaus.', category: 'Vegetarian', isVegetarian: true, sortOrder: 102 },
  { name: 'Paneer Jalfrezi', price: 12.25, description: 'Paneer stir-fried with mixed peppers in a spiced sauce.', descriptionNl: "Paneer geroerbakt met gemengde paprika's in een gekruide saus.", category: 'Vegetarian', isVegetarian: true, sortOrder: 103 },
  { name: 'Shahi Paneer', price: 12.25, description: 'Paneer in a luxurious creamy and mildly aromatic sauce.', descriptionNl: 'Paneer in een weelderige romige en mild aromatische saus.', category: 'Vegetarian', isVegetarian: true, sortOrder: 104 },
  { name: 'Bhindi Masala', price: 14.50, description: 'Okra sautéed with onions, tomatoes and traditional spices.', descriptionNl: 'Okra zacht gebakken met ui, tomaten en traditionele kruiden.', category: 'Vegetarian', isVegetarian: true, sortOrder: 105 },
  { name: 'Alu Baingan Masala', price: 12.50, description: 'Potato and eggplant cooked in spiced tomato gravy.', descriptionNl: 'Aardappel en aubergine gekookt in een gekruide tomatensaus.', category: 'Vegetarian', isVegetarian: true, sortOrder: 106 },
  { name: 'Chana Masala', price: 12.50, description: 'Chickpeas simmered in a spiced North Indian curry.', descriptionNl: 'Kikkererwten langzaam gegaard in een gekruide Noord-Indiase curry.', category: 'Vegetarian', isVegetarian: true, sortOrder: 107 },
  { name: 'Mixed Vegetables', price: 12.50, description: 'Assorted garden vegetables cooked with mild Indian spices.', descriptionNl: 'Assortiment tuin-groenten gekookt met milde Indiase specerijen.', category: 'Vegetarian', isVegetarian: true, sortOrder: 108 },

  // DAL / LENTILS (items 31-32)
  { name: 'Dal Tadka', price: 8.50, description: 'Yellow lentils tempered with spices and aromatic seasonings.', descriptionNl: 'Gele linzen gekruid met specerijen en aromatische kruiden.', category: 'Dal / Lentils', isVegetarian: true, sortOrder: 101 },
  { name: 'Dal Makhni', price: 10.50, description: 'Creamy black lentils slow-cooked with traditional spices.', descriptionNl: 'Romige zwarte linzen langzaam gegaard met traditionele kruiden.', category: 'Dal / Lentils', isVegetarian: true, sortOrder: 102 },

  // BIRYANIS (items 33-36)
  { name: 'Hyderabadi Chicken Dum Biryani', price: 14.75, description: 'Aromatic basmati rice slow-cooked with spiced chicken and saffron.', descriptionNl: 'Aromatische basmatirijst langzaam gegaard met gekruide kip en saffraan.', category: 'Biryani', isVegetarian: false, sortOrder: 101 },
  { name: 'Vegetable Biryani', price: 12.50, description: 'Fragrant basmati rice layered with mixed vegetables and spices.', descriptionNl: 'Geurige basmatirijst in lagen met gemengde groenten en kruiden.', category: 'Biryani', isVegetarian: true, sortOrder: 102 },
  { name: 'Prawn Biryani', price: 18.75, description: 'Flavoursome rice layered with succulent spiced prawns.', descriptionNl: 'Smaakvolle rijst in lagen met sappige gekruide garnalen.', category: 'Biryani', isVegetarian: false, sortOrder: 103 },
  { name: 'Royal Awadhi Lamb Biryani', price: 16.75, description: 'Fragrant long-grain rice layered with tender lamb and aromatic spices.', descriptionNl: 'Geurige langkorrelrijst in lagen met mals lamsvlees en aromatische kruiden.', category: 'Biryani', isVegetarian: false, sortOrder: 104 },

  // SIDES & BREADS (items 37-44)
  { name: 'Plain Naan', price: 2.75, description: 'Soft leavened bread — perfect with curries.', descriptionNl: "Zacht gerezen brood — perfect bij curry's.", category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 101 },
  { name: 'Butter Naan', price: 3.75, description: 'Warm naan brushed with rich butter.', descriptionNl: 'Warme naan met rijke botersmeer.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 102 },
  { name: 'Garlic Naan', price: 4.00, description: 'Fluffy naan infused with roasted garlic.', descriptionNl: 'Luchtige naan doorspekt met geroosterde knoflook.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 103 },
  { name: 'Aloo Kulcha', price: 4.50, description: 'Stuffed flatbread with spiced mashed potatoes.', descriptionNl: 'Gevuld platbrood met gekruide aardappelpuree.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 104 },
  { name: 'Cheese Naan', price: 4.75, description: 'Soft leavened bread with melted cheese.', descriptionNl: 'Zacht gerezen brood met gesmolten kaas.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 105 },
  { name: 'Steamed Rice', price: 3.75, description: 'Fluffy steamed basmati rice — great with any dish.', descriptionNl: 'Luchtige gestoomde basmatirijst — heerlijk bij elk gerecht.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 106 },
  { name: 'Pulao Rice', price: 3.75, description: 'Basmati rice tempered with aromatic spices.', descriptionNl: 'Basmatirijst gekruid met aromatische specerijen.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 107 },
  { name: 'Raita', price: 2.50, description: 'Cooling yogurt with choice of toppings.', descriptionNl: 'Verfrissende yoghurt met keuze aan toppings.', category: 'Indian Breads & Extras', isVegetarian: true, sortOrder: 108 },

  // CHINESE / FUSION — STARTERS (items 45-49)
  { name: 'ChinaTown Chili Chicken', price: 10.50, description: 'Fiery Indian-Chinese chili chicken with peppers and onions.', descriptionNl: 'Vurige Indiaas-Chinese chilikip met paprika en uien.', category: 'Chinese Starters', isVegetarian: false, isSpicy: true, sortOrder: 101 },
  { name: 'Tempura Fried Prawn', price: 10.50, description: 'Light tempura prawns served with sweet chilli dipping sauce.', descriptionNl: 'Lichte tempura-garnalen geserveerd met zoete chilisaus.', category: 'Chinese Starters', isVegetarian: false, sortOrder: 102 },
  { name: 'Mushroom Chili (Chinese)', price: 10.50, description: 'Stir-fried mushrooms with peppers in a tangy chilli glaze.', descriptionNl: 'Geroerbakte champignons met paprika in een pittige chiliglazuur.', category: 'Chinese Starters', isVegetarian: true, isSpicy: true, sortOrder: 103 },
  { name: 'Sriracha Fish Chili', price: 10.50, description: 'Wok-fried fish pieces in bold sriracha chilli sauce with peppers.', descriptionNl: 'In de wok gebakken visstukjes in een krachtige sriracha-chilisaus met paprika.', category: 'Chinese Starters', isVegetarian: false, isSpicy: true, sortOrder: 104 },
  { name: 'Crunchy Chicken Wings', price: 10.50, description: 'Crispy garlic-marinated chicken wings with spicy dipping sauce.', descriptionNl: 'Knapperige knoflookgemarineerde kippenvleugels met pittige dipsaus.', category: 'Chinese Starters', isVegetarian: false, sortOrder: 105 },

  // CHINESE MAIN COURSE (items 50-55)
  { name: 'Hakka Noodles — Veg', price: 12.50, description: 'Stir-fried noodles with crisp veggies in savory sauce.', descriptionNl: 'Roergebakken noedels met knapperige groenten in hartige saus.', category: 'Chinese Main Course', isVegetarian: true, sortOrder: 101 },
  { name: 'Hakka Noodles — Chicken', price: 14.50, description: 'Stir-fried noodles with chicken and fresh vegetables.', descriptionNl: 'Roergebakken noedels met kip en verse groenten.', category: 'Chinese Main Course', isVegetarian: false, sortOrder: 102 },
  { name: 'Spicy Basil Fried Rice — Veg', price: 12.50, description: 'Basil-infused fried rice with mixed vegetables.', descriptionNl: 'Gebakken rijst met basilicum en gemengde groenten.', category: 'Chinese Main Course', isVegetarian: true, sortOrder: 103 },
  { name: 'Spicy Basil Fried Rice — Chicken', price: 14.50, description: 'Basil fried rice with succulent chicken pieces.', descriptionNl: 'Gebakken rijst met basilicum en sappige kipstukjes.', category: 'Chinese Main Course', isVegetarian: false, sortOrder: 104 },
  { name: 'Three Pepper Chili Chicken with Gravy', price: 12.50, description: 'Chicken in a bold three-pepper Indian-Chinese sauce.', descriptionNl: 'Kip in een krachtige Indiaas-Chinese saus van drie pepers.', category: 'Chinese Main Course', isVegetarian: false, isSpicy: true, sortOrder: 105 },
  { name: 'Mushroom Chili Garlic with Gravy', price: 11.50, description: 'Mushrooms tossed in rich garlic chilli gravy.', descriptionNl: 'Champignons geroerd in een rijke knoflook-chilisaus.', category: 'Chinese Main Course', isVegetarian: true, isSpicy: true, sortOrder: 106 },

  // KIDS (items 56-58)
  { name: 'Chicken Nuggets with French Fries or Rice', price: 6.50, description: 'Crispy chicken nuggets with choice of fries or rice.', descriptionNl: 'Knapperige kipnuggets met keuze uit frietjes of rijst.', category: 'Kids Menu', isVegetarian: false, sortOrder: 101 },
  { name: 'Chicken Malai Tikka & French Fries', price: 6.50, description: 'Juicy chicken malai tikka paired with golden fries.', descriptionNl: 'Sappige chicken malai tikka geserveerd met goudgele frietjes.', category: 'Kids Menu', isVegetarian: false, sortOrder: 102 },
  { name: 'French Fries', price: 3.00, description: 'Classic crispy fries, lightly seasoned.', descriptionNl: 'Klassieke knapperige frietjes, licht gekruid.', category: 'Kids Menu', isVegetarian: true, sortOrder: 103 },

  // DESSERTS (items 59-61)
  { name: 'Ras Malai', price: 5.50, description: 'Soft cheese dumplings in sweet creamy milk syrup.', descriptionNl: 'Zachte kaasballetjes in zoete romige melksiroop.', category: 'Desserts', isVegetarian: true, sortOrder: 101 },
  { name: 'Gulab Jamun', price: 5.50, description: 'Golden fried milk dumplings soaked in sweet syrup.', descriptionNl: 'Goudbruine, gefrituurde melkballetjes geweekt in zoete siroop.', category: 'Desserts', isVegetarian: true, sortOrder: 102 },
  { name: 'Mango Lassi', price: 3.50, description: 'Refreshing sweet mango yogurt drink with a hint of cardamom.', descriptionNl: 'Verfrissende zoete mango-yoghurtdrink met een vleugje kardemom.', category: 'Desserts', isVegetarian: true, sortOrder: 103 },

  // DRINKS (items 62-67)
  { name: 'Coca-Cola', price: 2.75, description: 'Chilled classic cola drink.', descriptionNl: 'Koude klassieke cola-drank.', category: 'Drinks', isVegetarian: true, sortOrder: 101 },
  { name: 'Coca-Cola Light', price: 2.75, description: 'Zero sugar cola option.', descriptionNl: 'Suikervrije cola-optie.', category: 'Drinks', isVegetarian: true, sortOrder: 102 },
  { name: 'Ice Tea', price: 2.75, description: 'Chilled iced tea — sweet and refreshing.', descriptionNl: 'Koude ijsthee — zoet en verfrissend.', category: 'Drinks', isVegetarian: true, sortOrder: 103 },
  { name: 'Fanta', price: 2.75, description: 'Fruit-flavoured soft drink.', descriptionNl: 'Frisdrank met fruitsmaak.', category: 'Drinks', isVegetarian: true, sortOrder: 104 },
  { name: 'Spa Red', price: 2.75, description: 'Sparkling mineral water — crisp and fizzy.', descriptionNl: 'Bruisend mineraalwater — fris en bruisend.', category: 'Drinks', isVegetarian: true, sortOrder: 105 },
  { name: 'Spa Blue', price: 2.75, description: 'Still mineral water — refreshing and pure.', descriptionNl: 'Plat mineraalwater — verfrissend en puur.', category: 'Drinks', isVegetarian: true, sortOrder: 106 },
];

// ===================== SEED FUNCTION =====================
async function seedDatabase() {
  console.log('🚀 Starting Light of India menu seed...');
  console.log(`   Using API at: http://localhost:${PORT}/api/v1/menu`);
  console.log(`   Dine-in items: ${dineInItems.length}`);
  console.log(`   Takeaway items: ${takeawayItems.length}`);
  console.log(`   Total: ${dineInItems.length + takeawayItems.length}\n`);

  // Step 0: Clear existing menu data to prevent duplicates
  console.log('🗑️  Clearing existing menu data...');
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    const itemResult = await db.collection('menuitems').deleteMany({});
    const catResult = await db.collection('menucategories').deleteMany({});
    console.log(`  ✅ Deleted ${itemResult.deletedCount} items and ${catResult.deletedCount} categories`);
    await client.close();
  } catch (error) {
    console.log(`  ⚠️  Could not clear via MongoDB (${error.message}), continuing anyway...`);
  }

  // Step 1: Create categories
  console.log('📁 Creating categories...');
  const categoryMap = {};

  for (const category of categories) {
    try {
      const result = await makeRequest('POST', `http://localhost:${PORT}/api/v1/menu/categories`, category);
      if (result.status === 201 || result.status === 200) {
        categoryMap[category.name] = result.data.data?._id || result.data._id || result.data.category?._id;
        console.log(`  ✅ ${category.name}`);
      } else if (result.status === 409 || (result.data?.message && result.data.message.includes('already exists'))) {
        console.log(`  ⏭️  ${category.name} (already exists)`);
      } else {
        console.log(`  ❌ ${category.name}: ${result.data?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`  ❌ ${category.name}: ${error.message}`);
    }
  }

  // Fetch all categories to ensure we have IDs
  try {
    const catResult = await makeRequest('GET', `http://localhost:${PORT}/api/v1/menu/categories`);
    if (catResult.data?.data) {
      for (const cat of catResult.data.data) {
        categoryMap[cat.name] = cat._id;
      }
    }
  } catch (e) {
    console.log('  ⚠️  Could not fetch categories:', e.message);
  }

  console.log(`\n📋 Category map: ${Object.keys(categoryMap).length} categories`);
  for (const [name, id] of Object.entries(categoryMap)) {
    console.log(`   ${name} → ${id}`);
  }

  // Step 2: Create dine-in items
  console.log('\n🍽️  Creating DINE-IN menu items...');
  let dineInCount = 0;
  let dineInErrors = 0;
  for (const item of dineInItems) {
    const categoryId = categoryMap[item.category];
    if (!categoryId) {
      console.log(`  ⚠️  Skipping "${item.name}" - category "${item.category}" not found`);
      dineInErrors++;
      continue;
    }

    try {
      const itemData = {
        name: item.name,
        price: item.price,
        description: item.description,
        descriptionNl: item.descriptionNl,
        category: categoryId,
        menuType: 'dine-in',
        isVegetarian: item.isVegetarian || false,
        isSpicy: item.isSpicy || false,
        isDoubleSpicy: item.isDoubleSpicy || false,
        sortOrder: item.sortOrder || 0,
        isActive: true,
      };

      const result = await makeRequest('POST', `http://localhost:${PORT}/api/v1/menu/items`, itemData);
      if (result.status === 201 || result.status === 200) {
        dineInCount++;
        process.stdout.write(`\r  ✅ Created ${dineInCount} / ${dineInItems.length} dine-in items...`);
      } else {
        dineInErrors++;
        console.log(`\n  ❌ ${item.name}: ${result.data?.message || JSON.stringify(result.data)}`);
      }
    } catch (error) {
      dineInErrors++;
      console.log(`\n  ❌ ${item.name}: ${error.message}`);
    }
  }
  console.log(`\n  📊 Dine-in: ${dineInCount} created, ${dineInErrors} errors`);

  // Step 3: Create take-away items
  console.log('\n📦 Creating TAKE-AWAY menu items...');
  let takeawayCount = 0;
  let takeawayErrors = 0;
  for (const item of takeawayItems) {
    const categoryId = categoryMap[item.category];
    if (!categoryId) {
      console.log(`  ⚠️  Skipping "${item.name}" - category "${item.category}" not found`);
      takeawayErrors++;
      continue;
    }

    try {
      const itemData = {
        name: item.name,
        price: item.price,
        description: item.description,
        descriptionNl: item.descriptionNl,
        category: categoryId,
        menuType: 'takeaway',
        isVegetarian: item.isVegetarian || false,
        isSpicy: item.isSpicy || false,
        isDoubleSpicy: item.isDoubleSpicy || false,
        sortOrder: item.sortOrder || 0,
        isActive: true,
      };

      const result = await makeRequest('POST', `http://localhost:${PORT}/api/v1/menu/items`, itemData);
      if (result.status === 201 || result.status === 200) {
        takeawayCount++;
        process.stdout.write(`\r  ✅ Created ${takeawayCount} / ${takeawayItems.length} take-away items...`);
      } else {
        takeawayErrors++;
        console.log(`\n  ❌ ${item.name}: ${result.data?.message || JSON.stringify(result.data)}`);
      }
    } catch (error) {
      takeawayErrors++;
      console.log(`\n  ❌ ${item.name}: ${error.message}`);
    }
  }
  console.log(`\n  📊 Takeaway: ${takeawayCount} created, ${takeawayErrors} errors`);

  console.log('\n✨ Seed completed!');
  console.log(`   📁 Categories: ${Object.keys(categoryMap).length}`);
  console.log(`   🍽️  Dine-in items: ${dineInCount}`);
  console.log(`   📦 Take-away items: ${takeawayCount}`);
  console.log(`   📊 Total items: ${dineInCount + takeawayCount}`);
  console.log(`   ⚠️  Total errors: ${dineInErrors + takeawayErrors}`);
}

seedDatabase().catch(console.error);
