'use client';
import React, { useState, useEffect } from "react";
import { Zap, AlertCircle } from "lucide-react";
import { useStartSessionMutation } from "@/lib/redux/services/sessionApi";
import { useGetProfileQuery } from "@/lib/redux/services/profileApi";
import { useGetCustomerVehiclesQuery } from "@/lib/redux/services/stationApi";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function QuickStartCharging() {
    const [open, setOpen] = useState(false);
    const [connectorId, setConnectorId] = useState("");
    const [vehicleId, setVehicleId] = useState<string>("");

    const [startSession, { isLoading }] = useStartSessionMutation();
    const { data: vehicles, isLoading: isVehiclesLoading } = useGetCustomerVehiclesQuery();
    
    // Auto-select first vehicle if only one exists
    useEffect(() => {
        if (vehicles && vehicles.length === 1 && !vehicleId) {
            setVehicleId(vehicles[0].id.toString());
        }
    }, [vehicles, vehicleId]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await startSession({ 
                connectorId: parseInt(connectorId), 
                vehicleId: parseInt(vehicleId) 
            }).unwrap();
            toast.success("Đã bắt đầu sạc thành công!");
            setOpen(false);
        } catch (err: any) {
            toast.error(err?.data || "Không thể sạc. Vui lòng kiểm tra lại.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="hidden md:flex gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                    <Zap size={18} />
                    <span className="font-semibold">Sạc nhanh</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-rose-600">
                        <Zap className="fill-current" /> Sạc nhanh (Giả lập QR)
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Chọn xe của bạn</Label>
                        <Select value={vehicleId} onValueChange={setVehicleId} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn xe để sạc..." />
                            </SelectTrigger>
                            <SelectContent>
                                {isVehiclesLoading ? (
                                    <SelectItem value="loading" disabled>Đang tải danh sách xe...</SelectItem>
                                ) : vehicles && vehicles.length > 0 ? (
                                    vehicles.map((v: any) => (
                                        <SelectItem key={v.id} value={v.id.toString()}>
                                            {v.brand} {v.model} ({v.licensePlate})
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled>Bạn chưa có xe nào</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Nhập ID Trụ sạc (Connector ID)</Label>
                        <Input 
                            type="number" 
                            placeholder="Ví dụ: 101" 
                            value={connectorId}
                            onChange={(e) => setConnectorId(e.target.value)}
                            required
                        />
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <AlertCircle size={12} />
                            Mã này thường dán trên thân trụ sạc
                        </p>
                    </div>

                    <DialogFooter>
                        <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700" disabled={isLoading}>
                            {isLoading ? "Đang xử lý..." : "Bắt đầu sạc ngay"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
