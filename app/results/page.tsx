'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Location {
  id: number;
  state: string;
  city: string;
  matchScore?: number;
  economy?: { costOfLiving?: string };
  taxes?: { incomeTax?: number };
  climate?: { type?: string };
  vaFacilities?: boolean;
  firearms?: { laws?: string };
  marijuana?: { status?: string };
  veteranBenefits?: any;
  crime?: { totalIndex?: number };
}

export default function ResultsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resultsData = sessionStorage.getItem('quizResults');
    if (resultsData) {
      const data = JSON.parse(resultsData);
      setLocations(data.locations || []);
    }
    setLoading(false);
  }, []);

  const getCityUrl = (location: Location) => {
    return `/${location.state.toLowerCase()}/${location.city.toLowerCase().replace(/\s+/g, '')}`;
  };

  if (loading) {
    return (
      <div className="loading" style={{ padding: '4rem', textAlign: 'center' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
        <p>Loading results...</p>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="results-container">
        <div className="results-header">
          <h1>No Results</h1>
          <p>Please take the quiz first to see your matches.</p>
          <Link href="/quiz" className="refine-button">
            <i className="fas fa-clipboard-list"></i>
            <span>Take Quiz</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <h1>Your Retirement Matches</h1>
        <p>Based on your preferences, here are the top locations we recommend for your retirement.</p>
        <Link href="/quiz" className="refine-button">
          <i className="fas fa-redo"></i>
          <span>Retake Quiz</span>
        </Link>
      </div>

      <div className="results-grid">
        {locations.map((location) => (
          <div key={location.id} className="location-card">
            <div className="location-header">
              <h3>{location.city}, {location.state}</h3>
              <div className="match-score">
                <span className="score">{location.matchScore || 0}%</span>
                <span className="label">Match</span>
              </div>
            </div>
            <div className="location-details">
              {location.taxes?.incomeTax === 0 && (
                <div className="detail-item">
                  <i className="fas fa-dollar-sign"></i>
                  <span>No state income tax</span>
                </div>
              )}
              {location.climate?.type && (
                <div className="detail-item">
                  <i className="fas fa-thermometer-half"></i>
                  <span>{location.climate.type} climate</span>
                </div>
              )}
              {location.veteranBenefits && (
                <div className="detail-item">
                  <i className="fas fa-star"></i>
                  <span>Veteran benefits available</span>
                </div>
              )}
              {location.vaFacilities && (
                <div className="detail-item">
                  <i className="fas fa-hospital"></i>
                  <span>VA facilities nearby</span>
                </div>
              )}
              {(location.firearms?.laws === 'Constitutional Carry' ||
                location.firearms?.laws === 'Constitutional carry') && (
                <div className="detail-item">
                  <i className="fas fa-shield-alt"></i>
                  <span>Constitutional carry</span>
                </div>
              )}
              {location.marijuana?.status && (
                <div className="detail-item">
                  <i className="fas fa-leaf"></i>
                  <span>{location.marijuana.status} marijuana</span>
                </div>
              )}
            </div>
            <div className="location-stats">
              {location.economy?.costOfLiving && (
                <div className="stat">
                  <span className="stat-label">
                    Cost of Living ({location.economy.costOfLiving})
                  </span>
                  <div className="stat-bar">
                    <div
                      className="stat-fill"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, (150 - parseFloat(location.economy.costOfLiving)) * 2)
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
              {location.crime?.totalIndex !== undefined && (
                <div className="stat">
                  <span className="stat-label">Safety Score</span>
                  <div className="stat-bar">
                    <div
                      className="stat-fill"
                      style={{
                        width: `${Math.max(0, Math.min(100, 100 - location.crime.totalIndex * 10))}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            <Link href={getCityUrl(location)} className="learn-more-btn">
              Learn More
              <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

