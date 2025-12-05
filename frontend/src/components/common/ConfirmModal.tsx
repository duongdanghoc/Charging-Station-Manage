"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"; 
import { Button } from "@/components/ui/button"; 

interface ConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: React.ReactNode; 

    // Tùy chọn: Nếu muốn custom nút bấm
    // Nếu không truyền, mặc định sẽ hiện: [Hủy] [Xác nhận]
    footerButtons?: React.ReactNode[];

    // Hành động mặc định nếu dùng nút mặc định
    onConfirm?: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean; // Để disable nút khi đang gọi API xóa
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    open,
    onOpenChange,
    title,
    description,
    footerButtons,
    onConfirm,
    confirmLabel = "Xác nhận",
    cancelLabel = "Hủy bỏ",
    isLoading = false,
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl text-gray-900">{title}</DialogTitle>
                    <DialogDescription className="pt-2 text-gray-600">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 mt-4">
                    {footerButtons ? (
                        // CASE 1: Truyền danh sách nút tùy ý (bao nhiêu cũng được)
                        // Reverse để nút chính thường nằm bên phải (trên desktop)
                        <>
                            {footerButtons.map((btn, index) => (
                                <React.Fragment key={index}>{btn}</React.Fragment>
                            ))}
                        </>
                    ) : (
                        // CASE 2: Mặc định 2 nút (Hủy - Xác nhận)
                        <>
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                {cancelLabel}
                            </Button>
                            <Button
                                variant="destructive" // Màu đỏ cảnh báo
                                onClick={onConfirm}
                                disabled={isLoading}
                            >
                                {isLoading ? "Đang xử lý..." : confirmLabel}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmModal;
