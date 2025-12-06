"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetChargingHistoryQuery } from "@/lib/redux/services/profileApi";
import { UserRole } from "../types";

export interface HistorySectionProps {
    role: UserRole;
    currentUserId?: string; // Truyền ID user vào props
}

const HistorySection: React.FC<HistorySectionProps> = ({ role, currentUserId }) => {
    const [page, setPage] = useState(0);
    const pageSize = 10;

    // Gọi API lấy dữ liệu thật
    // Lưu ý: userId cần được đảm bảo tồn tại. Nếu props chưa có, bạn có thể lấy từ Redux store
    const { data, isLoading, isError } = useGetChargingHistoryQuery(
        { userId: currentUserId || "", page, size: pageSize },
        { skip: !currentUserId || role !== "CUSTOMER" } // Chỉ fetch nếu có ID và là Customer
    );

    // Helper function: Format tiền tệ
    const formatCurrency = (amount: number | null) => {
        if (amount === null || amount === undefined) return "—";
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Helper function: Render Status Badge
    const renderPaymentStatus = (status: string | null) => {
        switch (status) {
            case "PAID":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Đã thanh toán</Badge>;
            case "PENDING":
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">Chờ thanh toán</Badge>;
            case "FAILED":
                return <Badge variant="destructive">Thất bại</Badge>;
            case "REFUNDED":
                return <Badge variant="outline">Đã hoàn tiền</Badge>;
            default:
                return <Badge variant="secondary">Chưa có</Badge>;
        }
    };

    const renderSessionStatus = (status: string) => {
        switch (status) {
            case "CHARGING": return <Badge className="animate-pulse bg-blue-500">Đang sạc</Badge>;
            case "COMPLETED": return <span className="text-sm text-gray-600">Hoàn tất</span>;
            case "CANCELLED": return <span className="text-sm text-red-500">Đã hủy</span>;
            default: return <span className="text-sm text-gray-500">{status}</span>;
        }
    }

    if (role !== "CUSTOMER") {
        return (
            <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                    Chức năng lịch sử cho vai trò {role} đang được phát triển.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Lịch sử phiên sạc</CardTitle>
                <CardDescription>
                    Danh sách các phiên sạc và trạng thái thanh toán của bạn.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : isError ? (
                    <div className="text-center py-10 text-red-500">
                        Không thể tải dữ liệu lịch sử. Vui lòng thử lại sau.
                    </div>
                ) : !data || data.content.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        Bạn chưa có giao dịch nào.
                    </div>
                ) : (
                    <>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Trạm sạc</TableHead>
                                        <TableHead>Thời gian</TableHead>
                                        <TableHead>Thông tin sạc</TableHead>
                                        <TableHead className="text-right">Tổng tiền</TableHead>
                                        <TableHead className="text-center">Thanh toán</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.content.map((item) => (
                                        <TableRow key={item.sessionId}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{item.stationName}</span>
                                                    <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={item.address}>
                                                        {item.address}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm">
                                                    <span>{format(new Date(item.startTime), "dd/MM/yyyy", { locale: vi })}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(new Date(item.startTime), "HH:mm", { locale: vi })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-sm">
                                                        {renderSessionStatus(item.sessionStatus)}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {item.energyKwh} kWh • {item.vehiclePlate}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                {formatCurrency(item.totalAmount)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {renderPaymentStatus(item.paymentStatus)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Controls Simple */}
                        <div className="flex items-center justify-center space-x-2 py-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((old) => Math.max(0, old - 1))}
                                disabled={page === 0}
                            >
                                <ChevronLeft></ChevronLeft>
                            </Button>
                            <span className="text-sm text-gray-600">
                                {data.number + 1} / {data.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((old) => (!data.totalPages || old >= data.totalPages - 1 ? old : old + 1))}
                                disabled={!data || page >= data.totalPages - 1}
                            >
                                <ChevronRight></ChevronRight>
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default HistorySection;
