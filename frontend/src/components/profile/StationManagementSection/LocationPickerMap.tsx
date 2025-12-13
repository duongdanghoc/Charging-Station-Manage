"use client";

import React, { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix icon mặc định của Leaflet bị lỗi khi build
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface LocationPickerMapProps {
    lat: number;
    lng: number;
    onChange: (lat: number, lng: number) => void;
}

const LocationPickerMap: React.FC<LocationPickerMapProps> = ({ lat, lng, onChange }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    // Khởi tạo bản đồ (chỉ chạy 1 lần)
    useEffect(() => {
        if (!mapRef.current || leafletMapRef.current) return;

        // Center mặc định nếu chưa có tọa độ hợp lệ (lấy Hà Nội)
        const initialLat = lat || 21.0227;
        const initialLng = lng || 105.8194;

        const map = L.map(mapRef.current).setView([initialLat, initialLng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Tạo Marker có thể kéo thả (Draggable)
        const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);

        // Sự kiện khi kéo marker xong
        marker.on('dragend', function (event) {
            const marker = event.target;
            const position = marker.getLatLng();
            onChange(position.lat, position.lng);
        });

        // Sự kiện click vào bản đồ để di chuyển marker
        map.on('click', function (e) {
            marker.setLatLng(e.latlng);
            onChange(e.latlng.lat, e.latlng.lng);
        });

        leafletMapRef.current = map;
        markerRef.current = marker;

        // Cleanup khi component unmount
        return () => {
            if (leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
                markerRef.current = null;
            }
        };
    }, []); // Empty dependency array -> Run once on mount

    // Cập nhật vị trí Marker khi props lat/lng thay đổi từ bên ngoài (ví dụ người dùng gõ số vào input)
    useEffect(() => {
        if (leafletMapRef.current && markerRef.current) {
            const currentLatLng = markerRef.current.getLatLng();

            // Chỉ cập nhật nếu tọa độ thực sự khác biệt (tránh vòng lặp vô tận)
            // Sử dụng sai số nhỏ epsilon để so sánh số thực
            const epsilon = 0.000001;
            if (Math.abs(currentLatLng.lat - lat) > epsilon || Math.abs(currentLatLng.lng - lng) > epsilon) {
                const newLatLng = new L.LatLng(lat, lng);
                markerRef.current.setLatLng(newLatLng);
                leafletMapRef.current.panTo(newLatLng);
            }
        }
    }, [lat, lng]);

    // Khi Modal mở ra, kích thước container thay đổi, cần gọi invalidateSize
    useEffect(() => {
        const timer = setTimeout(() => {
            if (leafletMapRef.current) {
                leafletMapRef.current.invalidateSize();
            }
        }, 200); // Delay để đợi Modal animation xong
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative w-full h-full rounded-md overflow-hidden border border-gray-300">
            <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '300px' }} />
            <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 text-xs rounded shadow z-[1000] pointer-events-none">
                Click hoặc kéo Marker để chọn vị trí
            </div>
        </div>
    );
};

export default LocationPickerMap;
