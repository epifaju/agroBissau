'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Fix Leaflet default icon issue
if (typeof window !== 'undefined') {
  const L = require('leaflet');
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

interface ListingMapProps {
  location: {
    city?: string;
    address?: string;
    lat?: number;
    lng?: number;
  };
  title?: string;
  height?: string;
}

const defaultCenter: [number, number] = [11.8636, -15.5974]; // Bissau

export function ListingMap({
  location,
  title,
  height = '300px',
}: ListingMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);

  useEffect(() => {
    if (location.lat && location.lng) {
      const coords: [number, number] = [location.lat, location.lng];
      setPosition(coords);
      setMapCenter(coords);
    } else if (location.city) {
      // Try to find city coordinates
      const cities: { name: string; coords: [number, number] }[] = [
        { name: 'Bissau', coords: [11.8636, -15.5974] },
        { name: 'Bafatá', coords: [12.1667, -14.6667] },
        { name: 'Gabú', coords: [12.2833, -14.2167] },
        { name: 'Bissorã', coords: [12.2167, -15.45] },
        { name: 'Bolama', coords: [11.5833, -15.4833] },
        { name: 'Cacheu', coords: [12.2667, -16.1667] },
        { name: 'Canchungo', coords: [12.0667, -16.0333] },
        { name: 'Catió', coords: [11.2833, -15.25] },
        { name: 'Farim', coords: [12.4833, -15.2167] },
        { name: 'Mansôa', coords: [12.1167, -15.3167] },
        { name: 'Quinhámel', coords: [11.8833, -15.85] },
      ];

      const cityData = cities.find(
        (c) => c.name.toLowerCase() === location.city?.toLowerCase()
      );
      if (cityData) {
        setMapCenter(cityData.coords);
        setPosition(cityData.coords);
      }
    }
  }, [location]);

  if (!position) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-5 h-5" />
            <div>
              <p className="font-semibold">{location.city || 'Localisation non spécifiée'}</p>
              {location.address && <p className="text-sm">{location.address}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative" style={{ height }}>
          {typeof window !== 'undefined' && (
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%', zIndex: 0 }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position}>
                <Popup>
                  <div>
                    {title && <p className="font-semibold mb-1">{title}</p>}
                    <p className="text-sm">{location.city || 'Localisation'}</p>
                    {location.address && (
                      <p className="text-xs text-gray-600">{location.address}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          )}
          {typeof window === 'undefined' && (
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
              <p className="text-gray-500">Chargement de la carte...</p>
            </div>
          )}
        </div>
        <div className="p-4 border-t">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-5 h-5" />
            <div>
              <p className="font-semibold">{location.city || 'Localisation'}</p>
              {location.address && <p className="text-sm">{location.address}</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

