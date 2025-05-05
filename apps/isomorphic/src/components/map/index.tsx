import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PinMap from 'public/images/map-pin.png';

const DefaultIcon = L.icon({
   iconUrl: PinMap.src,
   iconSize: [25, 41],
   iconAnchor: [12, 41],
   popupAnchor: [1, -34],
   shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const Map = ({
   initialLatitude,
   initialLongitude,
   onPositionChange,
}: {
   initialLatitude: number;
   initialLongitude: number;
   onPositionChange: (lat: number, lng: number) => void;
}) => {
   const [position, setPosition] = useState<[number, number]>([initialLatitude, initialLongitude]);

   const handleMarkerDrag = (event: any) => {
      const { lat, lng } = event.target?.getLatLng();
      setPosition([lat, lng]);
      onPositionChange(lat, lng);
   };

   return (
      <MapContainer center={position} zoom={16} className="h-64 w-full">
         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
         <Marker position={position} draggable={true} eventHandlers={{ dragend: handleMarkerDrag }}>
            <Popup>
               Localização: {position[0]}, {position[1]}
            </Popup>
         </Marker>
      </MapContainer>
   );
};

export default Map;
