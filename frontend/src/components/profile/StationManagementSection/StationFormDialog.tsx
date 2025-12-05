'use client';

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Station, CreateStationRequest } from "@/lib/redux/services/stationApi";

interface StationFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateStationRequest) => void;
    initialData?: Station | null;
    isLoading?: boolean;
}

// Zod schema validation could be added here for robust checking

const StationFormDialog: React.FC<StationFormDialogProps> = ({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isLoading
}) => {
    const form = useForm<CreateStationRequest>({
        defaultValues: {
            name: "",
            addressDetail: "",
            province: "",
            latitude: 10.762622, // Default HCM
            longitude: 106.660172,
            openTime: "07:00",
            closeTime: "22:00",
            type: "CAR",
        },
    });

    // Reset form when opening for create, or fill data when editing
    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    name: initialData.name,
                    addressDetail: initialData.address,
                    province: initialData.city,
                    latitude: initialData.latitude,
                    longitude: initialData.longitude,
                    openTime: initialData.openTime.slice(0, 5), // HH:mm:ss -> HH:mm
                    closeTime: initialData.closeTime.slice(0, 5),
                    type: initialData.type,
                });
            } else {
                form.reset({
                    name: "",
                    addressDetail: "",
                    province: "",
                    latitude: 10.762622,
                    longitude: 106.660172,
                    openTime: "07:00",
                    closeTime: "22:00",
                    type: "CAR",
                });
            }
        }
    }, [open, initialData, form]);

    const handleSubmit = (values: CreateStationRequest) => {
        // Append seconds to time for LocalTime Java parsing if needed
        const formattedValues = {
            ...values,
            openTime: values.openTime.length === 5 ? `${values.openTime}:00` : values.openTime,
            closeTime: values.closeTime.length === 5 ? `${values.closeTime}:00` : values.closeTime,
        };
        onSubmit(formattedValues);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Cập nhật trạm sạc" : "Thêm trạm sạc mới"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            rules={{ required: "Tên trạm là bắt buộc" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên trạm</FormLabel>
                                    <FormControl>
                                        <Input placeholder="VD: Trạm sạc Vincom" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Loại xe</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn loại xe" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="CAR">Ô tô (Car)</SelectItem>
                                                <SelectItem value="MOTORBIKE">Xe máy (Motorbike)</SelectItem>
                                                <SelectItem value="BICYCLE">Xe đạp (Bicycle)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <FormField
                                    control={form.control}
                                    name="openTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mở cửa</FormLabel>
                                            <FormControl><Input type="time" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="closeTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Đóng cửa</FormLabel>
                                            <FormControl><Input type="time" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="addressDetail"
                            rules={{ required: "Địa chỉ là bắt buộc" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Địa chỉ chi tiết</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Số nhà, tên đường..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="province"
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tỉnh/TP</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="latitude"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vĩ độ (Lat)</FormLabel>
                                        <FormControl><Input type="number" step="any" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="longitude"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kinh độ (Long)</FormLabel>
                                        <FormControl><Input type="number" step="any" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                            <Button type="submit" disabled={isLoading}>{isLoading ? "Đang xử lý..." : (initialData ? "Cập nhật" : "Thêm mới")}</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default StationFormDialog;
