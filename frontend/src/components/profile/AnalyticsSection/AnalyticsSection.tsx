'use client';

import React, { useState, useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, BarChart3, TrendingUp, Calendar, RefreshCcw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserRole } from "../types";
import { useGetVendorRevenueStatsQuery, useGetVendorChartDataQuery } from "@/lib/redux/services/profileApi";
import { Area, Line, ComposedChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

interface AnalyticsSectionProps {
    role: Extract<UserRole, "SUPPLIER" | "TECH">;
}

type TimeRange = "7" | "30" | "90" | "365";

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ role }) => {
    const [range, setRange] = useState<TimeRange>("30");

    const { data: revenueStats, isLoading: isLoadingStats, refetch: refetchStats } = useGetVendorRevenueStatsQuery(undefined, {
        skip: role !== "SUPPLIER",
    });

    const { data: chartData, isLoading: isLoadingChart, refetch: refetchChart } = useGetVendorChartDataQuery({ days: parseInt(range) }, {
        skip: role !== "SUPPLIER",
    });

    const handleRefresh = () => {
        refetchStats();
        refetchChart();
    };

    const formatCurrency = (amount?: number) => {
        if (amount === undefined || amount === null) return "0 ₫";
        if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
        if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} tr`;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
    };

    // --- LOGIC XỬ LÝ DỮ LIỆU ---
    const processedChartData = useMemo(() => {
        if (!chartData || chartData.length === 0) return [];

        // 1. 7 Ngày & 30 Ngày: Giữ nguyên từng ngày
        if (range === "7" || range === "30") {
            return chartData.map(item => ({
                date: item.date,
                revenue: item.revenue,
                sessions: item.sessions
            }));
        }

        // 2. 90 Ngày: Gộp theo Tuần (7 ngày/nhóm)
        if (range === "90") {
            const aggregated = [];
            let chunkRevenue = 0;
            let chunkSessions = 0;
            let startDateStr = "";

            for (let i = 0; i < chartData.length; i++) {
                if (i % 7 === 0) {
                    startDateStr = chartData[i].date; // Ngày bắt đầu tuần
                    chunkRevenue = 0;
                    chunkSessions = 0;
                }

                chunkRevenue += chartData[i].revenue;
                chunkSessions += chartData[i].sessions;

                // Nếu là ngày cuối của block 7 hoặc ngày cuối cùng của mảng
                if ((i + 1) % 7 === 0 || i === chartData.length - 1) {
                    aggregated.push({
                        date: `${startDateStr} - ${chartData[i].date}`,
                        revenue: chunkRevenue,
                        sessions: chunkSessions
                    });
                }
            }
            return aggregated;
        }

        // 3. 1 Năm: Gộp theo Tháng
        if (range === "365") {
            const monthMap = new Map<string, { revenue: number; sessions: number; label: string }>();

            chartData.forEach(item => {
                // item.date dạng "dd/MM" -> Lấy "MM"
                const month = item.date.split('/')[1];
                if (!monthMap.has(month)) {
                    monthMap.set(month, { revenue: 0, sessions: 0, label: `Tháng ${month}` });
                }
                const entry = monthMap.get(month)!;
                entry.revenue += item.revenue;
                entry.sessions += item.sessions;
            });

            return Array.from(monthMap.values()).map(v => ({
                date: v.label,
                revenue: v.revenue,
                sessions: v.sessions
            }));
        }

        return [];
    }, [chartData, range]);

    const chartConfig = {
        revenue: { label: "Doanh thu", color: "#2563eb" },
        sessions: { label: "Lượt sạc", color: "#f59e0b" },
    } satisfies ChartConfig;

    return (
        <section className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Tổng quan hoạt động</h2>
                    <p className="text-sm text-gray-500 mt-1">Cập nhật số liệu kinh doanh và hiệu suất trạm sạc.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={range} onValueChange={(value: TimeRange) => setRange(value)}>
                        <SelectTrigger className="w-[160px] h-9 text-sm flex flex-row items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <SelectValue placeholder="Chọn thời gian" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">7 ngày qua</SelectItem>
                            <SelectItem value="30">30 ngày qua</SelectItem>
                            <SelectItem value="90">3 tháng qua</SelectItem>
                            <SelectItem value="365">1 năm qua</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="h-9 px-3" onClick={handleRefresh}>
                        <RefreshCcw className={`h-4 w-4 text-gray-500 ${isLoadingStats || isLoadingChart ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ModernMetricCard
                    title="Doanh thu hôm nay"
                    value={formatCurrency(revenueStats?.dailyRevenue)}
                    subValue={revenueStats?.monthlyGrowth ?? null}
                    subLabel="so với tháng trước"
                    icon={<TrendingUp className="h-5 w-5 text-white" />}
                    color="bg-blue-600" isLoading={isLoadingStats} />

                <ModernMetricCard
                    title="Doanh thu tháng này"
                    value={formatCurrency(revenueStats?.monthlyRevenue)}
                    subValue={null}
                    subLabel="Tháng hiện tại"
                    icon={<Calendar className="h-5 w-5 text-white" />}
                    color="bg-indigo-600"
                    isLoading={isLoadingStats} />

                <ModernMetricCard
                    title="Doanh thu tháng trước"
                    value={formatCurrency(revenueStats?.lastMonthRevenue)}
                    subValue={null}
                    subLabel="Đã chốt sổ"
                    icon={<BarChart3 className="h-5 w-5 text-white" />}
                    color="bg-slate-600"
                    isLoading={isLoadingStats} />
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 text-lg">Hiệu suất kinh doanh</h3>
                    <p className="text-sm text-gray-500">Doanh thu và lượt sạc</p>
                </div>
                <div className="h-[400px] w-full">
                    {isLoadingChart ? (
                        <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-lg animate-pulse"><p className="text-gray-400 text-sm">Đang tải dữ liệu...</p></div>
                    ) : processedChartData.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <ComposedChart
                                accessibilityLayer
                                data={processedChartData}
                                margin={{ left: 10, right: 10, top: 20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor={chartConfig.revenue.color}
                                            stopOpacity={0.3} />
                                        <stop
                                            offset="95%"
                                            stopColor={chartConfig.revenue.color}
                                            stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />

                                {/* Trục X: 30 ngày -> hiện label cách nhật */}
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    minTickGap={30}
                                    interval={range === "30" ? 1 : "preserveStartEnd"}
                                    style={{ fontSize: '12px', fill: '#6b7280' }}
                                />

                                {/* Trục Y Trái: Doanh thu */}
                                <YAxis
                                    yAxisId="left"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                                    style={{ fontSize: '12px', fill: chartConfig.revenue.color }} />

                                {/* Trục Y Phải: Lượt sạc */}
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tickLine={false}
                                    axisLine={false}
                                    style={{ fontSize: '12px', fill: chartConfig.sessions.color }} />

                                <ChartTooltip content={
                                    <ChartTooltipContent labelFormatter={(value) =>
                                        <span className="font-semibold text-gray-700">{value}</span>} />} />
                                <ChartLegend />

                                <Area
                                    yAxisId="left"
                                    dataKey="revenue"
                                    type="monotone"
                                    fill="url(#fillRevenue)"
                                    stroke={chartConfig.revenue.color}
                                    strokeWidth={3}
                                    name="Doanh thu"
                                    dot={false}
                                    activeDot={{ r: 6 }} />
                                <Line
                                    yAxisId="right"
                                    dataKey="sessions"
                                    type="monotone"
                                    stroke={chartConfig.sessions.color}
                                    strokeWidth={2}
                                    name="Lượt sạc"
                                    dot={{ r: 3, fill: chartConfig.sessions.color }}
                                    activeDot={{ r: 6 }} />
                            </ComposedChart>
                        </ChartContainer>
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">Chưa có dữ liệu</div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default AnalyticsSection;

const ModernMetricCard: React.FC<{
    title: string;
    value: string;
    subValue: number | null;
    subLabel: string;
    icon: React.ReactNode;
    color: string;
    isLoading: boolean;
}> = ({ title, value, subValue, subLabel, icon, color, isLoading }) => {
    if (isLoading) return <div className="h-32 rounded-2xl bg-gray-50 animate-pulse border border-gray-100" />;
    const isPositive = (subValue || 0) >= 0;
    return (
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between">
                <div><p className="text-sm font-medium text-gray-500">{title}</p><h3 className="mt-2 text-2xl font-bold text-gray-900 tracking-tight">{value}</h3></div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${color}`}>{icon}</div>
            </div>
            <div className="mt-4 flex items-center text-sm">
                {subValue !== null && (<span className={`flex items-center font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>{isPositive ? <ArrowUpRight className="mr-1 h-4 w-4" /> : <ArrowDownRight className="mr-1 h-4 w-4" />}{Math.abs(subValue).toFixed(1)}%</span>)}
                <span className={`text-gray-500 ${subValue !== null ? 'ml-2' : ''}`}>{subLabel}</span>
            </div>
        </div>
    );
};
