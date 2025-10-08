const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Paths
const schemaPath = path.join(__dirname, 'schema.sql');
const jsonPath = path.join(__dirname, '..', 'data', 'locations.json');
const dbPath = path.join(__dirname, '..', 'data', 'locations.db');

console.log('Starting migration from JSON to SQLite...\n');

// Delete existing database if it exists
if (fs.existsSync(dbPath)) {
  console.log('Removing existing database...');
  fs.unlinkSync(dbPath);
}

// Create new database
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Load and execute schema
console.log('Creating schema...');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

// Load JSON data
console.log('Loading JSON data...');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const locations = jsonData.locations;

console.log(`Found ${locations.length} locations to migrate\n`);

// Tag generation logic
function generateTags(location) {
  const tags = [];

  // Climate tags
  const climateType = location.climate?.type?.toLowerCase() || '';
  if (climateType.includes('subtropical') || climateType.includes('hot')) {
    tags.push({ name: 'warm-climate', category: 'climate' });
  }
  if (climateType.includes('desert') || climateType.includes('arid')) {
    tags.push({ name: 'dry-climate', category: 'climate' });
  }
  if (climateType.includes('continental')) {
    tags.push({ name: 'four-seasons', category: 'climate' });
  }

  // Sunny days
  const sunnyDays = location.climate?.sunnyDays || 0;
  if (sunnyDays >= 250) {
    tags.push({ name: 'very-sunny', category: 'climate' });
  } else if (sunnyDays >= 200) {
    tags.push({ name: 'sunny', category: 'climate' });
  }

  // Temperature tags
  const avgHighSummer = location.climate?.avgHighSummer || 0;
  const avgLowWinter = location.climate?.avgLowWinter || 0;

  if (avgHighSummer < 80) {
    tags.push({ name: 'mild-summers', category: 'climate' });
  }
  if (avgLowWinter > 40) {
    tags.push({ name: 'warm-winters', category: 'climate' });
  } else if (avgLowWinter < 20) {
    tags.push({ name: 'cold-winters', category: 'climate' });
  }

  // Humidity
  const humidity = location.climate?.humiditySummer || 0;
  if (humidity < 50) {
    tags.push({ name: 'low-humidity', category: 'climate' });
  } else if (humidity > 70) {
    tags.push({ name: 'high-humidity', category: 'climate' });
  }

  // Firearms tags
  const gunLaws = location.firearms?.laws || '';
  if (gunLaws.toLowerCase().includes('constitutional carry')) {
    tags.push({ name: 'constitutional-carry', category: 'firearms' });
  }

  const giffordScore = location.firearms?.giffordScore;
  if (giffordScore === 'F') {
    tags.push({ name: 'gun-friendly', category: 'firearms' });
  }

  // Tax tags
  const incomeTax = location.taxes?.incomeTax || 0;
  if (incomeTax === 0) {
    tags.push({ name: 'no-income-tax', category: 'taxes' });
  }
  if (incomeTax <= 3) {
    tags.push({ name: 'low-income-tax', category: 'taxes' });
  }

  // Cost of living
  const costOfLiving = parseInt(location.economy?.costOfLiving) || 100;
  if (costOfLiving <= 90) {
    tags.push({ name: 'low-cost', category: 'economy' });
  } else if (costOfLiving >= 120) {
    tags.push({ name: 'high-cost', category: 'economy' });
  }

  // Marijuana
  const marijuanaStatus = location.marijuana?.status?.toLowerCase() || '';
  if (marijuanaStatus === 'recreational') {
    tags.push({ name: 'cannabis-legal', category: 'lifestyle' });
  } else if (marijuanaStatus === 'medical') {
    tags.push({ name: 'medical-cannabis', category: 'lifestyle' });
  }

  // Density/Lifestyle
  const density = location.density || 0;
  if (density >= 3000) {
    tags.push({ name: 'urban', category: 'lifestyle' });
  } else if (density >= 1000) {
    tags.push({ name: 'suburban', category: 'lifestyle' });
  } else if (density > 0) {
    tags.push({ name: 'rural', category: 'lifestyle' });
  }

  // Tech hub
  if (location.tech?.hubPresent) {
    tags.push({ name: 'tech-hub', category: 'community' });
  }

  // Military hub
  if (location.military?.hubPresent) {
    tags.push({ name: 'military-base', category: 'community' });
  }

  // VA facilities
  if (location.vaFacilities) {
    tags.push({ name: 'va-medical-center', category: 'healthcare' });
  }

  // Crime
  const crimeIndex = location.crime?.totalIndex || 10;
  if (crimeIndex >= 8) {
    tags.push({ name: 'low-crime', category: 'safety' });
  } else if (crimeIndex <= 3) {
    tags.push({ name: 'high-crime', category: 'safety' });
  }

  // LGBTQ
  const lgbtqRank = location.lgbtq?.rank;
  if (lgbtqRank && lgbtqRank <= 50) {
    tags.push({ name: 'lgbtq-friendly', category: 'community' });
  }

  // Political
  const stateParty = location.stateParty;
  if (stateParty === 'R') {
    tags.push({ name: 'red-state', category: 'politics' });
  } else if (stateParty === 'D') {
    tags.push({ name: 'blue-state', category: 'politics' });
  }

  const election2024Winner = location.politics?.election2024?.winner;
  if (election2024Winner === 'Trump') {
    tags.push({ name: 'republican-city', category: 'politics' });
  } else if (election2024Winner === 'Harris') {
    tags.push({ name: 'democratic-city', category: 'politics' });
  }

  return tags;
}

