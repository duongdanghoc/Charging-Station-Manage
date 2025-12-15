"use client";

import { useState } from 'react';
import { toast } from "sonner";
import {
  Search, Plus, Trash2, Eye,
  Car, Zap, X, Shield, Mail, Phone, Calendar
} from "lucide-react";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useCreateUserMutation,
  UserFilterParams,
  useGetVendorStationsQuery,
  useGetCustomerVehiclesQuery

} from "@/lib/redux/services/adminApi"; // Đường dẫn file api của bạn

// --- MOCK DATA CHO CHI TIẾT (VÌ CHƯA CÓ API THẬT CHO PHẦN NÀY) ---
const MOCK_VENDOR_STATIONS = [
  { id: 1, name: "Trạm Vincom Center", address: "72 Lê Thánh Tôn, Q1", ports: 10, revenue: "15.000.000 đ" },
  { id: 2, name: "Trạm Landmark 81", address: "Bình Thạnh", ports: 5, revenue: "8.200.000 đ" },
];

const MOCK_CUSTOMER_VEHICLES = [
  { id: 1, model: "VinFast VF8", license: "30H-123.45", battery: "85%", status: "Active" },
  { id: 2, model: "VinFast VFe34", license: "51K-999.99", battery: "42%", status: "Charging" },
];

