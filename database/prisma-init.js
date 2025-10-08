const { PrismaClient } = require('@prisma/client');

class PrismaDB {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async connect() {
    try {
      await this.prisma.$connect();
      console.log('Connected to PostgreSQL database successfully');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async close() {
    await this.prisma.$disconnect();
    console.log('Database connection closed');
  }

  // Get all locations with their tags
  async getLocations() {
    const locations = await this.prisma.location.findMany({
      include: {
        locationTags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: [
        { state: 'asc' },
        { city: 'asc' }
      ]
    });

    return locations.map(loc => this.formatLocation(loc));
  }

  // Get single location by state and city
  async getLocationByStateCity(state, city) {
    const location = await this.prisma.location.findFirst({
      where: {
        state: {
          equals: state,
          mode: 'insensitive'
        },
        city: {
          equals: city,
          mode: 'insensitive'
        }
      },
      include: {
        locationTags: {
          include: {
            tag: true
          }
        }
      }
    });

    return location ? this.formatLocation(location) : null;
  }

  // Get locations by tag
  async getLocationsByTag(tagName) {
    const locations = await this.prisma.location.findMany({
      where: {
        locationTags: {
          some: {
            tag: {
              name: tagName
            }
          }
        }
      },
      include: {
        locationTags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: [
        { state: 'asc' },
        { city: 'asc' }
      ]
    });

    return locations.map(loc => this.formatLocation(loc));
  }

  // Get tags for a location
  async getLocationTags(locationId) {
    const locationTags = await this.prisma.locationTag.findMany({
      where: {
        locationId: locationId
      },
      include: {
        tag: true
      },
      orderBy: [
        { tag: { category: 'asc' } },
        { tag: { name: 'asc' } }
      ]
    });

    return locationTags.map(lt => ({
      name: lt.tag.name,
      category: lt.tag.category
    }));
  }

  // Search locations with filters
  async searchLocations(filters = {}) {
    const whereClause = {};

    // Add filters
    if (filters.maxCost) {
      whereClause.costOfLiving = {
        lte: filters.maxCost
      };
    }

    if (filters.minSunnyDays) {
      whereClause.sunnyDays = {
        gte: filters.minSunnyDays
      };
    }

    if (filters.maxCrime) {
      whereClause.crimeIndex = {
        lte: filters.maxCrime
      };
    }

    if (filters.vaFacilities) {
      whereClause.vaFacilities = true;
    }

    if (filters.techHub) {
      whereClause.techHub = true;
    }

    if (filters.tags && filters.tags.length > 0) {
      whereClause.locationTags = {
        some: {
          tag: {
            name: {
              in: filters.tags
            }
          }
        }
      };
    }

    const locations = await this.prisma.location.findMany({
      where: whereClause,
      include: {
        locationTags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: [
        { state: 'asc' },
        { city: 'asc' }
      ]
    });

    return locations.map(loc => this.formatLocation(loc));
  }

  // Format location to match original JSON structure
  formatLocation(loc) {
    const extraData = loc.extraData || {};

    return {
      id: loc.id,
      state: loc.state,
      city: loc.city,
      county: loc.county,
      stateParty: loc.stateParty,
      population: loc.population,
      density: loc.density,
      politics: extraData.politics || {},
      vaFacilities: loc.vaFacilities,
      nearestVA: loc.nearestVA,
      distanceToVA: loc.distanceToVA,
      crime: {
        totalIndex: loc.crimeIndex
      },
      tech: {
        hubPresent: loc.techHub
      },
      military: {
        hubPresent: loc.militaryHub
      },
      taxes: {
        salesTax: loc.salesTax,
        incomeTax: loc.incomeTax
      },
      marijuana: {
        status: loc.marijuanaStatus
      },
      lgbtq: {
        rank: loc.lgbtqRank
      },
      firearms: extraData.firearms || {},
      climate: {
        type: loc.climateType,
        avgSnowfallInches: loc.avgSnowfall,
        avgRainfallInches: loc.avgRainfall,
        sunnyDays: loc.sunnyDays,
        avgLowWinter: loc.avgLowWinter,
        avgHighSummer: loc.avgHighSummer,
        humiditySummer: loc.humiditySummer
      },
      economy: {
        avgGasPrice: loc.avgGasPrice,
        costOfLiving: loc.costOfLiving ? loc.costOfLiving.toString() : null
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
  async getData() {
    const locations = await this.getLocations();
    return {
      locations: locations
    };
  }

  // Add a new location
  async addLocation(locationData) {
    const location = await this.prisma.location.create({
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
        extraData: {
          politics: locationData.politics || {},
          firearms: locationData.firearms || {},
          veteranBenefits: locationData.veteranBenefits || {}
        }
      }
    });

    return this.formatLocation(location);
  }
}

module.exports = new PrismaDB();
