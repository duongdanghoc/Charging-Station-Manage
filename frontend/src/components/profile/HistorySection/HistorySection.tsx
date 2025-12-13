"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from "../types";
import ChargingHistoryTable from "./ChargingHistoryTable";
import TransactionHistoryTable from "./TransactionHistoryTable";

export interface HistorySectionProps {
    role: UserRole;
    currentUserId?: string;
}

const HistorySection: React.FC<HistorySectionProps> = ({ role, currentUserId }) => {

    if (role !== "CUSTOMER") {
        return (
            <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                    Chức năng này hiện chỉ dành cho Khách hàng.
                </CardContent>
            </Card>
        );
    }

    if (!currentUserId) return null;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Hoạt động của bạn</CardTitle>
                <CardDescription>
                    Xem lại lịch sử sạc pin và các giao dịch thanh toán.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="charging" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="charging">Lịch sử phiên sạc</TabsTrigger>
                        <TabsTrigger value="transaction">Lịch sử giao dịch</TabsTrigger>
                    </TabsList>

                    <TabsContent value="charging">
                        <ChargingHistoryTable userId={currentUserId} />
                    </TabsContent>

                    <TabsContent value="transaction">
                        <TransactionHistoryTable userId={currentUserId} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default HistorySection;
