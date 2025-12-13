import { useState } from 'react';
import { toast } from "sonner";
import {
  Zap,
  MapPin,
  Activity,
  Power,
  Eye,
  BatteryCharging
} from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Interface giả lập (Thay bằng type thật từ API của bạn)
interface Station {
    id: number;
    name: string;
    address: string;
    ports: number;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
    revenue: number;
    lastCheck: string;
}

// Mock Data (Thay bằng API call thật: useGetStationsQuery)
const MOCK_STATIONS: Station[] = [
    { id: 1, name: "Trạm Vincom Đồng Khởi", address: "72 Lê Thánh Tôn, Q1", ports: 10, status: 'ACTIVE', revenue: 15000000, lastCheck: "2024-05-20" },
    { id: 2, name: "Trạm Landmark 81", address: "208 Nguyễn Hữu Cảnh", ports: 20, status: 'MAINTENANCE', revenue: 0, lastCheck: "2024-05-18" },
    { id: 3, name: "Trạm Aeon Mall Bình Tân", address: "Số 1 đường 17A", ports: 8, status: 'INACTIVE', revenue: 5000000, lastCheck: "2024-05-19" },
];

export default  function StationManagement() {
    const [stations, setStations] = useState<Station[]>(MOCK_STATIONS);
    const [selectedStation, setSelectedStation] = useState<Station | null>(null); // Cho Modal chi tiết
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Chức năng: Kích hoạt / Vô hiệu hóa
    const toggleStatus = (id: number, currentStatus: string) => {
        // TODO: Gọi API update status thật ở đây
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

        // Cập nhật State giả lập
        setStations(prev => prev.map(s => s.id === id ? { ...s, status: newStatus as any } : s));

        toast.success(`Đã cập nhật trạng thái trạm #${id} thành ${newStatus}`);
    };

    const filteredStations = stations.filter(s => filterStatus === 'all' || s.status === filterStatus);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-500" /> Quản Lý Trạm Sạc
                </h2>
                <div className="flex gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[180px] bg-white">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                            <SelectItem value="INACTIVE">Vô hiệu hóa</SelectItem>
                            <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Danh sách trạm */}
            <div className="grid grid-cols-1 gap-4">
                {filteredStations.map((station) => (
                    <div key={station.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full ${station.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                <BatteryCharging className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{station.name}</h3>
                                <div className="flex items-center text-sm text-gray-500 mt-1 gap-4">
                                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {station.address}</span>
                                    <span className="flex items-center gap-1"><Zap className="w-4 h-4" /> {station.ports} Cổng sạc</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Badge Trạng thái */}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                station.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border border-green-200' :
                                station.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                                {station.status === 'ACTIVE' ? 'HOẠT ĐỘNG' : station.status === 'MAINTENANCE' ? 'BẢO TRÌ' : 'ĐÃ TẮT'}
                            </span>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedStation(station)}
                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    title="Xem chi tiết"
                                >
                                    <Eye className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => toggleStatus(station.id, station.status)}
                                    className={`p-2 rounded-lg transition ${
                                        station.status === 'ACTIVE'
                                        ? 'text-red-500 hover:bg-red-50'
                                        : 'text-green-500 hover:bg-green-50'
                                    }`}
                                    title={station.status === 'ACTIVE' ? "Vô hiệu hóa" : "Kích hoạt"}
                                >
                                    <Power className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Xem Chi Tiết Trạm */}
            {selectedStation && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold">{selectedStation.name}</h3>
                                <p className="text-blue-100 text-sm mt-1 flex items-center gap-1">
                                    <MapPin className="w-4 h-4" /> {selectedStation.address}
                                </p>
                            </div>
                            <button onClick={() => setSelectedStation(null)} className="text-white/80 hover:text-white">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 rounded-lg border">
                                    <div className="text-xs text-gray-500">Doanh thu tháng</div>
                                    <div className="font-bold text-gray-800">{selectedStation.revenue.toLocaleString()} VNĐ</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg border">
                                    <div className="text-xs text-gray-500">Số cổng sạc</div>
                                    <div className="font-bold text-gray-800">{selectedStation.ports} Ports</div>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Trạng thái kỹ thuật</label>
                                <div className="mt-1 flex items-center gap-2 text-sm text-gray-800">
                                    <Activity className="w-4 h-4 text-green-500" /> Kiểm tra lần cuối: {selectedStation.lastCheck}
                                </div>
                            </div>
                            <div className="pt-4 border-t flex justify-end gap-2">
                                <button
                                    onClick={() => setSelectedStation(null)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