// Prepare statements
const insertLocation = db.prepare(`
  INSERT INTO locations (
    state, city, county, state_party,
    population, density,
    cost_of_living, avg_gas_price,
    sales_tax, income_tax,
    crime_index,
    climate_type, sunny_days, avg_high_summer, avg_low_winter,
    avg_rainfall, avg_snowfall, humidity_summer,
    va_facilities, nearest_va, distance_to_va,
    tech_hub, military_hub,
    marijuana_status, lgbtq_rank,
    lat, lng,
    description, extra_data
  ) VALUES (
    @state, @city, @county, @stateParty,
    @population, @density,
    @costOfLiving, @avgGasPrice,
    @salesTax, @incomeTax,
    @crimeIndex,
    @climateType, @sunnyDays, @avgHighSummer, @avgLowWinter,
    @avgRainfall, @avgSnowfall, @humiditySummer,
    @vaFacilities, @nearestVA, @distanceToVA,
    @techHub, @militaryHub,
    @marijuanaStatus, @lgbtqRank,
    @lat, @lng,
    @description, @extraData
  )
`);

const insertTag = db.prepare(`
  INSERT OR IGNORE INTO tags (name, category) VALUES (@name, @category)
`);

const getTag = db.prepare(`
  SELECT id FROM tags WHERE name = ?
`);

const insertLocationTag = db.prepare(`
  INSERT OR IGNORE INTO location_tags (location_id, tag_id) VALUES (?, ?)
`);

// Migrate data
const migrate = db.transaction(() => {
  let locationCount = 0;
  let tagCount = 0;

  for (const loc of locations) {
    // Extract data for extra_data JSON column
    const extraData = {
      politics: loc.politics,
      firearms: loc.firearms,
      veteranBenefits: loc.veteranBenefits
    };

    // Insert location
    const result = insertLocation.run({
      state: loc.state,
      city: loc.city,
      county: loc.county,
      stateParty: loc.stateParty,
      population: loc.population,
      density: loc.density,
      costOfLiving: parseInt(loc.economy?.costOfLiving) || null,
      avgGasPrice: loc.economy?.avgGasPrice || null,
      salesTax: loc.taxes?.salesTax || null,
      incomeTax: loc.taxes?.incomeTax || null,
      crimeIndex: loc.crime?.totalIndex || null,
      climateType: loc.climate?.type || null,
      sunnyDays: loc.climate?.sunnyDays || null,
      avgHighSummer: loc.climate?.avgHighSummer || null,
      avgLowWinter: loc.climate?.avgLowWinter || null,
      avgRainfall: loc.climate?.avgRainfallInches || null,
      avgSnowfall: loc.climate?.avgSnowfallInches || null,
      humiditySummer: loc.climate?.humiditySummer || null,
      vaFacilities: loc.vaFacilities ? 1 : 0,
      nearestVA: loc.nearestVA || null,
      distanceToVA: loc.distanceToVA || null,
      techHub: loc.tech?.hubPresent ? 1 : 0,
      militaryHub: loc.military?.hubPresent ? 1 : 0,
      marijuanaStatus: loc.marijuana?.status || null,
      lgbtqRank: loc.lgbtq?.rank || null,
      lat: loc.coordinates?.lat || null,
      lng: loc.coordinates?.lng || null,
      description: loc.description || null,
      extraData: JSON.stringify(extraData)
    });

    const locationId = result.lastInsertRowid;
    locationCount++;

    // Generate and insert tags
    const tags = generateTags(loc);
    for (const tag of tags) {
      insertTag.run(tag);
      const tagRow = getTag.get(tag.name);
      if (tagRow) {
        insertLocationTag.run(locationId, tagRow.id);
        tagCount++;
      }
    }

    if (locationCount % 10 === 0) {
      console.log(`Migrated ${locationCount}/${locations.length} locations...`);
    }
  }

  console.log(`\n✓ Migrated ${locationCount} locations`);
  console.log(`✓ Created ${tagCount} location-tag associations`);
});

// Run migration
try {
  migrate();

  // Display stats
  const stats = {
    locations: db.prepare('SELECT COUNT(*) as count FROM locations').get(),
    tags: db.prepare('SELECT COUNT(*) as count FROM tags').get(),
    tagsByCategory: db.prepare(`
      SELECT category, COUNT(*) as count
      FROM tags
      GROUP BY category
      ORDER BY count DESC
    `).all()
  };

  console.log('\nDatabase Statistics:');
  console.log(`Total Locations: ${stats.locations.count}`);
  console.log(`Total Tags: ${stats.tags.count}`);
  console.log('\nTags by Category:');
  stats.tagsByCategory.forEach(cat => {
    console.log(`  ${cat.category}: ${cat.count}`);
  });

  console.log('\n✓ Migration completed successfully!');
  console.log(`Database created at: ${dbPath}\n`);

} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}
