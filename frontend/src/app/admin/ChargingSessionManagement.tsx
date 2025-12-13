"use client";

import { useState } from 'react';
import {
  Search, Filter, BatteryCharging, Car, MapPin, User,
  ChevronLeft, ChevronRight, Eye, Clock, Zap
} from "lucide-react";
import {
  useGetChargingSessionsQuery,
  ChargingSessionFilterParams
} from "@/lib/redux/services/adminApi";

export default function ChargingSessionManagement() {
  // State quản lý Filters
  const [filters, setFilters] = useState<ChargingSessionFilterParams>({
    page: 0,
    size: 10,
    customerId: undefined,
    stationId: undefined,
    status: undefined,
    startTimeFrom: undefined,
    startTimeTo: undefined,
    customerName: '',
    stationName: '',
    licensePlate: ''
  });

  // State UI
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  // Redux API Hooks
  const { data: sessionsData, isLoading, isFetching } = useGetChargingSessionsQuery(filters);

  const sessions = sessionsData?.data?.content || [];
  const totalPages = sessionsData?.data?.totalPages || 0;

  // Handlers
  const handleFilterChange = (key: keyof ChargingSessionFilterParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      'COMPLETED': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Hoàn thành' },
      'CHARGING': { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Đang sạc' },
      'PENDING': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Chờ xử lý' },
      'CANCELLED': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Đã hủy' },
      'FAILED': { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Thất bại' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Page */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BatteryCharging className="w-6 h-6 text-green-600" /> Quản Lý Phiên Sạc
          </h2>
          <p className="text-sm text-gray-500 mt-1">Theo dõi và quản lý tất cả các phiên sạc trên hệ thống.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tên khách hàng, trạm, biển số..."
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                value={filters.customerName || ''}
                onChange={(e) => handleFilterChange('customerName', e.target.value)}
              />
            </div>
          </div>

          <div className="w-[180px]">
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Trạng thái</label>
            <select
              className="w-full py-2 px-3 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            >
              <option value="">Tất cả</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="CHARGING">Đang sạc</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="FAILED">Thất bại</option>
            </select>
          </div>

          <button
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            className="px-4 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition"
          >
            <Filter className="w-4 h-4" />
            Bộ lọc nâng cao
          </button>
        </div>

        {/* Advanced Filter */}
        {showAdvancedFilter && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
            <h4 className="font-medium text-gray-700 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Lọc nâng cao
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Ngày bắt đầu từ</label>
                <input
                  type="datetime-local"
                  className="w-full p-2 border rounded text-sm"
                  onChange={(e) => handleFilterChange('startTimeFrom', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Ngày bắt đầu đến</label>
                <input
                  type="datetime-local"
                  className="w-full p-2 border rounded text-sm"
                  onChange={(e) => handleFilterChange('startTimeTo', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Biển số xe</label>
                <input
                  type="text"
                  placeholder="VD: 30H-123.45"
                  className="w-full p-2 border rounded text-sm"
                  value={filters.licensePlate || ''}
                  onChange={(e) => handleFilterChange('licensePlate', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
              <tr>
                <th className="p-4">Thông tin phiên sạc</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Thời gian</th>
                <th className="p-4">Tổng tiền</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Không tìm thấy phiên sạc nào
                  </td>
                </tr>
              ) : (
                sessions.map((session: any) => (
                  <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{session.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Car className="w-3.5 h-3.5" />
                          {session.licensePlate || 'Chưa có biển số'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-3.5 h-3.5" />
                          {session.stationName}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(session.status)}
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          Bắt đầu: {formatDateTime(session.startTime)}
                        </div>
                        {session.endTime && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Clock className="w-3 h-3" />
                            Kết thúc: {formatDateTime(session.endTime)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-green-600">
                        {formatCurrency(session.totalAmount || 0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {session.energyConsumed || 0} kWh
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedSession(session)}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Hiển thị {sessions.length} phiên sạc
            </div>
            <div className="flex gap-2">
              <button
                disabled={filters.page === 0}
                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 0) - 1 }))}
                className="px-3 py-1 bg-white border rounded text-sm disabled:opacity-50 hover:bg-gray-100 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Trước
              </button>
              <span className="px-3 py-1 text-sm text-gray-600 flex items-center">
                Trang {(filters.page || 0) + 1} / {totalPages}
              </span>
              <button
                disabled={(filters.page || 0) + 1 >= totalPages}
                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 0) + 1 }))}
                className="px-3 py-1 bg-white border rounded text-sm disabled:opacity-50 hover:bg-gray-100 flex items-center gap-1"
              >
                Sau <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Chi Tiết Phiên Sạc */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">Chi tiết phiên sạc #{selectedSession.id}</h3>
                <p className="text-green-100 text-sm mt-1">
                  {selectedSession.customerName} • {selectedSession.stationName}
                </p>
              </div>
              <button 
                onClick={() => setSelectedSession(null)} 
                className="text-white/80 hover:text-white bg-white/10 p-1 rounded-full"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Thông tin chính */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1 font-semibold">
                    <User className="w-3 h-3" /> Khách hàng
                  </div>
                  <div className="text-gray-900 font-medium">{selectedSession.customerName}</div>
                  <div className="text-sm text-gray-500 mt-1">ID: #{selectedSession.customerId}</div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1 font-semibold">
                    <Car className="w-3 h-3" /> Phương tiện
                  </div>
                  <div className="text-gray-900 font-medium font-mono">
                    {selectedSession.licensePlate || 'Chưa có biển số'}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Model: {selectedSession.vehicleModel || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Thông tin trạm sạc */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Thông tin trạm sạc
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-blue-600 mb-1">Tên trạm</div>
                    <div className="font-medium">{selectedSession.stationName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">Địa chỉ</div>
                    <div className="font-medium">{selectedSession.stationAddress}</div>
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">Cổng sạc</div>
                    <div className="font-medium">Port #{selectedSession.portId}</div>
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">Vendor</div>
                    <div className="font-medium">{selectedSession.vendorName}</div>
                  </div>
                </div>
              </div>

              {/* Thông tin sạc */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1 font-semibold">
                    <Zap className="w-3 h-3" /> Năng lượng
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedSession.energyConsumed || 0} kWh
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Công suất: {selectedSession.power || 'N/A'} kW
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1 font-semibold">
                    <CreditCard className="w-3 h-3" /> Thanh toán
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedSession.totalAmount || 0)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Giá: {selectedSession.pricePerKwh || 0} đ/kWh
                  </div>
                </div>
              </div>

              {/* Thời gian */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium text-gray-700 mb-3">Thời gian thực hiện</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bắt đầu:</span>
                    <span className="font-medium">{formatDateTime(selectedSession.startTime)}</span>
                  </div>
                  {selectedSession.endTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kết thúc:</span>
                      <span className="font-medium">{formatDateTime(selectedSession.endTime)}</span>
                    </div>
                  )}
                  {selectedSession.duration && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời lượng:</span>
                      <span className="font-medium">{selectedSession.duration} phút</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Trạng thái */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-500 text-sm mb-1">Trạng thái phiên sạc</div>
                    {getStatusBadge(selectedSession.status)}
                  </div>
                  <div>
                    <div className="text-gray-500 text-sm mb-1">Trạng thái thanh toán</div>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      selectedSession.paymentStatus === 'PAID' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedSession.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
              <button 
                onClick={() => setSelectedSession(null)}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}