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

export default function WarmWintersPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [minTemp, setMinTemp] = useState(40);

  useEffect(() => {
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        setLocations(data.locations);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading locations:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Filter cities where average low winter is above the threshold
    const filtered = locations.filter((loc) => {
      const avgLowWinter = loc.climate?.avgLowWinter ?? -999;
      return avgLowWinter >= minTemp;
    });

    // Sort by warmest winters first
    filtered.sort((a, b) => {
      const tempA = a.climate?.avgLowWinter ?? -999;
      const tempB = b.climate?.avgLowWinter ?? -999;
      return tempB - tempA;
    });

    setFilteredLocations(filtered);
  }, [locations, minTemp]);

  const getCityUrl = (location: Location) => {
    return `/${location.state.toLowerCase()}/${location.city.toLowerCase().replace(/\s+/g, '')}`;
  };

  const getWinterDescription = (temp: number) => {
    if (temp >= 60) return { text: 'Tropical Winter', color: '#f97316' };
    if (temp >= 50) return { text: 'Very Mild Winter', color: '#fb923c' };
    if (temp >= 40) return { text: 'Mild Winter', color: '#fdba74' };
    return { text: 'Cool Winter', color: '#94a3b8' };
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
      <div className="hero-header" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}>
        <h1>Cities with Warm Winters</h1>
        <p style={{ fontSize: '1.1rem', marginTop: '1rem', opacity: 0.95 }}>
          Escape the cold! Discover retirement cities where winter stays comfortable.
        </p>

        <div className="hero-card" style={{ marginTop: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Minimum Winter Low Temperature: {minTemp}°F
            </label>
            <input
              type="range"
              min="20"
              max="70"
              value={minTemp}
              onChange={(e) => setMinTemp(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f59e0b' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginTop: '0.5rem', color: '#666' }}>
              <span>20°F</span>
              <span>45°F</span>
              <span>70°F</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>
          Found {filteredLocations.length} {filteredLocations.length === 1 ? 'city' : 'cities'} with winter lows above {minTemp}°F
        </div>
      </div>

      <div className="cities-container" style={{ marginTop: '2rem' }}>
        <div className="cities-grid">
          {filteredLocations.length === 0 ? (
            <div className="no-results">
              <i className="fas fa-thermometer-empty"></i>
              <h3>No cities match this temperature</h3>
              <p>Try lowering the minimum temperature</p>
            </div>
          ) : (
            filteredLocations.map((location) => {
              const winterTemp = location.climate?.avgLowWinter ?? 0;
              const winterDesc = getWinterDescription(winterTemp);

              return (
                <div key={location.id} className="city-card">
                  <div className="city-card-header">
                    {location.governor?.party && (
                      <span className="governor-badge">{location.governor.party}</span>
                    )}
                    <h3>{location.city}</h3>
                    <div className="state">{location.state}</div>
                  </div>
                  <div className="city-card-body">
                    <div
                      style={{
                        padding: '1rem',
                        background: `${winterDesc.color}20`,
                        borderLeft: `4px solid ${winterDesc.color}`,
                        borderRadius: '8px',
                        marginBottom: '1rem'
                      }}
                    >
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: winterDesc.color }}>
                        {winterTemp}°F
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                        Average Winter Low
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: winterDesc.color,
                        marginTop: '0.5rem'
                      }}>
                        {winterDesc.text}
                      </div>
                    </div>

                    <div className="city-badges">
                      {location.climate?.type && (
                        <span className="badge">
                          <i className="fas fa-cloud-sun"></i> {location.climate.type}
                        </span>
                      )}
                      {location.climate?.avgSnowfallInches !== undefined && (
                        <span className="badge">
                          <i className="fas fa-snowflake"></i> {location.climate.avgSnowfallInches}" snow/year
                        </span>
                      )}
                      {location.taxes?.incomeTax === 0 && (
                        <span className="badge highlight">
                          <i className="fas fa-dollar-sign"></i> No Income Tax
                        </span>
                      )}
                    </div>

                    <div className="city-stats">
                      <div className="stat-item">
                        <span className="label">Summer High</span>
                        <span className="value">{location.climate?.avgHighSummer || 'N/A'}°</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Cost of Living</span>
                        <span className="value">{location.economy?.costOfLiving || 'N/A'}</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Rainfall</span>
                        <span className="value">{location.climate?.avgRainfallInches || 0}"</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Gas Price</span>
                        <span className="value">{location.economy?.avgGasPrice || 'N/A'}</span>
                      </div>
                    </div>

                    {location.veteranBenefits && (
                      <div className="badge highlight" style={{ marginTop: 'var(--spacing-md)', width: '100%' }}>
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
              );
            })
          )}
        </div>
      </div>

      <div style={{
        maxWidth: '800px',
        margin: '3rem auto',
        padding: '2rem',
        background: '#f8fafc',
        borderRadius: '12px'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>About Warm Winter Cities</h2>
        <p style={{ lineHeight: '1.6', color: '#475569' }}>
          These retirement destinations offer mild winters where you can enjoy outdoor activities year-round
          without worrying about harsh cold, heavy snow, or icy conditions. A winter low temperature above 40°F
          typically means you'll rarely see freezing temperatures, making these cities ideal for retirees who
          want to escape harsh winters while enjoying lower costs of living than traditional warm-weather
          retirement destinations.
        </p>
      </div>
    </>
  );
}
