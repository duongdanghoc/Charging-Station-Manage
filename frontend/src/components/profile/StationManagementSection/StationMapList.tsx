'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Station } from "@/lib/redux/services/stationApi";

// Fix icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface StationMapListProps {
    stations: Station[];
    onStationClick: (station: Station) => void;
}

const StationMapList: React.FC<StationMapListProps> = ({ stations, onStationClick }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    useEffect(() => {
        if (!mapRef.current) return;

        // Init Map if not exists
        if (!leafletMapRef.current) {
            leafletMapRef.current = L.map(mapRef.current).setView([21.0227, 105.8194], 12); // Default Hanoi
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(leafletMapRef.current);
        }

        const map = leafletMapRef.current;

        // Clear old markers
        markersRef.current.forEach(m => map.removeLayer(m));
        markersRef.current = [];

        // Add new markers
        const bounds = L.latLngBounds([]);

        stations.forEach(station => {
            if (station.latitude && station.longitude) {
                const marker = L.marker([station.latitude, station.longitude])
                    .addTo(map)
                    .bindTooltip(`<b>${station.name}</b><br/>${station.address}`, {
                        direction: 'top',
                        offset: [0, -20],
                        opacity: 0.9
                    });

                // Click marker -> Callback
                marker.on('click', () => onStationClick(station));

                markersRef.current.push(marker);
                bounds.extend([station.latitude, station.longitude]);
            }
        });

        // Fit bounds if markers exist
        if (markersRef.current.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }

        // Fix resize issue
        setTimeout(() => map.invalidateSize(), 200);

    }, [stations, onStationClick]);

    return (
        <div className="h-[600px] w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm relative">
            <div ref={mapRef} className="h-full w-full bg-gray-100" />

            {/* Legend / Note */}
            <div className="absolute top-4 right-4 bg-white p-3 rounded shadow-md z-[20] text-xs space-y-1">
                <div className="font-semibold mb-1">Chú thích</div>
                <div className="flex items-center gap-2">
                    <img src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png" className="h-4" />
                    <span>Vị trí trạm sạc</span>
                </div>
                <div className="text-gray-500 italic mt-1">Click vào marker để xem chi tiết</div>
            </div>
        </div>
    );
};

export default StationMapList;
