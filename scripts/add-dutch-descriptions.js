/**
 * Migration script to add Dutch descriptions (descriptionNl) to all menu items
 * Run with: node scripts/add-dutch-descriptions.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// The running server uses my-app-development database
const MONGODB_URI = process.env.DB_URI.replace('/light-of-india?', '/my-app-development?');

// Dutch descriptions mapped by item name
const dutchDescriptions = {
  // ============== DINE-IN STARTERS ==============
  'Mulligatawny Soup': 'Hartverwarmende gekruide linzen- en groentesoep met aromatische kerriekruiden.',
  'Chargrilled Tomato Basil Broth': 'Rokerige geroosterde tomaat-basilicumsoep met een romige, knapperige garnering.',
  'Sweetcorn Soup': 'Rijke romige zoete maïssoep gemengd met subtiele kruiden voor een hartelijke start.',
  'Dahi Bhalla': 'Lichte linzenballetjes gedrenkt in gekoelde yoghurt met pittige chutneys.',
  'Papdi Chaat': 'Krokante wafeltjes met gekruide aardappelen, gekoelde yoghurt en chutneys.',
  'Pani Puri': 'Krokante holle balletjes gevuld met pittige aardappel en geserveerd met pittig munt-tamarinde water.',
  'Pani Puri Shot (alcoholic)': 'Pani puri geserveerd met een verfrissende alcoholische twist van munt en tamarinde.',
  'Lawrence Road Ki Aloo Tikki': 'Goudkleurige gefrituurde gekruide aardappelpatties met verkoelende chutneys.',
  'Sev Dahi Puri': 'Krokante puri\'s gevuld met gekruide aardappelen, yoghurt en knapperige sev.',
  'Samosa Veg': '2 samosa stukken geserveerd met pittige sauzen.',
  'Samosa Chaat': 'Samosa stukken bedekt met kikkererwten en pittige sauzen.',
  'Onion Bhaji': 'Krokante gefrituurde uienfritters geserveerd met chutney.',
  'Chicken Kathi Roll': 'Gekruide gegrilde kip gewikkeld in warm, zacht platbrood.',
  'Classic Tandoori Chicken': 'Malse halve kip gemarineerd in traditionele kruiden en geroosterd in een klei-oven.',
  'Tangri Kebab': 'Sappige kippenbouten gemarineerd in gember-knoflook en citroen.',
  'Murgh Afgani (Starter)': 'Kip gemarineerd in cashewpasta en gegrild tot perfecte sappigheid.',
  'Murgh Afgani': 'Kip gemarineerd in cashewpasta en gegrild tot perfecte sappigheid.',
  'Tandoori Prawn (Starter)': 'Vlezige garnalen gemarineerd in Indiase kruiden en gegrild in de tandoor.',
  'LOI Chicken Tikka': 'Malse kipstukken een nacht gemarineerd en perfect gegrild.',
  'Chicken 65': 'Krokante gekruide kip met een pittige Zuid-Indiase smaakkick.',
  'Koliwala Prawns': 'Krokante garnalen in Mumbai-stijl gekruid en goudbruin gefrituurd.',
  'Malai Broccoli': 'Broccoli gemarineerd in kaas en yoghurt en vervolgens geroosterd.',
  'Reshmi Khumb': 'Zachte kaasgevulde champignons gefrituurd tot een gouden krokantheid.',
  'Corn and Jalapeño Harabhara': 'Zoete maïs en jalapeño hapjes met gesmolten kaas en muntechutney.',
  'Basil Garlic Paneer Tikka': 'Paneerblokjes gemarineerd in basilicum-knoflookkruiden en mals gegrild.',

  // ============== DINE-IN MAIN COURSE ==============
  'Old Delhi Butter Chicken': 'Romige tomatensaus met sappige stukjes gegrilde kip.',
  'Chicken Saag': 'Kip gestoofd in een rijke spinazie-curry.',
  'Chicken Lababdar': 'Gegrilde kippenblokjes in een rijke tomaten-roomcurry.',
  'Chicken Chettinad': 'Pittige Zuid-Indiase kipcurry met krachtige aromatische kruiden.',
  'Chicken Tikka Jalfrezi': 'Roergebakken kip met paprika en milde kruiden.',
  'Chicken Madras': 'Heet Zuid-Indiase kipgerecht met krachtige kruiden.',
  'Chicken Vindaloo': 'Vurige Goaanse kipcurry met een pittige azijnsmaak.',
  'Chicken Balti': 'Malse kip gekookt met tomaten en aromatische Balti-kruiden.',
  'Chicken Dhansak': 'Kip gekookt met linzen en milde kruiden voor een zoet-zure smaak.',
  'Chicken Kadhai': 'Kip gestoofd met paprika en traditionele Indiase kruiden.',
  'Mixed Grill': 'Een chef\'s selectie van gegrild vlees en kebabs geserveerd sissend heet.',
  'Grilled Lamb Chops': 'Gemarineerde lamskoteletten gegrild en geserveerd met muntechutney.',
  'Tandoori Chicken (Main)': 'Klassieke kip geroosterd in klei-oven met kruiden en specerijen.',
  'Chicken Tikka (Main)': 'Malse kipstukken gemarineerd in kruiden en gegrild.',
  'Seekh Kebab (Main)': 'Gehakt spiesjes gekruid en gegrild tot sappige perfectie.',
  'Murgh Afghani (Main)': 'Sappige kip gemarineerd in romige kruiden en geroosterd in de oven.',
  'Murgh Afghani': 'Sappige kip gemarineerd in romige kruiden en geroosterd in de oven.',
  'Goan Fish Curry': 'Pittige kokos-tamarinde viscurry met kustkruiden.',
  'Prawn Kadai': 'Garnalen gekookt in een rijke gekruide tomaten-pepersaus.',
  'Tandoori Prawn (Main)': 'Grote garnalen gekruid en gegrild in de tandoor.',
  'Tandoori Prawn': 'Grote garnalen gekruid en gegrild in de tandoor.',

  // ============== LAMB DISHES ==============
  'Lamb Rogan Josh': 'Malse lamsvlees gestoofd in rijke Kashmiri-kruiden.',
  'Lamb Saag': 'Lamsstukken gestoofd in gekruide spinazie-curry.',
  'Lamb Kadai': 'Lam gekookt met tomaten, uien en traditionele kruiden.',
  'Lamb Balti': 'Lam gekookt in een aromatische Balti-saus.',
  'Lamb Madras': 'Heet Zuid-Indiase lamscurry met krachtige kruiden.',
  'Lamb Vindaloo': 'Pittige Goaanse lamscurry met een pittige azijnsmaak.',
  'Lamb Jalfrezi': 'Pittig roergebakken lam met paprika, ui en aromatische kruiden.',
  'Lamb Qorma': 'Lam in een romige, mild gekruide traditionele qorma-saus.',

  // ============== DAL / LENTILS ==============
  'Dal Tadka': 'Gele linzen gekruid met specerijen en aromatische kruiden.',
  'Amritsari Tadka Wali Dal': 'Gele linzen getemperd met mosterdzaad en kruiden.',
  'Dal Makhni': 'Romige zwarte linzen langzaam gesudderd met aromatische kruiden.',

  // ============== VEGETARIAN ==============
  'Paneer Makhni': 'Malse paneerblokjes in een rijke romige tomatensaus.',
  'Palak Paneer': 'Paneer gestoofd in gekruide spinaziesaus.',
  'Paneer Lababdar': 'Paneerblokjes gestoofd in rijke tomaat-roomcurry.',
  'Paneer Jalfrezi': 'Paneer roergebakken met kruiden, paprika en ui.',
  'Shahi Paneer': 'Paneer in een romige, aromatische romige saus.',
  'Bhindi Do Pyaza': 'Okra geroerbakt met ui en kruiden.',
  'Bhindi Masala': 'Okra zacht gebakken met ui, tomaten en traditionele kruiden.',
  'Smoked Baingan Bharta': 'Gerookte aubergine geprakt met kruiden en specerijen.',
  'Alu Baingan Masala': 'Aardappel en aubergine gekookt in een rijke gekruide tomatensaus.',
  'Chana Masala': 'Kikkererwten gekookt in traditionele Noord-Indiase kruiden.',
  'Nizam Subzi Handi': 'Gemengde groenten gekookt met aromatische kruiden.',
  'Mixed Vegetables': 'Assortiment tuin-groenten gekookt met milde Indiase specerijen.',
  'Alu Gobi': 'Bloemkool en aardappelen gesauteerd met komijn, kurkuma en aromatische kruiden.',

  // ============== BIRYANI ==============
  'Hyderabadi Chicken Dum Biryani': 'Aromatische basmatirijst langzaam gegaard met gekruide kip en saffraan.',
  'Royal Awadhi Lamb Biryani': 'Geurige langkorrelrijst in lagen met mals lamsvlees en aromatische kruiden.',
  'Vegetable Biryani': 'Gekruide basmatirijst met gemengde groenten en kruiden.',
  'Prawn Biryani': 'Gekruide basmatirijst in lagen met sappige garnalen.',

  // ============== SALADS ==============
  'Garden Green Salad': 'Verse gemengde groene salade met knapperige groenten.',
  'It\'s Greek to Me': 'Mediterrane salade met kikkererwten, olijven, dadels en feta in honing-balsamico dressing.',
  'Grilled Chicken with Tomato Cucumber Salad': 'Sappige gegrilde kip op verse groene salade met tomaat en komkommer.',
  'Garden of Caesar': 'Knapperige romaine sla met Parmezaan, baconcroutons en romige Caesar dressing.',
  'Masala Onion': 'Gesneden uien gemengd met pittige kruiden.',

  // ============== KIDS MENU ==============
  'Chicken Nuggets with French Fries or Rice': 'Krokante kipnuggets geserveerd met goudgele frietjes of gestoomde rijst.',
  'Chicken Malai Tikka & French Fries': 'Sappige gekruide chicken malai tikka geserveerd met knapperige frietjes.',
  'French Fries': 'Klassieke knapperige goudgele frietjes, licht gekruid.',

  // ============== INDIAN BREADS & EXTRAS ==============
  'Tandoori Roti': 'Traditioneel volkoren platbrood gebakken in een kleioven.',
  'Plain Naan': 'Zacht gerezen brood.',
  'Butter Naan': 'Zacht gerezen brood ingesmeerd met rijke boter.',
  'Garlic Naan': 'Warme naan verrijkt met geroosterde knoflook.',
  'Chilli Garlic Naan': 'Pittige knoflooknaan met een vleugje chili.',
  'Aloo Kulcha': 'Platbrood gevuld met gekruide aardappelpuree.',
  'Signature Cheese & Jalapeño Kulcha': 'Platbrood gevuld met gesmolten kaas en jalapeño\'s.',
  'Cheese Naan': 'Zacht gerezen brood met gesmolten kaas.',
  'Chicken Naan': 'Zachte naan gevuld met gekruide kipstukjes.',
  'Raita': 'Verfrissende yoghurtsaus.',
  'Steamed Rice': 'Luchtige gestoomde basmatirijst.',
  'Pulao Rice': 'Basmatirijst gekruid met komijnzaad.',
  'Papadum': 'Knapperige linzenwafels geserveerd met chutneys.',

  // ============== DESSERTS ==============
  'Chocolate Brownie': 'Warme chocoladebrownie met een rijke, smeuïge kern.',
  'Chocolate Lava Cake': 'Verleidelijke lava-chocoladetaart geserveerd warm.',
  'Ananas Kesari / Pineapple Kesari': 'Zoet griesmeeldessert met ananas en geurige specerijen.',
  'Amrakhand': 'Romig mango-yoghurt dessert met aromatische kruiden.',
  'Ras Malai': 'Zachte kaasknoedels in zoete romige melk.',
  'Gulab Jamun': 'Goudgebakken melkknoedels geweekt in suikersiroop.',
  'Ice Cream — Vanilla': 'Romig klassieke vanille-ijs.',
  'Ice Cream — Strawberry': 'Vers aardbeienijs met levendige smaak.',
  'Ice Cream — Chocolate': 'Rijk chocolade-ijs voor chocoholics.',
  'Ice Cream — Mango': 'Tropisch mango-ijs met fruitige zoetheid.',
  'Light of India Ice Cream Combination': 'Assortiment premium bolletjes van favoriete ijssmaken.',
  'Mango Lassi': 'Verfrissende zoete mango-yoghurtdrink met een vleugje kardemom.',

  // ============== DRINKS ==============
  'Coca-Cola': 'Koude klassieke cola-drank.',
  'Coca-Cola Light': 'Suikervrije cola-optie.',
  'Ice Tea': 'Koude ijsthee — zoet en verfrissend.',
  'Fanta': 'Frisdrank met fruitsmaak.',
  'Spa Red': 'Bruisend mineraalwater — fris en bruisend.',
  'Spa Blue': 'Plat mineraalwater — verfrissend en puur.',

  // ============== CHINESE STARTERS ==============
  'Country Style Fried Chicken Wings': 'Knapperige vleugels gemarineerd in knoflook, geserveerd met pittige dipsaus.',
  'Crunchy Chicken Wings': 'Knapperige knoflookgemarineerde kippenvleugels met pittige dipsaus.',
  'Sriracha Fish Chili': 'Vis gebakken in een vurige sriracha-chillisaus met paprika.',
  'Burnt Garlic Lemon Chili Fish': 'Vis geroerd met rokerige knoflook, pittige citroen en chili.',
  'Coated Shallow Fried Fish': 'Vis met panko-korst geserveerd met zelfgemaakte tartaar.',
  'Tempura Fried Prawn': 'Lichte tempura-garnalen met zoete chilisaus.',
  'Chicken Drumstick (Chinese)': 'Kippenbouten gebakken met bosui en chili.',
  'ChinaTown Chili Chicken': 'Klassieke chilikip met paprika en uien.',
  'China Town Chili Chicken': 'Vurige Indiaas-Chinese chilikip met paprika en uien.',
  'Thai Flavored Lemon Chili Cottage Cheese': 'Paneer doordrenkt met Thaise kruiden en citroen-chili.',
  'Mushroom Chili (Chinese)': 'Kastanjechampignons geroerbakt met paprika en chilipepers.',
  'Mushroom Chili': 'Geroerbakte champignons met paprika in een pittige chiliglazuur.',
  'Honey Chili Potato': 'Aardappelen gemengd in een zoete honing-chilisaus.',

  // ============== CHINESE MAIN COURSE ==============
  'Hakka Noodles — Veg': 'Roergebakken noedels met verse groenten in een lichte sojaglazuur.',
  'Hakka Noodles — Chicken': 'Roergebakken noedels met kip en knapperige groenten.',
  'Hakka Noodles — Seafood': 'Roergebakken noedels met zeevruchten en levendige woksmaken.',
  'Spicy Basil Fried Rice — Veg': 'Gebakken rijst met geurige basilicum en tuin groenten.',
  'Spicy Basil Fried Rice — Chicken': 'Gebakken rijst met sappige kip en aromatische basilicum.',
  'Spicy Basil Fried Rice — Seafood': 'Gebakken rijst met gemengde zeevruchten en uitgesproken basilicum aroma.',
  'Three Pepper Chili Chicken with Gravy': 'Kip in een pittige chilisaus van drie soorten peper.',
  'Chicken Black Pepper Sauce with Gravy': 'Kip gebakken in een saus van grof zwarte peper.',
  'Three Pepper Chili Paneer with Gravy': 'Paneerblokjes in een pittige chilisaus van drie pepers.',
  'Mushroom Chili Garlic with Gravy': 'Champignons geroerbakt in een rijke knoflook-chilisaus.',

  // ============== TAKEAWAY SPECIFIC ITEMS ==============
  'Veg Samosa': '2 x knapperige deegdriehoeken gevuld met gekruide groenten.',
  'Tandoori Chicken Starter': 'Sappige kipstukken gemarineerd in tandoorikruiden en in de oven geroosterd.',
  'Chicken Tikka Starter': 'Malse kipstukken gemarineerd en gegrild met aromatische kruiden.',
  'Seekh Kebab': 'Gehakt gekruide vleesspiesjes gegrild tot sappige perfectie.',
  'Butter Chicken': 'Malse kip gestoofd in een romige tomatensaus met milde kruiden.',
  'Chicken Tikka Masala': 'Gegrilde kipblokjes in een gekruide romige tomaten-masalasaus.',
  'Tandoori Chicken': 'Klassieke kip geroosterd in klei-oven met kenmerkende kruiden.',
  'Chicken Tikka': 'Malse gemarineerde kipstukjes gegrild tot sappige perfectie.',
};

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!\n');

    // Access the native MongoDB collection directly
    const collection = mongoose.connection.db.collection('menuitems');

    // Get all menu items
    const items = await collection.find({}).toArray();
    console.log(`Found ${items.length} menu items in database.\n`);

    let updated = 0;
    let notFound = 0;
    const missingItems = [];

    for (const item of items) {
      const dutchDesc = dutchDescriptions[item.name];
      
      if (dutchDesc) {
        await collection.updateOne(
          { _id: item._id },
          { $set: { descriptionNl: dutchDesc } }
        );
        console.log(`✓ Updated: ${item.name}`);
        updated++;
      } else {
        console.log(`✗ No Dutch description found for: ${item.name}`);
        missingItems.push(item.name);
        notFound++;
      }
    }

    console.log('\n========== MIGRATION COMPLETE ==========');
    console.log(`Total items: ${items.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`Missing Dutch descriptions: ${notFound}`);
    
    if (missingItems.length > 0) {
      console.log('\nItems without Dutch descriptions:');
      missingItems.forEach(name => console.log(`  - ${name}`));
    }

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
}

migrate();
