'use client';

import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Power } from "lucide-react";
import type { Connector } from "@/lib/redux/services/connectorApi";

interface ConnectorListTableProps {
    connectors: Connector[];
    onViewDetail: (connector: Connector) => void;
    onEdit: (connector: Connector) => void;
    onDelete: (id: number) => void;
    onToggleStatus: (connector: Connector) => void;
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

const ConnectorListTable: React.FC<ConnectorListTableProps> = ({
    connectors,
    onViewDetail,
    onEdit,
    onDelete,
    onToggleStatus,
}) => {
    if (!connectors || connectors.length === 0) {
        return (
            <div className="bg-white rounded-lg border p-8 text-center">
                <p className="text-gray-500">Không có connector nào</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Trạm sạc</TableHead>
                            <TableHead>Trụ sạc</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Công suất (kW)</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {connectors.map((connector) => (
                            <TableRow key={connector.id}>
                                <TableCell className="font-medium">#{connector.id}</TableCell>
                                <TableCell>{connector.stationName || "N/A"}</TableCell>
                                <TableCell>{connector.poleName || `Pole #${connector.poleId}`}</TableCell>
                                <TableCell>{getConnectorTypeLabel(connector.connectorType)}</TableCell>
                                <TableCell>{connector.maxPower} kW</TableCell>
                                <TableCell>{getStatusBadge(connector.status)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onViewDetail(connector)}
                                            title="Xem chi tiết"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(connector)}
                                            title="Chỉnh sửa"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onToggleStatus(connector)}
                                            title="Chuyển trạng thái"
                                            className={connector.status === "AVAILABLE" ? "text-orange-600" : "text-green-600"}
                                        >
                                            <Power className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(connector.id)}
                                            title="Xóa"
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default ConnectorListTable;
