'use client';

import React, { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetChargingHistoryQuery } from "@/lib/redux/services/profileApi";

interface Props {
    userId: string;
}

const ChargingHistoryTable: React.FC<Props> = ({ userId }) => {
    const [page, setPage] = useState(0);
    const { data, isLoading, isError } = useGetChargingHistoryQuery({ userId, page, size: 5 });

    const uniqueContent = React.useMemo(() => {
        if (!data?.content) return [];
        const seen = new Set();
        return data.content.filter(item => {
            const isDuplicate = seen.has(item.sessionId);
            seen.add(item.sessionId);
            return !isDuplicate;
        });
    }, [data?.content]);

    const formatCurrency = (amount: number | null) =>
        amount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount) : "—";

    const renderStatus = (status: string) => {
        switch (status) {
            case "PENDING": return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200">Đang chờ</Badge>;
            case "CHARGING": return <Badge className="animate-pulse bg-blue-500">Đang sạc</Badge>;
            case "COMPLETED": return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">Hoàn thành</Badge>;
            case "CANCELLED": return <Badge variant="destructive">Đã hủy</Badge>;
            case "FAILED": return <Badge variant="destructive">Thất bại</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>;
    if (isError) return <div className="text-red-500 py-8 text-center">Lỗi tải dữ liệu.</div>;
    if (!data) return null;
    if (!uniqueContent.length) return <div className="text-gray-500 py-8 text-center">Chưa có lịch sử sạc.</div>;

    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Trạm sạc</TableHead>
                            <TableHead>Thời gian</TableHead>
                            <TableHead>Năng lượng</TableHead>
                            <TableHead className="text-right">Chi phí</TableHead>
                            <TableHead className="text-center">Trạng thái</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {uniqueContent.map((item) => (
                            <TableRow key={item.sessionId}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{item.stationName}</span>
                                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">{item.address}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {format(new Date(item.startTime), "dd/MM/yyyy HH:mm", { locale: vi })}
                                </TableCell>
                                <TableCell>{item.energyKwh} kWh</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                                <TableCell className="text-center">{renderStatus(item.sessionStatus)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-sm text-gray-600">
                    {data.number + 1} / {data.totalPages}
                </span>

                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= (data.totalPages - 1)}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default ChargingHistoryTable;
