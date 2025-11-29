"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useGetSessionQuery } from "@/lib/redux/services/auth";
import { useGetProfileOverviewQuery, useGetDashboardQuery } from "@/lib/redux/services/profileApi";
import type { DbProfile } from "@/lib/redux/services/profileApi";
import { Toaster } from "@/components/ui/sonner";

// Các components phụ trợ
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="text-center text-red-600 py-10">
    <p>Error loading data: {message}</p>
    <p>Please try refreshing the page.</p>
  </div>
);

export default function CustomerDashboard() {
  const { data: sessionData, isLoading: isLoadingSession } = useGetSessionQuery();
  const router = useRouter();
  const userId = sessionData?.user?.id;

  // Fetch customer profile data
  const {
    data: overviewData,
    error: overviewError,
    isLoading: isLoadingOverview,
    isFetching: isFetchingOverview,
  } = useGetProfileOverviewQuery(userId?.toString() ?? "", {
    skip: !userId,
  });

  // Dashboard data (recent activities)
  const {
    data: dashboardData,
    error: dashboardError,
    isLoading: isLoadingDashboard,
  } = useGetDashboardQuery(userId?.toString() ?? "", { skip: !userId });

  React.useEffect(() => {
    if (!isLoadingSession && (!sessionData?.user || sessionData.user.role !== "CUSTOMER")) {
      router.replace("/login");
    }
  }, [isLoadingSession, sessionData, router]);

  const isLoading = isLoadingSession || isLoadingOverview || isLoadingDashboard;

  if (isLoading) {
    return (
      <div className="pt-16 sm:pt-20 md:pt-24 max-w-4xl mx-auto px-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (!userId) {
    return null; // Will be redirected by useEffect
  }

  if (overviewError || dashboardError) {
    const errorMessage =
      typeof dashboardError === "object" && dashboardError && "data" in dashboardError
        ? String((dashboardError as any).data)
        : typeof overviewError === "object" && overviewError && "data" in overviewError
        ? String(overviewError.data)
        : "An unknown error occurred";
    return (
      <div className="pt-16 sm:pt-20 md:pt-24 max-w-4xl mx-auto px-4">
        <ErrorDisplay message={errorMessage} />
      </div>
    );
  }

  // Đảm bảo profileData có type đúng từ API
  const profileData: DbProfile = overviewData?.profile ?? {
    id: userId?.toString() ?? "",
    name: null,
    phone: null,
    avatar_url: null,
    type: null,
    role: null,
    intro: null
  };

  return (
    <div className="flex flex-col min-h-screen pt-16">
      <Toaster />
      {isFetchingOverview && (
        <div className="fixed top-4 right-4 z-50 bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm">
          Đang cập nhật...
        </div>
      )}
      <main className="flex-grow container max-w-6xl mx-auto px-4 py-12 md:px-8">
        {/* Customer Info Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Thông tin khách hàng</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 mb-2">Họ và tên</p>
              <p className="font-medium">{profileData.name || "Chưa cập nhật"}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-2">Số điện thoại</p>
              <p className="font-medium">{profileData.phone || "Chưa cập nhật"}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-2">Email</p>
              <p className="font-medium">{sessionData?.user?.email || "Chưa cập nhật"}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-2">Trạng thái</p>
              <p className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Đang hoạt động
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <h3 className="font-semibold mb-2">Trạm sạc gần đây</h3>
            <p className="text-gray-600 mb-4">Xem các trạm sạc trong khu vực của bạn</p>
            <button 
              onClick={() => router.push("/map")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Xem bản đồ →
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <h3 className="font-semibold mb-2">Lịch sử sạc pin</h3>
            <p className="text-gray-600 mb-4">Xem lịch sử sử dụng trạm sạc</p>
            <button 
              onClick={() => router.push("/customer/history")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Xem lịch sử →
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <h3 className="font-semibold mb-2">Cập nhật thông tin</h3>
            <p className="text-gray-600 mb-4">Chỉnh sửa thông tin cá nhân</p>
            <button 
              onClick={() => router.push("/profile")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Cập nhật →
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-semibold mb-4">Hoạt động gần đây</h2>
          <div className="space-y-4">
            {/* Render recent activities */}
            {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
              dashboardData.recentActivities.map((act) => (
                <div key={act.id} className="p-3 border rounded-md">
                  <div className="font-medium">{act.type} {act.stationName ? `- ${act.stationName}` : ''}</div>
                  <div className="text-sm text-gray-500">{act.description || ''}</div>
                  <div className="text-xs text-gray-400">{new Date(act.timestamp).toLocaleString()}</div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 italic">Chưa có hoạt động nào gần đây</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}