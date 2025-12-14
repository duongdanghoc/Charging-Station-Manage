'use client';
import React, { useState, useEffect } from "react";
import { Zap, AlertCircle } from "lucide-react";
import { useStartSessionMutation } from "@/lib/redux/services/sessionApi";
import { useGetCustomerVehiclesQuery } from "@/lib/redux/services/stationApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ChargingMonitor from "@/components/charging/ChargingMonitor";

export default function QuickChargeSection() {
    const router = useRouter();
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
            // Optional: redirect or update UI. 
            // In profile tab context, maybe stay here or switch to History tab?
            // For now, let's just show success. 
            // If we want to show the monitor, ensuring layout.tsx picks it up is key (which we verified).
        } catch (err: any) {
            toast.error(err?.data || "Không thể sạc. Vui lòng kiểm tra lại.");
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-rose-500 to-orange-500 p-6 text-white text-center">
                <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
                    <Zap size={32} className="fill-current" />
                </div>
                <h2 className="text-2xl font-bold">Sạc Nhanh</h2>
                <p className="text-rose-100 text-sm mt-1">Bắt đầu phiên sạc ngay tại đây</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-3">
                    <Label className="text-gray-700">Chọn xe của bạn</Label>
                    <Select value={vehicleId} onValueChange={setVehicleId} required>
                        <SelectTrigger className="w-full">
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
                    {(!vehicles || vehicles.length === 0) && !isVehiclesLoading && (
                        <p className="text-xs text-rose-500">
                            Bạn cần thêm xe vào hồ sơ trước khi sạc.
                        </p>
                    )}
                </div>

                <div className="space-y-3">
                    <Label className="text-gray-700">Nhập ID Trụ sạc (Connector ID)</Label>
                    <div className="relative">
                        <Input 
                            type="number" 
                            placeholder="Ví dụ: 101" 
                            className="pl-4 text-lg font-mono tracking-widest"
                            value={connectorId}
                            onChange={(e) => setConnectorId(e.target.value)}
                            required
                        />
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 bg-gray-50 p-2 rounded">
                        <AlertCircle size={14} className="text-blue-500" />
                        Mã này được in trên tem dán tại thân trụ sạc
                    </p>
                </div>

                <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-rose-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]" 
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                            Đang xử lý...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Zap size={18} className="fill-current" /> BẮT ĐẦU SẠC NGAY
                        </span>
                    )}
                </Button>
            </form>
            <div className="px-6 pb-6">
                 <ChargingMonitor />
            </div>
        </div>
    );
}
