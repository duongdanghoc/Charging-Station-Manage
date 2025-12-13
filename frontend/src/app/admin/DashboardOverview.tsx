"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Users, Zap, DollarSign, Activity, BatteryCharging } from "lucide-react";
import { useGetDashboardOverviewQuery } from "@/lib/redux/services/adminApi";

// Card hiển thị chỉ số nhỏ
function StatCard({ title, value, icon: Icon, color, subtext }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {subtext && <p className="text-xs text-green-600 mt-1 font-medium">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  const { data: apiData, isLoading } = useGetDashboardOverviewQuery();

  // Dữ liệu lấy từ API, nếu chưa có thì dùng default
  const stats = apiData?.data || {
    totalUsers: 0,
    totalCustomers: 0,
    totalVendors: 0,
    totalStations: 0,
    totalSessions: 0,
    totalRevenue: 0,
    revenueChartData: [],
    sessionChartData: []
  };

  // Định dạng tiền tệ
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  if (isLoading) return <div className="p-10 text-center">Đang tải dữ liệu thống kê...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* 1. Tiêu đề */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" /> Dashboard Tổng Quan
        </h2>
        <p className="text-sm text-gray-500 mt-1">Báo cáo hoạt động kinh doanh và vận hành hệ thống.</p>
      </div>

      {/* 2. Các thẻ chỉ số (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng Doanh Thu"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          color="bg-green-500"
          subtext="+12.5% so với tháng trước"
        />
        <StatCard

          title="Tổng Phiên Sạc"
          value={stats.totalSessions}
          icon={BatteryCharging}
          color="bg-blue-500"
          subtext="Đang hoạt động"
        />
        <StatCard
          title="Tổng Trạm Sạc"
          value={stats.totalStations}
          icon={Zap}
          color="bg-yellow-500"
        />
        <StatCard
          title="Tổng Người Dùng"
          value={stats.totalUsers}
          icon={Users}
          color="bg-purple-500"
          subtext={`${stats.totalCustomers} Khách - ${stats.totalVendors} Vendor`}
        />
      </div>

      {/* 3. Biểu đồ (Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Biểu đồ Doanh thu (Area Chart) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Biểu đồ Doanh Thu (6 tháng)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="Doanh thu" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ Phiên sạc (Bar Chart) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Số Lượng Phiên Sạc</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.sessionChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Số phiên" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
