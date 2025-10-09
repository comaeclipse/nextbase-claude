'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import Leaflet dynamically to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
      <p>Loading map...</p>
    </div>
  ),
});

interface Location {
  id: number;
  state: string;
  city: string;
  coordinates: { lat: number | null; lng: number | null };
  economy?: { costOfLiving?: string };
  vaFacilities?: boolean;
  firearms?: { laws?: string };
}

export default function MapPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        setLocations(data.locations.filter((loc: Location) => loc.coordinates?.lat && loc.coordinates?.lng));
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading locations:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className="map-container">
      <div className="map-header">
        <h1>Retirement Cities Map</h1>
        <p>Explore veteran-friendly retirement locations across the United States</p>
      </div>

      <MapComponent locations={locations} />

      <div className="map-legend">
        <div className="legend-title">Legend</div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-marker legend-marker-teal"></div>
            <span>VA Clinic Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker legend-marker-amber"></div>
            <span>Constitutional Carry</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker legend-marker-rose"></div>
            <span>Affordable Living</span>
          </div>
        </div>
        <div className="legend-info">Click on markers to see city details</div>
      </div>
    </div>
  );
}

