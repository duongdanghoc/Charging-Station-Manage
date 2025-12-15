"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Zap, Wrench, MapPin, Home, Clock, Trash2, Edit, Info, PanelLeftOpen, PanelRightOpen, Star, Navigation, Search, Filter, X } from 'lucide-react';
import { StationService, type FilterParams } from './StationService';
import type { Station, StationType } from './StationPinTool';
import { formatDistance } from './formatters';
import { StationPinTool } from './StationPinTool';
import type mapboxgl from 'mapbox-gl';

type StationListItem = Station & {
    distance?: number | null;
    status?: string | null;
    rating?: number | null;
    ratingProvider?: string | null;
    connectors?: string[] | null;
};

interface StationFilterProps {
    onStationClick?: (station: Station) => void;
    onStationEdit?: (station: Station) => void;
    onStationDelete?: (stationId: string) => void;
    onStationAdded?: (station: Station) => void;
    onStationNavigate?: (station: Station) => void;
    onStationDetail?: (stationId: string) => void;
    map?: mapboxgl.Map | null;
    className?: string;
    mobile?: boolean;
    forceCollapse?: boolean;
}

export const StationFilter: React.FC<StationFilterProps> = ({
    onStationClick,
    onStationEdit,
    onStationDelete,
    onStationAdded,
    onStationNavigate,
    onStationDetail,
    map,
    className = '',
    mobile = false,
    forceCollapse = false,
}) => {
    const [stations, setStations] = useState<StationListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | StationType>('all');
    // Using isCollapsed for desktop sidebar, sheetState for mobile
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [sheetState, setSheetState] = useState<'collapsed' | 'expanded'>('collapsed');

    // Effect to handle forced collapse (e.g. from simulation start)
    useEffect(() => {
        if (forceCollapse) {
            setIsCollapsed(true);
            if (sheetState === 'expanded') {
                setSheetState('collapsed');
            }
        }
    }, [forceCollapse, sheetState]);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isPinToolActive, setIsPinToolActive] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState<FilterParams>({
        status: undefined,
        vehicleType: undefined,
        connectorType: undefined,
        stationType: 'all',
    });

    // Drag logic for mobile sheet
    const sheetRef = useRef<HTMLDivElement>(null);
    const startY = useRef<number | null>(null);
    const currentY = useRef<number | null>(null);
    const [dragOffset, setDragOffset] = useState(0);

    const onTouchStart = (e: React.TouchEvent) => {
        startY.current = e.touches[0].clientY;
        currentY.current = startY.current;
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!startY.current) return;
        currentY.current = e.touches[0].clientY;
        const diff = currentY.current - startY.current;

        // Only allow dragging down if expanded, or up if collapsed (prevent over-drag)
        if (sheetState === 'expanded' && diff > 0) {
            setDragOffset(diff);
        } else if (sheetState === 'collapsed' && diff < 0) {
            setDragOffset(diff);
        }
    };

    const onTouchEnd = () => {
        if (!startY.current || !currentY.current) {
            setDragOffset(0);
            return;
        }

        const diff = currentY.current - startY.current;
        const threshold = 100; // px to trigger change

        if (sheetState === 'expanded') {
            if (diff > threshold) setSheetState('collapsed');
        } else {
            if (diff < -threshold) setSheetState('expanded');
        }

        setDragOffset(0);
        startY.current = null;
        currentY.current = null;
    };

    // Reset sheet when filters change to show results
    useEffect(() => {
        if (mobile && (searchText || filters.status || filters.vehicleType || filters.connectorType)) {
            // Optional: Auto expand when searching? 
            // setSheetState('expanded');
        }
    }, [searchText, filters, mobile]);

    useEffect(() => {
        loadStations();
    }, [filter, searchText, filters]);

    const loadStations = async () => {
        try {
            setLoading(true);
            setError(null);

            const filterParams: FilterParams = {
                search: searchText || undefined,
                status: filters.status,
                vehicleType: filters.vehicleType,
                connectorType: filters.connectorType,
                stationType: filters.stationType,
                size: 100,
            };

            const data = await StationService.filterStations(filterParams);
            setStations(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi không xác định');
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchText('');
        setFilters({
            status: undefined,
            vehicleType: undefined,
            connectorType: undefined,
            stationType: 'all',
        });
    };

    const hasActiveFilters = searchText || filters.status !== undefined || filters.vehicleType || filters.connectorType || (filters.stationType && filters.stationType !== 'all');

    const handleDelete = async (stationId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa trạm này?')) return;

        try {
            setDeletingId(stationId);
            await StationService.deleteStation(stationId);
            setStations(prev => prev.filter(s => s.id !== stationId));
            onStationDelete?.(stationId);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Không thể xóa trạm');
        } finally {
            setDeletingId(null);
        }
    };

    const getStationIcon = (type: StationType) => {
        return type === 'rescue' ? Wrench : Zap;
    };

    const getStationTypeText = (type: StationType) => {
        return type === 'rescue' ? 'Cứu hộ' : 'Sạc điện';
    };

    const formatCoordinate = (value: number | undefined) => {
        if (typeof value !== 'number' || Number.isNaN(value)) return '—';
        return value.toFixed(3);
    };

    const formatDate = (value?: string | null) => {
        if (!value) return '—';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '—';
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const filteredStations = stations;

    const formatStationDistance = (distance?: number | null) => {
        if (typeof distance !== 'number' || Number.isNaN(distance)) return null;
        const normalizedMeters = distance > 200 ? distance : distance * 1000;
        return formatDistance(normalizedMeters);
    };

    if (mobile) {
        // Mobile Bottom Sheet UI
        const isExpanded = sheetState === 'expanded';
        const heightStyle = isExpanded ? '50%' : '140px'; // 50% height when expanded
        const transformStyle = `translateY(${dragOffset}px)`;

        return (
            <div
                ref={sheetRef}
                className="fixed bottom-0 left-0 right-0 z-[450] bg-white rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-all duration-300 ease-out flex flex-col"
                style={{
                    height: heightStyle,
                    transform: transformStyle,
                    touchAction: 'none' // Prevent browser default scrolling on container
                }}
            >
                {/* Drag Handle */}
                <div
                    className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    onClick={() => setSheetState(s => s === 'collapsed' ? 'expanded' : 'collapsed')}
                >
                    <div className="w-12 h-1.5 rounded-full bg-gray-300" />
                </div>

                {/* Header Section (Always Visible) */}
                <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800">Trạm sạc & Cứu hộ</h3>
                        <p className="text-xs text-gray-500">{stations.length} trạm gần đây</p>
                    </div>
                    <button
                        onClick={() => setSheetState(s => s === 'collapsed' ? 'expanded' : 'collapsed')}
                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
                    >
                        {isExpanded ? <X size={20} /> : <PanelRightOpen size={20} className="rotate-90" />}
                    </button>
                </div>

                {/* Scrollable Content (Expanded) or Preview (Collapsed) */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-3" style={{ touchAction: 'pan-y' }}> {/* Allow scroll inside content */}
                    {!isExpanded ? (
                        /* Collapsed Preview: Show mostly the first items horizontally or just hint */
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {/* Horizontal scroll preview for collapsed state */}
                            {loading ? <span className="text-xs text-gray-400">Đang tải...</span> :
                                filteredStations.slice(0, 5).map((station, index) => {
                                    const Icon = getStationIcon(station.type);
                                    return (
                                        <div key={`preview-${station.id}-${index}`} className="min-w-[140px] bg-white p-2 rounded-lg border border-gray-100 shadow-sm flex flex-col gap-1"
                                            onClick={() => { onStationDetail?.(station.id!); setSheetState('expanded'); }}>
                                            <div className="flex items-center gap-1">
                                                <Icon size={12} className={station.type === 'rescue' ? 'text-orange-500' : 'text-green-500'} />
                                                <span className="text-xs font-medium truncate">{station.name}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-400 truncate">{station.description}</div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    ) : (
                        /* Expanded: Full list logic reused but adapted for mobile container */
                        <div className="space-y-3">
                            {/* Station Type Filter */}
                            <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1">
                                {[
                                    { value: 'all' as const, label: 'Tất cả', icon: null },
                                    { value: 'charging' as const, label: 'Sạc', icon: Zap },
                                    { value: 'rescue' as const, label: 'Cứu hộ', icon: Wrench },
                                ].map(({ value, label, icon: Icon }) => (
                                    <button
                                        key={value}
                                        onClick={() => setFilters(prev => ({ ...prev, stationType: value }))}
                                        className={`flex-1 inline-flex items-center justify-center gap-1 rounded px-2 py-1 text-xs font-medium shadow-sm ${
                                            filters.stationType === value
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700'
                                        }`}
                                        title={`Hiển thị ${label.toLowerCase()}`}
                                    >
                                        {Icon && <Icon size={14} />}
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Keep search/filter inputs active here if expanded */}
                            <div className="bg-white p-2 rounded-lg shadow-sm mb-3">
                                <div className="flex gap-2 mb-2">
                                    <input
                                        className="flex-1 text-sm bg-gray-100 rounded px-2 py-1.5 outline-none"
                                        placeholder="Tìm trạm..."
                                        value={searchText}
                                        onChange={e => setSearchText(e.target.value)}
                                    />
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`p-1.5 rounded border ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200'}`}
                                    >
                                        <Filter size={16} />
                                    </button>
                                </div>
                                {showFilters && (
                                    <div className="pt-2 border-t border-gray-100 space-y-3">
                                        {/* Status Filter */}
                                        <div>
                                            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">Trạng thái</label>
                                            <div className="flex gap-1.5">
                                                {[
                                                    { value: undefined, label: 'Tất cả' },
                                                    { value: 1, label: 'Hoạt động' },
                                                    { value: 0, label: 'Bảo trì' },
                                                ].map(({ value, label }) => (
                                                    <button
                                                        key={label}
                                                        onClick={() => setFilters(prev => ({ ...prev, status: value }))}
                                                        className={`flex-1 rounded-md border px-2 py-1.5 text-[11px] font-semibold transition-colors ${filters.status === value
                                                            ? 'border-blue-600 bg-blue-600 text-white'
                                                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Vehicle Type Filter */}
                                        <div>
                                            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">Loại xe</label>
                                            <div className="flex gap-1.5">
                                                {[
                                                    { value: undefined, label: 'Tất cả' },
                                                    { value: 'CAR' as const, label: 'Ô tô' },
                                                    { value: 'MOTORBIKE' as const, label: 'Xe máy' },
                                                    { value: 'BICYCLE' as const, label: 'Xe đạp' },
                                                ].map(({ value, label }) => (
                                                    <button
                                                        key={label}
                                                        onClick={() => setFilters(prev => ({ ...prev, vehicleType: value }))}
                                                        className={`flex-1 rounded-md border px-2 py-1.5 text-[11px] font-semibold transition-colors ${filters.vehicleType === value
                                                            ? 'border-blue-600 bg-blue-600 text-white'
                                                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Connector Type Filter */}
                                        <div>
                                            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">Cổng sạc</label>
                                            <div className="grid grid-cols-3 gap-1.5">
                                                {[
                                                    { value: undefined, label: 'Tất cả' },
                                                    { value: 'TYPE1' as const, label: 'Type 1' },
                                                    { value: 'TYPE2' as const, label: 'Type 2' },
                                                    { value: 'CHADEMO' as const, label: 'CHAdeMO' },
                                                    { value: 'CCS' as const, label: 'CCS' },
                                                    { value: 'TESLA' as const, label: 'Tesla' },
                                                ].map(({ value, label }) => (
                                                    <button
                                                        key={label}
                                                        onClick={() => setFilters(prev => ({ ...prev, connectorType: value }))}
                                                        className={`rounded-md border px-2 py-1.5 text-[11px] font-semibold transition-colors ${filters.connectorType === value
                                                            ? 'border-blue-600 bg-blue-600 text-white'
                                                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {hasActiveFilters && (
                                            <button
                                                onClick={clearFilters}
                                                className="w-full rounded-md bg-gray-100 px-2 py-2 text-[11px] font-semibold text-gray-700 hover:bg-gray-200"
                                            >
                                                Xóa bộ lọc
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {loading && <div className="text-center py-4 text-gray-500 text-sm">Đang tải dữ liệu...</div>}

                            {!loading && filteredStations.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">Không tìm thấy trạm nào</div>}

                            {filteredStations.map((station, index) => {
                                const Icon = getStationIcon(station.type);
                                const statusLabel = (station as StationListItem).status ?? null;
                                const ratingValue = (station as StationListItem).rating;
                                const connectors = (station as StationListItem).connectors ?? [];

                                return (
                                    <div
                                        key={`mobile-${station.id}-${index}`}
                                        onClick={() => onStationDetail?.(station.id!)}
                                        className="mb-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm transition-all hover:-translate-y-[1px] hover:border-blue-300 hover:shadow-md cursor-pointer"
                                    >
                                        {/* Header */}
                                        <div className="flex items-start gap-2.5">
                                            <span
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${station.type === 'rescue' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </span>

                                            <div className="min-w-0 flex-1 space-y-1">
                                                {/* Name & Status */}
                                                <div className="flex items-center gap-1.5">
                                                    <span className="truncate text-xs font-semibold text-slate-900">
                                                        {station.name}
                                                    </span>

                                                    {statusLabel && (
                                                        <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold ${statusLabel === 'Hoạt động'
                                                            ? 'bg-emerald-50 text-emerald-600'
                                                            : 'bg-slate-100 text-slate-600'
                                                            }`}>
                                                            <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusLabel === 'Hoạt động' ? 'bg-emerald-500' : 'bg-slate-400'
                                                                }`} />
                                                            {statusLabel}
                                                        </span>
                                                    )}

                                                    {typeof ratingValue === 'number' && Number.isFinite(ratingValue) && (
                                                        <span className="ml-auto inline-flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                                                            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-500" />
                                                            {ratingValue.toFixed(1)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Address */}
                                                {station.description && (
                                                    <div className="flex items-start gap-1 text-[11px] text-slate-500">
                                                        <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
                                                        <span className="line-clamp-1 leading-tight">{station.description}</span>
                                                    </div>
                                                )}

                                                {/* Contact & Time */}
                                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                    {station.contact && (
                                                        <span className="inline-flex items-center gap-1">
                                                            <Home className="h-3 w-3 text-slate-400" />
                                                            <span className="truncate">{station.contact}</span>
                                                        </span>
                                                    )}

                                                    {station.openTime && station.closeTime && (
                                                        <span className="inline-flex items-center gap-1">
                                                            <Clock className="h-3 w-3 text-slate-400" />
                                                            <span className="whitespace-nowrap">{station.openTime.substring(0, 5)} - {station.closeTime.substring(0, 5)}</span>
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Connectors */}
                                                {connectors && connectors.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {connectors.map((connector, idx) => (
                                                            <span key={idx} className="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                                                                <Zap className="mr-0.5 h-2.5 w-2.5" />
                                                                {connector}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-2 flex items-center justify-end gap-1 border-t border-slate-100 pt-2">
                                            {onStationNavigate && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onStationNavigate(station);
                                                    }}
                                                    className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-600 transition-colors hover:bg-blue-100"
                                                    title="Chỉ đường"
                                                >
                                                    <Navigation className="h-3 w-3" />
                                                    Chỉ đường
                                                </button>
                                            )}

                                            {onStationEdit && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onStationEdit(station);
                                                    }}
                                                    className="rounded-md p-1 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                </button>
                                            )}

                                            {onStationDelete && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(station.id!);
                                                    }}
                                                    disabled={deletingId === station.id}
                                                    className="rounded-md p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (isCollapsed) {
        return (
            <div className={`fixed bottom-4 right-4 z-[360] w-[340px] max-w-[90vw] rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur ${className}`}>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-1 flex-col leading-tight">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Danh sách trạm</span>
                        <span className="text-[10px] font-medium text-slate-500">{stations.length} trạm · {filter === 'all' ? 'Tất cả' : getStationTypeText(filter)}</span>
                    </div>
                    <button
                        onClick={() => setIsCollapsed(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white transition-colors hover:bg-blue-400"
                        title="Mở danh sách trạm"
                    >
                        <PanelRightOpen className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`fixed bottom-4 right-4 z-[350] flex h-[calc(60vh-2rem)] w-[370px] max-w-[90vw] flex-col rounded-2xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur ${className}`}>
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200">
                <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Trạm sạc</span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">và Cứu hộ</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* {map ? (
                        <StationPinTool
                            map={map}
                            isActive={isPinToolActive}
                            onToggle={() => setIsPinToolActive((prev) => !prev)}
                            onStationAdded={async (station) => {
                                setIsPinToolActive(false);
                                onStationAdded?.(station);
                                await loadStations();
                            }}
                        />
                    ) : (
                        <button
                            disabled
                            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-400"
                            title="Bản đồ đang khởi tạo"
                        >
                            <MapPin className="h-4 w-4" />
                            Thêm trạm
                        </button>
                    )} */}

                    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
                        {[
                            { value: 'all' as const, label: 'Tất cả', icon: null },
                            { value: 'charging' as const, label: 'Sạc', icon: Zap },
                            { value: 'rescue' as const, label: 'Cứu hộ', icon: Wrench },
                        ].map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => setFilters(prev => ({ ...prev, stationType: value }))}
                                className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium shadow-sm ${
                                    filters.stationType === value
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-slate-700'
                                }`}
                                title={`Hiển thị ${label.toLowerCase()}`}
                            >
                                {Icon && <Icon size={14} />}
                                <span className="hidden lg:inline">{label}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            setIsPinToolActive(false);
                            setIsCollapsed(true);
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        title="Thu gọn danh sách trạm"
                    >
                        <PanelLeftOpen className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="px-4 py-2.5 border-b border-slate-200 space-y-2">
                {/* Search bar and filter button */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm tên, địa chỉ..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-8 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100"
                        />
                        {searchText && (
                            <button
                                onClick={() => setSearchText('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${hasActiveFilters
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <Filter className="h-3.5 w-3.5" />
                        {hasActiveFilters && `(${[searchText, filters.status !== undefined, filters.vehicleType, filters.connectorType].filter(Boolean).length})`}
                    </button>
                </div>

                {/* Filters panel */}
                {showFilters && (
                    <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                        {/* Status Filter */}
                        <div>
                            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Trạng thái</label>
                            <div className="flex gap-1.5">
                                {[
                                    { value: undefined, label: 'Tất cả' },
                                    { value: 1, label: 'Hoạt động' },
                                    { value: 0, label: 'Bảo trì' },
                                ].map(({ value, label }) => (
                                    <button
                                        key={label}
                                        onClick={() => setFilters(prev => ({ ...prev, status: value }))}
                                        className={`flex-1 rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors ${filters.status === value
                                            ? 'border-blue-600 bg-blue-600 text-white'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Vehicle Type Filter */}
                        <div>
                            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Loại xe</label>
                            <div className="flex gap-1.5">
                                {[
                                    { value: undefined, label: 'Tất cả' },
                                    { value: 'CAR' as const, label: 'Ô tô' },
                                    { value: 'MOTORBIKE' as const, label: 'Xe máy' },
                                    { value: 'BICYCLE' as const, label: 'Xe đạp' },
                                ].map(({ value, label }) => (
                                    <button
                                        key={label}
                                        onClick={() => setFilters(prev => ({ ...prev, vehicleType: value }))}
                                        className={`flex-1 rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors ${filters.vehicleType === value
                                            ? 'border-blue-600 bg-blue-600 text-white'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Connector Type Filter */}
                        <div>
                            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Cổng sạc</label>
                            <div className="grid grid-cols-3 gap-1.5">
                                {[
                                    { value: undefined, label: 'Tất cả' },
                                    { value: 'TYPE1' as const, label: 'Type 1' },
                                    { value: 'TYPE2' as const, label: 'Type 2' },
                                    { value: 'CHADEMO' as const, label: 'CHAdeMO' },
                                    { value: 'CCS' as const, label: 'CCS' },
                                    { value: 'TESLA' as const, label: 'Tesla' },
                                ].map(({ value, label }) => (
                                    <button
                                        key={label}
                                        onClick={() => setFilters(prev => ({ ...prev, connectorType: value }))}
                                        className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors ${filters.connectorType === value
                                            ? 'border-blue-600 bg-blue-600 text-white'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="w-full rounded-md bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-300"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Kết quả: <strong className="text-slate-700">{stations.length}</strong> trạm</span>
                </div>
            </div>

            {/* Station List */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 pt-2">
                {loading && (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-500">
                        Đang tải...
                    </div>
                )}

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center text-xs text-red-500">
                        {error}
                        <button
                            onClick={loadStations}
                            className="mt-2 inline-block text-xs font-semibold text-blue-600 hover:text-blue-500"
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                {!loading && !error && filteredStations.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-500">
                        Không tìm thấy trạm nào
                    </div>
                )}

                {!loading && !error && filteredStations.map((station, index) => {
                    const Icon = getStationIcon(station.type);
                    const statusLabel = (station as StationListItem).status ?? null;
                    const ratingValue = (station as StationListItem).rating;
                    const connectors = (station as StationListItem).connectors ?? [];

                    return (
                        <div
                            key={`desktop-${station.id}-${index}`}
                            onClick={() => onStationDetail?.(station.id!)}
                            className="mb-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm transition-all hover:-translate-y-[1px] hover:border-blue-300 hover:shadow-md cursor-pointer"
                        >
                            {/* Header */}
                            <div className="flex items-start gap-2.5">
                                <span
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${station.type === 'rescue' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}
                                >
                                    <Icon className="h-4 w-4" />
                                </span>

                                <div className="min-w-0 flex-1 space-y-1">
                                    {/* Name & Status */}
                                    <div className="flex items-center gap-1.5">
                                        <span className="truncate text-xs font-semibold text-slate-900">
                                            {station.name}
                                        </span>

                                        {statusLabel && (
                                            <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold ${statusLabel === 'Hoạt động'
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusLabel === 'Hoạt động' ? 'bg-emerald-500' : 'bg-slate-400'
                                                    }`} />
                                                {statusLabel}
                                            </span>
                                        )}

                                        {typeof ratingValue === 'number' && Number.isFinite(ratingValue) && (
                                            <span className="ml-auto inline-flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                                                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-500" />
                                                {ratingValue.toFixed(1)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Address */}
                                    {station.description && (
                                        <div className="flex items-start gap-1 text-[11px] text-slate-500">
                                            <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
                                            <span className="line-clamp-1 leading-tight">{station.description}</span>
                                        </div>
                                    )}

                                    {/* Contact & Time */}
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                        {station.contact && (
                                            <span className="inline-flex items-center gap-1">
                                                <Home className="h-3 w-3 text-slate-400" />
                                                <span className="truncate">{station.contact}</span>
                                            </span>
                                        )}

                                        {station.openTime && station.closeTime && (
                                            <span className="inline-flex items-center gap-1">
                                                <Clock className="h-3 w-3 text-slate-400" />
                                                <span className="whitespace-nowrap">{station.openTime.substring(0, 5)} - {station.closeTime.substring(0, 5)}</span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Connectors */}
                                    {connectors && connectors.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {connectors.map((connector, idx) => (
                                                <span key={idx} className="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                                                    <Zap className="mr-0.5 h-2.5 w-2.5" />
                                                    {connector}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-2 flex items-center justify-end gap-1 border-t border-slate-100 pt-2">
                                {onStationNavigate && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onStationNavigate(station);
                                        }}
                                        className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-600 transition-colors hover:bg-blue-100"
                                        title="Chỉ đường"
                                    >
                                        <Navigation className="h-3 w-3" />
                                        Chỉ đường
                                    </button>
                                )}

                                {onStationEdit && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onStationEdit(station);
                                        }}
                                        className="rounded-md p-1 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                        title="Chỉnh sửa"
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                    </button>
                                )}

                                {onStationDelete && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(station.id!);
                                        }}
                                        disabled={deletingId === station.id}
                                        className="rounded-md p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                        title="Xóa"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Refresh Button */}
            {!loading && (
                <div className="border-t border-slate-200 bg-slate-50 px-3 py-2">
                    <button
                        onClick={loadStations}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                    >
                        Làm mới
                    </button>
                </div>
            )}
        </div>
    );
};