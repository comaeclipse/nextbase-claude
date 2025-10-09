'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Location {
  id: number;
  state: string;
  city: string;
  coordinates: { lat: number | null; lng: number | null };
  economy?: { costOfLiving?: string };
  vaFacilities?: boolean;
  firearms?: { laws?: string };
}

interface MapComponentProps {
  locations: Location[];
}

export default function MapComponent({ locations }: MapComponentProps) {
  useEffect(() => {
    // Initialize map
    const map = L.map('map').setView([39.8283, -98.5795], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Add markers for each location
    locations.forEach((location) => {
      if (location.coordinates?.lat && location.coordinates?.lng) {
        let markerColor = '#6366f1';
        let iconHtml = '<i class="fas fa-map-marker-alt"></i>';

        if (location.vaFacilities) {
          markerColor = '#14b8a6';
        } else if (
          location.firearms?.laws === 'Constitutional Carry' ||
          location.firearms?.laws === 'Constitutional carry'
        ) {
          markerColor = '#fbbf24';
        } else if (location.economy?.costOfLiving && parseFloat(location.economy.costOfLiving) < 90) {
          markerColor = '#f472b6';
        }

        const marker = L.circleMarker([location.coordinates.lat, location.coordinates.lng], {
          radius: 8,
          fillColor: markerColor,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.7,
        }).addTo(map);

        const cityUrl = `/${location.state.toLowerCase()}/${location.city.toLowerCase().replace(/\s+/g, '')}`;
        
        const popupContent = `
          <div class="marker-popup">
            <h3>${location.city}, ${location.state}</h3>
            <div class="popup-details">
              ${location.economy?.costOfLiving ? `<p><strong>Cost of Living:</strong> ${location.economy.costOfLiving}</p>` : ''}
              ${location.vaFacilities ? '<p><i class="fas fa-hospital"></i> VA Clinic Available</p>' : ''}
            </div>
            <a href="${cityUrl}" class="popup-link">View Details →</a>
          </div>
        `;

        marker.bindPopup(popupContent);
      }
    });

    // Fit bounds if we have locations
    if (locations.length > 0) {
      const bounds = locations
        .filter((loc) => loc.coordinates?.lat && loc.coordinates?.lng)
        .map((loc) => [loc.coordinates.lat!, loc.coordinates.lng!] as [number, number]);

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 4 });
      }
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      map.remove();
    };
  }, [locations]);

  return <div id="map" style={{ height: '600px', width: '100%', borderRadius: '1rem', border: '2px solid var(--border-color)' }}></div>;
}

