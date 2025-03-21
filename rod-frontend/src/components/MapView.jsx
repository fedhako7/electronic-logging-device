import React from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import polyline from '@mapbox/polyline';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

const MapView = ({ route }) => {
  const decodedPath = polyline.decode(route.path);
  const positions = decodedPath.map(([lat, lng]) => [lat, lng]);
  return positions.length ? (
    <MapContainer bounds={positions} className="h-[400px] w-full rounded-md">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Polyline positions={positions} color="blue" />
    </MapContainer>
  ) : (
    <p className="text-red-500">Unable to display route</p>
  );
};

export default MapView;
