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
    const locations = database.getLocations();

    if (limit) {
      return locations.slice(offset, offset + limit).map(loc => new Location(loc));
    }

    return locations.map(loc => new Location(loc));
  }

  static async findById(id) {
    const locations = database.getLocations();
    const location = locations.find(loc => loc.id === parseInt(id));
    return location ? new Location(location) : null;
  }

  static async search(criteria) {
    let locations = database.getLocations();

    // Filter by regions
    if (criteria.regions && criteria.regions.length > 0) {
      locations = locations.filter(loc => criteria.regions.includes(loc.region));
    }

    // Filter by climate
    if (criteria.climate) {
      locations = locations.filter(loc => loc.climate_type === criteria.climate);
    }

    // Filter by density
    if (criteria.density) {
      locations = locations.filter(loc => loc.population_density === criteria.density);
    }

    // Filter by taxes
    if (criteria.taxes) {
      if (criteria.taxes.includes('no-income-tax')) {
        locations = locations.filter(loc => !loc.state_income_tax);
      }
      if (criteria.taxes.includes('veteran-tax-breaks')) {
        locations = locations.filter(loc => loc.veteran_tax_benefits);
      }
    }

    // Filter by amenities
    if (criteria.amenities && criteria.amenities.includes('va-facilities')) {
      locations = locations.filter(loc => loc.va_facilities_nearby);
    }

    // Filter by gun laws
    if (criteria['gun-laws']) {
      locations = locations.filter(loc => loc.gun_laws_rating === criteria['gun-laws']);
    }

    // Sort by healthcare quality and veteran population
    locations.sort((a, b) => {
      const scoreA = (a.healthcare_quality_score || 0) + (a.veteran_population_pct || 0);
      const scoreB = (b.healthcare_quality_score || 0) + (b.veteran_population_pct || 0);
      return scoreB - scoreA;
    });

    return locations.map(loc => new Location(loc));
  }

  static async getStats() {
    const locations = database.getLocations();

    const states = new Set(locations.map(loc => loc.state)).size;

    const validCostOfLiving = locations
      .filter(loc => loc.cost_of_living_index)
      .map(loc => loc.cost_of_living_index);
    const avgCostOfLiving = validCostOfLiving.length > 0
      ? validCostOfLiving.reduce((a, b) => a + b, 0) / validCostOfLiving.length
      : 0;

    const validHealthcare = locations
      .filter(loc => loc.healthcare_quality_score)
      .map(loc => loc.healthcare_quality_score);
    const avgHealthcareScore = validHealthcare.length > 0
      ? validHealthcare.reduce((a, b) => a + b, 0) / validHealthcare.length
      : 0;

    return {
      total_locations: locations.length,
      states_count: states,
      avg_cost_of_living: Math.round(avgCostOfLiving * 10) / 10,
      avg_healthcare_score: Math.round(avgHealthcareScore * 10) / 10
    };
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
