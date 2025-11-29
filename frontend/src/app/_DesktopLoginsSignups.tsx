"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetSessionQuery, useLogoutMutation } from "@/lib/redux/services/auth";

export const DesktopLoginsSignups: React.FC = () => {
    const { data: sessionData, isLoading, refetch } = useGetSessionQuery();
    const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
    const router = useRouter();
    const user = sessionData?.user;

    const handleLogout = async () => {
        try {
            // Clear localStorage first
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            
            // Call logout API
            await logout().unwrap();
            
            // Refetch session to update UI immediately
            await refetch();
            
            // Navigate to login page
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout failed:", error);
            
            // Even if API fails, ensure localStorage is cleared and redirect
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            
            // Force refetch to clear cache
            await refetch();
            
            router.push("/login");
            router.refresh();
        }
    };

    if (isLoading || isLoggingOut) {
        return <div className="animate-pulse h-8 w-20 bg-gray-200 rounded"></div>;
    }

    if (user) {
        return (
            <div className="flex items-center space-x-4">
                <Link href="/profile">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                        <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                </Link>
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Đăng nhập
            </Link>
            <Link
                href="/register"
                className="inline-block px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700"
            >
                Đăng ký
            </Link>
        </div>
    );
};

export default DesktopLoginsSignups;
