import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import polyline from '@mapbox/polyline';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom icon factory function
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const MapView = ({ route }) => {
  const decodedPath = polyline.decode(route.path);
  const positions = decodedPath.map(([lat, lng]) => [lat, lng]);

  // Extract locations from the route
  const { current, pickup, dropoff } = route.locations || {};
  const markers = [
    current && {
      position: [current.lat, current.lon],
      label: 'Start (Current)',
      color: 'green',
    },
    pickup && {
      position: [pickup.lat, pickup.lon],
      label: 'Pickup',
      color: 'yellow',
    },
    dropoff && {
      position: [dropoff.lat, dropoff.lon],
      label: 'Drop-off',
      color: 'blue',
    },
  ].filter(Boolean);

  // Calculate bounds to include both polyline and markers
  const allPoints = [
    ...positions,
    ...markers.map((marker) => marker.position),
  ];
  const bounds = allPoints.length > 0 ? L.latLngBounds(allPoints) : null;

  return bounds ? (
    <div className="w-full">
      <MapContainer
        bounds={bounds}
        scrollWheelZoom={false}
        className="h-[400px] w-full rounded-md"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={positions} color="blue" />
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={marker.position}
            icon={createCustomIcon(marker.color)}
          >
            <Popup>{marker.label}</Popup>
          </Marker>
        ))}
      </MapContainer>
      {/* Legend/Key */}
      <div className="mt-2 flex justify-center space-x-4 text-sm text-white bg-gray-800 p-2 rounded-md">
        {markers.map((marker, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded-full border-2 border-white"
              style={{ backgroundColor: marker.color }}
            ></div>
            <span>{marker.label}</span>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <p className="text-red-500">Unable to display route</p>
  );
};

export default MapView;
