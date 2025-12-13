'use client';

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Station, CreateStationRequest } from "@/lib/redux/services/stationApi";
import { getDirtyValues } from "@/utils/getDirtyValues";
import LocationPickerMap from "./LocationPickerMap";

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
            latitude: 21.0227, // Default Hanoi
            longitude: 105.8194,
            openTime: "07:00",
            closeTime: "22:00",
            type: "CAR",
        },
    });

    const { formState: { dirtyFields }, watch, setValue } = form;

    const currentLat = watch("latitude");
    const currentLng = watch("longitude");

    // Hàm xử lý khi người dùng chọn trên bản đồ -> Cập nhật ngược lại vào Form
    const handleMapChange = (lat: number, lng: number) => {
        setValue("latitude", parseFloat(lat.toFixed(6)), { shouldDirty: true });
        setValue("longitude", parseFloat(lng.toFixed(6)), { shouldDirty: true });
    };

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
                    latitude: 21.0227,
                    longitude: 105.8194,
                    openTime: "07:00",
                    closeTime: "22:00",
                    type: "CAR",
                });
            }
        }
    }, [open, initialData, form]);

    const handleSubmit = (values: CreateStationRequest) => {
        // A. XỬ LÝ CHO TRƯỜNG HỢP UPDATE (Chỉ gửi các trường đã thay đổi)
        if (initialData) {
            // Lấy ra các trường đã thay đổi
            const changedValues = getDirtyValues(dirtyFields, values);

            // Nếu không có gì thay đổi thì không gọi API, chỉ đóng modal (hoặc báo thông báo)
            if (Object.keys(changedValues).length === 0) {
                onOpenChange(false);
                return;
            }

            // Xử lý format giờ giấc (nếu trường giờ có bị thay đổi)
            if (changedValues.openTime && changedValues.openTime.length === 5) {
                changedValues.openTime = `${changedValues.openTime}:00`;
            }
            if (changedValues.closeTime && changedValues.closeTime.length === 5) {
                changedValues.closeTime = `${changedValues.closeTime}:00`;
            }

            // Gửi đi payload chỉ chứa các trường thay đổi
            // Cần ép kiểu về CreateStationRequest vì changedValues là Partial
            onSubmit(changedValues as CreateStationRequest);
        }
        // B. XỬ LÝ CHO TRƯỜNG HỢP CREATE (Gửi tất cả)
        else {
            const formattedValues = {
                ...values,
                openTime: values.openTime.length === 5 ? `${values.openTime}:00` : values.openTime,
                closeTime: values.closeTime.length === 5 ? `${values.closeTime}:00` : values.closeTime,
            };
            onSubmit(formattedValues);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Cập nhật trạm sạc" : "Thêm trạm sạc mới"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

                        {/* Layout chia 2 cột: Trái (Input), Phải (Bản đồ) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Cột Trái: Form nhập liệu */}
                            <div className="space-y-4">
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

                                <FormField
                                    control={form.control}
                                    name="province"
                                    rules={{ required: "Tỉnh/TP là bắt buộc" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tỉnh/TP</FormLabel>
                                            <FormControl><Input placeholder="TP.HCM" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="latitude"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Vĩ độ (Lat)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="any"
                                                        {...field}
                                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="longitude"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Kinh độ (Long)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="any"
                                                        {...field}
                                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Cột Phải: Bản đồ */}
                            <div className="flex flex-col h-full min-h-[300px]">
                                <div className="mb-2 text-sm font-medium text-gray-700">Chọn vị trí trên bản đồ</div>
                                <LocationPickerMap
                                    lat={currentLat}
                                    lng={currentLng}
                                    onChange={handleMapChange}
                                />
                            </div>

                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
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
