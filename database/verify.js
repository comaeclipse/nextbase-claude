const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'locations.db');
const db = new Database(dbPath, { readonly: true });

console.log('Database Verification Report\n');
console.log('=' .repeat(60));

// Check total counts
const locationCount = db.prepare('SELECT COUNT(*) as count FROM locations').get();
const tagCount = db.prepare('SELECT COUNT(*) as count FROM tags').get();
const relationCount = db.prepare('SELECT COUNT(*) as count FROM location_tags').get();

console.log(`\nCounts:`);
console.log(`  Locations: ${locationCount.count}`);
console.log(`  Tags: ${tagCount.count}`);
console.log(`  Location-Tag Relations: ${relationCount.count}`);

// Sample some locations
console.log(`\n${'='.repeat(60)}`);
console.log('Sample Locations:\n');

const sampleLocations = db.prepare(`
  SELECT state, city, cost_of_living, crime_index, sunny_days, va_facilities
  FROM locations
  LIMIT 5
`).all();

sampleLocations.forEach(loc => {
  console.log(`${loc.city}, ${loc.state}`);
  console.log(`  Cost of Living: ${loc.cost_of_living || 'N/A'}`);
  console.log(`  Crime Index: ${loc.crime_index || 'N/A'}`);
  console.log(`  Sunny Days: ${loc.sunny_days || 'N/A'}`);
  console.log(`  VA Facilities: ${loc.va_facilities ? 'Yes' : 'No'}`);
  console.log();
});

// Show all tags by category
console.log(`${'='.repeat(60)}`);
console.log('All Tags by Category:\n');

const tagsByCategory = db.prepare(`
  SELECT category, GROUP_CONCAT(name, ', ') as tags
  FROM tags
  GROUP BY category
  ORDER BY category
`).all();

tagsByCategory.forEach(cat => {
  console.log(`${cat.category}:`);
  console.log(`  ${cat.tags}`);
  console.log();
});

// Sample location with tags
console.log(`${'='.repeat(60)}`);
console.log('Sample Location with Tags:\n');

const locationWithTags = db.prepare(`
  SELECT l.city, l.state, l.cost_of_living, l.sunny_days,
         GROUP_CONCAT(t.name, ', ') as tags
  FROM locations l
  LEFT JOIN location_tags lt ON l.id = lt.location_id
  LEFT JOIN tags t ON lt.tag_id = t.id
  WHERE l.city = 'Phoenix'
  GROUP BY l.id
`).get();

if (locationWithTags) {
  console.log(`${locationWithTags.city}, ${locationWithTags.state}`);
  console.log(`  Cost of Living: ${locationWithTags.cost_of_living}`);
  console.log(`  Sunny Days: ${locationWithTags.sunny_days}`);
  console.log(`  Tags: ${locationWithTags.tags || 'None'}`);
}

// Test filtering by tags
console.log(`\n${'='.repeat(60)}`);
console.log('Locations with "constitutional-carry" tag:\n');

const ccLocations = db.prepare(`
  SELECT l.city, l.state
  FROM locations l
  JOIN location_tags lt ON l.id = lt.location_id
  JOIN tags t ON lt.tag_id = t.id
  WHERE t.name = 'constitutional-carry'
  ORDER BY l.state, l.city
`).all();

ccLocations.forEach(loc => {
  console.log(`  - ${loc.city}, ${loc.state}`);
});

console.log(`\nTotal: ${ccLocations.length} locations`);

// Test filtering by multiple criteria
console.log(`\n${'='.repeat(60)}`);
console.log('Low-cost locations with VA facilities:\n');

const lowCostVA = db.prepare(`
  SELECT city, state, cost_of_living
  FROM locations
  WHERE cost_of_living <= 95 AND va_facilities = 1
  ORDER BY cost_of_living
  LIMIT 10
`).all();

lowCostVA.forEach(loc => {
  console.log(`  - ${loc.city}, ${loc.state} (CoL: ${loc.cost_of_living})`);
});

// Verify JSON data is preserved
console.log(`\n${'='.repeat(60)}`);
console.log('Verifying JSON extra_data column:\n');

const withExtraData = db.prepare(`
  SELECT city, state, extra_data
  FROM locations
  WHERE extra_data IS NOT NULL AND extra_data != '{}'
  LIMIT 1
`).get();

if (withExtraData) {
  console.log(`${withExtraData.city}, ${withExtraData.state}`);
  const extraData = JSON.parse(withExtraData.extra_data);
  console.log('  Extra data keys:', Object.keys(extraData).join(', '));
  if (extraData.politics) {
    console.log('  Politics data present: ✓');
  }
  if (extraData.firearms) {
    console.log('  Firearms data present: ✓');
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log('✓ Verification complete!\n');

db.close();
