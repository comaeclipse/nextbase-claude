const fs = require('fs');
const path = require('path');
const https = require('https');

// Read locations.json
const locationsPath = path.join(__dirname, '..', 'data', 'locations.json');
const data = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));

// Function to geocode a city using Nominatim API
function geocodeCity(city, state) {
  return new Promise((resolve, reject) => {
    const query = encodeURIComponent(`${city}, ${state}, USA`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    const options = {
      headers: {
        'User-Agent': 'VetRetire-App/1.0'
      }
    };

    https.get(url, options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const results = JSON.parse(body);
          if (results && results.length > 0) {
            resolve({
              lat: parseFloat(results[0].lat),
              lng: parseFloat(results[0].lon)
            });
          } else {
            console.warn(`No results for ${city}, ${state}`);
            resolve(null);
          }
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Add delay between requests to respect Nominatim's rate limit (1 request/second)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function to geocode all cities
async function geocodeAllCities() {
  console.log(`Geocoding ${data.locations.length} cities...`);

  for (let i = 0; i < data.locations.length; i++) {
    const location = data.locations[i];

    if (location.coordinates) {
      console.log(`${i + 1}. ${location.city}, ${location.state} - Already has coordinates`);
      continue;
    }

    try {
      const coords = await geocodeCity(location.city, location.state);
      if (coords) {
        location.coordinates = coords;
        console.log(`${i + 1}. ${location.city}, ${location.state} - ✓ (${coords.lat}, ${coords.lng})`);
      } else {
        console.log(`${i + 1}. ${location.city}, ${location.state} - ✗ No results`);
      }

      // Wait 1 second between requests to respect rate limits
      if (i < data.locations.length - 1) {
        await delay(1000);
      }
    } catch (err) {
      console.error(`${i + 1}. ${location.city}, ${location.state} - Error: ${err.message}`);
    }
  }

  // Write updated data back to file
  fs.writeFileSync(locationsPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('\n✓ Geocoding complete!');
  console.log(`✓ Updated: ${locationsPath}`);
}

// Run the geocoding
geocodeAllCities().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
