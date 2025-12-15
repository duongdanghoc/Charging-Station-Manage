"use client";

import React, { useEffect, useState } from 'react';
import { X, MapPin, Clock, Star, Zap, Power, Calendar, Building2, Phone, Mail, AlertCircle, CheckCircle, XCircle, Loader2, Wrench } from 'lucide-react';
import { StationService } from './StationService';
import type { ChargingConnector, ChargingPole } from '@/lib/redux/services/stationApi';

interface Review {
    id: number;
    customerName: string;
    stars: number;
    comment: string;
    createdAt: string;
}

interface StationDetail {
    id: number;
    name: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
    openTime: string;
    closeTime: string;
    status: number;
    type: string;
    vendorName: string;
    averageRating: number;
    totalRatings: number;
    poles: ChargingPole[];
    contact?: string;
    // Thêm thông tin từ Station API
    ports?: number;       // Tổng số đầu sạc
    activePorts?: number; // Số đầu sạc đang sẵn sàng
}

interface StationDetailModalProps {
    stationId: string;
    onClose: () => void;
}

export const StationDetailModal: React.FC<StationDetailModalProps> = ({ stationId, onClose }) => {
    const [station, setStation] = useState<StationDetail | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'poles' | 'reviews'>('info');

    useEffect(() => {
        loadStationDetail();
        loadReviews();
    }, [stationId]);

    const loadStationDetail = async () => {
        try {
            setLoading(true);
            const data = await StationService.getStationById(stationId);
            
            // Nếu là trạm sạc thường (không phải rescue), load thêm danh sách trụ sạc
            let poles: ChargingPole[] = [];
            const stationIdStr = String(stationId);
            if (data.type !== 'rescue' && !stationIdStr.startsWith('rescue-')) {
                try {
                    const polesData = await StationService.getStationPoles(stationId);
                    poles = Array.isArray(polesData) ? polesData : (polesData?.data || []);
                    console.log('Loaded poles data:', poles); // Debug log
                } catch (poleErr) {
                    console.error('Không thể tải trụ sạc:', poleErr);
                    poles = [];
                }
            }
            
            setStation({
                ...data,
                poles: poles
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể tải thông tin trạm');
        } finally {
            setLoading(false);
        }
    };

    const loadReviews = async () => {
        try {
            const data = await StationService.getStationReviews(stationId);
            setReviews(data);
        } catch (err) {
            console.error('Không thể tải đánh giá:', err);
        }
    };

    const getStatusColor = (status: number) => {
        return status === 1 ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 bg-slate-100';
    };

    const getStatusText = (status: number) => {
        return status === 1 ? 'Hoạt động' : 'Bảo trì';
    };

    const getConnectorStatusIcon = (status: string) => {
        switch (status) {
            case 'AVAILABLE':
                return <CheckCircle className="h-4 w-4 text-emerald-500" />;
            case 'INUSE':
            case 'IN_USE':
                return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
            case 'OUTOFSERVICE':
            case 'OUT_OF_SERVICE':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-slate-400" />;
        }
    };

    const getConnectorStatusText = (status: string) => {
        switch (status) {
            case 'AVAILABLE':
                return 'Sẵn sàng';
            case 'INUSE':
            case 'IN_USE':
                return 'Đang sử dụng';
            case 'OUTOFSERVICE':
            case 'OUT_OF_SERVICE':
                return 'Ngưng hoạt động';
            default:
                return 'Không rõ';
        }
    };

    const getConnectorStatusColor = (status: string) => {
        switch (status) {
            case 'AVAILABLE':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'INUSE':
            case 'IN_USE':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'OUTOFSERVICE':
            case 'OUT_OF_SERVICE':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const formatConnectorType = (type: string) => {
        const types: Record<string, string> = {
            TYPE1: 'Type 1',
            TYPE2: 'Type 2',
            CHADEMO: 'CHAdeMO',
            CCS: 'CCS',
            TESLA: 'Tesla',
        };
        return types[type] || type;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-sm text-slate-600">Đang tải thông tin...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !station) {
        return (
            <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-6 w-6 text-red-500" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-red-900">Lỗi tải dữ liệu</h3>
                            <p className="mt-1 text-sm text-red-600">{error || 'Không thể tải thông tin trạm'}</p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="mt-4 w-full rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                {/* Header */}
                <div className={`flex items-start justify-between border-b border-slate-200 p-6 ${station.type === 'rescue' ? 'bg-gradient-to-r from-orange-50 to-amber-50' : 'bg-gradient-to-r from-blue-50 to-emerald-50'}`}>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            {station.type === 'rescue' ? (
                                <Wrench className="h-6 w-6 text-orange-600" />
                            ) : (
                                <Zap className="h-6 w-6 text-emerald-600" />
                            )}
                            <h2 className="text-2xl font-bold text-slate-900">{station.name}</h2>
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(station.status)}`}>
                                <span className={`inline-block h-2 w-2 rounded-full ${station.status === 1 ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                {getStatusText(station.status)}
                            </span>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {station.city}
                            </span>
                            <span className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                {station.vendorName}
                            </span>
                            {station.averageRating > 0 && (
                                <span className="flex items-center gap-1 font-semibold text-amber-600">
                                    <Star className="h-4 w-4 fill-amber-400" />
                                    {station.averageRating.toFixed(1)} ({station.totalRatings} đánh giá)
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-slate-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 bg-slate-50 px-6">
                    <div className="flex gap-1">
                        {[
                            { id: 'info' as const, label: 'Thông tin', icon: MapPin },
                            ...(station.type !== 'rescue' ? [{ id: 'poles' as const, label: `Trụ sạc (${station.poles?.length || 0})`, icon: Zap }] : []),
                            ...(station.type !== 'rescue' ? [{ id: 'reviews' as const, label: `Đánh giá (${reviews.length})`, icon: Star }] : []),
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${activeTab === id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 180px)' }}>
                    {/* Tab: Thông tin */}
                    {activeTab === 'info' && (
                        <div className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Địa chỉ */}
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <MapPin className="h-4 w-4 text-blue-600" />
                                        Địa chỉ
                                    </div>
                                    <p className="mt-2 text-slate-900">{station.address}</p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {station.latitude.toFixed(6)}, {station.longitude.toFixed(6)}
                                    </p>
                                </div>

                                {/* Giờ hoạt động */}
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <Clock className="h-4 w-4 text-blue-600" />
                                        Giờ hoạt động
                                    </div>
                                    <p className="mt-2 text-lg font-semibold text-slate-900">
                                        {station.openTime} - {station.closeTime}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-600">Mở cửa hàng ngày</p>
                                </div>
                            </div>

                            {/* Tổng quan */}
                            {station.type === 'rescue' ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-center">
                                        <Wrench className="mx-auto h-8 w-8 text-orange-600" />
                                        <p className="mt-2 text-xl font-bold text-slate-900">Cứu hộ 24/7</p>
                                        <p className="text-sm text-slate-600">Dịch vụ khẩn cấp</p>
                                    </div>
                                    {station.contact && (
                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                                            <Phone className="mx-auto h-8 w-8 text-blue-600" />
                                            <p className="mt-2 text-xl font-bold text-slate-900">{station.contact}</p>
                                            <p className="text-sm text-slate-600">Hotline</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
                                        <Zap className="mx-auto h-8 w-8 text-emerald-600" />
                                        <p className="mt-2 text-2xl font-bold text-slate-900">{station.poles?.length || 0}</p>
                                        <p className="text-sm text-slate-600">Trụ sạc</p>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
                                        <Power className="mx-auto h-8 w-8 text-blue-600" />
                                        <p className="mt-2 text-2xl font-bold text-slate-900">
                                            {station.activePorts !== undefined 
                                                ? `${station.activePorts}/${station.ports || station.poles?.reduce((sum, pole) => sum + (pole.connectors?.length || pole.connectorCount || 0), 0) || 0}`
                                                : (station.ports || station.poles?.reduce((sum, pole) => sum + (pole.connectors?.length || pole.connectorCount || 0), 0) || 0)
                                            }
                                        </p>
                                        <p className="text-sm text-slate-600">Cổng sạc</p>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
                                        <Star className="mx-auto h-8 w-8 text-amber-500" />
                                        <p className="mt-2 text-2xl font-bold text-slate-900">
                                            {station.averageRating > 0 ? station.averageRating.toFixed(1) : 'N/A'}
                                        </p>
                                        <p className="text-sm text-slate-600">Đánh giá</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Trụ sạc */}
                    {activeTab === 'poles' && (
                        <div className="space-y-4">
                            {station.poles && station.poles.length > 0 ? (
                                station.poles.map((pole, idx) => (
                                    <div key={pole.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                                    <Zap className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">Trụ #{idx + 1}</h3>
                                                    <p className="text-sm text-slate-600">{pole.manufacturer}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-slate-900">{pole.maxPower} kW</p>
                                                <p className="text-xs text-slate-500">Công suất tối đa</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
                                            <span className="flex items-center gap-1">
                                                <Power className="h-4 w-4" />
                                                {pole.connectors?.length || pole.connectorCount || 0} cổng
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                Lắp đặt: {formatDate(pole.installDate)}
                                            </span>
                                        </div>

                                        {/* Connectors */}
                                        {pole.connectors && pole.connectors.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cổng sạc:</p>
                                                <div className="grid gap-2 sm:grid-cols-2">
                                                    {pole.connectors.map((connector) => (
                                                        <div
                                                            key={connector.id}
                                                            className={`flex items-center justify-between rounded-lg border p-3 ${getConnectorStatusColor(connector.status)}`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {getConnectorStatusIcon(connector.status)}
                                                                <div>
                                                                    <p className="text-sm font-semibold">
                                                                        {formatConnectorType(connector.connectorType)}
                                                                    </p>
                                                                    <p className="text-xs">{getConnectorStatusText(connector.status)}</p>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm font-bold">{connector.maxPower} kW</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                                    <Zap className="mx-auto h-12 w-12 text-slate-400" />
                                    <p className="mt-2 text-sm text-slate-600">Chưa có thông tin trụ sạc</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Đánh giá */}
                    {activeTab === 'reviews' && (
                        <div className="space-y-4">
                            {/* Rating Summary */}
                            {station.averageRating > 0 && (
                                <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6">
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <p className="text-5xl font-bold text-amber-600">{station.averageRating.toFixed(1)}</p>
                                            <div className="mt-2 flex justify-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`h-5 w-5 ${star <= Math.round(station.averageRating)
                                                                ? 'fill-amber-400 text-amber-500'
                                                                : 'text-slate-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="mt-1 text-sm text-slate-600">{station.totalRatings} đánh giá</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reviews List */}
                            {reviews.length > 0 ? (
                                <div className="space-y-3">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-slate-900">{review.customerName}</p>
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    className={`h-3.5 w-3.5 ${star <= review.stars
                                                                            ? 'fill-amber-400 text-amber-500'
                                                                            : 'text-slate-300'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="mt-2 text-sm text-slate-700">{review.comment}</p>
                                                </div>
                                                <p className="text-xs text-slate-500">{formatDateTime(review.createdAt)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                                    <Star className="mx-auto h-12 w-12 text-slate-400" />
                                    <p className="mt-2 text-sm text-slate-600">Chưa có đánh giá nào</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
