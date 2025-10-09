'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Location {
  id: number;
  state: string;
  city: string;
  county: string | null;
  stateParty: string | null;
  population: number | null;
  density: number | null;
  vaFacilities: boolean;
  veteranBenefits?: boolean;
  climate: {
    type: string | null;
    avgHighSummer: number | null;
    avgLowWinter: number | null;
    avgRainfallInches?: number | null;
    avgSnowfallInches?: number | null;
  };
  economy: {
    costOfLiving: string | null;
    avgGasPrice: string | null;
  };
  taxes: { salesTax: number | null; incomeTax: number | null };
  firearms: { laws?: string };
  marijuana: { status: string | null };
  crime: { totalIndex: number | null };
  coordinates: { lat: number | null; lng: number | null };
  governor?: { party: string };
  politics?: { trend: string };
  tech?: { hubPresent: boolean };
  lgbtq?: { rank: number };
}

type BubbleFilter = 'mild-winters' | 'ocean' | 'snow' | 'warm' | 'low-tax' | 'mountains' | 'cheap-gas';

export default function HomePage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedBubbles, setSelectedBubbles] = useState<BubbleFilter[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({
    climate: '',
    cost: '',
    tax: '',
    firearms: '',
    marijuana: '',
    vetBenefits: false,
  });

  useEffect(() => {
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        setLocations(data.locations);
        setFilteredLocations(data.locations);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading locations:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, locations, selectedBubbles, viewMode, sortColumn, sortDirection]);

  const applyFilters = () => {
    let filtered = [...locations];

    // Apply dropdown filters
    if (filters.climate) {
      filtered = filtered.filter(
        (loc) => loc.climate?.type === filters.climate
      );
    }

    if (filters.cost) {
      filtered = filtered.filter((loc) => loc.economy?.costOfLiving === filters.cost);
    }

    if (filters.tax === '0') {
      filtered = filtered.filter((loc) => loc.taxes?.incomeTax === 0);
    } else if (filters.tax === '1') {
      filtered = filtered.filter((loc) => (loc.taxes?.incomeTax ?? 0) > 0);
    }

    if (filters.firearms) {
      filtered = filtered.filter((loc) =>
        loc.firearms?.laws === filters.firearms
      );
    }

    if (filters.marijuana) {
      filtered = filtered.filter((loc) =>
        loc.marijuana?.status === filters.marijuana
      );
    }

    if (filters.vetBenefits) {
      filtered = filtered.filter((loc) => loc.veteranBenefits);
    }

    // Apply bubble filters (OR logic - match ANY selected bubble)
    if (selectedBubbles.length > 0) {
      const coastalStates = ['California', 'Florida', 'Washington', 'Oregon', 'Maine', 'North Carolina',
                            'South Carolina', 'Georgia', 'Virginia', 'Maryland', 'Delaware', 'New Jersey',
                            'New York', 'Connecticut', 'Rhode Island', 'Massachusetts', 'New Hampshire',
                            'Texas', 'Louisiana', 'Mississippi', 'Alabama', 'Alaska', 'Hawaii'];

      const mountainStates = ['Colorado', 'Montana', 'Wyoming', 'Idaho', 'Utah', 'New Mexico',
                             'Arizona', 'Nevada', 'Washington', 'Oregon', 'California', 'Alaska'];

      filtered = filtered.filter((loc) => {
        return selectedBubbles.some((bubble) => {
          switch (bubble) {
            case 'mild-winters':
              return loc.climate?.type === 'Mediterranean';
            case 'ocean':
              return coastalStates.includes(loc.state);
            case 'snow':
              return (loc.climate?.avgSnowfallInches ?? 0) > 30;
            case 'warm':
              return loc.climate?.type === 'Tropical';
            case 'low-tax':
              return loc.taxes?.incomeTax === 0;
            case 'mountains':
              return mountainStates.includes(loc.state);
            case 'cheap-gas':
              return parseFloat(loc.economy?.avgGasPrice || '999') < 3.13;
            default:
              return false;
          }
        });
      });
    }

    // Apply sorting if in table view
    if (viewMode === 'table' && sortColumn) {
      filtered = sortLocations(filtered, sortColumn);
    }

    setFilteredLocations(filtered);
  };

  const sortLocations = (locs: Location[], column: string) => {
    return [...locs].sort((a, b) => {
      let valA: any, valB: any;

      switch (column) {
        case 'city':
          valA = a.city || '';
          valB = b.city || '';
          break;
        case 'state':
          valA = a.state || '';
          valB = b.state || '';
          break;
        case 'county':
          valA = a.county || '';
          valB = b.county || '';
          break;
        case 'population':
          valA = a.population || 0;
          valB = b.population || 0;
          break;
        case 'costOfLiving':
          valA = parseFloat(a.economy?.costOfLiving || '0');
          valB = parseFloat(b.economy?.costOfLiving || '0');
          break;
        case 'incomeTax':
          valA = a.taxes?.incomeTax || 0;
          valB = b.taxes?.incomeTax || 0;
          break;
        case 'climate':
          valA = a.climate?.type || '';
          valB = b.climate?.type || '';
          break;
        default:
          return 0;
      }

      if (typeof valA === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
    });
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const toggleBubble = (bubble: BubbleFilter) => {
    setSelectedBubbles((prev) =>
      prev.includes(bubble)
        ? prev.filter((b) => b !== bubble)
        : [...prev, bubble]
    );
  };

  const clearFilters = () => {
    setFilters({
      climate: '',
      cost: '',
      tax: '',
      firearms: '',
      marijuana: '',
      vetBenefits: false,
    });
    setSelectedBubbles([]);
  };

  const getCityUrl = (location: Location) => {
    return `/${location.state.toLowerCase()}/${location.city.toLowerCase().replace(/\s+/g, '')}`;
  };

  const getFilterResultsText = () => {
    if (selectedBubbles.length === 0) return null;

    const filterDescriptions: Record<BubbleFilter, string> = {
      'cheap-gas': 'where gas prices are less than the average of $3.13',
      'low-tax': 'with no state income tax',
      'mild-winters': 'with Mediterranean climate',
      'ocean': 'near the ocean',
      'snow': 'with 30+ inches of snowfall annually',
      'warm': 'with tropical climate',
      'mountains': 'in mountain states'
    };

    const count = filteredLocations.length;
    const cityWord = count === 1 ? 'city' : 'cities';

    if (selectedBubbles.length === 1) {
      const description = filterDescriptions[selectedBubbles[0]];
      return `Showing ${count} ${cityWord} ${description}`;
    } else {
      return `Showing ${count} ${cityWord} matching your preferences`;
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading cities...</p>
      </div>
    );
  }

  return (
    <>
      <div className="filter-bar" id="filterBar">
        <div className="filter-container">
          <div className="filters-left">
            <div className="filter-item">
              <label>Climate</label>
              <select
                className="filter-select"
                value={filters.climate}
                onChange={(e) => setFilters({ ...filters, climate: e.target.value })}
              >
                <option value="">All Climates</option>
                <option value="Humid subtropical">Humid Subtropical</option>
                <option value="Mediterranean">Mediterranean</option>
                <option value="Continental">Continental</option>
                <option value="Desert">Desert</option>
                <option value="Tropical">Tropical</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Cost of Living</label>
              <select
                className="filter-select"
                value={filters.cost}
                onChange={(e) => setFilters({ ...filters, cost: e.target.value })}
              >
                <option value="">Any</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Income Tax</label>
              <select
                className="filter-select"
                value={filters.tax}
                onChange={(e) => setFilters({ ...filters, tax: e.target.value })}
              >
                <option value="">Any</option>
                <option value="0">No Income Tax</option>
                <option value="1">Has Income Tax</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Firearms</label>
              <select
                className="filter-select"
                value={filters.firearms}
                onChange={(e) => setFilters({ ...filters, firearms: e.target.value })}
              >
                <option value="">Any</option>
                <option value="Constitutional carry">Constitutional Carry</option>
                <option value="Permitless carry">Permitless Carry</option>
                <option value="Shall issue">Shall Issue</option>
                <option value="May issue">May Issue</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Marijuana</label>
              <select
                className="filter-select"
                value={filters.marijuana}
                onChange={(e) => setFilters({ ...filters, marijuana: e.target.value })}
              >
                <option value="">Any</option>
                <option value="Legal">Recreational Legal</option>
                <option value="Medical">Medical Only</option>
                <option value="Illegal">Illegal</option>
              </select>
            </div>

            <div className="filter-item checkbox-filter">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.vetBenefits}
                  onChange={(e) =>
                    setFilters({ ...filters, vetBenefits: e.target.checked })
                  }
                />
                <span>Veteran Benefits</span>
              </label>
            </div>
          </div>

          <div className="filter-actions">
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <i className="fas fa-th"></i>
              </button>
              <button
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                <i className="fas fa-table"></i>
              </button>
            </div>
            <button className="clear-filters" onClick={clearFilters}>
              <i className="fas fa-redo"></i>
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="hero-header">
        <h1>Find Your Perfect Retirement City</h1>
        <div className="hero-card">
          <div className="hero-prompt">I want to live...</div>
          <div className="bubble-choices">
            <button
              className={`bubble-choice ${selectedBubbles.includes('mild-winters') ? 'selected' : ''}`}
              onClick={() => toggleBubble('mild-winters')}
            >
              somewhere with mild winters
            </button>
            <button
              className={`bubble-choice ${selectedBubbles.includes('ocean') ? 'selected' : ''}`}
              onClick={() => toggleBubble('ocean')}
            >
              near the ocean
            </button>
            <button
              className={`bubble-choice ${selectedBubbles.includes('snow') ? 'selected' : ''}`}
              onClick={() => toggleBubble('snow')}
            >
              snow adventures
            </button>
            <button
              className={`bubble-choice ${selectedBubbles.includes('warm') ? 'selected' : ''}`}
              onClick={() => toggleBubble('warm')}
            >
              year-round warmth
            </button>
            <button
              className={`bubble-choice ${selectedBubbles.includes('low-tax') ? 'selected' : ''}`}
              onClick={() => toggleBubble('low-tax')}
            >
              in a low-tax state
            </button>
            <button
              className={`bubble-choice ${selectedBubbles.includes('mountains') ? 'selected' : ''}`}
              onClick={() => toggleBubble('mountains')}
            >
              in the mountains
            </button>
            <button
              className={`bubble-choice ${selectedBubbles.includes('cheap-gas') ? 'selected' : ''}`}
              onClick={() => toggleBubble('cheap-gas')}
            >
              affordable fuel
            </button>
          </div>
        </div>
      </div>

      {getFilterResultsText() && (
        <div className="filter-results-text">
          {getFilterResultsText()}
        </div>
      )}

      <div className="cities-container">
        {viewMode === 'grid' ? (
          <div className="cities-grid">
            {filteredLocations.length === 0 ? (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <h3>No cities match your filters</h3>
                <p>Try adjusting your search criteria</p>
              </div>
            ) : (
              filteredLocations.map((location) => (
                <div key={location.id} className="city-card">
                  <div className="city-card-header">
                    {location.governor?.party && (
                      <span className="governor-badge">{location.governor.party}</span>
                    )}
                    <h3>{location.city}</h3>
                    <div className="state">{location.state}</div>
                  </div>
                  <div className="city-card-body">
                    <div className="city-badges">
                      {location.taxes?.incomeTax === 0 && (
                        <span className="badge highlight">
                          <i className="fas fa-dollar-sign"></i> No Income Tax
                        </span>
                      )}
                      {location.climate?.type && (
                        <span className="badge">
                          <i className="fas fa-thermometer-half"></i> {location.climate.type}
                        </span>
                      )}
                      {location.firearms?.laws && (
                        <span className="badge">
                          <i className="fas fa-shield-alt"></i> {location.firearms.laws}
                        </span>
                      )}
                      {location.marijuana?.status && (
                        <span className="badge">
                          <i className="fas fa-leaf"></i> {location.marijuana.status}
                        </span>
                      )}
                    </div>

                    <div className="city-stats">
                      <div className="stat-item">
                        <span className="label">Sales Tax</span>
                        <span className="value">{location.taxes?.salesTax || 0}%</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Cost of Living</span>
                        <span className="value">{location.economy?.costOfLiving || 'N/A'}</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Gas Price</span>
                        <span className="value">{location.economy?.avgGasPrice || 'N/A'}</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Rainfall</span>
                        <span className="value">{location.climate?.avgRainfallInches || 0}"</span>
                      </div>
                    </div>

                    {location.veteranBenefits && (
                      <div className="badge highlight" style={{ marginBottom: 'var(--spacing-md)', width: '100%' }}>
                        <i className="fas fa-star"></i>
                        <span>Veteran Benefits Available</span>
                      </div>
                    )}

                    <Link href={getCityUrl(location)} className="learn-more">
                      <span>Learn More</span>
                      <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="cities-table-wrapper">
            <table className="cities-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('city')} style={{ cursor: 'pointer' }}>City</th>
                  <th onClick={() => handleSort('state')} style={{ cursor: 'pointer' }}>State</th>
                  <th onClick={() => handleSort('county')} style={{ cursor: 'pointer' }}>County</th>
                  <th>State Party</th>
                  <th>Election Trend</th>
                  <th onClick={() => handleSort('population')} style={{ cursor: 'pointer' }}>Population</th>
                  <th>Density</th>
                  <th>Governor</th>
                  <th>Sales Tax</th>
                  <th onClick={() => handleSort('incomeTax')} style={{ cursor: 'pointer' }}>Income Tax</th>
                  <th onClick={() => handleSort('costOfLiving')} style={{ cursor: 'pointer' }}>Cost of Living</th>
                  <th>VA Clinic</th>
                  <th>Crime Index</th>
                  <th onClick={() => handleSort('climate')} style={{ cursor: 'pointer' }}>Climate</th>
                  <th>Winter Low</th>
                  <th>Summer High</th>
                  <th>Firearms</th>
                  <th>Marijuana</th>
                  <th>Tech Hub</th>
                  <th>LGBTQ Rank</th>
                  <th>Gas Price</th>
                  <th>Rainfall</th>
                  <th>Snowfall</th>
                  <th>Vet Benefits</th>
                </tr>
              </thead>
              <tbody>
                {filteredLocations.map((location) => {
                  let statePartyBadge = 'N/A';
                  if (location.stateParty === 'R') {
                    statePartyBadge = 'Red';
                  } else if (location.stateParty === 'D') {
                    statePartyBadge = 'Blue';
                  }

                  return (
                    <tr
                      key={location.id}
                      onClick={() => window.location.href = getCityUrl(location)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td><strong>{location.city}</strong></td>
                      <td>{location.state}</td>
                      <td>{location.county || 'N/A'}</td>
                      <td>
                        {location.stateParty === 'R' && (
                          <span className="table-badge" style={{ backgroundColor: '#dc2626', color: 'white', borderColor: '#dc2626' }}>Red</span>
                        )}
                        {location.stateParty === 'D' && (
                          <span className="table-badge" style={{ backgroundColor: '#2563eb', color: 'white', borderColor: '#2563eb' }}>Blue</span>
                        )}
                        {!location.stateParty && 'N/A'}
                      </td>
                      <td>{location.politics?.trend || 'N/A'}</td>
                      <td>{location.population ? location.population.toLocaleString() : 'N/A'}</td>
                      <td>{location.density ? location.density.toLocaleString() : 'N/A'}</td>
                      <td><span className="table-badge">{location.governor?.party || 'Unknown'}</span></td>
                      <td>{location.taxes?.salesTax || 0}%</td>
                      <td>
                        {location.taxes?.incomeTax === 0 ? (
                          <span className="table-badge highlight">No Tax</span>
                        ) : (
                          `${location.taxes?.incomeTax || 0}%`
                        )}
                      </td>
                      <td>{location.economy?.costOfLiving || 'N/A'}</td>
                      <td>
                        {location.vaFacilities ? (
                          <span className="table-badge highlight">Yes</span>
                        ) : (
                          'No'
                        )}
                      </td>
                      <td>{location.crime?.totalIndex || 'N/A'}</td>
                      <td>{location.climate?.type || 'N/A'}</td>
                      <td>{location.climate?.avgLowWinter ? `${location.climate.avgLowWinter}°` : 'N/A'}</td>
                      <td>{location.climate?.avgHighSummer ? `${location.climate.avgHighSummer}°` : 'N/A'}</td>
                      <td>{location.firearms?.laws || 'N/A'}</td>
                      <td>{location.marijuana?.status || 'N/A'}</td>
                      <td>{location.tech?.hubPresent ? 'Yes' : 'No'}</td>
                      <td>{location.lgbtq?.rank ? `#${location.lgbtq.rank}` : 'N/A'}</td>
                      <td>{location.economy?.avgGasPrice || 'N/A'}</td>
                      <td>{location.climate?.avgRainfallInches || 0}"</td>
                      <td>{location.climate?.avgSnowfallInches || 0}"</td>
                      <td>
                        {location.veteranBenefits ? (
                          <span className="table-badge highlight">Yes</span>
                        ) : (
                          'No'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
