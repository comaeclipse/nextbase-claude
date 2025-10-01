const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'veteran_retirement.db');

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.initializeTables().then(resolve).catch(reject);
        }
      });
    });
  }

  initializeTables() {
    return new Promise((resolve, reject) => {
      const createLocationsTable = `
        CREATE TABLE IF NOT EXISTS locations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          state TEXT NOT NULL,
          city TEXT NOT NULL,
          region TEXT NOT NULL,

          -- Geography & Climate
          climate_type TEXT,
          avg_temp_summer REAL,
          avg_temp_winter REAL,
          precipitation_annual REAL,
          humidity_avg REAL,
          population_density TEXT,

          -- Financial
          state_income_tax BOOLEAN DEFAULT 0,
          property_tax_rate REAL,
          sales_tax_rate REAL,
          cost_of_living_index REAL,
          median_home_price REAL,
          retirement_tax_friendly BOOLEAN DEFAULT 0,
          veteran_tax_benefits BOOLEAN DEFAULT 0,

          -- Healthcare & Services
          healthcare_quality_score REAL,
          va_facilities_nearby BOOLEAN DEFAULT 0,
          va_medical_center_distance REAL,
          hospital_count INTEGER,
          specialist_availability REAL,

          -- Lifestyle & Amenities
          recreation_score REAL,
          cultural_activities_score REAL,
          dining_entertainment_score REAL,
          shopping_score REAL,
          walkability_score REAL,
          public_transit_score REAL,
          airport_proximity REAL,

          -- Technology
          internet_speed_avg REAL,
          tech_hub_proximity REAL,
          smart_city_features BOOLEAN DEFAULT 0,

          -- Legal & Gun Laws
          gun_laws_rating TEXT,
          constitutional_carry BOOLEAN DEFAULT 0,
          ccw_reciprocity_states INTEGER,

          -- Community
          veteran_population_pct REAL,
          military_friendly_businesses BOOLEAN DEFAULT 0,
          active_senior_community BOOLEAN DEFAULT 0,
          diversity_index REAL,
          crime_rate REAL,

          -- Additional Info
          description TEXT,
          pros TEXT,
          cons TEXT,
          best_for TEXT,
          image_url TEXT,

          -- Meta
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const createAdminUsersTable = `
        CREATE TABLE IF NOT EXISTS admin_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          email TEXT,
          role TEXT DEFAULT 'admin',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME
        )
      `;

      const createCriteriaTable = `
        CREATE TABLE IF NOT EXISTS criteria_weights (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          criterion_name TEXT UNIQUE NOT NULL,
          weight REAL DEFAULT 1.0,
          description TEXT,
          category TEXT,
          active BOOLEAN DEFAULT 1
        )
      `;

      this.db.serialize(() => {
        this.db.run(createLocationsTable);
        this.db.run(createAdminUsersTable);
        this.db.run(createCriteriaTable, (err) => {
          if (err) {
            reject(err);
          } else {
            this.seedDefaultData().then(resolve).catch(reject);
          }
        });
      });
    });
  }

  seedDefaultData() {
    return new Promise(async (resolve, reject) => {
      // Insert default admin user (password: admin123)
      const bcrypt = require('bcryptjs');
      const defaultAdminHash = await bcrypt.hash('admin123', 10);

      const insertAdmin = `
        INSERT OR IGNORE INTO admin_users (username, password_hash, email)
        VALUES ('admin', ?, 'admin@vetretire.com')
      `;

      // Insert default criteria weights
      const criteriaData = [
        ['cost_of_living', 1.0, 'Overall cost of living importance', 'financial'],
        ['healthcare_quality', 1.2, 'Healthcare quality importance', 'health'],
        ['climate', 0.8, 'Climate preference importance', 'environment'],
        ['veteran_community', 1.1, 'Veteran community presence', 'community'],
        ['tax_benefits', 0.9, 'Tax benefits importance', 'financial'],
        ['recreation', 0.7, 'Recreation opportunities', 'lifestyle'],
        ['safety', 1.0, 'Safety and crime rates', 'community']
      ];

      const insertCriteria = `
        INSERT OR IGNORE INTO criteria_weights (criterion_name, weight, description, category)
        VALUES (?, ?, ?, ?)
      `;

      // Sample location data
      const sampleLocations = [
        {
          name: 'Austin, Texas',
          state: 'Texas',
          city: 'Austin',
          region: 'southwest',
          climate_type: 'warm',
          population_density: 'urban',
          state_income_tax: 0,
          property_tax_rate: 1.8,
          cost_of_living_index: 103.2,
          healthcare_quality_score: 85,
          va_facilities_nearby: 1,
          veteran_population_pct: 8.5,
          gun_laws_rating: 'constitutional-carry',
          constitutional_carry: 1,
          description: 'Vibrant tech hub with no state income tax and strong veteran community.',
          pros: 'No state income tax, tech opportunities, music scene, food culture',
          cons: 'High property taxes, summer heat, traffic congestion',
          best_for: 'Tech-savvy veterans who enjoy urban amenities'
        },
        {
          name: 'Raleigh, North Carolina',
          state: 'North Carolina',
          city: 'Raleigh',
          region: 'southeast',
          climate_type: 'four-seasons',
          population_density: 'suburban',
          state_income_tax: 1,
          property_tax_rate: 0.8,
          cost_of_living_index: 95.7,
          healthcare_quality_score: 92,
          va_facilities_nearby: 1,
          veteran_population_pct: 12.3,
          gun_laws_rating: 'shall-issue',
          description: 'Research Triangle area with excellent healthcare and education.',
          pros: 'Great healthcare, four seasons, research opportunities, moderate cost',
          cons: 'State income tax, hurricane risk, summer humidity',
          best_for: 'Veterans seeking balance of urban and suburban lifestyle'
        }
      ];

      this.db.serialize(() => {
        this.db.run(insertAdmin, [defaultAdminHash], (err) => {
          if (err) console.log('Admin already exists or error:', err.message);
        });

        criteriaData.forEach(criteria => {
          this.db.run(insertCriteria, criteria, (err) => {
            if (err) console.log('Criteria already exists or error:', err.message);
          });
        });

        // Insert sample locations
        const insertLocation = `
          INSERT OR IGNORE INTO locations (
            name, state, city, region, climate_type, population_density,
            state_income_tax, property_tax_rate, cost_of_living_index,
            healthcare_quality_score, va_facilities_nearby, veteran_population_pct,
            gun_laws_rating, constitutional_carry, description, pros, cons, best_for
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        sampleLocations.forEach(location => {
          this.db.run(insertLocation, [
            location.name, location.state, location.city, location.region,
            location.climate_type, location.population_density,
            location.state_income_tax, location.property_tax_rate, location.cost_of_living_index,
            location.healthcare_quality_score, location.va_facilities_nearby, location.veteran_population_pct,
            location.gun_laws_rating, location.constitutional_carry,
            location.description, location.pros, location.cons, location.best_for
          ], (err) => {
            if (err) console.log('Location already exists or error:', err.message);
          });
        });

        resolve();
      });
    });
  }

  close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('Database connection closed');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  getDB() {
    return this.db;
  }
}

module.exports = new Database();