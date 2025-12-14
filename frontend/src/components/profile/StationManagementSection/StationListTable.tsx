'use client';

import React from "react";
import { Building2, Eye, MapPin, Pencil, Power, Trash2, WifiOff, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Station } from "@/lib/redux/services/stationApi";

interface StationListTableProps {
    stations: Station[];
    onViewDetail: (station: Station) => void;
    onEdit: (station: Station) => void;
    onDelete: (id: number) => void;
    onToggleStatus: (station: Station) => void;
    onManageConnectors: (station: Station) => void;
}

const StationListTable: React.FC<StationListTableProps> = ({
    stations,
    onViewDetail,
    onEdit,
    onDelete,
    onToggleStatus,
    onManageConnectors
}) => {
    
    // Đã xóa hàm getConnectorStats cũ vì không còn cần thiết

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                    <h3 className="text-base font-semibold text-gray-900">Danh sách trạm sạc</h3>
                    <p className="text-xs text-gray-500">
                        {stations.length} trạm được quản lý
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                        <tr>
                            <th className="px-6 py-3 font-medium">Tên trạm</th>
                            <th className="px-6 py-3 font-medium">Địa chỉ</th>
                            <th className="px-6 py-3 font-medium">Loại xe</th>
                            <th className="px-6 py-3 font-medium">Connectors</th>
                            <th className="px-6 py-3 font-medium">Trạng thái</th>
                            <th className="px-6 py-3 font-medium text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {stations.map((station) => {
                            return (
                            <tr key={station.id} className="hover:bg-gray-50/60">
                                <td className="px-6 py-3">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="size-4 text-gray-400" />
                                        <span className="font-medium text-gray-900">{station.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-3 text-gray-600 flex flex-col gap-1">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="size-4 mt-[2px] text-gray-400 shrink-0" />
                                        <span>{station.address}</span>
                                    </div>
                                    <span className="text-xs text-gray-400 pl-6">{station.city}</span>
                                </td>
                                <td className="px-6 py-3 text-gray-600">
                                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-semibold">
                                        {station.type}
                                    </span>
                                </td>
                                <td className="px-6 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">
                                            {/* 👇 SỬA Ở ĐÂY: Dùng trực tiếp trường activePorts và ports từ API */}
                                            <span className="font-semibold text-emerald-600">{station.activePorts || 0}</span>
                                            <span className="text-gray-400">/</span>
                                            <span className="font-medium text-gray-600">{station.ports || 0}</span>
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onManageConnectors(station)}
                                            className="h-7 text-xs px-2"
                                            title="Quản lý connectors"
                                        >
                                            <Plug className="size-3 mr-1" />
                                            Quản lý
                                        </Button>
                                    </div>
                                </td>
                                <td className="px-6 py-3">
                                    <span
                                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${station.status === 1
                                            ? "bg-emerald-50 text-emerald-600"
                                            : "bg-gray-100 text-gray-500"
                                            }`}
                                    >
                                        {station.status === 1 ? <Power className="size-3" /> : <WifiOff className="size-3" />}
                                        {station.status === 1 ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="px-6 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onViewDetail(station)}
                                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                            title="Xem chi tiết"
                                        >
                                            <Eye className="size-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onEdit(station)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Pencil className="size-4 text-blue-600" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onToggleStatus(station)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Power className={`size-4 ${station.status === 1 ? "text-orange-500" : "text-emerald-500"}`} />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onDelete(station.id)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Trash2 className="size-4 text-red-600" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        );})}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StationListTable;