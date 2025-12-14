'use client';

import React, { useState } from "react";
import { PoleManagementDialog } from "./PoleManagementDialog";
import { ConnectorManagerDialog } from "./ConnectorManagerDialog"; // 👇 Import mới
import { 
    useGetStationByIdQuery, 
    useDeleteChargingPoleMutation 
} from "@/lib/redux/services/stationApi";
import { toast } from "sonner";

import {
    Zap, MapPin, Clock, Server, BatteryCharging, Info, Plus, 
    CheckCircle2, XCircle, Pencil, Trash2, Plug // 👇 Thêm icon Plug
} from "lucide-react";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Station, ChargingPole, ChargingConnector } from "@/lib/redux/services/stationApi";
import { PriceManagementDialog } from "./PriceManagementDialog";

interface StationDetailSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    station: Station | null;
}

const StationDetailSheet: React.FC<StationDetailSheetProps> = ({
    open,
    onOpenChange,
    station: initialStation
}) => {
    // State quản lý dialogs
    const [isPoleDialogOpen, setIsPoleDialogOpen] = useState(false);
    const [selectedPoleToEdit, setSelectedPoleToEdit] = useState<ChargingPole | null>(null);
    
    // 👇 State quản lý Dialog Connector
    const [connectorPole, setConnectorPole] = useState<ChargingPole | null>(null);

    const stationId = initialStation?.id || 0;

    const { data: freshStationData } = useGetStationByIdQuery(stationId, {
        skip: !stationId || !open,
    });
    
    const [deletePole] = useDeleteChargingPoleMutation();

    const station = freshStationData?.data || initialStation;
    if (!station) return null;
    const poles = station.poles || [];

    // --- HÀM XỬ LÝ ---
    const handleAddNew = () => {
        setSelectedPoleToEdit(null);
        setIsPoleDialogOpen(true);
    };

    const handleEdit = (pole: ChargingPole) => {
        setSelectedPoleToEdit(pole);
        setIsPoleDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa trụ sạc này?")) return;
        try {
            await deletePole(id).unwrap();
            toast.success("Xóa trụ sạc thành công");
        } catch (error) {
            toast.error("Lỗi khi xóa trụ sạc");
        }
    };

    // 👇 Hàm mở dialog quản lý đầu sạc
    const handleManageConnectors = (pole: ChargingPole) => {
        setConnectorPole(pole);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="sm:max-w-2xl w-full p-0 flex flex-col bg-gray-50">
                <SheetHeader className="px-6 py-4 bg-white border-b border-gray-100">
                    <SheetTitle className="text-xl flex items-center gap-2 text-blue-700">
                        <Info className="size-5" /> Chi tiết trạm sạc
                    </SheetTitle>
                    <SheetDescription>Xem thông tin cấu hình trụ sạc.</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* 1. Thông tin chung */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{station.name}</h3>
                            <div className="flex items-start gap-2 text-gray-500 text-sm mt-1">
                                <MapPin className="size-4 mt-0.5 shrink-0" />
                                <span>{station.address}, {station.city}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-gray-500 uppercase">Loại xe</span>
                                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                                    <Zap className="size-4 text-orange-500" />
                                    {station.type}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-gray-500 uppercase">Giờ hoạt động</span>
                                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                                    <Clock className="size-4 text-blue-500" />
                                    {station.openTime} - {station.closeTime}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Danh sách Trụ sạc */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Server className="size-5 text-gray-600" />
                                Hệ thống trụ sạc ({poles.length})
                            </h4>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="gap-1 h-8 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                onClick={handleAddNew}
                            >
                                <Plus className="w-4 h-4" /> Thêm trụ sạc
                            </Button>
                        </div>

                        {poles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400 bg-white rounded-xl border border-dashed">
                                <Server className="size-10 mb-2 opacity-20" />
                                <p>Chưa có trụ sạc nào được lắp đặt.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {poles.map((pole) => (
                                    <PoleItem 
                                        key={pole.id} 
                                        pole={pole} 
                                        onEdit={() => handleEdit(pole)}
                                        onDelete={() => handleDelete(pole.id)}
                                        onManageConnectors={() => handleManageConnectors(pole)} // 👇 Truyền hàm này xuống
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- CÁC DIALOGS --- */}
                <PoleManagementDialog 
                    open={isPoleDialogOpen} 
                    onOpenChange={setIsPoleDialogOpen}
                    stationId={station.id}
                    poleToEdit={selectedPoleToEdit}
                />

                {/* 👇 Dialog quản lý Connector */}
                <ConnectorManagerDialog 
                    open={!!connectorPole}
                    onOpenChange={(open) => !open && setConnectorPole(null)}
                    pole={connectorPole}
                />
            </SheetContent>
        </Sheet>
    );
};

// --- SUB COMPONENTS ---

const PoleItem: React.FC<{ 
    pole: ChargingPole; 
    onEdit: () => void; 
    onDelete: () => void;
    onManageConnectors: () => void; // 👇 Thêm prop mới
}> = ({ pole, onEdit, onDelete, onManageConnectors }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md group">
            <div className="bg-gray-50/80 px-4 py-3 flex justify-between items-center border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-600 text-xs">
                        #{pole.id}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-gray-900">{pole.manufacturer}</div>
                        <div className="text-xs text-gray-500">Lắp đặt: {pole.installDate}</div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <PriceManagementDialog poleId={pole.id} poleName={pole.manufacturer} />
                    
                    <div className="flex items-center gap-1 border-l pl-2 ml-1">
                        {/* 👇 Nút Quản lý Đầu sạc (Phích cắm) */}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-blue-500 hover:text-blue-700 hover:bg-blue-50" 
                            onClick={onManageConnectors}
                            title="Quản lý đầu sạc"
                        >
                            <Plug className="h-3.5 w-3.5" />
                        </Button>

                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-orange-600" onClick={onEdit}>
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-red-600" onClick={onDelete}>
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="p-4">
                <div className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide flex justify-between">
                    <span>Đầu sạc ({pole.connectors.length})</span>
                    <span className="text-xs text-gray-400">Max {pole.maxPower} kW</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pole.connectors.map((connector) => (
                        <ConnectorItem key={connector.id} connector={connector} />
                    ))}
                    {pole.connectors.length === 0 && (
                        <div className="col-span-2 text-center py-2 text-sm text-gray-400 italic bg-gray-50 rounded border border-dashed">
                            Chưa gắn đầu sạc
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ConnectorItem: React.FC<{ connector: ChargingConnector }> = ({ connector }) => {
    const statusConfig: any = {
        AVAILABLE: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: CheckCircle2, label: "Sẵn sàng" },
        INUSE: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", icon: BatteryCharging, label: "Đang sạc" },
        OUTOFSERVICE: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: XCircle, label: "Bảo trì" }
    };
    const config = statusConfig[connector.status] || statusConfig.OUTOFSERVICE;
    const StatusIcon = config.icon;
    return (
        <div className={`relative flex items-center gap-3 p-3 rounded-lg border transition-all hover:scale-[1.02] ${config.bg} ${config.border}`}>
            <div className={`p-2 rounded-full bg-white/80 ${config.text}`}> <StatusIcon size={16} /> </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800 text-sm truncate">{connector.connectorType}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${config.text}`}>{config.label}</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Công suất: <span className="font-medium text-gray-900">{connector.maxPower} kW</span></div>
            </div>
        </div>
    );
};

export default StationDetailSheet;