// fix-shifted-reservation-dates.js
// One-time cleanup for legacy date-shift artifacts in reservation settings.
// Usage:
//   node scripts/fix-shifted-reservation-dates.js          (dry-run)
//   node scripts/fix-shifted-reservation-dates.js --apply  (write changes)

require('dotenv').config();
const { MongoClient } = require('mongodb');

const DB_URI = process.env.DB_URI || process.env.MONGODB_URI;
const DB_NAME = 'my-app-development';
const APPLY = process.argv.includes('--apply');

if (!DB_URI) {
  console.error('Missing DB_URI or MONGODB_URI in environment.');
  process.exit(1);
}

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const toDateKeyUTC = (value) => {
  const date = new Date(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fromDateKeyUTCNoon = (dateKey) => new Date(`${dateKey}T12:00:00.000Z`);

const addDaysUTC = (dateKey, days) => {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return toDateKeyUTC(date);
};

const getDayNameFromDateKey = (dateKey) => {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  return DAY_NAMES[date.getUTCDay()];
};

async function main() {
  const client = new MongoClient(DB_URI);

  console.log(APPLY ? 'Applying reservation date cleanup...' : 'Dry-run mode. Use --apply to persist changes.');

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const settingsCollection = db.collection('restaurantsettings');

    const settings = await settingsCollection.findOne({});
    if (!settings) {
      console.log('No restaurant settings document found.');
      return;
    }

    const operatingHours = Array.isArray(settings.operatingHours) ? settings.operatingHours : [];
    const fridayHours = operatingHours.find((item) => item.day === 'friday');
    const saturdayHours = operatingHours.find((item) => item.day === 'saturday');

    const fridayOpenByWeek = fridayHours?.isOpen === true;
    const saturdayClosedByWeek = saturdayHours?.isOpen === false;

    const closedKeys = new Set((settings.closedDates || []).map(toDateKeyUTC));
    const openKeys = new Set((settings.openDates || []).map(toDateKeyUTC));

    const shiftedClosedFridayKeys = [];
    const shiftedOpenFridayKeys = [];

    // Heuristic for legacy shift artifacts:
    // - Friday is weekly open
    // - Saturday is weekly closed
    // - Specific Friday entries are usually shifted Saturday interactions
    if (fridayOpenByWeek && saturdayClosedByWeek) {
      for (const key of closedKeys) {
        if (getDayNameFromDateKey(key) === 'friday') {
          shiftedClosedFridayKeys.push(key);
        }
      }

      for (const key of openKeys) {
        if (getDayNameFromDateKey(key) === 'friday') {
          shiftedOpenFridayKeys.push(key);
        }
      }
    }

    const updatedClosedKeys = new Set(closedKeys);
    const updatedOpenKeys = new Set(openKeys);

    // Remove shifted Friday-specific closed entries.
    for (const fridayKey of shiftedClosedFridayKeys) {
      updatedClosedKeys.delete(fridayKey);
    }

    // Move shifted Friday-specific open overrides to Saturday.
    for (const fridayKey of shiftedOpenFridayKeys) {
      updatedOpenKeys.delete(fridayKey);

      const saturdayKey = addDaysUTC(fridayKey, 1);
      if (!updatedClosedKeys.has(saturdayKey)) {
        updatedOpenKeys.add(saturdayKey);
      }
    }

    // Ensure closed wins over open if overlap exists.
    for (const closedKey of updatedClosedKeys) {
      if (updatedOpenKeys.has(closedKey)) {
        updatedOpenKeys.delete(closedKey);
      }
    }

    const sortedClosedKeys = Array.from(updatedClosedKeys).sort();
    const sortedOpenKeys = Array.from(updatedOpenKeys).sort();

    console.log('\n--- Analysis ---');
    console.log(`Weekly Friday open: ${fridayOpenByWeek}`);
    console.log(`Weekly Saturday closed: ${saturdayClosedByWeek}`);
    console.log(`Closed dates before: ${(settings.closedDates || []).length}`);
    console.log(`Open dates before: ${(settings.openDates || []).length}`);

    console.log('\nDetected shifted Friday closed dates:');
    console.log(shiftedClosedFridayKeys.length ? shiftedClosedFridayKeys.join(', ') : '(none)');

    console.log('\nDetected shifted Friday open dates:');
    console.log(shiftedOpenFridayKeys.length ? shiftedOpenFridayKeys.join(', ') : '(none)');

    console.log('\nClosed dates after cleanup:');
    console.log(sortedClosedKeys.join(', ') || '(none)');

    console.log('\nOpen dates after cleanup:');
    console.log(sortedOpenKeys.join(', ') || '(none)');

    if (!APPLY) {
      console.log('\nDry-run complete. No changes written.');
      return;
    }

    await settingsCollection.updateOne(
      { _id: settings._id },
      {
        $set: {
          closedDates: sortedClosedKeys.map(fromDateKeyUTCNoon),
          openDates: sortedOpenKeys.map(fromDateKeyUTCNoon),
          updatedAt: new Date(),
        },
      },
    );

    console.log('\nCleanup applied successfully.');
  } catch (error) {
    console.error('Cleanup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
