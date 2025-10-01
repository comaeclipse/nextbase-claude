const database = require('../database/init');

class Location {
  constructor(data = {}) {
    this.id = data.id;
    this.name = data.name;
    this.state = data.state;
    this.city = data.city;
    this.region = data.region;

    // Geography & Climate
    this.climate_type = data.climate_type;
    this.avg_temp_summer = data.avg_temp_summer;
    this.avg_temp_winter = data.avg_temp_winter;
    this.precipitation_annual = data.precipitation_annual;
    this.humidity_avg = data.humidity_avg;
    this.population_density = data.population_density;

    // Financial
    this.state_income_tax = data.state_income_tax;
    this.property_tax_rate = data.property_tax_rate;
    this.sales_tax_rate = data.sales_tax_rate;
    this.cost_of_living_index = data.cost_of_living_index;
    this.median_home_price = data.median_home_price;
    this.retirement_tax_friendly = data.retirement_tax_friendly;
    this.veteran_tax_benefits = data.veteran_tax_benefits;

    // Healthcare & Services
    this.healthcare_quality_score = data.healthcare_quality_score;
    this.va_facilities_nearby = data.va_facilities_nearby;
    this.va_medical_center_distance = data.va_medical_center_distance;
    this.hospital_count = data.hospital_count;
    this.specialist_availability = data.specialist_availability;

    // Lifestyle & Amenities
    this.recreation_score = data.recreation_score;
    this.cultural_activities_score = data.cultural_activities_score;
    this.dining_entertainment_score = data.dining_entertainment_score;
    this.shopping_score = data.shopping_score;
    this.walkability_score = data.walkability_score;
    this.public_transit_score = data.public_transit_score;
    this.airport_proximity = data.airport_proximity;

    // Technology
    this.internet_speed_avg = data.internet_speed_avg;
    this.tech_hub_proximity = data.tech_hub_proximity;
    this.smart_city_features = data.smart_city_features;

    // Legal & Gun Laws
    this.gun_laws_rating = data.gun_laws_rating;
    this.constitutional_carry = data.constitutional_carry;
    this.ccw_reciprocity_states = data.ccw_reciprocity_states;

    // Community
    this.veteran_population_pct = data.veteran_population_pct;
    this.military_friendly_businesses = data.military_friendly_businesses;
    this.active_senior_community = data.active_senior_community;
    this.diversity_index = data.diversity_index;
    this.crime_rate = data.crime_rate;

    // Additional Info
    this.description = data.description;
    this.pros = data.pros;
    this.cons = data.cons;
    this.best_for = data.best_for;
    this.image_url = data.image_url;

    // Meta
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async findAll(limit = null, offset = 0) {
    return new Promise((resolve, reject) => {
      const db = database.getDB();
      let query = 'SELECT * FROM locations ORDER BY name';
      const params = [];

      if (limit) {
        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);
      }

      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const locations = rows.map(row => new Location(row));
          resolve(locations);
        }
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      const db = database.getDB();
      db.get('SELECT * FROM locations WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new Location(row));
        } else {
          resolve(null);
        }
      });
    });
  }

  static async search(criteria) {
    return new Promise((resolve, reject) => {
      const db = database.getDB();
      let query = 'SELECT * FROM locations WHERE 1=1';
      const params = [];

      // Build dynamic query based on criteria
      if (criteria.regions && criteria.regions.length > 0) {
        const regionPlaceholders = criteria.regions.map(() => '?').join(',');
        query += ` AND region IN (${regionPlaceholders})`;
        params.push(...criteria.regions);
      }

      if (criteria.climate) {
        query += ' AND climate_type = ?';
        params.push(criteria.climate);
      }

      if (criteria.density) {
        query += ' AND population_density = ?';
        params.push(criteria.density);
      }

      if (criteria.taxes && criteria.taxes.includes('no-income-tax')) {
        query += ' AND state_income_tax = 0';
      }

      if (criteria.taxes && criteria.taxes.includes('veteran-tax-breaks')) {
        query += ' AND veteran_tax_benefits = 1';
      }

      if (criteria.amenities && criteria.amenities.includes('va-facilities')) {
        query += ' AND va_facilities_nearby = 1';
      }

      if (criteria['gun-laws']) {
        query += ' AND gun_laws_rating = ?';
        params.push(criteria['gun-laws']);
      }

      query += ' ORDER BY healthcare_quality_score DESC, veteran_population_pct DESC';

      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const locations = rows.map(row => new Location(row));
          resolve(locations);
        }
      });
    });
  }

  async save() {
    return new Promise((resolve, reject) => {
      const db = database.getDB();

      if (this.id) {
        // Update existing location
        const query = `
          UPDATE locations SET
            name = ?, state = ?, city = ?, region = ?,
            climate_type = ?, avg_temp_summer = ?, avg_temp_winter = ?,
            precipitation_annual = ?, humidity_avg = ?, population_density = ?,
            state_income_tax = ?, property_tax_rate = ?, sales_tax_rate = ?,
            cost_of_living_index = ?, median_home_price = ?, retirement_tax_friendly = ?,
            veteran_tax_benefits = ?, healthcare_quality_score = ?, va_facilities_nearby = ?,
            va_medical_center_distance = ?, hospital_count = ?, specialist_availability = ?,
            recreation_score = ?, cultural_activities_score = ?, dining_entertainment_score = ?,
            shopping_score = ?, walkability_score = ?, public_transit_score = ?,
            airport_proximity = ?, internet_speed_avg = ?, tech_hub_proximity = ?,
            smart_city_features = ?, gun_laws_rating = ?, constitutional_carry = ?,
            ccw_reciprocity_states = ?, veteran_population_pct = ?, military_friendly_businesses = ?,
            active_senior_community = ?, diversity_index = ?, crime_rate = ?,
            description = ?, pros = ?, cons = ?, best_for = ?, image_url = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;

        const params = [
          this.name, this.state, this.city, this.region,
          this.climate_type, this.avg_temp_summer, this.avg_temp_winter,
          this.precipitation_annual, this.humidity_avg, this.population_density,
          this.state_income_tax, this.property_tax_rate, this.sales_tax_rate,
          this.cost_of_living_index, this.median_home_price, this.retirement_tax_friendly,
          this.veteran_tax_benefits, this.healthcare_quality_score, this.va_facilities_nearby,
          this.va_medical_center_distance, this.hospital_count, this.specialist_availability,
          this.recreation_score, this.cultural_activities_score, this.dining_entertainment_score,
          this.shopping_score, this.walkability_score, this.public_transit_score,
          this.airport_proximity, this.internet_speed_avg, this.tech_hub_proximity,
          this.smart_city_features, this.gun_laws_rating, this.constitutional_carry,
          this.ccw_reciprocity_states, this.veteran_population_pct, this.military_friendly_businesses,
          this.active_senior_community, this.diversity_index, this.crime_rate,
          this.description, this.pros, this.cons, this.best_for, this.image_url,
          this.id
        ];

        db.run(query, params, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this);
          }
        });
      } else {
        // Create new location
        const query = `
          INSERT INTO locations (
            name, state, city, region, climate_type, avg_temp_summer, avg_temp_winter,
            precipitation_annual, humidity_avg, population_density, state_income_tax,
            property_tax_rate, sales_tax_rate, cost_of_living_index, median_home_price,
            retirement_tax_friendly, veteran_tax_benefits, healthcare_quality_score,
            va_facilities_nearby, va_medical_center_distance, hospital_count,
            specialist_availability, recreation_score, cultural_activities_score,
            dining_entertainment_score, shopping_score, walkability_score,
            public_transit_score, airport_proximity, internet_speed_avg,
            tech_hub_proximity, smart_city_features, gun_laws_rating,
            constitutional_carry, ccw_reciprocity_states, veteran_population_pct,
            military_friendly_businesses, active_senior_community, diversity_index,
            crime_rate, description, pros, cons, best_for, image_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
          this.name, this.state, this.city, this.region,
          this.climate_type, this.avg_temp_summer, this.avg_temp_winter,
          this.precipitation_annual, this.humidity_avg, this.population_density,
          this.state_income_tax, this.property_tax_rate, this.sales_tax_rate,
          this.cost_of_living_index, this.median_home_price, this.retirement_tax_friendly,
          this.veteran_tax_benefits, this.healthcare_quality_score, this.va_facilities_nearby,
          this.va_medical_center_distance, this.hospital_count, this.specialist_availability,
          this.recreation_score, this.cultural_activities_score, this.dining_entertainment_score,
          this.shopping_score, this.walkability_score, this.public_transit_score,
          this.airport_proximity, this.internet_speed_avg, this.tech_hub_proximity,
          this.smart_city_features, this.gun_laws_rating, this.constitutional_carry,
          this.ccw_reciprocity_states, this.veteran_population_pct, this.military_friendly_businesses,
          this.active_senior_community, this.diversity_index, this.crime_rate,
          this.description, this.pros, this.cons, this.best_for, this.image_url
        ];

        db.run(query, params, function(err) {
          if (err) {
            reject(err);
          } else {
            this.id = this.lastID;
            resolve(this);
          }
        });
      }
    });
  }

  async delete() {
    return new Promise((resolve, reject) => {
      if (!this.id) {
        reject(new Error('Cannot delete location without ID'));
        return;
      }

      const db = database.getDB();
      db.run('DELETE FROM locations WHERE id = ?', [this.id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  static async getStats() {
    return new Promise((resolve, reject) => {
      const db = database.getDB();
      const queries = [
        'SELECT COUNT(*) as total_locations FROM locations',
        'SELECT COUNT(*) as states_count FROM (SELECT DISTINCT state FROM locations)',
        'SELECT AVG(cost_of_living_index) as avg_cost_of_living FROM locations WHERE cost_of_living_index IS NOT NULL',
        'SELECT AVG(healthcare_quality_score) as avg_healthcare_score FROM locations WHERE healthcare_quality_score IS NOT NULL'
      ];

      Promise.all(queries.map(query => {
        return new Promise((resolve, reject) => {
          db.get(query, (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
      })).then(results => {
        resolve({
          total_locations: results[0].total_locations,
          states_count: results[1].states_count,
          avg_cost_of_living: Math.round(results[2].avg_cost_of_living * 10) / 10,
          avg_healthcare_score: Math.round(results[3].avg_healthcare_score * 10) / 10
        });
      }).catch(reject);
    });
  }

  calculateMatchScore(criteria) {
    let score = 0;
    let maxScore = 0;

    // Climate matching
    if (criteria.climate && this.climate_type === criteria.climate) {
      score += 20;
    }
    maxScore += 20;

    // Tax preferences
    if (criteria.taxes) {
      if (criteria.taxes.includes('no-income-tax') && !this.state_income_tax) {
        score += 15;
      }
      if (criteria.taxes.includes('veteran-tax-breaks') && this.veteran_tax_benefits) {
        score += 15;
      }
    }
    maxScore += 30;

    // Healthcare quality
    if (this.healthcare_quality_score) {
      score += (this.healthcare_quality_score / 100) * 25;
    }
    maxScore += 25;

    // VA facilities
    if (criteria.amenities && criteria.amenities.includes('va-facilities') && this.va_facilities_nearby) {
      score += 15;
    }
    maxScore += 15;

    // Veteran community
    if (this.veteran_population_pct) {
      score += Math.min((this.veteran_population_pct / 15) * 10, 10);
    }
    maxScore += 10;

    return Math.round((score / maxScore) * 100);
  }
}

module.exports = Location;