const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function migrateData() {
  try {
    console.log('Starting data migration...');
    
    // Read the existing JSON data
    const jsonPath = path.join(__dirname, '..', 'data', 'locations.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const locations = jsonData.locations || [];
    
    console.log(`Found ${locations.length} locations to migrate`);
    
    // Clear existing data
    await prisma.locationTag.deleteMany();
    await prisma.location.deleteMany();
    await prisma.tag.deleteMany();
    
    console.log('Cleared existing data');
    
    // Create tags first (collect all unique tags)
    const tagMap = new Map();
    const allTags = new Set();
    
    locations.forEach(location => {
      // Extract tags from various fields
      if (location.climate?.type) {
        const climateType = location.climate.type.toLowerCase();
        if (climateType.includes('subtropical')) allTags.add('warm-climate');
        if (climateType.includes('desert') || climateType.includes('arid')) allTags.add('dry-climate');
        if (climateType.includes('continental')) allTags.add('mild-summers');
      }
      
      if (location.climate?.sunnyDays > 250) {
        allTags.add('very-sunny');
      }
      
      if (location.density) {
        if (location.density > 3000) allTags.add('urban');
        else if (location.density >= 1000) allTags.add('suburban');
        else allTags.add('rural');
      }
      
      if (location.taxes?.incomeTax === 0) {
        allTags.add('no-income-tax');
      } else if (location.taxes?.incomeTax <= 3) {
        allTags.add('low-income-tax');
      }
      
      if (location.firearms?.laws) {
        const laws = location.firearms.laws.toLowerCase();
        if (laws.includes('constitutional carry')) allTags.add('constitutional-carry');
        if (laws.includes('shall issue')) allTags.add('gun-friendly');
      }
    });
    
    // Create tags in database
    for (const tagName of allTags) {
      const tag = await prisma.tag.create({
        data: {
          name: tagName,
          category: getTagCategory(tagName),
          description: getTagDescription(tagName)
        }
      });
      tagMap.set(tagName, tag.id);
    }
    
    console.log(`Created ${tagMap.size} tags`);
    
    // Migrate locations
    for (const locationData of locations) {
      try {
        // Prepare extra data
        const extraData = {
          politics: locationData.politics || {},
          firearms: locationData.firearms || {},
          veteranBenefits: locationData.veteranBenefits || {}
        };
        
        // Create location
        const location = await prisma.location.create({
          data: {
            state: locationData.state,
            city: locationData.city,
            county: locationData.county,
            stateParty: locationData.stateParty,
            population: locationData.population,
            density: locationData.density,
            costOfLiving: locationData.economy?.costOfLiving ? parseInt(locationData.economy.costOfLiving) : null,
            avgGasPrice: locationData.economy?.avgGasPrice,
            salesTax: locationData.taxes?.salesTax,
            incomeTax: locationData.taxes?.incomeTax,
            crimeIndex: locationData.crime?.totalIndex,
            climateType: locationData.climate?.type,
            sunnyDays: locationData.climate?.sunnyDays,
            avgHighSummer: locationData.climate?.avgHighSummer,
            avgLowWinter: locationData.climate?.avgLowWinter,
            avgRainfall: locationData.climate?.avgRainfallInches,
            avgSnowfall: locationData.climate?.avgSnowfallInches,
            humiditySummer: locationData.climate?.humiditySummer,
            vaFacilities: locationData.vaFacilities || false,
            nearestVA: locationData.nearestVA,
            distanceToVA: locationData.distanceToVA,
            techHub: locationData.tech?.hubPresent || false,
            militaryHub: locationData.military?.hubPresent || false,
            marijuanaStatus: locationData.marijuana?.status,
            lgbtqRank: locationData.lgbtq?.rank,
            lat: locationData.coordinates?.lat,
            lng: locationData.coordinates?.lng,
            description: locationData.description,
            extraData: extraData
          }
        });
        
        // Create location-tag relationships
        const locationTags = [];
        
        // Climate tags
        if (locationData.climate?.type) {
          const climateType = locationData.climate.type.toLowerCase();
          if (climateType.includes('subtropical') && tagMap.has('warm-climate')) {
            locationTags.push({ locationId: location.id, tagId: tagMap.get('warm-climate') });
          }
          if (climateType.includes('desert') || climateType.includes('arid')) {
            if (tagMap.has('dry-climate')) {
              locationTags.push({ locationId: location.id, tagId: tagMap.get('dry-climate') });
            }
          }
          if (climateType.includes('continental') && tagMap.has('mild-summers')) {
            locationTags.push({ locationId: location.id, tagId: tagMap.get('mild-summers') });
          }
        }
        
        if (locationData.climate?.sunnyDays > 250 && tagMap.has('very-sunny')) {
          locationTags.push({ locationId: location.id, tagId: tagMap.get('very-sunny') });
        }
        
        // Density tags
        if (locationData.density) {
          if (locationData.density > 3000 && tagMap.has('urban')) {
            locationTags.push({ locationId: location.id, tagId: tagMap.get('urban') });
          } else if (locationData.density >= 1000 && tagMap.has('suburban')) {
            locationTags.push({ locationId: location.id, tagId: tagMap.get('suburban') });
          } else if (locationData.density < 1000 && tagMap.has('rural')) {
            locationTags.push({ locationId: location.id, tagId: tagMap.get('rural') });
          }
        }
        
        // Tax tags
        if (locationData.taxes?.incomeTax === 0 && tagMap.has('no-income-tax')) {
          locationTags.push({ locationId: location.id, tagId: tagMap.get('no-income-tax') });
        } else if (locationData.taxes?.incomeTax <= 3 && tagMap.has('low-income-tax')) {
          locationTags.push({ locationId: location.id, tagId: tagMap.get('low-income-tax') });
        }
        
        // Firearms tags
        if (locationData.firearms?.laws) {
          const laws = locationData.firearms.laws.toLowerCase();
          if (laws.includes('constitutional carry') && tagMap.has('constitutional-carry')) {
            locationTags.push({ locationId: location.id, tagId: tagMap.get('constitutional-carry') });
          }
          if (laws.includes('shall issue') && tagMap.has('gun-friendly')) {
            locationTags.push({ locationId: location.id, tagId: tagMap.get('gun-friendly') });
          }
        }
        
        // Create location-tag relationships
        if (locationTags.length > 0) {
          await prisma.locationTag.createMany({
            data: locationTags
          });
        }
        
        console.log(`Migrated ${location.city}, ${location.state}`);
        
      } catch (error) {
        console.error(`Error migrating ${locationData.city}, ${locationData.state}:`, error);
      }
    }
    
    console.log('Data migration completed successfully!');
    
    // Verify migration
    const locationCount = await prisma.location.count();
    const tagCount = await prisma.tag.count();
    const locationTagCount = await prisma.locationTag.count();
    
    console.log(`Migration verification:`);
    console.log(`- Locations: ${locationCount}`);
    console.log(`- Tags: ${tagCount}`);
    console.log(`- Location-Tag relationships: ${locationTagCount}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function getTagCategory(tagName) {
  const categories = {
    'warm-climate': 'climate',
    'dry-climate': 'climate',
    'mild-summers': 'climate',
    'very-sunny': 'climate',
    'urban': 'density',
    'suburban': 'density',
    'rural': 'density',
    'no-income-tax': 'taxes',
    'low-income-tax': 'taxes',
    'constitutional-carry': 'firearms',
    'gun-friendly': 'firearms'
  };
  return categories[tagName] || 'general';
}

function getTagDescription(tagName) {
  const descriptions = {
    'warm-climate': 'Subtropical or warm climate',
    'dry-climate': 'Desert or arid climate',
    'mild-summers': 'Continental climate with mild summers',
    'very-sunny': 'More than 250 sunny days per year',
    'urban': 'High population density (>3000 people/sq mi)',
    'suburban': 'Medium population density (1000-3000 people/sq mi)',
    'rural': 'Low population density (<1000 people/sq mi)',
    'no-income-tax': 'No state income tax',
    'low-income-tax': 'Low state income tax (≤3%)',
    'constitutional-carry': 'Constitutional carry laws',
    'gun-friendly': 'Shall-issue gun laws'
  };
  return descriptions[tagName] || '';
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateData };
