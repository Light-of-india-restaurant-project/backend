const http = require('http');
const { MongoClient } = require('mongodb');

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.DB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/my-app-development';
const DB_NAME = 'my-app-development';
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
  { name: 'Soup', icon: '🍲', sortOrder: 1 },
  { name: 'Street Food', icon: '🍢', sortOrder: 2 },
  { name: 'Starters', icon: '🥗', sortOrder: 3 },
  { name: 'Chicken Dishes', icon: '🍗', sortOrder: 4 },
  { name: 'Lamb Dishes', icon: '🍖', sortOrder: 5 },
  { name: 'Seafood', icon: '🐟', sortOrder: 6 },
  { name: 'Vegetable Dishes', icon: '🥬', sortOrder: 7 },
  { name: 'Grill Dishes', icon: '🔥', sortOrder: 8 },
  { name: 'Biryani', icon: '🍚', sortOrder: 9 },
  { name: 'Side Dishes', icon: '🫘', sortOrder: 10 },
  { name: 'Indian Breads', icon: '🫓', sortOrder: 11 },
  { name: 'Salad', icon: '🥗', sortOrder: 12 },
  { name: 'Kids Menu', icon: '👶', sortOrder: 13 },
  { name: 'Extra', icon: '➕', sortOrder: 14 },
  { name: 'Desserts', icon: '🍨', sortOrder: 15 },
  { name: 'Coffee & Tea', icon: '☕', sortOrder: 16 },
  { name: 'Soft Drinks', icon: '🥤', sortOrder: 17 },
  { name: 'Lassi', icon: '🥛', sortOrder: 18 },
  { name: 'Spirits & Liqueurs', icon: '🥃', sortOrder: 19 },
  { name: 'Wine', icon: '🍷', sortOrder: 20 },
  { name: 'Drinks', icon: '🥤', sortOrder: 21 },
];

