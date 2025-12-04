"use client";

import React from "react";
import Pagination from "./Pagination";
import { SetStateAction } from "react"; // Import để sử dụng type

// Định nghĩa Props mới, phù hợp với AdminPage đang truyền vào
interface PaginationClientProps {
    page: number; // Đã đổi tên prop cho khớp với AdminPage.tsx
    totalPages: number;
    onPageChange: (newPage: number) => void; // Prop mới, chỉ nhận số trang mới
}

/**
 * Client-side wrapper:
 * Chuyển đổi callback onPageChange thành hàm setter mà Pagination.tsx yêu cầu.
 */
export default function PaginationClient({
    page,
    totalPages,
    onPageChange,
}: PaginationClientProps) {

    /**
     * Tạo một hàm handler thỏa mãn kiểu React.Dispatch<React.SetStateAction<number>>
     * mà Pagination.tsx đang yêu cầu.
     */
    const handleSetPage = (action: SetStateAction<number>) => {
        let newPage: number;

        if (typeof action === 'function') {
            // Nếu Pagination.tsx gọi setCurrentPage(prev => prev - 1),
            // ta thực thi hàm đó trên giá trị 'page' hiện tại (filters.page)
            const updateFn = action as (prevState: number) => number;
            newPage = updateFn(page);
        } else {
            // Nếu Pagination.tsx gọi setCurrentPage(3), ta lấy giá trị đó
            newPage = action;
        }

        // Gọi callback của AdminPage.tsx với số trang cuối cùng đã tính
        onPageChange(newPage);
    };

    return (
        <Pagination
            currentPage={page} // Truyền page hiện tại
            totalPages={totalPages}
            setCurrentPage={handleSetPage} // Truyền hàm handler đã tùy chỉnh
        />
    );
}
