import { database } from '@/lib/database';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    state: string;
    city: string;
  };
}

export default async function CityPage({ params }: PageProps) {
  const { state, city } = params;
  
  // Decode and format the city name (remove spaces from URL)
  const formattedCity = city.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  const location = await database.getLocationByStateCity(state, formattedCity);

  if (!location) {
    notFound();
  }

  return (
    <div className="city-detail-container">
      <div className="city-header-section">
        <div className="breadcrumb">
          <Link href="/">
            <i className="fas fa-home"></i> Home
          </Link>
          <span className="separator">/</span>
          <span>{location.state}</span>
          <span className="separator">/</span>
          <span>{location.city}</span>
        </div>

        <div className="city-hero">
          <div className="city-hero-content">
            <h1>
              {location.city}, {location.state}
            </h1>
            <p className="city-subtitle">{location.county} County</p>
            <div className="city-hero-badges">
              {location.stateParty === 'R' && <span className="party-badge red">Red State</span>}
              {location.stateParty === 'D' && <span className="party-badge blue">Blue State</span>}
              {location.vaFacilities && (
                <span className="va-badge">
                  <i className="fas fa-hospital"></i> VA Clinic Available
                </span>
              )}
              {location.tech?.hubPresent && (
                <span className="tech-badge">
                  <i className="fas fa-laptop-code"></i> Tech Hub
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="city-content">
        {/* Quick Stats Overview */}
        <section className="quick-stats">
          <h2>Quick Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Population</span>
                <span className="stat-value">
                  {location.population ? location.population.toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Cost of Living</span>
                <span className="stat-value">{location.economy?.costOfLiving || 'N/A'}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Crime Index</span>
                <span className="stat-value">{location.crime?.totalIndex ?? 'N/A'}</span>
                <span className="stat-note">Lower is safer</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-thermometer-half"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Climate</span>
                <span className="stat-value">{location.climate?.type || 'N/A'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Politics & Governance */}
        <section className="detail-section">
          <h2>
            <i className="fas fa-landmark"></i> Politics & Governance
          </h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">State Party</span>
              <span className="detail-value">
                {location.stateParty === 'R' && <span className="party-badge red">Republican</span>}
                {location.stateParty === 'D' && <span className="party-badge blue">Democratic</span>}
                {!location.stateParty && 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Governor</span>
              <span className="detail-value">{location.politics?.governor || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Mayor</span>
              <span className="detail-value">{location.politics?.mayor || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Election Trend</span>
              <span className="detail-value">{location.politics?.trend || 'N/A'}</span>
            </div>
          </div>
        </section>

        {/* Taxes & Economy */}
        <section className="detail-section">
          <h2>
            <i className="fas fa-money-bill-wave"></i> Taxes & Economy
          </h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Sales Tax</span>
              <span className="detail-value">{location.taxes?.salesTax || 0}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Income Tax</span>
              <span className="detail-value">
                {location.taxes?.incomeTax === 0 ? (
                  <span className="highlight-text">No Income Tax!</span>
                ) : (
                  `${location.taxes?.incomeTax || 'N/A'}%`
                )}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Cost of Living Index</span>
              <span className="detail-value">{location.economy?.costOfLiving || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Average Gas Price</span>
              <span className="detail-value">
                {location.economy?.avgGasPrice ? `$${location.economy.avgGasPrice}` : 'N/A'}
              </span>
            </div>
          </div>
        </section>

        {/* Climate */}
        <section className="detail-section">
          <h2>
            <i className="fas fa-cloud-sun"></i> Climate
          </h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Climate Type</span>
              <span className="detail-value">{location.climate?.type || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Summer High (Avg)</span>
              <span className="detail-value">
                {location.climate?.avgHighSummer ? `${location.climate.avgHighSummer}°F` : 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Winter Low (Avg)</span>
              <span className="detail-value">
                {location.climate?.avgLowWinter ? `${location.climate.avgLowWinter}°F` : 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Sunny Days/Year</span>
              <span className="detail-value">{location.climate?.sunnyDays || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Annual Rainfall</span>
              <span className="detail-value">
                {location.climate?.avgRainfallInches ? `${location.climate.avgRainfallInches}″` : 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Annual Snowfall</span>
              <span className="detail-value">
                {location.climate?.avgSnowfallInches ? `${location.climate.avgSnowfallInches}″` : 'N/A'}
              </span>
            </div>
          </div>
        </section>

        {/* Laws & Regulations */}
        <section className="detail-section">
          <h2>
            <i className="fas fa-balance-scale"></i> Laws & Regulations
          </h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Firearms Laws</span>
              <span className="detail-value">{location.firearms?.laws || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Marijuana Status</span>
              <span className="detail-value">{location.marijuana?.status || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">LGBTQ+ Friendliness Rank</span>
              <span className="detail-value">
                {location.lgbtq?.rank ? `#${location.lgbtq.rank}` : 'N/A'}
              </span>
            </div>
          </div>
        </section>

        {/* Veteran Services */}
        <section className="detail-section">
          <h2>
            <i className="fas fa-star"></i> Veteran Services
          </h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">VA Facilities Nearby</span>
              <span className="detail-value">{location.vaFacilities ? 'Yes' : 'No'}</span>
            </div>
            {location.nearestVA && (
              <div className="detail-item">
                <span className="detail-label">Nearest VA</span>
                <span className="detail-value">{location.nearestVA}</span>
              </div>
            )}
            {location.distanceToVA && (
              <div className="detail-item">
                <span className="detail-label">Distance to VA</span>
                <span className="detail-value">{location.distanceToVA}</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