// ===================== DINE-IN MENU =====================
const dineInItems = [
  // === SOUP ===
  { name: 'Mulligatawny Soup', price: 7.50, description: 'Hearty spiced lentil and vegetable soup with aromatic curry notes.', descriptionNl: 'Hartverwarmende gekruide linzen- en groentesoep met aromatische kerrienoten.', category: 'Soup', isVegetarian: true, sortOrder: 1 },
  { name: 'Tomato Soup', price: 7.50, description: 'Smoky roasted tomato and basil soup with a creamy, crisp garnish.', descriptionNl: 'Rokerige geroosterde tomaat-basilicumsoep met een romige, knapperige garnering.', category: 'Soup', isVegetarian: true, sortOrder: 2 },
  { name: 'Sweetcorn Soup', price: 7.50, description: 'Rich creamy sweetcorn blended with subtle spices for a comforting start.', descriptionNl: 'Rijke romige zoete maïssoep gemengd met subtiele kruiden voor een hartelijke start.', category: 'Soup', isVegetarian: true, sortOrder: 3 },

  // === STREET FOOD ===
  { name: 'Papdi Chaat', price: 8.50, description: 'Crispy wafers topped with spiced potatoes, chilled yogurt and chutneys.', descriptionNl: 'Krokante wafeltjes met gekruide aardappelen, gekoelde yoghurt en chutneys.', category: 'Street Food', isVegetarian: true, sortOrder: 1 },
  { name: 'Samosa Chaat', price: 7.50, description: 'Samosa pieces topped with chickpeas and tangy sauces.', descriptionNl: 'Samosa stukken bedekt met kikkererwten en pittige sauzen.', category: 'Street Food', isVegetarian: true, sortOrder: 2 },
  { name: 'Pani Puri', price: 7.50, description: 'Crispy hollow balls filled with spicy potato and served with tangy mint-tamarind water.', descriptionNl: 'Krokante holle balletjes gevuld met pittige aardappel, geserveerd met munt-tamarindewater.', category: 'Street Food', isVegetarian: true, sortOrder: 3 },
  { name: 'Pani Puri Shot (Alcoholic)', price: 8.50, description: 'Crispy hollow balls filled with spicy potato and served with tangy mint-tamarind water.', descriptionNl: 'Krokante holle balletjes gevuld met pittige aardappel, geserveerd met pittig munt-tamarindewater (alcoholisch).', category: 'Street Food', isVegetarian: true, sortOrder: 4 },
  { name: 'Dahi Puri', price: 8.50, description: 'Crispy hollow shells filled with spiced potatoes, tangy chutneys, and creamy yogurt, topped with crunchy sev.', descriptionNl: 'Krokante holle schelpen gevuld met gekruide aardappelen, pittige chutneys en romige yoghurt, afgewerkt met knapperige sev.', category: 'Street Food', isVegetarian: true, sortOrder: 5 },
  { name: 'Aloo Tikki', price: 7.50, description: 'Golden fried spiced potato patties with cooling chutneys.', descriptionNl: 'Goudgebakken gekruide aardappelkoekjes met verkoelende chutneys.', category: 'Street Food', isVegetarian: true, sortOrder: 6 },
  { name: 'Vada Pav', price: 8.50, description: 'Deep fried potato patty wrapped in bread served with condiments such as chutney and red chilli powder.', descriptionNl: 'Gefrituurde aardappelkoek in brood geserveerd met chutney en rode chilipoeder.', category: 'Street Food', isVegetarian: true, sortOrder: 7 },
  { name: 'Pav Bhaji', price: 11.50, description: 'Thick vegetable curry served with 2 butter fried buns.', descriptionNl: 'Dikke groentecurry geserveerd met 2 in boter gebakken broodjes.', category: 'Street Food', isVegetarian: true, sortOrder: 8 },
  { name: 'Cholay Bhature', price: 11.50, description: 'Spiced chickpea curry served with fluffy, deep-fried leavened bread.', descriptionNl: 'Gekruide kikkererwten curry geserveerd met luchtig gefrituurde broodjes.', category: 'Street Food', isVegetarian: true, sortOrder: 9 },

  // === STARTERS ===
  { name: 'Papadum', price: 3.50, description: 'Crispy lentil wafers served with chutneys.', descriptionNl: 'Knapperige linzenwafels geserveerd met chutneys.', category: 'Starters', isVegetarian: true, sortOrder: 1 },
  { name: 'Vegetable Samosa', price: 6.50, description: 'Crispy golden pastry filled with spiced vegetables and aromatic herbs, served with a flavorful chutney.', descriptionNl: 'Krokant gouden gebak gevuld met gekruide groenten en aromatische kruiden, geserveerd met smaakvolle chutney.', category: 'Starters', isVegetarian: true, sortOrder: 2 },
  { name: 'Onion Bhaji / Vegetable Pakora', price: 6.50, description: 'Crispy spiced onion fritters made with gram flour and aromatic herbs, served with tangy chutney.', descriptionNl: 'Krokante gekruide uienfritters gemaakt met kikkererwtenmeel en aromatische kruiden, geserveerd met pittige chutney.', category: 'Starters', isVegetarian: true, sortOrder: 3 },
  { name: 'Classic Tandoori Chicken', price: 11.50, description: 'Tender half chicken marinated in traditional spices and clay-oven roasted.', descriptionNl: 'Malse halve kip gemarineerd in traditionele kruiden en geroosterd in klei-oven.', category: 'Starters', isVegetarian: false, sortOrder: 4 },
  { name: 'Chicken Tikka', price: 13.50, description: 'Tender chicken chunks marinated overnight and perfectly grilled.', descriptionNl: 'Malse kipstukken een nacht gemarineerd en perfect gegrild.', category: 'Starters', isVegetarian: false, sortOrder: 5 },
  { name: 'Malai Broccoli', price: 11.99, description: 'Broccoli marinated in cheese and yogurt then roasted.', descriptionNl: 'Broccoli gemarineerd in kaas en yoghurt en vervolgens geroosterd.', category: 'Starters', isVegetarian: true, sortOrder: 6 },

  // === CHICKEN DISHES (served with basmati rice) ===
  { name: 'Butter Chicken', price: 21.50, description: 'Creamy tomato gravy with succulent pieces of grilled chicken.', descriptionNl: 'Romige tomatensaus met sappige stukjes gegrilde kip.', category: 'Chicken Dishes', isVegetarian: false, sortOrder: 1 },
  { name: 'Chicken Tikka Masala', price: 21.50, description: 'Cooked chicken tikka pieces simmered in a rich, creamy tomato-based masala sauce infused with aromatic spices, served with grilled chicken.', descriptionNl: 'Gegaarde chicken tikka stukken gestoofd in een rijke, romige masalasaus op tomatenbasis met aromatische kruiden.', category: 'Chicken Dishes', isVegetarian: false, sortOrder: 2 },
  { name: 'Chicken Korma', price: 21.50, description: 'Creamy, mildly spiced chicken curry simmered in a rich blend of yogurt, nuts, and aromatic Mughlai spices.', descriptionNl: 'Romige, mild gekruide kipcurry gestoofd in een rijke mix van yoghurt, noten en aromatische Mughlai-kruiden.', category: 'Chicken Dishes', isVegetarian: false, sortOrder: 3 },
  { name: 'Chicken Tikka Jalfrezi', price: 21.50, description: 'Stir-fried chicken with peppers and mild spices.', descriptionNl: 'Roergebakken kip met paprika en milde kruiden.', category: 'Chicken Dishes', isVegetarian: false, sortOrder: 4 },
  { name: 'Chicken Saag', price: 21.50, description: 'Chicken simmered in rich spinach-based curry sauce.', descriptionNl: 'Kip gestoofd in rijke spinazie-currysaus.', category: 'Chicken Dishes', isVegetarian: false, sortOrder: 5 },
  { name: 'Chicken Madras', price: 21.50, description: 'Hot South Indian chicken curry with bold spices.', descriptionNl: 'Heet Zuid-Indiaas kipgerecht met krachtige kruiden.', category: 'Chicken Dishes', isVegetarian: false, isSpicy: true, sortOrder: 6 },
  { name: 'Chicken Balti', price: 21.50, description: 'Tender chicken cooked with tomatoes and aromatic Balti spices.', descriptionNl: 'Malse kip gekookt met tomaten en aromatische Balti-kruiden.', category: 'Chicken Dishes', isVegetarian: false, sortOrder: 7 },
  { name: 'Chicken Dhansak', price: 21.50, description: 'Chicken cooked in lentils with mild spices for a sweet-sour flavour.', descriptionNl: 'Kip gekookt met linzen en milde kruiden voor een zoet-zure smaak.', category: 'Chicken Dishes', isVegetarian: false, sortOrder: 8 },
  { name: 'Chicken Kadhai', price: 21.50, description: 'Chicken simmered with bell peppers and traditional Indian spices.', descriptionNl: 'Kip gestoofd met paprika en traditionele Indiase kruiden.', category: 'Chicken Dishes', isVegetarian: false, sortOrder: 9 },
  { name: 'Chicken Vindaloo', price: 21.50, description: 'Fiery Goa-style chicken curry with tangy vinegar notes and tender potatoes.', descriptionNl: 'Vurige Goaanse kipcurry met pittige azijntonen en malse aardappelen.', category: 'Chicken Dishes', isVegetarian: false, isSpicy: true, isDoubleSpicy: true, sortOrder: 10 },

  // === LAMB DISHES (served with basmati rice) ===
  { name: 'Lamb Rogan Josh', price: 24.50, description: 'Tender lamb simmered in rich Kashmiri spices.', descriptionNl: 'Mals lamsvlees gestoofd in rijke Kashmiri-kruiden.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 1 },
  { name: 'Lamb Korma', price: 24.50, description: 'Creamy, mildly spiced lamb curry simmered in a rich blend of yogurt, nuts, and aromatic Mughlai spices.', descriptionNl: 'Romige, mild gekruide lamscurry gestoofd in een rijke mix van yoghurt, noten en aromatische Mughlai-kruiden.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 2 },
  { name: 'Lamb Jalfrezi', price: 24.50, description: 'Stir-fried lamb with peppers and mild spices.', descriptionNl: 'Roergebakken lam met paprika en milde kruiden.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 3 },
  { name: 'Lamb Saag', price: 24.50, description: 'Lamb simmered in rich spinach-based curry sauce.', descriptionNl: 'Lam gestoofd in rijke spinazie-currysaus.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 4 },
  { name: 'Lamb Madras', price: 24.50, description: 'Hot South Indian lamb curry with bold spices.', descriptionNl: 'Heet Zuid-Indiaas lamsgerecht met krachtige kruiden.', category: 'Lamb Dishes', isVegetarian: false, isSpicy: true, sortOrder: 5 },
  { name: 'Lamb Balti', price: 24.50, description: 'Tender lamb cooked with tomatoes and aromatic Balti spices.', descriptionNl: 'Mals lam gekookt met tomaten en aromatische Balti-kruiden.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 6 },
  { name: 'Lamb Dhansak', price: 24.50, description: 'Lamb cooked in lentils with mild spices for a sweet-sour flavour.', descriptionNl: 'Lam gekookt met linzen en milde kruiden voor een zoet-zure smaak.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 7 },
  { name: 'Lamb Kadhai', price: 24.50, description: 'Lamb simmered with bell peppers and traditional Indian spices.', descriptionNl: 'Lam gestoofd met paprika en traditionele Indiase kruiden.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 8 },
  { name: 'Lamb Vindaloo', price: 24.50, description: 'Fiery Goa-style lamb curry with tangy vinegar notes and tender potatoes.', descriptionNl: 'Vurige Goaanse lamscurry met pittige azijntonen en malse aardappelen.', category: 'Lamb Dishes', isVegetarian: false, isSpicy: true, isDoubleSpicy: true, sortOrder: 9 },

  // === SEAFOOD (served with basmati rice) ===
  { name: 'Goa Fish Curry', price: 24.50, description: 'Tangy coconut and tamarind fish curry with coastal spices.', descriptionNl: 'Pittige kokos- en tamarindeviscurry met kustkruiden.', category: 'Seafood', isVegetarian: false, sortOrder: 1 },
  { name: 'Prawn Jalfrezi', price: 24.50, description: 'Stir-fried prawn with peppers and mild spices.', descriptionNl: 'Roergebakken garnalen met paprika en milde kruiden.', category: 'Seafood', isVegetarian: false, sortOrder: 2 },
  { name: 'Prawn Kadhai', price: 24.50, description: 'Prawn simmered with bell peppers and traditional Indian spices.', descriptionNl: 'Garnalen gestoofd met paprika en traditionele Indiase kruiden.', category: 'Seafood', isVegetarian: false, sortOrder: 3 },
  { name: 'Prawn Madras', price: 24.50, description: 'Hot South Indian prawn curry with bold spices.', descriptionNl: 'Heet Zuid-Indiaas garnalengerecht met krachtige kruiden.', category: 'Seafood', isVegetarian: false, isSpicy: true, sortOrder: 4 },
  { name: 'Prawn Vindaloo', price: 24.50, description: 'Fiery Goa-style prawn curry with tangy vinegar notes and tender potatoes.', descriptionNl: 'Vurige Goaanse garnalencurry met pittige azijntonen en malse aardappelen.', category: 'Seafood', isVegetarian: false, isSpicy: true, isDoubleSpicy: true, sortOrder: 5 },

  // === VEGETABLE DISHES (served with basmati rice) ===
  { name: 'Shahi Paneer', price: 18.50, description: 'Paneer in a creamy, aromatic royal sauce.', descriptionNl: 'Paneer in een romige, aromatische koninklijke saus.', category: 'Vegetable Dishes', isVegetarian: true, sortOrder: 1 },
  { name: 'Saag Paneer', price: 18.50, description: 'Paneer cooked in seasoned spinach gravy.', descriptionNl: 'Paneer gekookt in gekruide spinaziesaus.', category: 'Vegetable Dishes', isVegetarian: true, sortOrder: 2 },
  { name: 'Paneer Jalfrezi', price: 18.50, description: 'Paneer stir-fried with spices, peppers and onions.', descriptionNl: 'Paneer roergebakken met kruiden, paprika en uien.', category: 'Vegetable Dishes', isVegetarian: true, sortOrder: 3 },
  { name: 'Bhindi Do Pyaza', price: 20.50, description: 'Okra sautéed with onions and spices.', descriptionNl: 'Okra gesauteerd met uien en kruiden.', category: 'Vegetable Dishes', isVegetarian: true, sortOrder: 4 },
  { name: 'Alu Baingan Masala', price: 18.50, description: 'Potato and eggplant cooked in rich spiced tomato gravy.', descriptionNl: 'Aardappel en aubergine gekookt in rijke gekruide tomatensaus.', category: 'Vegetable Dishes', isVegetarian: true, sortOrder: 5 },
  { name: 'Chana Masala', price: 18.50, description: 'Chickpeas cooked in traditional North Indian spices.', descriptionNl: 'Kikkererwten gekookt in traditionele Noord-Indiase kruiden.', category: 'Vegetable Dishes', isVegetarian: true, sortOrder: 6 },
  { name: 'Mix Vegetable', price: 18.50, description: 'Assorted vegetables cooked with aromatic spices.', descriptionNl: 'Gemengde groenten gekookt met aromatische kruiden.', category: 'Vegetable Dishes', isVegetarian: true, sortOrder: 7 },
  { name: 'Alu Gobi', price: 18.50, description: 'Cauliflower and potatoes sautéed with cumin, turmeric and aromatic spices.', descriptionNl: 'Bloemkool en aardappelen gesauteerd met komijn, kurkuma en aromatische kruiden.', category: 'Vegetable Dishes', isVegetarian: true, sortOrder: 8 },

  // === GRILL DISHES (served with basmati rice) ===
  { name: 'Tandoori Chicken', price: 20.50, description: 'Classic clay-oven roasted chicken seasoned with spices and herbs.', descriptionNl: 'Klassieke kip geroosterd in klei-oven met kruiden en specerijen.', category: 'Grill Dishes', isVegetarian: false, sortOrder: 1 },
  { name: 'Chicken Tikka (Grill)', price: 21.50, description: 'Tender pieces of chicken marinated in spices and grilled.', descriptionNl: 'Malse kipstukken gemarineerd in kruiden en gegrild.', category: 'Grill Dishes', isVegetarian: false, sortOrder: 2 },
  { name: 'Grilled Lamb Chops', price: 24.50, description: 'Marinated lamb chops chargrilled and served with mint chutney.', descriptionNl: 'Gemarineerde lamskoteletten gegrild en geserveerd met muntchutney.', category: 'Grill Dishes', isVegetarian: false, sortOrder: 3 },
  { name: 'Seekh Kabab', price: 22.50, description: 'Minced spiced meat skewers grilled to juicy perfection.', descriptionNl: 'Gehakte gekruide vleesspiesjes gegrild tot sappige perfectie.', category: 'Grill Dishes', isVegetarian: false, sortOrder: 4 },
  { name: 'Mix Grill', price: 26.50, description: "A chef's selection of grilled meats and kebabs served sizzling.", descriptionNl: "Een chef's selectie van gegrild vlees en kebabs, sissend geserveerd.", category: 'Grill Dishes', isVegetarian: false, sortOrder: 5 },

  // === BIRYANI (served with raita) ===
  { name: 'Chicken Biryani', price: 20.50, description: 'Aromatic basmati rice slow-cooked with spiced chicken and saffron.', descriptionNl: 'Aromatische basmatirijst langzaam gegaard met gekruide kip en saffraan.', category: 'Biryani', isVegetarian: false, sortOrder: 1 },
  { name: 'Lamb Biryani', price: 22.50, description: 'Fragrant long-grain rice layered with tender lamb and aromatic spices.', descriptionNl: 'Geurige langkorrelrijst in lagen met mals lamsvlees en aromatische kruiden.', category: 'Biryani', isVegetarian: false, sortOrder: 2 },
  { name: 'Vegetable Biryani', price: 18.50, description: 'Seasoned basmati rice with mixed vegetables and herbs.', descriptionNl: 'Gekruide basmatirijst met gemengde groenten en kruiden.', category: 'Biryani', isVegetarian: true, sortOrder: 3 },
  { name: 'Prawn Biryani', price: 24.50, description: 'Spiced basmati rice layered with succulent prawns.', descriptionNl: 'Gekruide basmatirijst in lagen met sappige garnalen.', category: 'Biryani', isVegetarian: false, sortOrder: 4 },

  // === SIDE DISHES ===
  { name: 'Daal Tarka', price: 10.50, description: 'Yellow lentils tempered with mustard seeds and spices.', descriptionNl: 'Gele linzen getemperd met mosterdzaad en kruiden.', category: 'Side Dishes', isVegetarian: true, sortOrder: 1 },
  { name: 'Daal Makhani', price: 12.50, description: 'Creamy black lentils slow simmered with aromatic spices.', descriptionNl: 'Romige zwarte linzen langzaam gestoofd met aromatische kruiden.', category: 'Side Dishes', isVegetarian: true, sortOrder: 2 },

  // === INDIAN BREADS ===
  { name: 'Plain Naan', price: 3.95, description: 'Soft leavened bread.', descriptionNl: 'Zacht gerezen brood.', category: 'Indian Breads', isVegetarian: true, sortOrder: 1 },
  { name: 'Tandoori Roti', price: 3.95, description: 'Traditional whole wheat flatbread baked in a clay oven.', descriptionNl: 'Traditioneel volkoren platbrood gebakken in een kleioven.', category: 'Indian Breads', isVegetarian: true, sortOrder: 2 },
  { name: 'Garlic Naan', price: 4.75, description: 'Warm naan infused with roasted garlic.', descriptionNl: 'Warme naan doordrenkt met geroosterde knoflook.', category: 'Indian Breads', isVegetarian: true, sortOrder: 3 },
  { name: 'Cheese Naan', price: 5.50, description: 'Soft leavened naan stuffed with melted cheese, baked until golden and served warm.', descriptionNl: 'Zacht gerezen naan gevuld met gesmolten kaas, goudbruin gebakken en warm geserveerd.', category: 'Indian Breads', isVegetarian: true, sortOrder: 4 },
  { name: 'Butter Naan', price: 4.75, description: 'Soft leavened bread brushed with rich butter.', descriptionNl: 'Zacht gerezen brood ingesmeerd met rijke boter.', category: 'Indian Breads', isVegetarian: true, sortOrder: 5 },
  { name: 'Qeema Naan', price: 6.50, description: 'Crumbly spiced minced meat stuffed in soft leavened naan, baked to golden perfection with aromatic herbs and traditional spices.', descriptionNl: 'Kruimelig gekruid gehakt gevuld in zachte naan, goudbruin gebakken met aromatische kruiden en traditionele specerijen.', category: 'Indian Breads', isVegetarian: false, sortOrder: 6 },
  { name: 'Aloo Naan', price: 5.50, description: 'Flatbread stuffed with spiced mashed potatoes.', descriptionNl: 'Platbrood gevuld met gekruide aardappelpuree.', category: 'Indian Breads', isVegetarian: true, sortOrder: 7 },
  { name: 'Aloo Paratha', price: 5.50, description: 'Whole wheat flatbread stuffed with spiced mashed potatoes, pan-fried to golden perfection with butter or ghee.', descriptionNl: 'Volkoren platbrood gevuld met gekruide aardappelpuree, goudbruin gebakken met boter of ghee.', category: 'Indian Breads', isVegetarian: true, sortOrder: 8 },
  { name: 'Peshawari Naan', price: 6.50, description: 'Soft leavened naan stuffed with sweet nuts and coconut, baked in a tandoor and finished with rich butter for a fragrant, slightly sweet taste.', descriptionNl: 'Zachte naan gevuld met zoete noten en kokos, gebakken in een tandoor en afgewerkt met rijke boter voor een geurige, licht zoete smaak.', category: 'Indian Breads', isVegetarian: true, sortOrder: 9 },

  // === SALAD ===
  { name: 'Green Salad', price: 7.50, description: 'Fresh mixed greens tossed with crisp vegetables.', descriptionNl: 'Verse gemengde groene salade met knapperige groenten.', category: 'Salad', isVegetarian: true, sortOrder: 1 },
  { name: 'Masala Onion', price: 2.50, description: 'Sliced onions tossed with tangy spices.', descriptionNl: 'Gesneden uien gemengd met pittige kruiden.', category: 'Salad', isVegetarian: true, sortOrder: 2 },

  // === KIDS MENU ===
  { name: 'Chicken Nuggets with French Fries or Rice', price: 7.50, description: 'Crispy chicken nuggets served with golden fries or steaming rice.', descriptionNl: 'Krokante kipnuggets geserveerd met goudgele frietjes of gestoomde rijst.', category: 'Kids Menu', isVegetarian: false, sortOrder: 1 },
  { name: 'French Fries', price: 3.50, description: 'Classic crisp golden fries, lightly seasoned.', descriptionNl: 'Klassieke knapperige goudgele frietjes, licht gekruid.', category: 'Kids Menu', isVegetarian: true, sortOrder: 2 },

  // === EXTRA ===
  { name: 'Raita', price: 3.95, description: 'Cooling yogurt-based condiment with cucumber, mint, and roasted cumin, served fresh as a refreshing accompaniment to spicy dishes.', descriptionNl: 'Verkoelende yoghurtdip met komkommer, munt en geroosterde komijn, fris geserveerd als verfrissende begeleider bij pittige gerechten.', category: 'Extra', isVegetarian: true, sortOrder: 1 },
  { name: 'Zeera Rice', price: 4.95, description: 'Basmati rice seasoned with cumin seeds.', descriptionNl: 'Basmatirijst gekruid met komijnzaad.', category: 'Extra', isVegetarian: true, sortOrder: 2 },
  { name: 'Pulao Rice', price: 4.95, description: 'Fluffy steamed basmati rice.', descriptionNl: 'Luchtige gestoomde basmatirijst.', category: 'Extra', isVegetarian: true, sortOrder: 3 },

  // === DESSERTS ===
  { name: 'Kesari Halwa', price: 6.50, description: 'Creamy semolina-based sweet pudding cooked in ghee, sugar, and saffron, enriched with cardamom and roasted nuts for a rich golden finish.', descriptionNl: 'Romige griesmeel-pudding gekookt in ghee, suiker en saffraan, verrijkt met kardemom en geroosterde noten.', category: 'Desserts', isVegetarian: true, sortOrder: 1 },
  { name: 'Gajar Ka Halwa', price: 7.50, description: 'Creamy, slow-cooked grated carrots simmered in milk, ghee, and sugar, enriched with nuts and aromatic cardamom.', descriptionNl: 'Romige, langzaam gegaarde geraspte wortelen gestoofd in melk, ghee en suiker, verrijkt met noten en aromatische kardemom.', category: 'Desserts', isVegetarian: true, sortOrder: 2 },
  { name: 'Ras Malai', price: 6.50, description: 'Soft cheese dumplings in sweet creamy milk.', descriptionNl: 'Zachte kaasballetjes in zoete romige melk.', category: 'Desserts', isVegetarian: true, sortOrder: 3 },
  { name: 'Gulab Jamun', price: 6.50, description: 'Creamy, deep-fried milk-solid dumplings soaked in fragrant rose-saffron sugar syrup, a classic Indian dessert.', descriptionNl: 'Romige gefrituurde melkballetjes gedrenkt in geurige rozen-saffraan suikersiroop, een klassiek Indiaas dessert.', category: 'Desserts', isVegetarian: true, sortOrder: 4 },
  { name: 'Ice Cream — Vanilla', price: 5.50, description: 'Creamy classic vanilla ice cream.', descriptionNl: 'Romig klassiek vanille-ijs.', category: 'Desserts', isVegetarian: true, sortOrder: 5 },
  { name: 'Ice Cream — Strawberry', price: 5.50, description: 'Fresh strawberry ice cream with vibrant flavour.', descriptionNl: 'Vers aardbeienijs met levendige smaak.', category: 'Desserts', isVegetarian: true, sortOrder: 6 },
  { name: 'Ice Cream — Chocolate', price: 5.50, description: 'Rich chocolate ice cream for chocoholics.', descriptionNl: 'Rijk chocolade-ijs voor chocoholics.', category: 'Desserts', isVegetarian: true, sortOrder: 7 },
  { name: 'Ice Cream — Mango', price: 5.50, description: 'Tropical mango ice cream with fruity sweetness.', descriptionNl: 'Tropisch mango-ijs met fruitige zoetheid.', category: 'Desserts', isVegetarian: true, sortOrder: 8 },
  { name: 'Light of India Ice Cream Combination', price: 10.50, description: 'Assorted premium scoops of favourite ice cream flavours.', descriptionNl: 'Assortiment premium bolletjes van favoriete ijssmaken.', category: 'Desserts', isVegetarian: true, sortOrder: 9 },

  // === COFFEE & TEA ===
  { name: 'Green Tea', price: 3.50, description: 'Light and refreshing green tea.', descriptionNl: 'Lichte en verfrissende groene thee.', category: 'Coffee & Tea', isVegetarian: true, sortOrder: 1 },
  { name: 'Fresh Mint / Ginger Tea', price: 4.50, description: 'Freshly brewed mint or ginger infused tea.', descriptionNl: 'Vers gezette munt- of gemberthee.', category: 'Coffee & Tea', isVegetarian: true, sortOrder: 2 },
  { name: 'Indian Tea', price: 4.50, description: 'Traditional Indian chai brewed with spices and milk.', descriptionNl: 'Traditionele Indiase chai gezet met kruiden en melk.', category: 'Coffee & Tea', isVegetarian: true, sortOrder: 3 },
  { name: 'Coffee', price: 3.25, description: 'Freshly brewed coffee.', descriptionNl: 'Vers gezette koffie.', category: 'Coffee & Tea', isVegetarian: true, sortOrder: 4 },
  { name: 'Espresso', price: 3.25, description: 'Strong single shot espresso.', descriptionNl: 'Sterke enkele espresso.', category: 'Coffee & Tea', isVegetarian: true, sortOrder: 5 },
  { name: 'Double Espresso', price: 5.50, description: 'Double shot of rich espresso.', descriptionNl: 'Dubbele shot rijke espresso.', category: 'Coffee & Tea', isVegetarian: true, sortOrder: 6 },
  { name: 'Cappuccino', price: 4.50, description: 'Classic cappuccino with frothy milk.', descriptionNl: 'Klassieke cappuccino met schuimige melk.', category: 'Coffee & Tea', isVegetarian: true, sortOrder: 7 },
  { name: 'Café au Lait', price: 4.50, description: 'Coffee with warm steamed milk.', descriptionNl: 'Koffie met warme gestoomde melk.', category: 'Coffee & Tea', isVegetarian: true, sortOrder: 8 },
  { name: 'Decaf', price: 3.50, description: 'Decaffeinated coffee.', descriptionNl: 'Cafeïnevrije koffie.', category: 'Coffee & Tea', isVegetarian: true, sortOrder: 9 },
  { name: 'French Coffee', price: 9.50, description: 'Coffee with a splash of Grand Marnier liqueur.', descriptionNl: 'Koffie met een scheutje Grand Marnier likeur.', category: 'Coffee & Tea', isVegetarian: true, sortOrder: 10 },
  { name: 'Irish Coffee', price: 9.50, description: 'Coffee with Irish whiskey and whipped cream.', descriptionNl: 'Koffie met Ierse whiskey en slagroom.', category: 'Coffee & Tea', isVegetarian: true, sortOrder: 11 },
  { name: 'Spanish Coffee', price: 9.50, description: 'Coffee with Spanish brandy and cream.', descriptionNl: 'Koffie met Spaanse brandy en room.', category: 'Coffee & Tea', isVegetarian: true, sortOrder: 12 },

  // === SOFT DRINKS ===
  { name: "Jus d'Orange", price: 3.50, description: 'Freshly squeezed orange juice.', descriptionNl: 'Vers geperst sinaasappelsap.', category: 'Soft Drinks', isVegetarian: true, sortOrder: 1 },
  { name: 'Appelsap', price: 3.50, description: 'Apple juice.', descriptionNl: 'Appelsap.', category: 'Soft Drinks', isVegetarian: true, sortOrder: 2 },
  { name: 'Coca-Cola / Light / Zero', price: 3.50, description: 'Classic Coca-Cola, Light or Zero.', descriptionNl: 'Klassieke Coca-Cola, Light of Zero.', category: 'Soft Drinks', isVegetarian: true, sortOrder: 3 },
  { name: 'Sprite', price: 3.50, description: 'Lemon-lime flavoured soft drink.', descriptionNl: 'Citroen-limoen frisdrank.', category: 'Soft Drinks', isVegetarian: true, sortOrder: 4 },
  { name: 'Fanta', price: 3.50, description: 'Orange flavoured soft drink.', descriptionNl: 'Sinaasappel frisdrank.', category: 'Soft Drinks', isVegetarian: true, sortOrder: 5 },
  { name: 'Cassis', price: 3.50, description: 'Blackcurrant flavoured soft drink.', descriptionNl: 'Zwarte bessen frisdrank.', category: 'Soft Drinks', isVegetarian: true, sortOrder: 6 },
  { name: 'Fuze Tea', price: 3.50, description: 'Iced tea with a refreshing taste.', descriptionNl: 'IJsthee met een verfrissende smaak.', category: 'Soft Drinks', isVegetarian: true, sortOrder: 7 },
  { name: 'Bitter Lemon', price: 3.50, description: 'Bitter lemon flavoured soft drink.', descriptionNl: 'Bitter lemon frisdrank.', category: 'Soft Drinks', isVegetarian: true, sortOrder: 8 },
  { name: 'Tonic', price: 3.50, description: 'Classic tonic water.', descriptionNl: 'Klassiek tonic water.', category: 'Soft Drinks', isVegetarian: true, sortOrder: 9 },
  { name: 'Chaudfontaine Blauw / Rood', price: 2.95, description: 'Still or sparkling mineral water.', descriptionNl: 'Plat of bruisend mineraalwater.', category: 'Soft Drinks', isVegetarian: true, sortOrder: 10 },
  { name: 'Chaudfontaine 1L', price: 5.75, description: 'Large bottle still or sparkling mineral water.', descriptionNl: 'Grote fles plat of bruisend mineraalwater.', category: 'Soft Drinks', isVegetarian: true, sortOrder: 11 },

  // === LASSI ===
  { name: 'Mango Lassi', price: 5.25, description: 'Refreshing sweet mango yogurt drink.', descriptionNl: 'Verfrissende zoete mango-yoghurtdrank.', category: 'Lassi', isVegetarian: true, sortOrder: 1 },
  { name: 'Sweet Lassi', price: 4.25, description: 'Traditional sweet yogurt drink.', descriptionNl: 'Traditionele zoete yoghurtdrank.', category: 'Lassi', isVegetarian: true, sortOrder: 2 },
  { name: 'Salt Lassi', price: 4.25, description: 'Traditional salted yogurt drink with cumin.', descriptionNl: 'Traditionele gezouten yoghurtdrank met komijn.', category: 'Lassi', isVegetarian: true, sortOrder: 3 },

  // === SPIRITS & LIQUEURS ===
  // Whisky
  { name: 'Ballantines', price: 6.50, description: 'Blended Scotch whisky.', descriptionNl: 'Blended Schotse whisky.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 1 },
  { name: 'Four Roses', price: 6.50, description: 'Kentucky straight bourbon whiskey.', descriptionNl: 'Kentucky straight bourbon whiskey.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 2 },
  { name: 'Johnnie Walker Red', price: 6.75, description: 'Red Label blended Scotch whisky.', descriptionNl: 'Red Label blended Schotse whisky.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 3 },
  { name: 'Johnnie Walker Black', price: 7.50, description: 'Black Label blended Scotch whisky.', descriptionNl: 'Black Label blended Schotse whisky.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 4 },
  { name: 'Dimple', price: 7.50, description: 'Premium blended Scotch whisky.', descriptionNl: 'Premium blended Schotse whisky.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 5 },
  { name: 'Jack Daniels', price: 7.50, description: 'Tennessee whiskey.', descriptionNl: 'Tennessee whiskey.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 6 },
  { name: 'Chivas Regal', price: 8.50, description: 'Premium blended Scotch whisky.', descriptionNl: 'Premium blended Schotse whisky.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 7 },
  { name: 'Glenfiddich', price: 8.50, description: 'Single malt Scotch whisky.', descriptionNl: 'Single malt Schotse whisky.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 8 },
  // Cognac
  { name: 'Remy Martin (VSOP)', price: 8.50, description: 'Fine Champagne cognac.', descriptionNl: 'Fine Champagne cognac.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 9 },
  { name: 'Courvoisier', price: 8.50, description: 'Classic French cognac.', descriptionNl: 'Klassieke Franse cognac.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 10 },
  { name: 'Armagnac', price: 8.50, description: 'French brandy from Gascony.', descriptionNl: 'Franse brandy uit Gascogne.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 11 },
  { name: 'Calvados', price: 8.50, description: 'Apple brandy from Normandy.', descriptionNl: 'Appelbrandy uit Normandië.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 12 },
  // Liqueurs
  { name: 'Baileys', price: 6.50, description: 'Irish cream liqueur.', descriptionNl: 'Ierse crèmelikeur.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 13 },
  { name: 'Malibu', price: 6.50, description: 'Coconut flavoured rum liqueur.', descriptionNl: 'Kokos rumlikeur.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 14 },
  { name: 'Safari', price: 6.50, description: 'Exotic fruit liqueur.', descriptionNl: 'Exotische fruitlikeur.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 15 },
  { name: 'Southern Comfort', price: 6.50, description: 'Fruit and spice flavoured whiskey liqueur.', descriptionNl: 'Fruit- en kruidenwhiskeylikeur.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 16 },
  { name: 'Tia Maria', price: 6.50, description: 'Coffee flavoured liqueur.', descriptionNl: 'Koffielikeur.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 17 },
  { name: 'Cointreau', price: 7.50, description: 'Premium orange liqueur.', descriptionNl: 'Premium sinaasappellikeur.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 18 },
  { name: 'Drambuie', price: 7.50, description: 'Scotch whisky liqueur with honey and herbs.', descriptionNl: 'Schotse whiskylikeur met honing en kruiden.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 19 },
  { name: 'D.O.M. Benedictine', price: 7.50, description: 'French herbal liqueur.', descriptionNl: 'Franse kruidenlikeur.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 20 },
  { name: 'Grand Marnier', price: 7.50, description: 'Orange flavoured cognac liqueur.', descriptionNl: 'Sinaasappel cognac likeur.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 21 },
  { name: 'Sambuca', price: 7.50, description: 'Italian anise-flavoured liqueur.', descriptionNl: 'Italiaanse anijslikeur.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 22 },
  { name: 'Amaretto Disaronno', price: 7.50, description: 'Italian almond flavoured liqueur.', descriptionNl: 'Italiaanse amandellikeur.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 23 },
  // Foreign Spirits
  { name: 'Bacardi', price: 5.50, description: 'White rum.', descriptionNl: 'Witte rum.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 24 },
  { name: 'Bacardi Lemon', price: 5.75, description: 'Lemon flavoured rum.', descriptionNl: 'Citroen rum.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 25 },
  { name: "Gordon's Gin", price: 5.75, description: 'Classic London dry gin.', descriptionNl: 'Klassieke London dry gin.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 26 },
  { name: 'Vodka', price: 5.75, description: 'Classic vodka.', descriptionNl: 'Klassieke wodka.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 27 },
  { name: 'Jonge Jenever', price: 4.00, description: 'Young Dutch genever.', descriptionNl: 'Jonge jenever.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 28 },
  { name: 'Oude Jenever', price: 3.50, description: 'Aged Dutch genever.', descriptionNl: 'Oude jenever.', category: 'Spirits & Liqueurs', isVegetarian: true, sortOrder: 29 },

  // === WINE ===
  // Mousserende Wijn (Sparkling)
  { name: 'Planas Albareda Brut 18.7CL', price: 9.50, description: 'Cava Brut from Penedès, Spain. Xarello, Macabeo and Parellada. Fine mousse, citrus fruit, soft, dry.', descriptionNl: 'Cava Brut uit Penedès, Spanje. Xarello, Macabeo en Parellada. Fijne mousse, citrusfruit, zacht, droog.', category: 'Wine', isVegetarian: true, sortOrder: 1 },
  { name: 'Planas Albareda Cava Brut (Bottle)', price: 29.50, description: 'Cava Brut from Penedès, Spain. Xarello, Macabeo and Parellada. Fine mousse, citrus fruit, soft, dry.', descriptionNl: 'Cava Brut uit Penedès, Spanje. Xarello, Macabeo en Parellada. Fijne mousse, citrusfruit, zacht, droog.', category: 'Wine', isVegetarian: true, sortOrder: 2 },
  // White Wine
  { name: 'Sauvignon Blanc (Glass)', price: 5.50, description: 'Sainte Magdelaine Sauvignon Blanc, Languedoc, France. Fruity, citrus, melon, fresh.', descriptionNl: 'Sainte Magdelaine Sauvignon Blanc, Languedoc, Frankrijk. Fruitig, citrus, meloen, fris.', category: 'Wine', isVegetarian: true, sortOrder: 3 },
  { name: 'Sauvignon Blanc (Bottle)', price: 27.50, description: 'Sainte Magdelaine Sauvignon Blanc, Languedoc, France. Fruity, citrus, melon, fresh.', descriptionNl: 'Sainte Magdelaine Sauvignon Blanc, Languedoc, Frankrijk. Fruitig, citrus, meloen, fris.', category: 'Wine', isVegetarian: true, sortOrder: 4 },
  { name: 'Chardonnay Millegrand (Glass)', price: 5.50, description: 'Chateau Millegrand Chardonnay, Languedoc, France. Peach, pear, apple, soft, full.', descriptionNl: 'Chateau Millegrand Chardonnay, Languedoc, Frankrijk. Perzik, peer, appel, zacht, vol.', category: 'Wine', isVegetarian: true, sortOrder: 5 },
  { name: 'Chardonnay Millegrand (Bottle)', price: 27.50, description: 'Chateau Millegrand Chardonnay, Languedoc, France. Peach, pear, apple, soft, full.', descriptionNl: 'Chateau Millegrand Chardonnay, Languedoc, Frankrijk. Perzik, peer, appel, zacht, vol.', category: 'Wine', isVegetarian: true, sortOrder: 6 },
  { name: 'Pinot Grigio Castel Pietra (Glass)', price: 5.50, description: 'Castel Pietra Pinot Grigio, Veneto, Italy. Fruity, elegant, dry.', descriptionNl: 'Castel Pietra Pinot Grigio, Veneto, Italië. Fruitig, elegant, droog.', category: 'Wine', isVegetarian: true, sortOrder: 7 },
  { name: 'Pinot Grigio Castel Pietra (Bottle)', price: 27.50, description: 'Castel Pietra Pinot Grigio, Veneto, Italy. Fruity, elegant, dry.', descriptionNl: 'Castel Pietra Pinot Grigio, Veneto, Italië. Fruitig, elegant, droog.', category: 'Wine', isVegetarian: true, sortOrder: 8 },
  { name: 'Pinot Blanc Heim Impérial (Bottle)', price: 32.50, description: 'Heim Impérial Pinot Blanc, Alsace, France. Soft, fresh, round.', descriptionNl: 'Heim Impérial Pinot Blanc, Elzas, Frankrijk. Zacht, fris, rond.', category: 'Wine', isVegetarian: true, sortOrder: 9 },
  { name: 'Macon-Prissé Chardonnay (Bottle)', price: 45.00, description: 'E. Delauney Macon-Prissé Chardonnay, Burgundy, France. Honey, white fruit, peach, vanilla.', descriptionNl: 'E. Delauney Macon-Prissé Chardonnay, Bourgogne, Frankrijk. Honing, wit fruit, perzik, vanille.', category: 'Wine', isVegetarian: true, sortOrder: 10 },
  // Rosé Wine
  { name: 'Latitude 43 Rosé (Glass)', price: 5.50, description: 'Latitude 43 Rosé, Languedoc, France. Syrah, Cinsault and Grenache. Strawberry, raspberry, fresh, dry.', descriptionNl: 'Latitude 43 Rosé, Languedoc, Frankrijk. Syrah, Cinsault en Grenache. Aardbei, framboos, fris, droog.', category: 'Wine', isVegetarian: true, sortOrder: 11 },
  { name: 'Latitude 43 Rosé (Bottle)', price: 27.50, description: 'Latitude 43 Rosé, Languedoc, France. Syrah, Cinsault and Grenache. Strawberry, raspberry, fresh, dry.', descriptionNl: 'Latitude 43 Rosé, Languedoc, Frankrijk. Syrah, Cinsault en Grenache. Aardbei, framboos, fris, droog.', category: 'Wine', isVegetarian: true, sortOrder: 12 },
  // Red Wine
  { name: 'Merlot Millegrand (Glass)', price: 5.50, description: 'Chateau Millegrand Merlot, Languedoc, France. Red fruit, supple, soft, slightly spicy.', descriptionNl: 'Chateau Millegrand Merlot, Languedoc, Frankrijk. Rood fruit, soepel, zacht, licht kruidig.', category: 'Wine', isVegetarian: true, sortOrder: 13 },
  { name: 'Merlot Millegrand (Bottle)', price: 27.50, description: 'Chateau Millegrand Merlot, Languedoc, France. Red fruit, supple, soft, slightly spicy.', descriptionNl: 'Chateau Millegrand Merlot, Languedoc, Frankrijk. Rood fruit, soepel, zacht, licht kruidig.', category: 'Wine', isVegetarian: true, sortOrder: 14 },
  { name: 'Malbec Benjamin (Glass)', price: 5.50, description: 'Nieto Senetiner Benjamin Malbec, Mendoza, Argentina. Fruity, plums, cherries, slightly spicy.', descriptionNl: 'Nieto Senetiner Benjamin Malbec, Mendoza, Argentinië. Fruitig, pruimen, kersen, licht kruidig.', category: 'Wine', isVegetarian: true, sortOrder: 15 },
  { name: 'Malbec Benjamin (Bottle)', price: 29.50, description: 'Nieto Senetiner Benjamin Malbec, Mendoza, Argentina. Fruity, plums, cherries, slightly spicy.', descriptionNl: 'Nieto Senetiner Benjamin Malbec, Mendoza, Argentinië. Fruitig, pruimen, kersen, licht kruidig.', category: 'Wine', isVegetarian: true, sortOrder: 16 },
  { name: 'Primitivo Puglia (Glass)', price: 6.00, description: 'Tinazzi Sentieri Infiniti Primitivo Puglia IGP, Italy. Red fruit, soft, full, cacao.', descriptionNl: 'Tinazzi Sentieri Infiniti Primitivo Puglia IGP, Italië. Rood fruit, zacht, vol, cacao.', category: 'Wine', isVegetarian: true, sortOrder: 17 },
  { name: 'Primitivo Puglia (Bottle)', price: 32.50, description: 'Tinazzi Sentieri Infiniti Primitivo Puglia IGP, Italy. Red fruit, soft, full, cacao.', descriptionNl: 'Tinazzi Sentieri Infiniti Primitivo Puglia IGP, Italië. Rood fruit, zacht, vol, cacao.', category: 'Wine', isVegetarian: true, sortOrder: 18 },
  { name: 'Côtes du Rhône Villages (Bottle)', price: 35.50, description: 'Boutinot Les Coteaux Côtes du Rhône Villages, France. Grenache Noir and Syrah. Spicy, vanilla, black pepper.', descriptionNl: 'Boutinot Les Coteaux Côtes du Rhône Villages, Frankrijk. Grenache Noir en Syrah. Kruidig, vanille, zwarte peper.', category: 'Wine', isVegetarian: true, sortOrder: 19 },
  { name: 'Valpolicella Ripasso Superiore (Bottle)', price: 45.00, description: 'Tinazzi Collezione di Famiglia Valpolicella Ripasso Superiore, Veneto, Italy. Corvina, Corvinone and Rondinella. Full, powerful, plums, nutmeg.', descriptionNl: 'Tinazzi Collezione di Famiglia Valpolicella Ripasso Superiore, Veneto, Italië. Corvina, Corvinone en Rondinella. Vol, krachtig, pruimen, nootmuskaat.', category: 'Wine', isVegetarian: true, sortOrder: 20 },
  { name: 'Lalande de Pomerol (Bottle)', price: 49.50, description: 'Chateau La Menotte Lalande de Pomerol, Bordeaux, France. Merlot and Cabernet Franc. Cherries, blackberries, mint, spicy, fruity.', descriptionNl: 'Chateau La Menotte Lalande de Pomerol, Bordeaux, Frankrijk. Merlot en Cabernet Franc. Kersen, bramen, mint, kruidig, fruitig.', category: 'Wine', isVegetarian: true, sortOrder: 21 },
];

// ===================== TAKEAWAY MENU =====================
const takeawayItems = [
  // === STREET FOOD ===
  { name: 'Papdi Chaat', price: 7.50, description: 'Crispy wafers topped with spiced potatoes, chilled yogurt and chutneys.', descriptionNl: 'Krokante wafeltjes met gekruide aardappelen, gekoelde yoghurt en chutneys.', category: 'Street Food', isVegetarian: true, sortOrder: 101 },
  { name: 'Samosa Chaat', price: 7.50, description: 'Samosa pieces topped with chickpeas and tangy sauces.', descriptionNl: 'Samosa stukken bedekt met kikkererwten en pittige sauzen.', category: 'Street Food', isVegetarian: true, sortOrder: 102 },
  { name: 'Aloo Tikki', price: 6.50, description: 'Golden fried spiced potato patties with cooling chutneys.', descriptionNl: 'Goudgebakken gekruide aardappelkoekjes met verkoelende chutneys.', category: 'Street Food', isVegetarian: true, sortOrder: 103 },
  { name: 'Vada Pav', price: 7.50, description: 'Deep fried potato patty wrapped in bread served with condiments such as chutney and red chilli powder.', descriptionNl: 'Gefrituurde aardappelkoek in brood geserveerd met chutney en rode chilipoeder.', category: 'Street Food', isVegetarian: true, sortOrder: 104 },
  { name: 'Pav Bhaji', price: 9.50, description: 'Thick vegetable curry served with 2 butter fried buns.', descriptionNl: 'Dikke groentecurry geserveerd met 2 in boter gebakken broodjes.', category: 'Street Food', isVegetarian: true, sortOrder: 105 },

  // === STARTERS ===
  { name: 'Vegetable Samosa', price: 5.50, description: 'Crispy golden pastry filled with spiced vegetables and aromatic herbs, served with a flavorful chutney.', descriptionNl: 'Krokant gouden gebak gevuld met gekruide groenten en aromatische kruiden, geserveerd met smaakvolle chutney.', category: 'Starters', isVegetarian: true, sortOrder: 101 },
  { name: 'Onion Bhaji / Vegetable Pakora', price: 5.50, description: 'Crispy spiced onion fritters made with gram flour and aromatic herbs, served with tangy chutney.', descriptionNl: 'Krokante gekruide uienfritters gemaakt met kikkererwtenmeel en aromatische kruiden, geserveerd met pittige chutney.', category: 'Starters', isVegetarian: true, sortOrder: 102 },

  // === CHICKEN DISHES (served with basmati rice) ===
  { name: 'Butter Chicken', price: 18.50, description: 'Creamy tomato gravy with succulent pieces of grilled chicken.', descriptionNl: 'Romige tomatensaus met sappige stukjes gegrilde kip.', category: 'Chicken Dishes', isVegetarian: false, sortOrder: 101 },
  { name: 'Chicken Tikka Masala', price: 18.50, description: 'Cooked chicken tikka pieces simmered in a rich, creamy tomato-based masala sauce infused with aromatic spices, served with grilled chicken.', descriptionNl: 'Gegaarde chicken tikka stukken gestoofd in een rijke, romige masalasaus op tomatenbasis met aromatische kruiden.', category: 'Chicken Dishes', isVegetarian: false, sortOrder: 102 },
  { name: 'Chicken Korma', price: 18.50, description: 'Creamy, mildly spiced chicken curry simmered in a rich blend of yogurt, nuts, and aromatic Mughlai spices.', descriptionNl: 'Romige, mild gekruide kipcurry gestoofd in een rijke mix van yoghurt, noten en aromatische Mughlai-kruiden.', category: 'Chicken Dishes', isVegetarian: false, sortOrder: 103 },
  { name: 'Chicken Tikka Jalfrezi', price: 18.50, description: 'Stir-fried chicken with peppers and mild spices.', descriptionNl: 'Roergebakken kip met paprika en milde kruiden.', category: 'Chicken Dishes', isVegetarian: false, sortOrder: 104 },
  { name: 'Chicken Saag', price: 18.50, description: 'Chicken simmered in rich spinach-based curry sauce.', descriptionNl: 'Kip gestoofd in rijke spinazie-currysaus.', category: 'Chicken Dishes', isVegetarian: false, sortOrder: 105 },
  { name: 'Chicken Madras', price: 18.50, description: 'Hot South Indian chicken curry with bold spices.', descriptionNl: 'Heet Zuid-Indiaas kipgerecht met krachtige kruiden.', category: 'Chicken Dishes', isVegetarian: false, isSpicy: true, sortOrder: 106 },
  { name: 'Chicken Balti', price: 18.50, description: 'Tender chicken cooked with tomatoes and aromatic Balti spices.', descriptionNl: 'Malse kip gekookt met tomaten en aromatische Balti-kruiden.', category: 'Chicken Dishes', isVegetarian: false, sortOrder: 107 },
  { name: 'Chicken Dhansak', price: 18.50, description: 'Chicken cooked in lentils with mild spices for a sweet-sour flavour.', descriptionNl: 'Kip gekookt met linzen en milde kruiden voor een zoet-zure smaak.', category: 'Chicken Dishes', isVegetarian: false, sortOrder: 108 },
  { name: 'Chicken Kadhai', price: 18.50, description: 'Chicken simmered with bell peppers and traditional Indian spices.', descriptionNl: 'Kip gestoofd met paprika en traditionele Indiase kruiden.', category: 'Chicken Dishes', isVegetarian: false, sortOrder: 109 },
  { name: 'Chicken Vindaloo', price: 18.50, description: 'Fiery Goa-style chicken curry with tangy vinegar notes and tender potatoes.', descriptionNl: 'Vurige Goaanse kipcurry met pittige azijntonen en malse aardappelen.', category: 'Chicken Dishes', isVegetarian: false, isSpicy: true, isDoubleSpicy: true, sortOrder: 110 },

  // === LAMB DISHES (served with basmati rice) ===
  { name: 'Lamb Rogan Josh', price: 19.95, description: 'Tender lamb simmered in rich Kashmiri spices.', descriptionNl: 'Mals lamsvlees gestoofd in rijke Kashmiri-kruiden.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 101 },
  { name: 'Lamb Korma', price: 19.95, description: 'Creamy, mildly spiced lamb curry simmered in a rich blend of yogurt, nuts, and aromatic Mughlai spices.', descriptionNl: 'Romige, mild gekruide lamscurry gestoofd in een rijke mix van yoghurt, noten en aromatische Mughlai-kruiden.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 102 },
  { name: 'Lamb Jalfrezi', price: 19.95, description: 'Stir-fried lamb with peppers and mild spices.', descriptionNl: 'Roergebakken lam met paprika en milde kruiden.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 103 },
  { name: 'Lamb Saag', price: 19.95, description: 'Lamb simmered in rich spinach-based curry sauce.', descriptionNl: 'Lam gestoofd in rijke spinazie-currysaus.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 104 },
  { name: 'Lamb Madras', price: 19.95, description: 'Hot South Indian lamb curry with bold spices.', descriptionNl: 'Heet Zuid-Indiaas lamsgerecht met krachtige kruiden.', category: 'Lamb Dishes', isVegetarian: false, isSpicy: true, sortOrder: 105 },
  { name: 'Lamb Balti', price: 19.95, description: 'Tender lamb cooked with tomatoes and aromatic Balti spices.', descriptionNl: 'Mals lam gekookt met tomaten en aromatische Balti-kruiden.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 106 },
  { name: 'Lamb Dhansak', price: 19.95, description: 'Lamb cooked in lentils with mild spices for a sweet-sour flavour.', descriptionNl: 'Lam gekookt met linzen en milde kruiden voor een zoet-zure smaak.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 107 },
  { name: 'Lamb Kadhai', price: 19.95, description: 'Lamb simmered with bell peppers and traditional Indian spices.', descriptionNl: 'Lam gestoofd met paprika en traditionele Indiase kruiden.', category: 'Lamb Dishes', isVegetarian: false, sortOrder: 108 },
  { name: 'Lamb Vindaloo', price: 19.95, description: 'Fiery Goa-style lamb curry with tangy vinegar notes and tender potatoes.', descriptionNl: 'Vurige Goaanse lamscurry met pittige azijntonen en malse aardappelen.', category: 'Lamb Dishes', isVegetarian: false, isSpicy: true, isDoubleSpicy: true, sortOrder: 109 },

  // === SEAFOOD (served with basmati rice) ===
  { name: 'Goa Fish Curry', price: 20.50, description: 'Tangy coconut and tamarind fish curry with coastal spices.', descriptionNl: 'Pittige kokos- en tamarindeviscurry met kustkruiden.', category: 'Seafood', isVegetarian: false, sortOrder: 101 },
  { name: 'Prawn Jalfrezi', price: 20.50, description: 'Stir-fried prawn with peppers and mild spices.', descriptionNl: 'Roergebakken garnalen met paprika en milde kruiden.', category: 'Seafood', isVegetarian: false, sortOrder: 102 },
  { name: 'Prawn Kadhai', price: 20.50, description: 'Prawn simmered with bell peppers and traditional Indian spices.', descriptionNl: 'Garnalen gestoofd met paprika en traditionele Indiase kruiden.', category: 'Seafood', isVegetarian: false, sortOrder: 103 },
  { name: 'Prawn Madras', price: 20.50, description: 'Hot South Indian prawn curry with bold spices.', descriptionNl: 'Heet Zuid-Indiaas garnalengerecht met krachtige kruiden.', category: 'Seafood', isVegetarian: false, isSpicy: true, sortOrder: 104 },
  { name: 'Prawn Vindaloo', price: 20.50, description: 'Fiery Goa-style prawn curry with tangy vinegar notes and tender potatoes.', descriptionNl: 'Vurige Goaanse garnalencurry met pittige azijntonen en malse aardappelen.', category: 'Seafood', isVegetarian: false, isSpicy: true, isDoubleSpicy: true, sortOrder: 105 },

  // === VEGETABLE DISHES (served with basmati rice) ===
  { name: 'Shahi Paneer', price: 16.50, description: 'Paneer in a creamy, aromatic royal sauce.', descriptionNl: 'Paneer in een romige, aromatische koninklijke saus.', category: 'Vegetable Dishes', isVegetarian: true, sortOrder: 101 },
  { name: 'Saag Paneer', price: 16.50, description: 'Paneer cooked in seasoned spinach gravy.', descriptionNl: 'Paneer gekookt in gekruide spinaziesaus.', category: 'Vegetable Dishes', isVegetarian: true, sortOrder: 102 },
  { name: 'Paneer Jalfrezi', price: 16.50, description: 'Paneer stir-fried with spices, peppers and onions.', descriptionNl: 'Paneer roergebakken met kruiden, paprika en uien.', category: 'Vegetable Dishes', isVegetarian: true, sortOrder: 103 },
  { name: 'Bhindi Do Pyaza', price: 16.50, description: 'Okra sautéed with onions and spices.', descriptionNl: 'Okra gesauteerd met uien en kruiden.', category: 'Vegetable Dishes', isVegetarian: true, sortOrder: 104 },
  { name: 'Alu Baingan Masala', price: 16.50, description: 'Potato and eggplant cooked in rich spiced tomato gravy.', descriptionNl: 'Aardappel en aubergine gekookt in rijke gekruide tomatensaus.', category: 'Vegetable Dishes', isVegetarian: true, sortOrder: 105 },
  { name: 'Chana Masala', price: 16.50, description: 'Chickpeas cooked in traditional North Indian spices.', descriptionNl: 'Kikkererwten gekookt in traditionele Noord-Indiase kruiden.', category: 'Vegetable Dishes', isVegetarian: true, sortOrder: 106 },
  { name: 'Mix Vegetable', price: 16.50, description: 'Assorted vegetables cooked with aromatic spices.', descriptionNl: 'Gemengde groenten gekookt met aromatische kruiden.', category: 'Vegetable Dishes', isVegetarian: true, sortOrder: 107 },
  { name: 'Alu Gobi', price: 16.50, description: 'Cauliflower and potatoes sautéed with cumin, turmeric and aromatic spices.', descriptionNl: 'Bloemkool en aardappelen gesauteerd met komijn, kurkuma en aromatische kruiden.', category: 'Vegetable Dishes', isVegetarian: true, sortOrder: 108 },
  { name: 'Daal Tarka', price: 16.50, description: 'Yellow lentils tempered with mustard seeds and spices.', descriptionNl: 'Gele linzen getemperd met mosterdzaad en kruiden.', category: 'Vegetable Dishes', isVegetarian: true, sortOrder: 109 },
  { name: 'Daal Makhani', price: 16.50, description: 'Creamy black lentils slow simmered with aromatic spices.', descriptionNl: 'Romige zwarte linzen langzaam gestoofd met aromatische kruiden.', category: 'Vegetable Dishes', isVegetarian: true, sortOrder: 110 },

  // === BIRYANI (served with raita) ===
  { name: 'Chicken Biryani', price: 17.95, description: 'Aromatic basmati rice slow-cooked with spiced chicken and saffron.', descriptionNl: 'Aromatische basmatirijst langzaam gegaard met gekruide kip en saffraan.', category: 'Biryani', isVegetarian: false, sortOrder: 101 },
  { name: 'Lamb Biryani', price: 19.95, description: 'Fragrant long-grain rice layered with tender lamb and aromatic spices.', descriptionNl: 'Geurige langkorrelrijst in lagen met mals lamsvlees en aromatische kruiden.', category: 'Biryani', isVegetarian: false, sortOrder: 102 },
  { name: 'Vegetable Biryani', price: 16.50, description: 'Seasoned basmati rice with mixed vegetables and herbs.', descriptionNl: 'Gekruide basmatirijst met gemengde groenten en kruiden.', category: 'Biryani', isVegetarian: true, sortOrder: 103 },
  { name: 'Prawn Biryani', price: 20.50, description: 'Spiced basmati rice layered with succulent prawns.', descriptionNl: 'Gekruide basmatirijst in lagen met sappige garnalen.', category: 'Biryani', isVegetarian: false, sortOrder: 104 },

  // === INDIAN BREADS ===
  { name: 'Plain Naan', price: 3.50, description: 'Soft leavened bread.', descriptionNl: 'Zacht gerezen brood.', category: 'Indian Breads', isVegetarian: true, sortOrder: 101 },
  { name: 'Tandoori Roti', price: 3.50, description: 'Traditional whole wheat flatbread baked in a clay oven.', descriptionNl: 'Traditioneel volkoren platbrood gebakken in een kleioven.', category: 'Indian Breads', isVegetarian: true, sortOrder: 102 },
  { name: 'Garlic Naan', price: 4.50, description: 'Warm naan infused with roasted garlic.', descriptionNl: 'Warme naan doordrenkt met geroosterde knoflook.', category: 'Indian Breads', isVegetarian: true, sortOrder: 103 },
  { name: 'Cheese Naan', price: 4.50, description: 'Soft leavened naan stuffed with melted cheese, baked until golden and served warm.', descriptionNl: 'Zacht gerezen naan gevuld met gesmolten kaas, goudbruin gebakken en warm geserveerd.', category: 'Indian Breads', isVegetarian: true, sortOrder: 104 },
  { name: 'Butter Naan', price: 4.50, description: 'Soft leavened bread brushed with rich butter.', descriptionNl: 'Zacht gerezen brood ingesmeerd met rijke boter.', category: 'Indian Breads', isVegetarian: true, sortOrder: 105 },
  { name: 'Qeema Naan', price: 5.50, description: 'Crumbly spiced minced meat stuffed in soft leavened naan, baked to golden perfection with aromatic herbs and traditional spices.', descriptionNl: 'Kruimelig gekruid gehakt gevuld in zachte naan, goudbruin gebakken met aromatische kruiden en traditionele specerijen.', category: 'Indian Breads', isVegetarian: false, sortOrder: 106 },
  { name: 'Aloo Naan', price: 4.50, description: 'Flatbread stuffed with spiced mashed potatoes.', descriptionNl: 'Platbrood gevuld met gekruide aardappelpuree.', category: 'Indian Breads', isVegetarian: true, sortOrder: 107 },
  { name: 'Aloo Paratha', price: 4.50, description: 'Whole wheat flatbread stuffed with spiced mashed potatoes, pan-fried to golden perfection with butter or ghee.', descriptionNl: 'Volkoren platbrood gevuld met gekruide aardappelpuree, goudbruin gebakken met boter of ghee.', category: 'Indian Breads', isVegetarian: true, sortOrder: 108 },
  { name: 'Peshawari Naan', price: 4.95, description: 'Soft leavened naan stuffed with sweet nuts and coconut, baked in a tandoor and finished with rich butter for a fragrant, slightly sweet taste.', descriptionNl: 'Zachte naan gevuld met zoete noten en kokos, gebakken in een tandoor en afgewerkt met rijke boter voor een geurige, licht zoete smaak.', category: 'Indian Breads', isVegetarian: true, sortOrder: 109 },

  // === EXTRA ===
  { name: 'Raita', price: 3.50, description: 'Cooling yogurt-based condiment with cucumber, mint, and roasted cumin, served fresh as a refreshing accompaniment to spicy dishes.', descriptionNl: 'Verkoelende yoghurtdip met komkommer, munt en geroosterde komijn, fris geserveerd als verfrissende begeleider bij pittige gerechten.', category: 'Extra', isVegetarian: true, sortOrder: 101 },
  { name: 'Zeera Rice', price: 4.95, description: 'Basmati rice seasoned with cumin seeds.', descriptionNl: 'Basmatirijst gekruid met komijnzaad.', category: 'Extra', isVegetarian: true, sortOrder: 102 },
  { name: 'Pulao Rice', price: 4.95, description: 'Fluffy steamed basmati rice.', descriptionNl: 'Luchtige gestoomde basmatirijst.', category: 'Extra', isVegetarian: true, sortOrder: 103 },

  // === DESSERTS ===
  { name: 'Kesari Halwa', price: 6.50, description: 'Creamy semolina-based sweet pudding cooked in ghee, sugar, and saffron, enriched with cardamom and roasted nuts for a rich golden finish.', descriptionNl: 'Romige griesmeel-pudding gekookt in ghee, suiker en saffraan, verrijkt met kardemom en geroosterde noten.', category: 'Desserts', isVegetarian: true, sortOrder: 101 },
  { name: 'Gajar Ka Halwa', price: 7.50, description: 'Creamy, slow-cooked grated carrots simmered in milk, ghee, and sugar, enriched with nuts and aromatic cardamom.', descriptionNl: 'Romige, langzaam gegaarde geraspte wortelen gestoofd in melk, ghee en suiker, verrijkt met noten en aromatische kardemom.', category: 'Desserts', isVegetarian: true, sortOrder: 102 },
  { name: 'Ras Malai', price: 5.50, description: 'Soft cheese dumplings in sweet creamy milk.', descriptionNl: 'Zachte kaasballetjes in zoete romige melk.', category: 'Desserts', isVegetarian: true, sortOrder: 103 },
  { name: 'Gulab Jamun', price: 5.50, description: 'Creamy, deep-fried milk-solid dumplings soaked in fragrant rose-saffron sugar syrup, a classic Indian dessert.', descriptionNl: 'Romige gefrituurde melkballetjes gedrenkt in geurige rozen-saffraan suikersiroop, een klassiek Indiaas dessert.', category: 'Desserts', isVegetarian: true, sortOrder: 104 },

  // === DRINKS ===
  { name: 'Mango Lassi', price: 5.50, description: 'Refreshing sweet mango yogurt drink.', descriptionNl: 'Verfrissende zoete mango-yoghurtdrank.', category: 'Drinks', isVegetarian: true, sortOrder: 101 },
  { name: 'Coca Cola 330ml', price: 2.95, description: 'Classic Coca-Cola.', descriptionNl: 'Klassieke Coca-Cola.', category: 'Drinks', isVegetarian: true, sortOrder: 102 },
  { name: 'Coca Cola Zero 330ml', price: 2.95, description: 'Coca-Cola Zero Sugar.', descriptionNl: 'Coca-Cola Zero Sugar.', category: 'Drinks', isVegetarian: true, sortOrder: 103 },
  { name: 'Fanta Orange 330ml', price: 2.95, description: 'Orange flavoured soft drink.', descriptionNl: 'Sinaasappel frisdrank.', category: 'Drinks', isVegetarian: true, sortOrder: 104 },
  { name: 'Spa Blauw 500ml', price: 2.95, description: 'Still mineral water.', descriptionNl: 'Plat mineraalwater.', category: 'Drinks', isVegetarian: true, sortOrder: 105 },
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
    const db = client.db(DB_NAME);
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
