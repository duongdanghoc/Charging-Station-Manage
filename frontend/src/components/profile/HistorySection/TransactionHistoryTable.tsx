'use client';

import React, { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Loader2, CreditCard } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetTransactionsQuery } from "@/lib/redux/services/profileApi";

interface Props {
    userId: string;
}

const TransactionHistoryTable: React.FC<Props> = ({ userId }) => {
    const [page, setPage] = useState(0);
    const { data, isLoading, isError } = useGetTransactionsQuery({ userId, page, size: 5 });

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const renderStatus = (status: string) => {
        switch (status) {
            case "PAID": return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">Thành công</Badge>;
            case "PENDING": return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200">Đang xử lý</Badge>;
            case "FAILED": return <Badge variant="destructive">Thất bại</Badge>;
            case "REFUNDED": return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200">Đã hoàn tiền</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>;
    if (isError) return <div className="text-red-500 py-8 text-center">Lỗi tải dữ liệu.</div>;
    if (!data?.content.length) return <div className="text-gray-500 py-8 text-center">Chưa có giao dịch nào.</div>;

    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Phương thức</TableHead>
                            <TableHead>Thời gian</TableHead>
                            <TableHead className="text-right">Số tiền</TableHead>
                            <TableHead className="text-center">Trạng thái</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.content.map((item) => (
                            <TableRow key={item.transactionId}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-gray-400" />
                                        <span>{item.description}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col text-sm">
                                        <span className="font-medium">{item.paymentMethod}</span>
                                        {item.bankName && <span className="text-xs text-muted-foreground">{item.bankName} - {item.accountNumber}</span>}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {item.paymentTime ? format(new Date(item.paymentTime), "dd/MM/yyyy HH:mm", { locale: vi }) : "—"}
                                </TableCell>
                                <TableCell className="text-right font-bold">{formatCurrency(item.amount)}</TableCell>
                                <TableCell className="text-center">{renderStatus(item.paymentStatus)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
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

export default TransactionHistoryTable;
