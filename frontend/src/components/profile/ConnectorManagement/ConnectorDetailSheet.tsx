'use client';

import React from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import type { Connector } from "@/lib/redux/services/connectorApi";

interface ConnectorDetailSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    connector: Connector | null;
}

const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
        AVAILABLE: { label: "Sẵn sàng", variant: "default" },
        IN_USE: { label: "Đang sử dụng", variant: "secondary" },
        MAINTENANCE: { label: "Bảo trì", variant: "outline" },
        OUT_OF_SERVICE: { label: "Ngưng hoạt động", variant: "destructive" },
    };

    const config = statusConfig[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getConnectorTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
        TYPE_1: "Type 1",
        TYPE_2: "Type 2",
        CCS1: "CCS1",
        CCS2: "CCS2",
        CHADEMO: "CHAdeMO",
        GB_T: "GB/T",
    };
    return typeLabels[type] || type;
};

const ConnectorDetailSheet: React.FC<ConnectorDetailSheetProps> = ({
    open,
    onOpenChange,
    connector,
}) => {
    if (!connector) {
        return null;
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Chi tiết Connector #{connector.id}</SheetTitle>
                    <SheetDescription>
                        Thông tin chi tiết về connector
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700">Thông tin cơ bản</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">ID Connector</p>
                                <p className="text-sm font-medium">#{connector.id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                                <div>{getStatusBadge(connector.status)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Station & Pole Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700">Vị trí</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Trạm sạc</p>
                                <p className="text-sm font-medium">
                                    {connector.stationName || `Station #${connector.stationId || "N/A"}`}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Trụ sạc</p>
                                <p className="text-sm font-medium">
                                    {connector.poleName || `Pole #${connector.poleId}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Technical Specs */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700">Thông số kỹ thuật</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Loại connector</p>
                                <p className="text-sm font-medium">{getConnectorTypeLabel(connector.connectorType)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Công suất tối đa</p>
                                <p className="text-sm font-medium">{connector.maxPower} kW</p>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps */}
                    {(connector.createdAt || connector.updatedAt) && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-700">Thời gian</h3>
                            <div className="space-y-3">
                                {connector.createdAt && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Ngày tạo</p>
                                        <p className="text-sm font-medium">
                                            {new Date(connector.createdAt).toLocaleString("vi-VN")}
                                        </p>
                                    </div>
                                )}
                                {connector.updatedAt && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Cập nhật lần cuối</p>
                                        <p className="text-sm font-medium">
                                            {new Date(connector.updatedAt).toLocaleString("vi-VN")}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default ConnectorDetailSheet;
