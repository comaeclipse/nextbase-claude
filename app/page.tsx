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
  climate: { type: string | null; avgHighSummer: number | null; avgLowWinter: number | null };
  economy: { costOfLiving: string | null; avgGasPrice: number | null };
  taxes: { salesTax: number | null; incomeTax: number | null };
  firearms: { laws?: string };
  marijuana: { status: string | null };
  crime: { totalIndex: number | null };
  coordinates: { lat: number | null; lng: number | null };
}

export default function HomePage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
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
    let filtered = [...locations];

    if (filters.climate) {
      filtered = filtered.filter(
        (loc) => loc.climate?.type?.includes(filters.climate) ?? false
      );
    }

    if (filters.cost) {
      filtered = filtered.filter((loc) => {
        const cost = parseInt(loc.economy?.costOfLiving || '100');
        if (filters.cost === 'Low') return cost < 90;
        if (filters.cost === 'Medium') return cost >= 90 && cost <= 110;
        if (filters.cost === 'High') return cost > 110;
        return true;
      });
    }

    if (filters.tax === '0') {
      filtered = filtered.filter((loc) => loc.taxes?.incomeTax === 0);
    } else if (filters.tax === '1') {
      filtered = filtered.filter((loc) => (loc.taxes?.incomeTax ?? 0) > 0);
    }

    if (filters.firearms) {
      filtered = filtered.filter((loc) =>
        loc.firearms?.laws?.includes(filters.firearms)
      );
    }

    if (filters.marijuana) {
      filtered = filtered.filter((loc) =>
        loc.marijuana?.status?.includes(filters.marijuana)
      );
    }

    if (filters.vetBenefits) {
      filtered = filtered.filter((loc) => loc.vaFacilities);
    }

    setFilteredLocations(filtered);
  }, [filters, locations]);

  const clearFilters = () => {
    setFilters({
      climate: '',
      cost: '',
      tax: '',
      firearms: '',
      marijuana: '',
      vetBenefits: false,
    });
  };

  const getCityUrl = (location: Location) => {
    return `/${location.state.toLowerCase()}/${location.city.toLowerCase().replace(/\s+/g, '')}`;
  };

  if (loading) {
    return (
      <div className="loading" style={{ padding: '4rem', textAlign: 'center' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
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
            <Link href="/quiz" className="bubble-choice">
              somewhere with mild winters
            </Link>
            <Link href="/quiz" className="bubble-choice">
              near the ocean
            </Link>
            <Link href="/quiz" className="bubble-choice">
              snow adventures
            </Link>
            <Link href="/quiz" className="bubble-choice">
              year-round warmth
            </Link>
            <Link href="/quiz" className="bubble-choice">
              in a low-tax state
            </Link>
            <Link href="/quiz" className="bubble-choice">
              in the mountains
            </Link>
            <Link href="/quiz" className="bubble-choice">
              affordable fuel
            </Link>
          </div>
        </div>
      </div>

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
                <Link
                  key={location.id}
                  href={getCityUrl(location)}
                  className="city-card"
                >
                  <div className="city-card-header">
                    <h3>{location.city}</h3>
                    <span className="state-abbr">{location.state}</span>
                  </div>
                  <div className="city-card-body">
                    <div className="city-stats">
                      {location.climate?.type && (
                        <div className="stat">
                          <i className="fas fa-thermometer-half"></i>
                          <span>{location.climate.type}</span>
                        </div>
                      )}
                      {location.economy?.costOfLiving && (
                        <div className="stat">
                          <i className="fas fa-dollar-sign"></i>
                          <span>COL: {location.economy.costOfLiving}</span>
                        </div>
                      )}
                      {location.taxes?.incomeTax === 0 && (
                        <div className="stat highlight">
                          <i className="fas fa-hand-holding-usd"></i>
                          <span>No Income Tax</span>
                        </div>
                      )}
                      {location.vaFacilities && (
                        <div className="stat highlight">
                          <i className="fas fa-hospital"></i>
                          <span>VA Clinic</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        ) : (
          <div className="cities-table-wrapper">
            <table className="cities-table">
              <thead>
                <tr>
                  <th>City</th>
                  <th>State</th>
                  <th>Population</th>
                  <th>Cost of Living</th>
                  <th>Income Tax</th>
                  <th>Climate</th>
                  <th>VA Clinic</th>
                </tr>
              </thead>
              <tbody>
                {filteredLocations.map((location) => (
                  <tr key={location.id}>
                    <td>
                      <Link href={getCityUrl(location)}>{location.city}</Link>
                    </td>
                    <td>{location.state}</td>
                    <td>{location.population?.toLocaleString() ?? 'N/A'}</td>
                    <td>{location.economy?.costOfLiving ?? 'N/A'}</td>
                    <td>{location.taxes?.incomeTax ?? 'N/A'}%</td>
                    <td>{location.climate?.type ?? 'N/A'}</td>
                    <td>{location.vaFacilities ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