// Hàm tạo mật khẩu mạnh (đảm bảo Backend không từ chối)
const generateStrongPassword = () => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  // Đảm bảo có đủ độ phức tạp: Hoa, Thường, Số, Ký tự đặc biệt
  let password =
    "A" + // 1 Chữ hoa
    "a" + // 1 Chữ thường
    "1" + // 1 Số
    "!";  // 1 Ký tự đặc biệt

  // Random thêm 8 ký tự nữa
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export function CreateUserModal({ isOpen, onClose, onSuccess }: any) {
  // State form
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'CUSTOMER' as 'VENDOR' | 'CUSTOMER'
  });

  const [createUser, { isLoading }] = useCreateUserMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const password = generateStrongPassword();

      // 👇 XỬ LÝ DỮ LIỆU AN TOÀN TRƯỚC KHI GỬI
      const payload = {
        name: form.name.trim(),   // Xóa khoảng trắng thừa
        email: form.email.trim(),
        phone: form.phone.trim(), // Quan trọng: Phone thường bị lỗi regex nếu có space
        role: form.role,          // Nếu backend cần 'ROLE_CUSTOMER', hãy sửa thành: `ROLE_${form.role}`
        password: password,
        // status: 1, // ⚠️ TẠM ẨN: Nhiều API tạo mới (Register) không nhận trường status. Nếu backend bạn cần, hãy bỏ comment dòng này.
      };

      console.log("Submitting Payload:", payload);

      await createUser(payload).unwrap();

      toast.success("Tạo tài khoản thành công!", {
        description: (
          <div className="mt-2 p-2 bg-green-100 text-green-800 rounded text-xs font-mono">
            <strong>Mật khẩu tạm:</strong> {password}
            <br />(Hãy copy mật khẩu này)
          </div>
        ),
        duration: 10000,
      });

      onSuccess();
      onClose();
      setForm({ name: '', email: '', phone: '', role: 'CUSTOMER' });

    } catch (err: any) {
      console.error("Full API Error Object:", err);

      // 👇 LOGIC BẮT LỖI CHI TIẾT (Validation Errors)
      let errorMsg = "Dữ liệu không hợp lệ";

      if (err?.data) {
        if (typeof err.data === 'string') {
          errorMsg = err.data;
        } else if (err.data.fieldErrors && Array.isArray(err.data.fieldErrors)) {
          // Trường hợp Spring Boot trả về list lỗi validation
          errorMsg = err.data.fieldErrors.map((e: any) => `${e.field}: ${e.message}`).join(", ");
        } else if (err.data.message) {
          errorMsg = err.data.message;
        } else if (err.data.error) {
          errorMsg = err.data.error;
        }
      }

      toast.error(`Tạo thất bại: ${errorMsg}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header Modal */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">Tạo tài khoản mới</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Họ và Tên <span className="text-red-500">*</span></label>
            <input
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Ví dụ: Nguyễn Văn A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email <span className="text-red-500">*</span></label>
            <input
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Số điện thoại <span className="text-red-500">*</span></label>
            <input
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="09xxxxxxxx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Vai trò <span className="text-red-500">*</span></label>
            <div className="relative">
              <select
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value as 'VENDOR' | 'CUSTOMER' })}
              >
                <option value="CUSTOMER">Khách hàng (Customer)</option>
                <option value="VENDOR">Đối tác (Vendor)</option>
              </select>
              {/* Mũi tên custom cho select box đẹp hơn */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              disabled={isLoading}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Đang xử lý...
                </span>
              ) : "Xác nhận tạo tài khoản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- COMPONENT: MODAL CHI TIẾT USER ---
function UserDetailModal({ user, onClose }: { user: any, onClose: () => void }) {
  // Gọi API lấy dữ liệu chi tiết dựa trên Role
  // skip: !user... nghĩa là nếu chưa có user hoặc sai role thì không gọi API
  const { data: stationsData, isLoading: loadStations } = useGetVendorStationsQuery(
    { id: user?.id },
    { skip: !user || user.role !== 'VENDOR' }
  );

  const { data: vehiclesData, isLoading: loadVehicles } = useGetCustomerVehiclesQuery(
    { id: user?.id },
    { skip: !user || user.role !== 'CUSTOMER' }
  );
  // 👇 VỊ TRÍ 1: Xem toàn bộ cục data API trả về (bao gồm status, message, data...)
  if (stationsData) console.log("🔥 API Full Response (Stations):", stationsData);
  if (vehiclesData) console.log("🔥 API Full Response (Vehicles):", vehiclesData);
  if (!user) return null;

  // Lấy list từ response API
  const stations = stationsData?.data?.content || [];
  const vehicles = vehiclesData?.data?.content || [];
  console.log("✅ Final Stations List:", stations);
  console.log("✅ Final Vehicles List:", vehicles);
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-slate-700">
              {user.name?.charAt(0) || "U"}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <div className="text-slate-300 text-sm flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${user.role === 'VENDOR' ? 'bg-purple-500' : 'bg-green-500'}`}>
                  {user.role}
                </span>
                <span>ID: #{user.id}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white bg-white/10 p-1 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1 font-semibold"><Mail className="w-3 h-3" /> Email</div>
              <div className="text-gray-900 font-medium break-all">{user.email}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1 font-semibold"><Phone className="w-3 h-3" /> Hotline</div>
              <div className="text-gray-900 font-medium">{user.phone}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1 font-semibold"><Shield className="w-3 h-3" /> Trạng thái</div>
              <div className={`font-medium ${user.status === 1 ? 'text-green-600' : 'text-red-600'}`}>
                {user.status === 1 ? '● Đang hoạt động' : '● Đã bị khóa'}
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1 font-semibold"><Calendar className="w-3 h-3" /> Ngày tạo</div>
              <div className="text-gray-900 font-medium">20/05/2024 (Mock)</div>
            </div>
          </div>

          {/* Dữ liệu riêng theo Role */}
          {user.role === 'VENDOR' ? (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 uppercase">
                <Zap className="w-4 h-4 text-yellow-500" /> Danh sách trạm sạc sở hữu
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-xs text-gray-500 uppercase">
                    <tr><th className="p-3">Tên trạm</th><th className="p-3">Địa chỉ</th><th className="p-3">Số Cổng (Số trụ)</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {/* 1. Xử lý trạng thái đang tải */}
                    {loadStations ? (
                      <tr><td colSpan={3} className="p-4 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                    ) : stations.length === 0 ? (
                      /* 2. Xử lý khi không có dữ liệu */
                      <tr><td colSpan={3} className="p-4 text-center text-gray-500">Đối tác này chưa có trạm sạc nào.</td></tr>
                    ) : (
                      /* 3. Map dữ liệu thật (stations) */
                      stations.map((st: any) => (
                        <tr key={st.id}>
                          <td className="p-3 font-medium">{st.name}</td>
                          <td className="p-3 text-gray-500">{st.address}</td>
                          {/* Backend trả về ports và poles, hiển thị ở đây */}
                          <td className="p-3 font-medium text-blue-600 font-semibold">
                            {st.ports} cổng ({st.poles} trụ)
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 uppercase">
                <Car className="w-4 h-4 text-blue-500" /> Danh sách phương tiện
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-xs text-gray-500 uppercase">
                    <tr><th className="p-3">Mẫu xe</th><th className="p-3">Biển số</th><th className="p-3">Pin</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {/* 1. Xử lý trạng thái đang tải */}
                    {loadVehicles ? (
                      <tr><td colSpan={3} className="p-4 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                    ) : vehicles.length === 0 ? (
                      /* 2. Xử lý khi không có dữ liệu */
                      <tr><td colSpan={3} className="p-4 text-center text-gray-500">Khách hàng chưa đăng ký xe nào.</td></tr>
                    ) : (
                      /* 3. Map dữ liệu thật (vehicles) */
                      vehicles.map((v: any) => (
                        <tr key={v.id}>
                          <td className="p-3 font-medium">{v.model}</td>
                          {/* Chú ý: Backend trả về licensePlate, không phải license */}
                          <td className="p-3 font-mono bg-gray-50 rounded text-slate-700">
                            {v.licensePlate || "Đang cập nhật"}
                          </td>
                          {/* Chú ý: Backend trả về batteryCapacity */}
                          <td className="p-3 text-green-600 font-bold">
                            {v.batteryCapacity ? `${v.batteryCapacity} kWh` : "N/A"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT: QUẢN LÝ NGƯỜI DÙNG ---
export default function UserManagement() {
  // State quản lý Filters
  const [filters, setFilters] = useState<UserFilterParams>({
    page: 0, size: 10, keyword: '', role: undefined, status: undefined
  });

  // State UI
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null); // Lưu user đang xem chi tiết

  // Redux API Hooks
  const { data: usersData, isLoading, isFetching } = useGetUsersQuery(filters);
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const users = usersData?.data?.content || [];
  const totalPages = usersData?.data?.totalPages || 0;

  // Handlers
  const handleFilterChange = (key: keyof UserFilterParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 })); // Reset về trang 1 khi filter
  };

  const handleDelete = async (id: number) => {
    if (confirm("⚠️ XÁC NHẬN XÓA?\n\nHành động này sẽ chuyển trạng thái người dùng sang 'DELETED'. Dữ liệu lịch sử sẽ được giữ lại.")) {
      try {
        await deleteUser(id).unwrap();
        toast.success("Đã xóa người dùng thành công");
      } catch (error) {
        toast.error("Xóa thất bại. Vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Page */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" /> Quản Lý Người Dùng
          </h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý tài khoản khách hàng và đối tác trạm sạc.</p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-blue-200 transition"
        >
          <Plus className="w-4 h-4" /> Thêm mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Tìm kiếm</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Nhập tên hoặc email..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
            />
          </div>
        </div>

        <div className="w-[160px]">
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Vai trò</label>
          <select
            className="w-full py-2 px-3 border rounded-lg text-sm bg-white"
            value={filters.role || ''}
            onChange={(e) => handleFilterChange('role', e.target.value || undefined)}
          >
            <option value="">Tất cả</option>
            <option value="CUSTOMER">Customer</option>
            <option value="VENDOR">Vendor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="w-[160px]">
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Trạng thái</label>
          <select
            className="w-full py-2 px-3 border rounded-lg text-sm bg-white"
            value={filters.status !== undefined ? filters.status : ''}
            onChange={(e) => handleFilterChange('status', e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">Tất cả</option>
            <option value="1">Hoạt động</option>
            <option value="0">Đã khóa</option>
          </select>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
              <tr>
                <th className="p-4">User Info</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading || isFetching ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Không tìm thấy kết quả nào</td></tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                          {user.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded text-xs font-semibold border ${user.role === 'ADMIN' ? 'bg-red-50 text-red-700 border-red-100' :
                        user.role === 'VENDOR' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                          'bg-green-50 text-green-700 border-green-100'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.status === 1
                        ? <span className="text-green-600 text-xs font-bold flex items-center gap-1">● Active</span>
                        : <span className="text-red-500 text-xs font-bold flex items-center gap-1">● Inactive</span>
                      }
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={isDeleting}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            title="Xóa người dùng"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Simple */}
        {totalPages > 0 && (
          <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
            <button
              disabled={filters.page === 0}
              onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 0) - 1 }))}
              className="px-3 py-1 bg-white border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
            >Trước</button>
            <span className="px-3 py-1 text-sm text-gray-600 flex items-center">
              Trang {(filters.page || 0) + 1} / {totalPages}
            </span>
            <button
              disabled={(filters.page || 0) + 1 >= totalPages}
              onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 0) + 1 }))}
              className="px-3 py-1 bg-white border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
            >Sau</button>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => setFilters({ ...filters, page: 0 })} // Refresh list
      />

      <UserDetailModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}
