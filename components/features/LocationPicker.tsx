'use client';

import { useEffect, useState, useRef } from 'react';
import { MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import dynamic from 'next/dynamic';

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

interface LocationPickerProps {
  city: string;
  address?: string;
  lat?: number;
  lng?: number;
  onChange: (location: { city: string; address?: string; lat: number; lng: number; region: string }) => void;
  required?: boolean;
}

const defaultCenter: [number, number] = [11.8636, -15.5974]; // Bissau, Guinea-Bissau
const defaultZoom = 13;

const cities: { name: string; coords: [number, number]; region: string }[] = [
  { name: 'Bissau', coords: [11.8636, -15.5974], region: 'Bissau' },
  { name: 'Bafatá', coords: [12.1667, -14.6667], region: 'Bafatá' },
  { name: 'Gabú', coords: [12.2833, -14.2167], region: 'Gabú' },
  { name: 'Bissorã', coords: [12.2167, -15.45], region: 'Oio' },
  { name: 'Bolama', coords: [11.5833, -15.4833], region: 'Bolama' },
  { name: 'Cacheu', coords: [12.2667, -16.1667], region: 'Cacheu' },
  { name: 'Canchungo', coords: [12.0667, -16.0333], region: 'Cacheu' },
  { name: 'Catió', coords: [11.2833, -15.25], region: 'Tombali' },
  { name: 'Farim', coords: [12.4833, -15.2167], region: 'Oio' },
  { name: 'Mansôa', coords: [12.1167, -15.3167], region: 'Oio' },
  { name: 'Quinhámel', coords: [11.8833, -15.85], region: 'Biombo' },
];

export function LocationPicker({
  city: initialCity,
  address: initialAddress,
  lat: initialLat,
  lng: initialLng,
  onChange,
  required = false,
}: LocationPickerProps) {
  const [city, setCity] = useState(initialCity || '');
  const [address, setAddress] = useState(initialAddress || '');
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    // Find city coordinates if city is set
    if (city && !position) {
      const cityData = cities.find((c) => c.name.toLowerCase() === city.toLowerCase());
      if (cityData) {
        setMapCenter(cityData.coords);
        setPosition(cityData.coords);
      }
    } else if (position) {
      setMapCenter(position);
    }
  }, [city, position]);

  const handleMapClick = (e: any) => {
    const { lat, lng } = e.latlng;
    const newPosition: [number, number] = [lat, lng];
    setPosition(newPosition);
    
    // Reverse geocoding simple (approximatif)
    const cityData = cities.find((c) => {
      const distance = Math.sqrt(
        Math.pow(c.coords[0] - lat, 2) + Math.pow(c.coords[1] - lng, 2)
      );
      return distance < 0.5; // Within ~50km
    });

    const selectedCity = cityData?.name || city || 'Bissau';
    const region = cityData?.region || 'Bissau';

    onChange({
      city: selectedCity,
      address,
      lat,
      lng,
      region,
    });
  };

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setSearchQuery('');
    const cityData = cities.find((c) => c.name === selectedCity);
    if (cityData) {
      setPosition(cityData.coords);
      setMapCenter(cityData.coords);
      onChange({
        city: selectedCity,
        address,
        lat: cityData.coords[0],
        lng: cityData.coords[1],
        region: cityData.region,
      });
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPosition: [number, number] = [latitude, longitude];
          setPosition(newPosition);
          setMapCenter(newPosition);

          // Find nearest city
          let nearestCity = cities[0];
          let minDistance = Infinity;
          cities.forEach((c) => {
            const distance = Math.sqrt(
              Math.pow(c.coords[0] - latitude, 2) + Math.pow(c.coords[1] - longitude, 2)
            );
            if (distance < minDistance) {
              minDistance = distance;
              nearestCity = c;
            }
          });

          setCity(nearestCity.name);
          onChange({
            city: nearestCity.name,
            address,
            lat: latitude,
            lng: longitude,
            region: nearestCity.region,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Impossible d\'obtenir votre localisation. Veuillez sélectionner manuellement sur la carte.');
        }
      );
    } else {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
    }
  };

  const filteredCities = searchQuery
    ? cities.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : cities;

  return (
    <div className="space-y-4">
      {/* Search and city selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Ville *</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={searchQuery || city}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchQuery('')}
            placeholder="Rechercher une ville..."
            className="pl-10"
            required={required}
          />
          {searchQuery && filteredCities.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredCities.map((cityOption) => (
                <button
                  key={cityOption.name}
                  type="button"
                  onClick={() => handleCitySelect(cityOption.name)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  {cityOption.name} ({cityOption.region})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Adresse (optionnel)</label>
        <Input
          value={address}
          onChange={(e) => {
            const newAddress = e.target.value;
            setAddress(newAddress);
            if (position) {
              onChange({
                city,
                address: newAddress,
                lat: position[0],
                lng: position[1],
                region: cities.find((c) => c.name === city)?.region || 'Bissau',
              });
            }
          }}
          placeholder="Rue, quartier..."
        />
      </div>

      {/* Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Localisation sur la carte</label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUseCurrentLocation}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Ma position
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="h-[400px] w-full relative">
              {typeof window !== 'undefined' && (
                <MapContainer
                  center={mapCenter}
                  zoom={defaultZoom}
                  style={{ height: '100%', width: '100%', zIndex: 0 }}
                  onClick={handleMapClick}
                  ref={mapRef}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {position && (
                    <Marker position={position}>
                      <Popup>
                        <div>
                          <p className="font-semibold">{city || 'Localisation sélectionnée'}</p>
                          {address && <p className="text-xs text-gray-500">{address}</p>}
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              )}
              {typeof window === 'undefined' && (
                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                  <p className="text-gray-500">Chargement de la carte...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <p className="text-xs text-gray-500">
          Cliquez sur la carte pour sélectionner la localisation précise
        </p>
        {position && (
          <p className="text-xs text-gray-600">
            Coordonnées: {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </p>
        )}
      </div>
    </div>
  );
}

