const fs = require('fs');
const path = require('path');

/**
 * Permanent CSV to JSON converter for NextBase location data
 *
 * Usage: node scripts/csv-to-json.js [input-csv-path] [output-json-path]
 *
 * Default paths:
 *   Input: C:\Users\Meeter\Downloads\Locations.csv
 *   Output: data/locations.json
 */

// Parse command line arguments or use defaults
const inputPath = process.argv[2] || 'C:\\Users\\Meeter\\Downloads\\Locations.csv';
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

function convertMarijuanaStatus(status) {
  if (!status) return null;
  const trimmed = status.trim();
  if (trimmed === 'Recreational') return 'Recreational';
  if (trimmed === 'Medical') return 'Medical';
  if (trimmed === 'Decriminalized') return 'Decriminalized';
  if (trimmed === 'Illegal') return 'Illegal';
  return trimmed;
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

  // Skip header row
  const dataLines = lines.slice(1);

  const locations = [];

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    const values = parseCSVLine(line);

    // Expected CSV columns (30 total):
    // State, City, County, StateParty, Governor, Mayor, 2016Election, 2016PresidentPercent,
    // 2024 Election, 2024PresidentPercent, ElectionChange, Population, Density, Sales Tax,
    // Income, COL, VA, TCI, Marijuana, LGBTQ, Tech, Snow, Rain, Sun, ALW, AHS, Climate,
    // Gas, Gifford, Veterans Benefits

    if (values.length < 30) {
      console.warn(`Warning: Row ${i + 2} has only ${values.length} columns, skipping`);
      continue;
    }

    const firearms = convertGiffordToFriendliness(values[28]);
    const vaFacilities = values[16] === 'Yes';
    const techHub = values[20] === 'Y';

    const location = {
      state: values[0],
      city: values[1],
      county: values[2],
      stateParty: values[3],
      population: parseInteger(values[11]),
      density: parseInteger(values[12]),
      politics: {
        governor: values[4],
        mayor: values[5],
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
      crime: {
        totalIndex: parseInteger(values[17])
      },
      tech: {
        hubPresent: techHub
      },
      taxes: {
        salesTax: parseNumber(values[13]),
        incomeTax: parseNumber(values[14])
      },
      marijuana: {
        status: convertMarijuanaStatus(values[18])
      },
      lgbtq: {
        rank: parseInteger(values[19])
      },
      firearms: {
        giffordScore: firearms.score,
        gunFriendliness: firearms.friendliness,
        laws: firearms.laws,
        permitRequired: firearms.permitRequired
      },
      climate: {
        type: values[26],
        avgSnowfallInches: parseInteger(values[21]),
        avgRainfallInches: parseInteger(values[22]),
        sunnyDays: parseInteger(values[23]),
        avgLowWinter: parseInteger(values[24]),
        avgHighSummer: parseInteger(values[25])
      },
      economy: {
        avgGasPrice: parseNumber(values[27]?.replace('$', '')),
        costOfLiving: values[15]
      }
    };

    // Add veteran benefits if present
    if (values[29] && values[29].trim() !== '') {
      location.veteranBenefits = {
        description: values[29]
      };
    }

    locations.push(location);
  }

  const output = {
    locations: locations
  };

  // Write to JSON file
  fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`✓ Successfully converted ${locations.length} locations`);
  console.log(`✓ Output written to: ${jsonPath}`);
}

// Run the conversion
try {
  convertCSVToJSON(inputPath, outputPath);
} catch (error) {
  console.error('Error during conversion:', error.message);
  process.exit(1);
}
