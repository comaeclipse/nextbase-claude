import { prisma } from './prisma';

interface LocationData {
  id: number;
  state: string;
  city: string;
  county: string | null;
  stateParty: string | null;
  population: number | null;
  density: number | null;
  vaFacilities: boolean;
  nearestVA: string | null;
  distanceToVA: string | null;
  crime: {
    totalIndex: number | null;
  };
  tech: {
    hubPresent: boolean;
  };
  military: {
    hubPresent: boolean;
  };
  taxes: {
    salesTax: number | null;
    incomeTax: number | null;
  };
  marijuana: {
    status: string | null;
  };
  lgbtq: {
    rank: number | null;
  };
  firearms: any;
  climate: {
    type: string | null;
    avgSnowfallInches: number | null;
    avgRainfallInches: number | null;
    sunnyDays: number | null;
    avgLowWinter: number | null;
    avgHighSummer: number | null;
    humiditySummer: number | null;
  };
  economy: {
    avgGasPrice: number | null;
    costOfLiving: string | null;
  };
  description: string | null;
  veteranBenefits: any;
  coordinates: {
    lat: number | null;
    lng: number | null;
  };
  politics?: any;
}

class Database {
  // Format location to match original JSON structure
  formatLocation(loc: any): LocationData {
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
        totalIndex: loc.crimeIndex,
      },
      tech: {
        hubPresent: loc.techHub,
      },
      military: {
        hubPresent: loc.militaryHub,
      },
      taxes: {
        salesTax: loc.salesTax,
        incomeTax: loc.incomeTax,
      },
      marijuana: {
        status: loc.marijuanaStatus,
      },
      lgbtq: {
        rank: loc.lgbtqRank,
      },
      firearms: extraData.firearms || {},
      climate: {
        type: loc.climateType,
        avgSnowfallInches: loc.avgSnowfall,
        avgRainfallInches: loc.avgRainfall,
        sunnyDays: loc.sunnyDays,
        avgLowWinter: loc.avgLowWinter,
        avgHighSummer: loc.avgHighSummer,
        humiditySummer: loc.humiditySummer,
      },
      economy: {
        avgGasPrice: loc.avgGasPrice,
        costOfLiving: loc.costOfLiving ? loc.costOfLiving.toString() : null,
      },
      description: loc.description,
      veteranBenefits: extraData.veteranBenefits && extraData.veteranBenefits.description 
        ? extraData.veteranBenefits 
        : null,
      coordinates: {
        lat: loc.lat,
        lng: loc.lng,
      },
    };
  }

  // Get all locations with their tags
  async getLocations(): Promise<LocationData[]> {
    const locations = await prisma.location.findMany({
      include: {
        locationTags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: [{ state: 'asc' }, { city: 'asc' }],
    });

    return locations.map((loc) => this.formatLocation(loc));
  }

  // Get single location by state and city
  async getLocationByStateCity(state: string, city: string): Promise<LocationData | null> {
    const location = await prisma.location.findFirst({
      where: {
        state: {
          equals: state,
          mode: 'insensitive',
        },
        city: {
          equals: city,
          mode: 'insensitive',
        },
      },
      include: {
        locationTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return location ? this.formatLocation(location) : null;
  }

  // For backward compatibility with existing API code
  async getData(): Promise<{ locations: LocationData[] }> {
    const locations = await this.getLocations();
    return {
      locations: locations,
    };
  }
}

export const database = new Database();

