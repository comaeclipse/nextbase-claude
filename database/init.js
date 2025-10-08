const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class VeteranDB {
  constructor() {
    // Use /tmp for serverless environments, local data dir otherwise
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

    if (isServerless) {
      this.dbPath = '/tmp/locations.db';
      this.sourcePath = path.join(__dirname, '..', 'data', 'locations.db');
    } else {
      this.dbPath = path.join(__dirname, '..', 'data', 'locations.db');
      this.sourcePath = this.dbPath;
    }

    this.db = null;
    this.jsonData = null;
    this.useJsonFallback = false;
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        // Try SQLite first
        try {
          // In serverless, copy database to /tmp if it doesn't exist there
          if (this.dbPath !== this.sourcePath && !fs.existsSync(this.dbPath)) {
            if (fs.existsSync(this.sourcePath)) {
              fs.copyFileSync(this.sourcePath, this.dbPath);
              console.log('Copied database to /tmp for serverless environment');
            } else {
              throw new Error('Source database file not found');
            }
          }

          this.db = new Database(this.dbPath);
          this.db.pragma('journal_mode = WAL');
          
          // Verify the database has the required tables
          const tables = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
          console.log('Available tables:', tables.map(t => t.name));
          
          if (!tables.some(t => t.name === 'locations')) {
            throw new Error('Locations table not found');
          }
          
          console.log('Connected to SQLite database successfully');
          resolve();
          return;
        } catch (sqliteError) {
          console.warn('SQLite connection failed, falling back to JSON data:', sqliteError.message);
          
          // Fallback to JSON data
          const jsonPath = path.join(__dirname, '..', 'data', 'locations.json');
          if (fs.existsSync(jsonPath)) {
            this.jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            this.useJsonFallback = true;
            console.log('Using JSON data fallback with', this.jsonData.locations.length, 'locations');
            resolve();
          } else {
            reject(new Error('Neither SQLite database nor JSON data file found'));
          }
        }
      } catch (err) {
        console.error('Error connecting to database:', err.message);
        reject(err);
      }
    });
  }

  // Get all locations with their tags (for compatibility with existing code)
  getLocations() {
    if (this.useJsonFallback) {
      return this.jsonData.locations || [];
    }
    
    if (!this.db) {
      throw new Error('Database not connected');
    }

    const locations = this.db.prepare(`
      SELECT * FROM locations ORDER BY state, city
    `).all();

    // Convert back to original JSON format for backward compatibility
    return locations.map(loc => this.formatLocation(loc));
  }

  // Get single location by state and city
  getLocationByStateCity(state, city) {
    if (this.useJsonFallback) {
      return this.jsonData.locations.find(loc =>
        loc.state.toLowerCase() === state.toLowerCase() &&
        loc.city.toLowerCase().replace(/\s+/g, '') === city.toLowerCase().replace(/\s+/g, '')
      ) || null;
    }
    
    if (!this.db) {
      throw new Error('Database not connected');
    }

    const location = this.db.prepare(`
      SELECT * FROM locations
      WHERE LOWER(state) = LOWER(?)
      AND LOWER(REPLACE(city, ' ', '')) = LOWER(REPLACE(?, ' ', ''))
    `).get(state, city);

    return location ? this.formatLocation(location) : null;
  }

  // Get locations by tag
  getLocationsByTag(tagName) {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    const locations = this.db.prepare(`
      SELECT l.* FROM locations l
      JOIN location_tags lt ON l.id = lt.location_id
      JOIN tags t ON lt.tag_id = t.id
      WHERE t.name = ?
      ORDER BY l.state, l.city
    `).all(tagName);

    return locations.map(loc => this.formatLocation(loc));
  }

  // Get tags for a location
  getLocationTags(locationId) {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    return this.db.prepare(`
      SELECT t.name, t.category FROM tags t
      JOIN location_tags lt ON t.id = lt.tag_id
      WHERE lt.location_id = ?
      ORDER BY t.category, t.name
    `).all(locationId);
  }

  // Search locations with filters
  searchLocations(filters = {}) {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    let query = 'SELECT * FROM locations WHERE 1=1';
    const params = [];

    // Add filters
    if (filters.maxCost) {
      query += ' AND cost_of_living <= ?';
      params.push(filters.maxCost);
    }

    if (filters.minSunnyDays) {
      query += ' AND sunny_days >= ?';
      params.push(filters.minSunnyDays);
    }

    if (filters.maxCrime) {
      query += ' AND crime_index <= ?';
      params.push(filters.maxCrime);
    }

    if (filters.vaFacilities) {
      query += ' AND va_facilities = 1';
    }

    if (filters.techHub) {
      query += ' AND tech_hub = 1';
    }

    if (filters.tags && filters.tags.length > 0) {
      // Filter by tags
      const placeholders = filters.tags.map(() => '?').join(',');
      query = `
        SELECT DISTINCT l.* FROM locations l
        JOIN location_tags lt ON l.id = lt.location_id
        JOIN tags t ON lt.tag_id = t.id
        WHERE t.name IN (${placeholders})
      `;
      params.push(...filters.tags);
    }

    query += ' ORDER BY state, city';

    const locations = this.db.prepare(query).all(...params);
    return locations.map(loc => this.formatLocation(loc));
  }

  // Format location to match original JSON structure
  formatLocation(loc) {
    const extraData = loc.extra_data ? JSON.parse(loc.extra_data) : {};

    return {
      id: loc.id,
      state: loc.state,
      city: loc.city,
      county: loc.county,
      stateParty: loc.state_party,
      population: loc.population,
      density: loc.density,
      politics: extraData.politics || {},
      vaFacilities: loc.va_facilities === 1,
      nearestVA: loc.nearest_va,
      distanceToVA: loc.distance_to_va,
      crime: {
        totalIndex: loc.crime_index
      },
      tech: {
        hubPresent: loc.tech_hub === 1
      },
      military: {
        hubPresent: loc.military_hub === 1
      },
      taxes: {
        salesTax: loc.sales_tax,
        incomeTax: loc.income_tax
      },
      marijuana: {
        status: loc.marijuana_status
      },
      lgbtq: {
        rank: loc.lgbtq_rank
      },
      firearms: extraData.firearms || {},
      climate: {
        type: loc.climate_type,
        avgSnowfallInches: loc.avg_snowfall,
        avgRainfallInches: loc.avg_rainfall,
        sunnyDays: loc.sunny_days,
        avgLowWinter: loc.avg_low_winter,
        avgHighSummer: loc.avg_high_summer,
        humiditySummer: loc.humidity_summer
      },
      economy: {
        avgGasPrice: loc.avg_gas_price,
        costOfLiving: loc.cost_of_living ? loc.cost_of_living.toString() : null
      },
      description: loc.description,
      veteranBenefits: extraData.veteranBenefits || {},
      coordinates: {
        lat: loc.lat,
        lng: loc.lng
      }
    };
  }

  // For backward compatibility with existing API code
  getData() {
    return {
      locations: this.getLocations()
    };
  }

  // Add a new location
  addLocation(location) {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    // This would require a full implementation based on your needs
    // For now, maintaining the interface
    throw new Error('addLocation not yet implemented for SQLite');
  }

  close() {
    if (this.db) {
      this.db.close();
      console.log('Database connection closed');
    }
    return Promise.resolve();
  }
}

module.exports = new VeteranDB();