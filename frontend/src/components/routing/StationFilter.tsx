"use client";

import React, { useState, useEffect } from 'react';
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
    map?: mapboxgl.Map | null;
    className?: string;
}

export const StationFilter: React.FC<StationFilterProps> = ({
    onStationClick,
    onStationEdit,
    onStationDelete,
    onStationAdded,
    onStationNavigate,
    map,
    className = '',
}) => {
    const [stations, setStations] = useState<StationListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | StationType>('all');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isPinToolActive, setIsPinToolActive] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState<FilterParams>({
        status: undefined,
        vehicleType: undefined,
        connectorType: undefined,
    });

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
        });
    };

    const hasActiveFilters = searchText || filters.status !== undefined || filters.vehicleType || filters.connectorType;

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
        <div className={`fixed bottom-4 right-4 z-[350] flex max-h-[calc(60vh-2rem)] w-[370px] max-w-[90vw] flex-col rounded-2xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur ${className}`}>
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200">
                <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Trạm sạc và Cứu hộ</span>
                    <h3 className="text-base font-semibold text-slate-900">Danh sách trạm</h3>
                </div>

                <div className="flex items-center gap-2">
                    {map ? (
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
                    )}

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
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                            hasActiveFilters 
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

                {!loading && !error && filteredStations.map((station) => {
                    const Icon = getStationIcon(station.type);
                    const statusLabel = (station as StationListItem).status ?? null;
                    const ratingValue = (station as StationListItem).rating;
                    const connectors = (station as StationListItem).connectors ?? [];

                    return (
                        <div
                            key={station.id}
                            className="mb-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm transition-all hover:-translate-y-[1px] hover:border-blue-300 hover:shadow-md"
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
                                        {onStationClick ? (
                                            <button
                                                onClick={() => onStationClick(station)}
                                                className="truncate text-left text-xs font-semibold text-slate-900 hover:text-blue-600"
                                            >
                                                {station.name}
                                            </button>
                                        ) : (
                                            <span className="truncate text-xs font-semibold text-slate-900">
                                                {station.name}
                                            </span>
                                        )}

                                        {statusLabel && (
                                            <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                                statusLabel === 'Hoạt động' 
                                                    ? 'bg-emerald-50 text-emerald-600' 
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                                                    statusLabel === 'Hoạt động' ? 'bg-emerald-500' : 'bg-slate-400'
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
                                        onClick={() => onStationNavigate(station)}
                                        className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-600 transition-colors hover:bg-blue-100"
                                        title="Chỉ đường"
                                    >
                                        <Navigation className="h-3 w-3" />
                                        Chỉ đường
                                    </button>
                                )}

                                {onStationEdit && (
                                    <button
                                        onClick={() => onStationEdit(station)}
                                        className="rounded-md p-1 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                        title="Chỉnh sửa"
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                    </button>
                                )}

                                {onStationDelete && (
                                    <button
                                        onClick={() => handleDelete(station.id!)}
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