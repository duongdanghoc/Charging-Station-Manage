"use client";

import React, { useState, useEffect } from 'react';
import { Car, Plus, Edit2, Trash2, Battery, Plug, AlertCircle, X, Hash, Tag, BatteryCharging, ShieldCheck } from 'lucide-react';
import {
    VehicleService,
    type Vehicle,
    type CreateVehicleRequest,
    type UpdateVehicleRequest,
    type VehicleType,
    type ConnectorType,
    VEHICLE_TYPE_LABELS,
    CONNECTOR_TYPE_LABELS
} from '@/services/vehicleService';

const CarInfoSection: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [formData, setFormData] = useState<CreateVehicleRequest>({
        vehicleType: 'CAR',
        brand: '',
        model: '',
        licensePlate: '',
        batteryCapacity: 0,
        connectorType: 'TYPE2',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

    useEffect(() => {
        loadVehicles();
    }, []);

    const loadVehicles = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Loading vehicles...');
            const data = await VehicleService.getVehicles();
            console.log('Vehicles loaded:', data);
            setVehicles(data);
        } catch (err) {
            console.error('Error loading vehicles:', err);
            const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách phương tiện';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingVehicle(null);
        setFormData({
            vehicleType: 'CAR',
            brand: '',
            model: '',
            licensePlate: '',
            batteryCapacity: 0,
            connectorType: 'TYPE2',
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleEdit = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setFormData({
            vehicleType: vehicle.vehicleType,
            brand: vehicle.brand,
            model: vehicle.model,
            licensePlate: vehicle.licensePlate,
            batteryCapacity: vehicle.batteryCapacity,
            connectorType: vehicle.connectorType,
        });
        setFormErrors({});
        setShowModal(true);
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.brand.trim()) {
            errors.brand = 'Vui lòng nhập hãng xe';
        }

        if (!formData.model.trim()) {
            errors.model = 'Vui lòng nhập model';
        }

        if (formData.vehicleType !== 'BICYCLE' && !formData.licensePlate.trim()) {
            errors.licensePlate = 'Vui lòng nhập biển số xe';
        }

        if (formData.batteryCapacity <= 0) {
            errors.batteryCapacity = 'Dung lượng pin phải lớn hơn 0';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            console.log('Form validation failed', formErrors);
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            console.log('Submitting vehicle data:', formData);

            if (editingVehicle) {
                const result = await VehicleService.updateVehicle(editingVehicle.id, formData as UpdateVehicleRequest);
                console.log('Update result:', result);
            } else {
                const result = await VehicleService.createVehicle(formData);
                console.log('Create result:', result);
            }

            await loadVehicles();
            setShowModal(false);
        } catch (err) {
            console.error('Error submitting vehicle:', err);
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra';

            if (errorMessage.toLowerCase().includes('biển số')) {
                setFormErrors(prev => ({ ...prev, licensePlate: errorMessage }));
            } else {
                setFormErrors(prev => ({ ...prev, general: errorMessage }));
            }
        } finally {
            setSubmitting(false);
        }
    };

    const promptDelete = (vehicle: Vehicle) => {
        if (vehicle.hasActiveSession) {
            alert('Không thể xóa phương tiện đang trong phiên sạc');
            return;
        }
        setVehicleToDelete(vehicle);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!vehicleToDelete) return;

        try {
            setSubmitting(true);
            setError(null);
            await VehicleService.deleteVehicle(vehicleToDelete.id);
            await loadVehicles();
            setShowDeleteModal(false);
            setVehicleToDelete(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể xóa phương tiện');
            setShowDeleteModal(false);
        } finally {
            setSubmitting(false);
        }
    };

    const getVehicleIcon = (type: VehicleType) => {
        return Car; // Could customize based on type
    };

    const getVehicleImage = (type: VehicleType) => {
        switch (type) {
            case 'CAR': return '/car.png';
            case 'MOTORBIKE': return '/motobike.png';
            case 'BICYCLE': return '/bike.png';
            default: return '/car.png';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Quản lý phương tiện</h2>
                    <p className="text-sm text-gray-500 mt-1">Quản lý danh sách các phương tiện của bạn</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Thêm phương tiện
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-red-900">Lỗi</h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                    <button
                        onClick={() => setError(null)}
                        className="text-red-400 hover:text-red-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                    <p className="mt-4 text-sm text-gray-500">Đang tải...</p>
                </div>
            )}

            {/* Vehicle List */}
            {!loading && vehicles.length === 0 && (
                <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center">
                    <Car className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-sm font-semibold text-gray-900">Chưa có phương tiện nào</h3>
                    <p className="mt-2 text-sm text-gray-500">Thêm phương tiện đầu tiên của bạn</p>
                    <button
                        onClick={handleAdd}
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        Thêm phương tiện
                    </button>
                </div>
            )}

            {!loading && vehicles.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                    {vehicles.map((vehicle) => {
                        const StatusIcon = vehicle.hasActiveSession ? BatteryCharging : ShieldCheck;
                        const statusStyles = vehicle.hasActiveSession
                            ? "bg-green-100 text-green-600"
                            : "bg-blue-100 text-blue-600";

                        return (
                            <div
                                key={vehicle.id}
                                className="group relative rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-all duration-300 overflow-hidden"
                            >
                                {/* Background Image Layer */}
                                <div
                                    className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-110"
                                    style={{
                                        backgroundImage: `url(${getVehicleImage(vehicle.vehicleType)})`,
                                        backgroundSize: 'contain',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        opacity: 0.8
                                    }}
                                />

                                {/* Diagonal Overlay */}
                                <div
                                    className="absolute inset-0 z-0"
                                    style={{
                                        background: 'linear-gradient(110deg, #ffffff 35%, rgba(255,255,255,0.95) 45%, transparent 100%)'
                                    }}
                                />

                                <div className="relative z-10 p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${statusStyles} flex-shrink-0 shadow-sm`}>
                                                <StatusIcon className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-gray-900 truncate text-lg">
                                                    {vehicle.brand} {vehicle.model}
                                                </h3>
                                                <p className="text-sm font-medium text-gray-500">{VEHICLE_TYPE_LABELS[vehicle.vehicleType]}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-sm">
                                            <button
                                                onClick={() => handleEdit(vehicle)}
                                                className="rounded-md p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => promptDelete(vehicle)}
                                                disabled={vehicle.hasActiveSession}
                                                className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={vehicle.hasActiveSession ? 'Đang sạc' : 'Xóa'}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-3 relative max-w-[60%]">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="inline-flex items-center justify-center rounded-md bg-gray-100 border border-gray-200 px-3 py-1 font-mono font-semibold text-gray-900 shadow-sm">
                                                {vehicle.licensePlate}
                                            </span>
                                            {vehicle.hasActiveSession && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 border border-green-200">
                                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                                                    Đang sạc
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-600 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Battery className="h-4 w-4 text-gray-400" />
                                                <span>{vehicle.batteryCapacity} kWh</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Plug className="h-4 w-4 text-gray-400" />
                                                <span>{CONNECTOR_TYPE_LABELS[vehicle.connectorType]}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl relative overflow-hidden transition-all">
                        {/* Background Image Layer */}
                        <div
                            className="absolute inset-0 z-0 transition-all duration-500"
                            style={{
                                backgroundImage: `url(${getVehicleImage(formData.vehicleType)})`,
                                backgroundSize: 'contain',
                                backgroundPosition: '100% center',
                                backgroundRepeat: 'no-repeat',
                                opacity: 0.5
                            }}
                        />

                        {/* Diagonal Overlay */}
                        <div
                            className="absolute inset-0 z-0"
                            style={{
                                background: 'linear-gradient(110deg, #ffffff 15%, rgba(255,255,255,0.95) 45%, transparent 100%)'
                            }}
                        />

                        {/* Modal Header */}
                        <div className="relative z-10 flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-white/50 backdrop-blur-sm">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editingVehicle ? 'Chỉnh sửa phương tiện' : 'Thêm phương tiện mới'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="relative z-10 p-6">
                            {formErrors.general && (
                                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                                    {formErrors.general}
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    {/* Vehicle Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            <span className="flex items-center gap-2">
                                                <Car className="h-4 w-4 text-gray-500" />
                                                Loại xe <span className="text-red-500">*</span>
                                            </span>
                                        </label>
                                        <select
                                            value={formData.vehicleType}
                                            onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as VehicleType })}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100 bg-white/80 backdrop-blur-sm"
                                        >
                                            {Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Brand */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            <span className="flex items-center gap-2">
                                                <Tag className="h-4 w-4 text-gray-500" />
                                                Hãng xe <span className="text-red-500">*</span>
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.brand}
                                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-white/80 backdrop-blur-sm ${formErrors.brand
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                                                }`}
                                            placeholder="VD: Tesla, VinFast, Honda..."
                                        />
                                        {formErrors.brand && (
                                            <p className="mt-1 text-xs text-red-600">{formErrors.brand}</p>
                                        )}
                                    </div>

                                    {/* Model */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            <span className="flex items-center gap-2">
                                                <Tag className="h-4 w-4 text-gray-500" />
                                                Model <span className="text-red-500">*</span>
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.model}
                                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-white/80 backdrop-blur-sm ${formErrors.model
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                                                }`}
                                            placeholder="VD: Model 3, VF8, SH..."
                                        />
                                        {formErrors.model && (
                                            <p className="mt-1 text-xs text-red-600">{formErrors.model}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    {/* License Plate */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            <span className="flex items-center gap-2">
                                                <Hash className="h-4 w-4 text-gray-500" />
                                                Biển số xe {formData.vehicleType !== 'BICYCLE' && <span className="text-red-500">*</span>}
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.licensePlate}
                                            onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '') })}
                                            className={`w-full rounded-lg border px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-1 bg-white/80 backdrop-blur-sm ${formErrors.licensePlate
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                                                }`}
                                            placeholder="VD: 30A-12345"
                                        />
                                        {formErrors.licensePlate && (
                                            <p className="mt-1 text-xs text-red-600">{formErrors.licensePlate}</p>
                                        )}
                                    </div>

                                    {/* Battery Capacity */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            <span className="flex items-center gap-2">
                                                <Battery className="h-4 w-4 text-gray-500" />
                                                Dung lượng pin (kWh) <span className="text-red-500">*</span>
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={formData.batteryCapacity || ''}
                                            onChange={(e) => setFormData({ ...formData, batteryCapacity: parseFloat(e.target.value) || 0 })}
                                            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-white/80 backdrop-blur-sm ${formErrors.batteryCapacity
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                                                }`}
                                            placeholder="VD: 50"
                                        />
                                        {formErrors.batteryCapacity && (
                                            <p className="mt-1 text-xs text-red-600">{formErrors.batteryCapacity}</p>
                                        )}
                                    </div>

                                    {/* Connector Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            <span className="flex items-center gap-2">
                                                <Plug className="h-4 w-4 text-gray-500" />
                                                Loại cổng sạc <span className="text-red-500">*</span>
                                            </span>
                                        </label>
                                        <select
                                            value={formData.connectorType}
                                            onChange={(e) => setFormData({ ...formData, connectorType: e.target.value as ConnectorType })}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100 bg-white/80 backdrop-blur-sm"
                                        >
                                            {Object.entries(CONNECTOR_TYPE_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-6 mt-2 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors bg-white/80 backdrop-blur-sm"
                                    disabled={submitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Đang xử lý...' : (editingVehicle ? 'Cập nhật' : 'Thêm')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {showDeleteModal && vehicleToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-2xl relative overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4 text-red-600">
                                <div className="p-2 bg-red-100 rounded-full">
                                    <Trash2 className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Xác nhận xóa</h3>
                            </div>

                            <p className="text-gray-600 mb-6">
                                Bạn có chắc chắn muốn xóa phương tiện <span className="font-semibold text-gray-900">{vehicleToDelete.brand} {vehicleToDelete.model}</span> ({vehicleToDelete.licensePlate})?
                                <br />
                                Hành động này không thể hoàn tác.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setVehicleToDelete(null);
                                    }}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                    disabled={submitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Đang xóa...' : 'Xóa phương tiện'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CarInfoSection;
