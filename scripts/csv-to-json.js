const fs = require('fs');
const path = require('path');

/**
 * CSV to JSON converter for NextBase location data
 *
 * Usage: node scripts/csv-to-json.js [input-csv-path] [output-json-path]
 *
 * Default paths:
 *   Input: C:\Users\Meeter\Downloads\Locations.csv
 *   Gunlaws: C:\Users\Meeter\Downloads\Gunlaws.csv
 *   Output: data/locations.json
 */

// Parse command line arguments or use defaults
const inputPath = process.argv[2] || 'C:\\Users\\Meeter\\Downloads\\Locations.csv';
const gunlawsPath = 'C:\\Users\\Meeter\\Downloads\\Gunlaws.csv';
const outputPath = process.argv[3] || path.join(__dirname, '..', 'data', 'locations.json');

// Helper functions
function parseNumber(value) {
  if (!value || value.trim() === '?' || value.trim() === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

function parseInteger(value) {
  if (!value || value.trim() === '?' || value.trim() === '') return null;
  const cleaned = value.replace(/,/g, '').replace(/"/g, '');
  const num = parseInt(cleaned);
  return isNaN(num) ? null : num;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

// Load Gunlaws.csv and create lookup map
function loadGunlaws() {
  if (!fs.existsSync(gunlawsPath)) {
    console.warn(`Warning: Gunlaws.csv not found at ${gunlawsPath}`);
    return {};
  }

  const content = fs.readFileSync(gunlawsPath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const gunlawsMap = {};

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const parts = parseCSVLine(lines[i]);
    const state = parts[0];

    if (state && state.length === 2) {
      gunlawsMap[state] = {
        magazineLimit: parts[1] || null,
        giffordScore: parts[2] || null,
        ghostGunBan: parts[3] === 'Y',
        assaultWeaponBan: parts[4] === 'Y'
      };
    }
  }

  console.log(`Loaded gun law data for ${Object.keys(gunlawsMap).length} states`);
  return gunlawsMap;
}

function convertGiffordToFriendliness(gifford) {
  if (!gifford) return { score: null, friendliness: 'Unknown', laws: 'Unknown', permitRequired: null };

  const trimmed = gifford.trim();

  // F = Very 2A Friendly (Constitutional Carry)
  if (trimmed === 'F') {
    return {
      score: 'F',
      friendliness: 'Excellent (Very 2A Friendly)',
      laws: 'Constitutional Carry',
      permitRequired: false
    };
  }

  // D/C- = Good (Permitless/Shall Issue)
  if (trimmed === 'D' || trimmed === 'C-') {
    return {
      score: trimmed,
      friendliness: 'Good (Permitless/Shall Issue)',
      laws: 'Shall Issue',
      permitRequired: false
    };
  }

  // C/C+ = Moderate (Shall Issue)
  if (trimmed === 'C' || trimmed === 'C+') {
    return {
      score: trimmed,
      friendliness: 'Moderate',
      laws: 'Shall Issue',
      permitRequired: true
    };
  }

  // B-/B = Fair (Some Restrictions)
  if (trimmed === 'B-' || trimmed === 'B') {
    return {
      score: trimmed,
      friendliness: 'Fair (Some Restrictions)',
      laws: 'Shall Issue',
      permitRequired: true
    };
  }

  // A-/A = Restrictive (May Issue)
  if (trimmed === 'A-' || trimmed === 'A') {
    return {
      score: trimmed,
      friendliness: 'Restrictive (Less 2A Friendly)',
      laws: 'May Issue',
      permitRequired: true
    };
  }

  return {
    score: trimmed,
    friendliness: 'Unknown',
    laws: 'Unknown',
    permitRequired: null
  };
}

// Main conversion function
function convertCSVToJSON(csvPath, jsonPath) {
  console.log(`Reading CSV from: ${csvPath}`);

  if (!fs.existsSync(csvPath)) {
    console.error(`Error: CSV file not found at ${csvPath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    console.error('Error: CSV file is empty or has no data rows');
    process.exit(1);
  }

  // Load gun laws data
  const gunlawsMap = loadGunlaws();

  // Skip header row
  const dataLines = lines.slice(1);
  const locations = [];

  console.log(`Processing ${dataLines.length} locations...`);

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    const values = parseCSVLine(line);

    // Expected CSV columns (34 total):
    // 0: State, 1: City, 2: County, 3: StateParty, 4: Governor, 5: CityPolitics,
    // 6: 2016Election, 7: 2016PresidentPercent, 8: 2024 Election, 9: 2024PresidentPercent,
    // 10: ElectionChange, 11: Population, 12: Density, 13: Sales Tax, 14: Income,
    // 15: COL, 16: VA, 17: NearestVA, 18: DistanceToVA, 19: TCI, 20: Marijuana,
    // 21: LGBTQ, 22: TechHub, 23: MilitaryHub, 24: Snow, 25: Rain, 26: Sun,
    // 27: ALW, 28: AHS, 29: HumiditySummer, 30: Climate, 31: Gas, 32: Description,
    // 33: Veterans Benefits

    if (values.length < 34) {
      console.warn(`Warning: Row ${i + 2} has only ${values.length} columns, skipping`);
      continue;
    }

    const state = values[0];
    const city = values[1];

    // Get gun laws from Gunlaws.csv or fall back to empty
    const stateGunlaws = gunlawsMap[state] || {};
    const giffordScore = stateGunlaws.giffordScore || null;
    const firearms = convertGiffordToFriendliness(giffordScore);

    const vaFacilities = values[16] === 'Yes';
    const techHub = values[22] === 'Y';
    const militaryHub = values[23] === 'Y';

    const location = {
      state: state,
      city: city,
      county: values[2],
      stateParty: values[3],
      population: parseInteger(values[11]),
      density: parseInteger(values[12]),
      politics: {
        governor: values[4],
        mayor: values[5],
        cityPolitics: values[5] || null,
        election2016: {
          winner: values[6],
          percent: parseInteger(values[7])
        },
        election2024: {
          winner: values[8],
          percent: parseInteger(values[9])
        },
        trend: values[10]
      },
      vaFacilities: vaFacilities,
      nearestVA: values[17] || null,
      distanceToVA: values[18] || null,
      crime: {
        totalIndex: parseInteger(values[19])
      },
      tech: {
        hubPresent: techHub
      },
      military: {
        hubPresent: militaryHub
      },
      taxes: {
        salesTax: parseNumber(values[13]),
        incomeTax: parseNumber(values[14])
      },
      marijuana: {
        status: values[20] || null
      },
      lgbtq: {
        rank: parseInteger(values[21])
      },
      firearms: {
        giffordScore: firearms.score,
        gunFriendliness: firearms.friendliness,
        laws: firearms.laws,
        permitRequired: firearms.permitRequired,
        magazineLimit: stateGunlaws.magazineLimit || null,
        ghostGunBan: stateGunlaws.ghostGunBan || false,
        assaultWeaponBan: stateGunlaws.assaultWeaponBan || false
      },
      climate: {
        type: values[30],
        avgSnowfallInches: parseInteger(values[24]),
        avgRainfallInches: parseInteger(values[25]),
        sunnyDays: parseInteger(values[26]),
        avgLowWinter: parseInteger(values[27]),
        avgHighSummer: parseInteger(values[28]),
        humiditySummer: parseInteger(values[29])
      },
      economy: {
        avgGasPrice: parseNumber(values[31]?.replace('$', '')),
        costOfLiving: values[15]
      }
    };

    // Add description if present
    if (values[32] && values[32].trim() !== '') {
      location.description = values[32].trim();
    }

    // Add veteran benefits if present
    if (values[33] && values[33].trim() !== '') {
      location.veteranBenefits = {
        description: values[33].trim()
      };
    }

    locations.push(location);
    console.log(`  ${i + 1}. ${city}, ${state} - ✓`);
  }

  const output = {
    locations: locations
  };

  // Write to JSON file
  fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\n✓ Successfully converted ${locations.length} locations`);
  console.log(`✓ Output written to: ${jsonPath}`);
}

// Run the conversion
try {
  convertCSVToJSON(inputPath, outputPath);
} catch (error) {
  console.error('Error during conversion:', error.message);
  process.exit(1);
}
