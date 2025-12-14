'use client';

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Connector, CreateConnectorRequest } from "@/lib/redux/services/connectorApi";

interface ConnectorFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    connector: Connector | null;
    onSubmit: (data: CreateConnectorRequest) => void;
    isLoading?: boolean;
}

const ConnectorFormDialog: React.FC<ConnectorFormDialogProps> = ({
    open,
    onOpenChange,
    connector,
    onSubmit,
    isLoading = false,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CreateConnectorRequest>({
        defaultValues: {
            poleId: 0,
            connectorType: "TYPE_2",
            maxPower: 50,
            status: "AVAILABLE",
        },
    });

    const connectorType = watch("connectorType");
    const status = watch("status");

    useEffect(() => {
        if (connector) {
            // Edit mode
            setValue("poleId", connector.poleId);
            setValue("connectorType", connector.connectorType);
            setValue("maxPower", connector.maxPower);
            setValue("status", connector.status);
        } else {
            // Create mode
            reset({
                poleId: 0,
                connectorType: "TYPE_2",
                maxPower: 50,
                status: "AVAILABLE",
            });
        }
    }, [connector, setValue, reset]);

    const handleFormSubmit = (data: CreateConnectorRequest) => {
        onSubmit(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {connector ? "Chỉnh sửa Connector" : "Thêm Connector mới"}
                    </DialogTitle>
                    <DialogDescription>
                        {connector
                            ? "Cập nhật thông tin connector"
                            : "Điền thông tin để thêm connector mới vào trụ sạc"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    {/* Pole ID */}
                    <div className="space-y-2">
                        <Label htmlFor="poleId">
                            ID Trụ sạc <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="poleId"
                            type="number"
                            {...register("poleId", {
                                required: "Vui lòng nhập ID trụ sạc",
                                min: { value: 1, message: "ID phải lớn hơn 0" },
                            })}
                            placeholder="Nhập ID trụ sạc"
                        />
                        {errors.poleId && (
                            <p className="text-sm text-red-500">{errors.poleId.message}</p>
                        )}
                    </div>

                    {/* Connector Type */}
                    <div className="space-y-2">
                        <Label htmlFor="connectorType">
                            Loại Connector <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={connectorType}
                            onValueChange={(value) => setValue("connectorType", value as any)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn loại connector" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TYPE_1">Type 1</SelectItem>
                                <SelectItem value="TYPE_2">Type 2</SelectItem>
                                <SelectItem value="CCS1">CCS1</SelectItem>
                                <SelectItem value="CCS2">CCS2</SelectItem>
                                <SelectItem value="CHADEMO">CHAdeMO</SelectItem>
                                <SelectItem value="GB_T">GB/T</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Max Power */}
                    <div className="space-y-2">
                        <Label htmlFor="maxPower">
                            Công suất tối đa (kW) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="maxPower"
                            type="number"
                            step="0.1"
                            {...register("maxPower", {
                                required: "Vui lòng nhập công suất",
                                min: { value: 1, message: "Công suất phải lớn hơn 0" },
                            })}
                            placeholder="Ví dụ: 50"
                        />
                        {errors.maxPower && (
                            <p className="text-sm text-red-500">{errors.maxPower.message}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label htmlFor="status">Trạng thái</Label>
                        <Select
                            value={status}
                            onValueChange={(value) => setValue("status", value as any)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AVAILABLE">Sẵn sàng</SelectItem>
                                <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                                <SelectItem value="OUT_OF_SERVICE">Ngưng hoạt động</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Đang xử lý..." : connector ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ConnectorFormDialog;