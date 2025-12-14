'use client';

import React, { useState, useMemo } from "react";
import { format, subDays, parse, startOfWeek, endOfWeek, formatISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    TrendingUp,
    Calendar as CalendarIcon,
    RefreshCcw
} from "lucide-react";
import { DateRange } from "react-day-picker";

// UI Components
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Charts
import { Area, Line, ComposedChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

// Redux
import { useGetVendorRevenueStatsQuery, useGetVendorChartDataByRangeQuery } from "@/lib/redux/services/profileApi";
import { UserRole } from "../types";

interface AnalyticsSectionProps {
    role: Extract<UserRole, "SUPPLIER" | "TECH">;
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ role }) => {
    // State quản lý khoảng thời gian (Mặc định 30 ngày gần nhất)
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });

    // State quản lý chế độ xem (Ngày / Tuần / Tháng)
    const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");

    // Chuẩn bị params cho API query
    const queryParams = useMemo(() => {
        if (!dateRange?.from || !dateRange?.to) {
            return { from: '', to: '' };
        }
        return {
            from: format(dateRange.from, 'yyyy-MM-dd'),
            to: format(dateRange.to, 'yyyy-MM-dd'),
        };
    }, [dateRange]);

    const isValidRange = Boolean(dateRange?.from && dateRange?.to);

    // Gọi API Revenue Stats (Tổng quan)
    const {
        data: revenueStats,
        isLoading: isLoadingStats,
        refetch: refetchStats
    } = useGetVendorRevenueStatsQuery(undefined, {
        skip: role !== "SUPPLIER" || !isValidRange,
    });

    // Gọi API Chart Data (Theo range)
    const {
        data: chartData,
        isLoading: isLoadingChart,
        refetch: refetchChart
    } = useGetVendorChartDataByRangeQuery(queryParams, {
        skip: role !== "SUPPLIER" || !dateRange?.from || !dateRange?.to,
    });

    const handleRefresh = () => {
        if (isValidRange) {
            refetchStats();
            refetchChart();
        }
    };

    // Helper format tiền
    const formatCurrency = (amount?: number) => {
        if (amount === undefined || amount === null) return "0 ₫";
        if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
        if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} tr`;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
    };

    // --- LOGIC GỘP DỮ LIỆU (AGGREGATION) ---
    const processedChartData = useMemo(() => {
        if (!chartData || chartData.length === 0) return [];

        // 1. Chế độ NGÀY: Giữ nguyên, chỉ format lại display date
        if (viewMode === "day") {
            return chartData.map(item => ({
                ...item,
                displayDate: item.date.substring(0, 5) // "dd/MM"
            }));
        }

        // 2. Chế độ TUẦN: Gộp theo tuần ISO
        if (viewMode === "week") {
            const weeklyMap = new Map<string, { revenue: number; sessions: number; label: string }>();

            chartData.forEach(item => {
                const dateObj = parse(item.date, 'dd/MM/yyyy', new Date());
                const start = startOfWeek(dateObj, { weekStartsOn: 1 });
                const end = endOfWeek(dateObj, { weekStartsOn: 1 });
                // Key định danh tuần
                const key = formatISO(start);
                const label = `${format(start, 'dd/MM')} - ${format(end, 'dd/MM')}`;

                if (!weeklyMap.has(key)) {
                    weeklyMap.set(key, { revenue: 0, sessions: 0, label });
                }
                const entry = weeklyMap.get(key)!;
                entry.revenue += item.revenue;
                entry.sessions += item.sessions;
            });
            return Array.from(weeklyMap.values()).map(v => ({
                date: v.label,
                displayDate: v.label,
                revenue: v.revenue,
                sessions: v.sessions
            }));
        }

        // 3. Chế độ THÁNG: Gộp theo tháng
        if (viewMode === "month") {
            const monthlyMap = new Map<string, { revenue: number; sessions: number; label: string }>();

            chartData.forEach(item => {
                const dateObj = parse(item.date, 'dd/MM/yyyy', new Date());
                const key = format(dateObj, 'MM/yyyy');
                const label = `Tháng ${format(dateObj, 'MM')}`;

                if (!monthlyMap.has(key)) {
                    monthlyMap.set(key, { revenue: 0, sessions: 0, label });
                }
                const entry = monthlyMap.get(key)!;
                entry.revenue += item.revenue;
                entry.sessions += item.sessions;
            });
            return Array.from(monthlyMap.values()).map(v => ({
                date: v.label,
                displayDate: v.label,
                revenue: v.revenue,
                sessions: v.sessions
            }));
        }

        return [];
    }, [chartData, viewMode]);

    // Dữ liệu bảng: Luôn hiển thị chi tiết theo ngày, đảo ngược để ngày mới nhất lên đầu
    const tableData = useMemo(() => {
        if (!chartData) return [];
        return [...chartData].reverse();
    }, [chartData]);

    // Cấu hình màu Chart
    const chartConfig = {
        revenue: { label: "Doanh thu", color: "#2563eb" },
        sessions: { label: "Lượt sạc", color: "#f59e0b" },
    } satisfies ChartConfig;

    return (
        <section className="space-y-6 animate-in fade-in duration-500">
            {/* Header + Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Báo cáo doanh thu</h2>
                    <p className="text-sm text-gray-500 mt-1">Theo dõi hiệu quả kinh doanh và số liệu trạm sạc.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Date Picker Range */}
                    <div className="grid gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-[260px] justify-start text-left font-normal bg-white",
                                        !dateRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                                                {format(dateRange.to, "dd/MM/yyyy")}
                                            </>
                                        ) : (
                                            format(dateRange.from, "dd/MM/yyyy")
                                        )
                                    ) : (
                                        <span>Chọn khoảng thời gian</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                    locale={vi}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRefresh}
                        className="bg-white"
                        disabled={!isValidRange || isLoadingStats || isLoadingChart}
                    >
                        <RefreshCcw className={`h-4 w-4 text-gray-600 ${isLoadingStats || isLoadingChart ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ModernMetricCard
                    title="Doanh thu hôm nay"
                    value={formatCurrency(revenueStats?.dailyRevenue)}
                    subValue={null}
                    subLabel=""
                    icon={<TrendingUp className="h-5 w-5 text-white" />}
                    color="bg-blue-600" isLoading={isLoadingStats} />

                <ModernMetricCard
                    title="Doanh thu tháng này"
                    value={formatCurrency(revenueStats?.monthlyRevenue)}
                    subValue={revenueStats?.monthlyGrowth ?? null}
                    subLabel="so với tháng trước"
                    icon={<CalendarIcon className="h-5 w-5 text-white" />}
                    color="bg-indigo-600" isLoading={isLoadingStats} />

                <ModernMetricCard
                    title="Doanh thu tháng trước"
                    value={formatCurrency(revenueStats?.lastMonthRevenue)}
                    subValue={null}
                    subLabel="Đã chốt sổ"
                    icon={<BarChart3 className="h-5 w-5 text-white" />}
                    color="bg-slate-600" isLoading={isLoadingStats} />
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">Biểu đồ tăng trưởng</h3>
                        <p className="text-sm text-gray-500">
                            Hiển thị dữ liệu theo {viewMode === 'day' ? 'Ngày' : viewMode === 'week' ? 'Tuần' : 'Tháng'}
                        </p>
                    </div>

                    {/* View Mode Switcher */}
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-full sm:w-[300px]">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="day">Ngày</TabsTrigger>
                            <TabsTrigger value="week">Tuần</TabsTrigger>
                            <TabsTrigger value="month">Tháng</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="h-[400px] w-full">
                    {isLoadingChart ? (
                        <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
                            <p className="text-gray-400 text-sm">Đang tải biểu đồ...</p>
                        </div>
                    ) : processedChartData.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <ComposedChart
                                accessibilityLayer
                                data={processedChartData}
                                margin={{ left: 10, right: 10, top: 20, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={chartConfig.revenue.color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={chartConfig.revenue.color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />

                                <XAxis
                                    dataKey="displayDate"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    minTickGap={30}
                                    style={{ fontSize: '12px', fill: '#6b7280' }}
                                />

                                <YAxis
                                    yAxisId="left"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                                    style={{ fontSize: '12px', fill: chartConfig.revenue.color }}
                                />

                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tickLine={false}
                                    axisLine={false}
                                    style={{ fontSize: '12px', fill: chartConfig.sessions.color }}
                                />

                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />

                                <Area
                                    yAxisId="left"
                                    dataKey="revenue"
                                    type="monotone"
                                    fill="url(#fillRevenue)"
                                    stroke={chartConfig.revenue.color}
                                    strokeWidth={3}
                                    name="Doanh thu"
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    yAxisId="right"
                                    dataKey="sessions"
                                    type="monotone"
                                    stroke={chartConfig.sessions.color}
                                    strokeWidth={2}
                                    name="Lượt sạc"
                                    dot={{ r: 3, fill: chartConfig.sessions.color }}
                                    activeDot={{ r: 6 }}
                                />
                            </ComposedChart>
                        </ChartContainer>
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
                            Không có dữ liệu trong khoảng thời gian này
                        </div>
                    )}
                </div>
            </div>

            {/* Data Table Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-lg">Chi tiết theo ngày</h3>
                    <p className="text-sm text-gray-500 mt-1">Số liệu cụ thể từng ngày trong khoảng thời gian đã chọn.</p>
                </div>
                <div className="relative w-full overflow-auto max-h-[400px]">
                    <Table>
                        <TableHeader className="bg-gray-50 sticky top-0 z-10">
                            <TableRow>
                                {/* Cột Ngày: Căn trái, độ rộng cố định hoặc auto */}
                                <TableHead className="w-[40%] text-left pl-6">Ngày</TableHead>

                                {/* Cột Số lượt sạc: Căn phải, độ rộng 30% */}
                                <TableHead className="w-[30%] text-right">Số lượt sạc</TableHead>

                                {/* Cột Doanh thu: Căn phải, độ rộng 30%, padding phải để không sát mép */}
                                <TableHead className="w-[30%] text-right pr-6">Doanh thu</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tableData.length > 0 ? (
                                tableData.map((row) => (
                                    <TableRow key={row.date} className="hover:bg-gray-50/50">
                                        <TableCell className="font-medium text-gray-700 text-left pl-6">
                                            {row.date}
                                        </TableCell>

                                        <TableCell className="text-right">
                                            {row.sessions}
                                        </TableCell>

                                        <TableCell className="text-right font-semibold text-blue-600 pr-6">
                                            {formatCurrency(row.revenue)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                                        Chưa có dữ liệu
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </section>
    );
};

export default AnalyticsSection;

// Sub-component cho Metric Card
const ModernMetricCard: React.FC<{
    title: string;
    value: string;
    subValue: number | null;
    subLabel: string;
    icon: React.ReactNode;
    color: string;
    isLoading: boolean;
}> = ({ title, value, subValue, subLabel, icon, color, isLoading }) => {
    if (isLoading) return
        <div className="h-32 rounded-2xl bg-gray-50 animate-pulse border border-gray-100"></div>;

    const isPositive = (subValue || 0) >= 0;

    return (
        <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="mt-2 text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${color}`}>
                    {icon}
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
                {subValue !== null && (
                    <span className={`flex items-center font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isPositive ? <ArrowUpRight className="mr-1 h-4 w-4" /> : <ArrowDownRight className="mr-1 h-4 w-4" />}
                        {Math.abs(subValue).toFixed(1)}%
                    </span>
                )}
                <span className={`text-gray-500 ${subValue !== null ? 'ml-2' : ''}`}>{subLabel}</span>
            </div>
        </div>
    );
};
