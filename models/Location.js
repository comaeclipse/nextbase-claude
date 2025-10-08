const database = require('../database/prisma-init');

class Location {
  constructor(data = {}) {
    // Store all data from the database formatted location object
    Object.assign(this, data);
  }

  static async findAll(limit = null, offset = 0) {
    const locations = await database.getLocations();

    if (limit) {
      return locations.slice(offset, offset + limit).map(loc => new Location(loc));
    }

    return locations.map(loc => new Location(loc));
  }

  static async findById(id) {
    const locations = await database.getLocations();
    const location = locations.find(loc => loc.id === parseInt(id));
    return location ? new Location(location) : null;
  }

  static async findByStateCity(state, city) {
    const location = await database.getLocationByStateCity(state, city);
    return location ? new Location(location) : null;
  }

  static async search(criteria) {
    // Build filters object for database
    const filters = {};

    // Map criteria to database filters
    if (criteria['cost-of-living']) {
      const costMapping = {
        'very-low': 85,
        'low': 95,
        'moderate': 110,
        'high': 999
      };
      filters.maxCost = costMapping[criteria['cost-of-living']] || 999;
    }

    if (criteria['va-facilities']) {
      filters.vaFacilities = true;
    }

    if (criteria['tech-hub']) {
      filters.techHub = true;
    }

    // Build tags array from criteria
    const tags = [];

    if (criteria.climate) {
      const climateTagMap = {
        'warm': 'warm-climate',
        'mild': 'mild-summers',
        'dry': 'dry-climate',
        'sunny': 'very-sunny'
      };
      if (climateTagMap[criteria.climate]) {
        tags.push(climateTagMap[criteria.climate]);
      }
    }

    if (criteria.density) {
      const densityTagMap = {
        'urban': 'urban',
        'suburban': 'suburban',
        'rural': 'rural'
      };
      if (densityTagMap[criteria.density]) {
        tags.push(densityTagMap[criteria.density]);
      }
    }

    if (criteria.taxes) {
      if (criteria.taxes.includes('no-income-tax')) {
        tags.push('no-income-tax');
      }
      if (criteria.taxes.includes('low-taxes')) {
        tags.push('low-income-tax');
      }
    }

    if (criteria['gun-laws']) {
      const gunTagMap = {
        'constitutional-carry': 'constitutional-carry',
        'gun-friendly': 'gun-friendly'
      };
      if (gunTagMap[criteria['gun-laws']]) {
        tags.push(gunTagMap[criteria['gun-laws']]);
      }
    }

    if (tags.length > 0) {
      filters.tags = tags;
    }

    // Use database search
    const locations = await database.searchLocations(filters);
    return locations.map(loc => new Location(loc));
  }

  static async getStats() {
    const locations = await database.getLocations();

    const states = new Set(locations.map(loc => loc.state)).size;

    const validCostOfLiving = locations
      .filter(loc => loc.economy?.costOfLiving)
      .map(loc => parseInt(loc.economy.costOfLiving));
    const avgCostOfLiving = validCostOfLiving.length > 0
      ? validCostOfLiving.reduce((a, b) => a + b, 0) / validCostOfLiving.length
      : 0;

    return {
      total_locations: locations.length,
      states_count: states,
      avg_cost_of_living: Math.round(avgCostOfLiving * 10) / 10
    };
  }

  // Calculate match score based on criteria (used in quiz)
  calculateMatchScore(criteria) {
    let score = 0;
    let maxScore = 0;

    // Climate matching
    if (criteria.climate && this.climate?.type) {
      const climateType = this.climate.type.toLowerCase();
      if (criteria.climate === 'warm' && climateType.includes('subtropical')) {
        score += 20;
      } else if (criteria.climate === 'dry' && (climateType.includes('desert') || climateType.includes('arid'))) {
        score += 20;
      } else if (criteria.climate === 'mild' && climateType.includes('continental')) {
        score += 20;
      }
    }
    maxScore += 20;

    // Tax preferences
    if (criteria.taxes) {
      if (criteria.taxes.includes('no-income-tax') && this.taxes?.incomeTax === 0) {
        score += 15;
      }
      if (this.taxes?.incomeTax <= 3) {
        score += 10;
      }
    }
    maxScore += 25;

    // Cost of living
    if (this.economy?.costOfLiving) {
      const cost = parseInt(this.economy.costOfLiving);
      if (cost <= 90) {
        score += 15;
      } else if (cost <= 100) {
        score += 10;
      } else if (cost <= 110) {
        score += 5;
      }
    }
    maxScore += 15;

    // VA facilities
    if (criteria.amenities && criteria.amenities.includes('va-facilities') && this.vaFacilities) {
      score += 15;
    }
    maxScore += 15;

    // Crime/Safety
    if (this.crime?.totalIndex) {
      if (this.crime.totalIndex >= 7) {
        score += 10;
      } else if (this.crime.totalIndex >= 5) {
        score += 5;
      }
    }
    maxScore += 10;

    // Gun laws
    if (criteria['gun-laws'] && this.firearms?.laws) {
      if (this.firearms.laws.toLowerCase().includes('constitutional carry')) {
        score += 15;
      }
    }
    maxScore += 15;

    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  }

  // Get tags for this location
  async getTags() {
    if (!this.id) return [];
    return await database.getLocationTags(this.id);
  }
}

module.exports = Location;
