"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";

interface AdminCheckProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AdminCheck({ children, fallback }: AdminCheckProps) {
  const router = useRouter();

  // 1. Lấy thông tin User trực tiếp từ Redux Store (không cần gọi API nữa)
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // State để tránh lỗi hydration (màn hình chớp nháy giữa server/client)
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // 2. Logic kiểm tra: Nếu đã load xong mà không phải Admin -> Đá về trang chủ
    if (isAuthenticated) {
        // Kiểm tra cả 'ADMIN' và 'ROLE_ADMIN' cho chắc chắn
        const role = user?.role;
        if (role !== "ADMIN" && role !== "ROLE_ADMIN") {
            router.replace("/");
        }
    } else {
        // Chưa đăng nhập -> Đá về Login
        router.replace("/login");
    }
  }, [isAuthenticated, user, router, isClient]);

  // Nếu chưa render xong ở client, hiện màn hình chờ
  if (!isClient) {
     return <div className="flex justify-center p-10">Đang tải...</div>;
  }

  // 3. Nếu là Admin -> Cho phép xem nội dung
  if (isAuthenticated && (user?.role === "ADMIN" || user?.role === "ROLE_ADMIN")) {
    return <>{children}</>;
  }

  // 4. Nếu không phải Admin -> Hiện Fallback hoặc Access Denied
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2 text-red-600">Access Denied</h2>
        <p className="text-gray-600">
          Bạn không có quyền truy cập trang này. <br/>
          Vui lòng đăng nhập bằng tài khoản Admin.
        </p>
      </div>
    </div>
  );
}
