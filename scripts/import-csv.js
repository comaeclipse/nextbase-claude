const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvPath = 'C:\\Users\\Meeter\\Downloads\\Locations.csv';
const csvContent = fs.readFileSync(csvPath, 'utf8');

// Parse CSV
const lines = csvContent.split('\n').filter(line => line.trim());
const headers = lines[0].split(',');

console.log('CSV Headers:', headers);
console.log('Total rows (excluding header):', lines.length - 1);

// Parse each row
const locations = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];

  // Handle quoted fields that may contain commas
  const values = [];
  let currentValue = '';
  let inQuotes = false;

  for (let j = 0; j < line.length; j++) {
    const char = line[j];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue.trim()); // Push the last value

  // Map CSV columns to JSON structure
  const location = {
    state: values[0],
    city: values[1],
    county: values[2],
    stateParty: values[3],
    population: parseInt(values[11].replace(/,/g, '')) || 0,
    density: parseInt(values[12].replace(/,/g, '')) || 0,
    politics: {
      governor: values[4],
      mayor: values[5],
      election2016: {
        winner: values[6],
        percent: parseInt(values[7]) || 0
      },
      election2024: {
        winner: values[8],
        percent: parseInt(values[9]) || 0
      },
      trend: values[10]
    },
    vaFacilities: values[16] === 'Yes',
    crime: {
      totalIndex: parseInt(values[19]) || 0
    },
    tech: {
      hubPresent: values[22] === 'Y' || values[22] === 'Yes'
    },
    taxes: {
      salesTax: parseFloat(values[13]) || 0,
      incomeTax: parseFloat(values[14]) || 0
    },
    marijuana: {
      status: values[20]
    },
    lgbtq: {
      rank: parseInt(values[21]) || 999
    },
    firearms: {
      giffordScore: values[31],
      gunFriendliness: getGunFriendliness(values[31]),
      laws: getFirearmsLaws(values[3], values[31]),
      permitRequired: getPermitRequired(values[31])
    },
    climate: {
      type: values[29],
      avgSnowfallInches: parseInt(values[23]) || 0,
      avgRainfallInches: parseInt(values[24]) || 0,
      sunnyDays: parseInt(values[25]) || 0,
      avgLowWinter: parseInt(values[26]) || 0,
      avgHighSummer: parseInt(values[27]) || 0
    },
    economy: {
      avgGasPrice: parseFloat(values[30].replace('$', '')) || 0,
      costOfLiving: values[15]
    }
  };

  // Add description if present
  if (values[32] && values[32].trim()) {
    location.description = values[32].trim();
  }

  // Add veteran benefits if present
  if (values[33] && values[33].trim()) {
    location.veteranBenefits = {
      description: values[33].trim()
    };
  }

  locations.push(location);
}

// Helper function to determine gun friendliness
function getGunFriendliness(giffordScore) {
  const baseGrade = giffordScore.charAt(0);

  if (baseGrade === 'F') return 'Excellent (Very 2A Friendly)';
  if (baseGrade === 'D') return 'Good (2A Friendly)';
  if (baseGrade === 'C') return 'Moderate';
  if (baseGrade === 'B') return 'Restrictive';
  if (baseGrade === 'A') return 'Very Restrictive';
  return 'Unknown';
}

// Helper function to determine firearms laws
function getFirearmsLaws(stateParty, giffordScore) {
  const baseGrade = giffordScore.charAt(0);

  if (baseGrade === 'F') return 'Constitutional Carry';
  if (baseGrade === 'D') return 'Shall issue';
  if (baseGrade === 'C') return 'Shall issue';
  if (baseGrade === 'B') return 'May issue';
  if (baseGrade === 'A') return 'May issue';
  return 'Unknown';
}

// Helper function to determine permit requirement
function getPermitRequired(giffordScore) {
  const baseGrade = giffordScore.charAt(0);
  return baseGrade !== 'F'; // Only F (Constitutional Carry) doesn't require permit
}

// Create the final JSON structure
const output = {
  locations: locations
};

// Write to locations.json
const outputPath = path.join(__dirname, '..', 'data', 'locations.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

console.log(`\n✓ Successfully converted ${locations.length} locations`);
console.log(`✓ Written to: ${outputPath}`);
console.log('\nSample location:');
console.log(JSON.stringify(locations[0], null, 2));
