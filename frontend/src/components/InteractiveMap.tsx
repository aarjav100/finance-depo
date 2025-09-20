import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon, LatLngTuple } from 'leaflet';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different location types
const createCustomIcon = (color: string) => new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="${color}" stroke="#fff" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0zm0 17c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z"/>
    </svg>
  `)}`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

const locationIcons = {
  home: createCustomIcon('#3b82f6'), // blue
  work: createCustomIcon('#8b5cf6'), // purple
  restaurant: createCustomIcon('#10b981'), // green
  shopping: createCustomIcon('#f59e0b'), // orange
  gas_station: createCustomIcon('#eab308'), // yellow
  entertainment: createCustomIcon('#ec4899'), // pink
  other: createCustomIcon('#6b7280'), // gray
};

interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'home' | 'work' | 'restaurant' | 'shopping' | 'gas_station' | 'entertainment' | 'other';
  category: string;
  averageSpending?: number;
  visitCount: number;
  lastVisited: Date;
  isFavorite: boolean;
}

interface InteractiveMapProps {
  locations: Location[];
  currentLocation?: { lat: number; lng: number };
  onLocationSelect?: (location: Location) => void;
  onMapClick?: (lat: number, lng: number) => void;
  height?: string;
  className?: string;
}

// Component to handle map click events
function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export function InteractiveMap({
  locations,
  currentLocation,
  onLocationSelect,
  onMapClick,
  height = '400px',
  className = ''
}: InteractiveMapProps) {
  const [mapCenter, setMapCenter] = useState<LatLngTuple>([40.7128, -74.0060]); // Default to NYC
  const [mapKey, setMapKey] = useState(0);

  // Update map center when current location changes
  useEffect(() => {
    if (currentLocation) {
      setMapCenter([currentLocation.lat, currentLocation.lng]);
      setMapKey(prev => prev + 1); // Force map re-render
    }
  }, [currentLocation]);

  // Calculate bounds to fit all locations
  const getMapBounds = () => {
    if (locations.length === 0) return null;
    
    const lats = locations.map(loc => loc.latitude);
    const lngs = locations.map(loc => loc.longitude);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    return [[minLat, minLng], [maxLat, maxLng]] as [[number, number], [number, number]];
  };

  const bounds = getMapBounds();

  const handleLocationClick = (location: Location) => {
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  const formatAmount = (amount?: number) => {
    return amount ? `$${amount.toFixed(2)}` : 'N/A';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <MapContainer
        key={mapKey}
        center={mapCenter}
        zoom={13}
        bounds={bounds || undefined}
        boundsOptions={{ padding: [20, 20] }}
        className="h-full w-full rounded-lg"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Current location marker */}
        {currentLocation && (
          <Marker
            position={[currentLocation.lat, currentLocation.lng]}
            icon={new Icon({
              iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="15" cy="15" r="12" fill="#ef4444" stroke="#fff" stroke-width="3"/>
                  <circle cx="15" cy="15" r="6" fill="#fff"/>
                </svg>
              `),
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            })}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold text-red-600">Your Location</h3>
                <p className="text-sm text-gray-600">
                  {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Location markers */}
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={locationIcons[location.type]}
            eventHandlers={{
              click: () => handleLocationClick(location),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    location.type === 'home' ? 'bg-blue-500' :
                    location.type === 'work' ? 'bg-purple-500' :
                    location.type === 'restaurant' ? 'bg-green-500' :
                    location.type === 'shopping' ? 'bg-orange-500' :
                    location.type === 'gas_station' ? 'bg-yellow-500' :
                    location.type === 'entertainment' ? 'bg-pink-500' :
                    'bg-gray-500'
                  }`} />
                  <h3 className="font-semibold text-gray-900">{location.name}</h3>
                  {location.isFavorite && (
                    <span className="text-yellow-500">⭐</span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                <p className="text-xs text-gray-500 mb-1">
                  <strong>Category:</strong> {location.category}
                </p>
                
                {location.averageSpending && location.averageSpending > 0 && (
                  <p className="text-xs text-gray-500 mb-1">
                    <strong>Avg. Spending:</strong> {formatAmount(location.averageSpending)}
                  </p>
                )}
                
                <p className="text-xs text-gray-500 mb-1">
                  <strong>Visits:</strong> {location.visitCount}
                </p>
                
                <p className="text-xs text-gray-500">
                  <strong>Last Visit:</strong> {formatDate(location.lastVisited)}
                </p>
                
                <button
                  onClick={() => handleLocationClick(location)}
                  className="mt-2 w-full px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Map click handler */}
        <MapClickHandler onMapClick={onMapClick} />
      </MapContainer>
    </div>
  );
}
