"use client";

import { useState, useEffect } from "react";
import {
  useGetRescueStationsQuery,
  useCreateRescueStationMutation,
  useDeleteRescueStationMutation,
  useUpdateRescueStationMutation // 👈 Import thêm hook Update
} from "@/lib/redux/services/adminApi";
import {
  Plus, Trash2, MapPin, Phone, Ambulance, Mail, Clock,
  Edit, Search, ChevronLeft, ChevronRight // 👈 Import thêm các icon mới
} from "lucide-react";
import { toast } from "sonner";

// --- 1. Helper Validate (Kiểm tra dữ liệu đầu vào) ---
const validateForm = (form: any) => {
  if (!form.name.trim()) return "Tên trạm không được để trống";
  if (!form.phone.trim()) return "Số điện thoại không được để trống";
  // Regex kiểm tra số điện thoại VN đơn giản (bắt đầu bằng 0 hoặc +84, dài 10-11 số)
  if (!/^(0|\+84)\d{9,10}$/.test(form.phone)) return "Số điện thoại không hợp lệ (VD: 09xxxx)";
  if (!form.addressDetail.trim()) return "Địa chỉ không được để trống";
  if (!form.province.trim()) return "Tỉnh/Thành phố không được để trống";
  if (form.openTime >= form.closeTime) return "Giờ mở cửa phải nhỏ hơn giờ đóng cửa";
  return null;
};

export default function RescueStationManagement() {
  // --- 2. State Quản lý (Filter, Pagination) ---
  const [page, setPage] = useState(0);        // Trang hiện tại (bắt đầu từ 0)
  const [keyword, setKeyword] = useState(""); // Từ khóa gửi xuống API
  const [searchTerm, setSearchTerm] = useState(""); // Từ khóa trong ô input (để debounce)

  // --- 3. API Hooks ---
  // Gọi API lấy danh sách (tự động chạy lại khi page hoặc keyword thay đổi)
  const { data: apiData, isLoading } = useGetRescueStationsQuery({ page, keyword });

  const [createStation, { isLoading: isCreating }] = useCreateRescueStationMutation();
  const [updateStation, { isLoading: isUpdating }] = useUpdateRescueStationMutation();
  const [deleteStation] = useDeleteRescueStationMutation();

  // --- 4. Modal & Form State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null); // null = Tạo mới, number = Đang sửa ID này

  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    addressDetail: "", province: "",
    openTime: "08:00", closeTime: "17:00"
  });

  // --- 5. Effect Debounce Search ---
  // Khi người dùng gõ, đợi 0.5s mới gọi API tìm kiếm để tránh spam request
  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(searchTerm);
      setPage(0); // Reset về trang 1 khi tìm kiếm mới
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- 6. Các hàm xử lý ---

  // Mở Modal (Xử lý cho cả Thêm và Sửa)
  const openModal = (station?: any) => {
    if (station) {
      // Mode Sửa: Đổ dữ liệu cũ vào form
      setEditingId(station.id);
      setForm({
        name: station.name,
        phone: station.phone,
        email: station.email || "",
        // Lấy thông tin từ object location lồng bên trong
        addressDetail: station.location?.addressDetail || "",
        province: station.location?.province || "",
        // Cắt chuỗi HH:mm:ss -> HH:mm cho input type="time"
        openTime: station.openTime?.substring(0, 5) || "08:00",
        closeTime: station.closeTime?.substring(0, 5) || "17:00"
      });
    } else {
      // Mode Tạo mới: Reset form trắng
      setEditingId(null);
      setForm({ name: "", phone: "", email: "", addressDetail: "", province: "", openTime: "08:00", closeTime: "17:00" });
    }
    setIsModalOpen(true);
  };

  // Xử lý Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate trước khi gửi
    const error = validateForm(form);
    if (error) {
      toast.error(error);
      return;
    }

    try {
      if (editingId) {
        // Gọi API Cập nhật
        await updateStation({ id: editingId, data: form }).unwrap();
        toast.success("Cập nhật thông tin thành công!");
      } else {
        // Gọi API Tạo mới
        await createStation(form).unwrap();
        toast.success("Thêm trạm mới thành công!");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Thao tác thất bại. Vui lòng thử lại.");
    }
  };

  // Xử lý Xóa
  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa trạm cứu hộ này?")) {
      try {
        await deleteStation(id).unwrap();
        toast.success("Đã xóa trạm cứu hộ");
      } catch (error) {
        toast.error("Xóa thất bại");
      }
    }
  };

  // Lấy dữ liệu từ API Response
  const stations = apiData?.data?.content || [];
  const totalPages = apiData?.data?.totalPages || 0;

  // --- 7. Render Giao Diện ---
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header & Toolbar */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Ambulance className="w-6 h-6 text-red-600" /> Quản Lý Cứu Hộ
          </h2>
          <p className="text-sm text-gray-500">Danh sách các đơn vị hỗ trợ khẩn cấp.</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {/* Ô Tìm kiếm */}
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm tên, SĐT..."
              className="pl-9 pr-4 py-2 border rounded-lg text-sm w-full md:w-64 focus:ring-2 focus:ring-red-200 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => openModal()} // Gọi không tham số -> Mode Tạo mới
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all text-sm font-medium whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Thêm Mới
          </button>
        </div>
      </div>

      {/* Grid Danh Sách Trạm */}
      {isLoading ? (
        <div className="py-20 text-center text-gray-500">
          <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          Đang tải dữ liệu...
        </div>
      ) : stations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed text-gray-400">
          Không tìm thấy trạm cứu hộ nào phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stations.map((station: any) => (
            <div key={station.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative group">
              {/* Toolbar Nút Sửa/Xóa (Hiện khi hover) */}
              <div className="absolute top-4 right-4 flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-2">
                 <button
                    onClick={() => openModal(station)} // Gọi có tham số -> Mode Sửa
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Chỉnh sửa"
                 >
                    <Edit className="w-4 h-4" />
                 </button>
                 <button
                    onClick={() => handleDelete(station.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Xóa"
                 >
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>

              <div className="flex items-center gap-3 mb-3 pr-16">
                <div className="p-3 bg-red-50 rounded-full text-red-600 shrink-0">
                  <Ambulance className="w-6 h-6" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-gray-800 truncate" title={station.name}>{station.name}</h3>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                     <Clock className="w-3 h-3"/> {station.openTime?.substring(0,5)} - {station.closeTime?.substring(0,5)}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mt-4 pt-4 border-t border-gray-50">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0"/>
                  <span className="line-clamp-2" title={`${station.location?.addressDetail}, ${station.location?.province}`}>
                    {station.location?.addressDetail}, {station.location?.province}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400"/> {station.phone}
                </p>
                {station.email && (
                  <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400"/> <span className="truncate">{station.email}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls (Nút Phân trang) */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-gray-100">
           <button
             disabled={page === 0}
             onClick={() => setPage(p => p - 1)}
             className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
           >
             <ChevronLeft className="w-5 h-5" />
           </button>
           <span className="text-sm font-medium text-gray-600">Trang {page + 1} / {totalPages}</span>
           <button
             disabled={page >= totalPages - 1}
             onClick={() => setPage(p => p + 1)}
             className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
           >
             <ChevronRight className="w-5 h-5" />
           </button>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800">
                  {editingId ? "Cập Nhật Thông Tin" : "Thêm Trạm Cứu Hộ"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Form Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên đơn vị <span className="text-red-500">*</span></label>
                <input required className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-200 outline-none transition"
                    value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="VD: Cứu hộ Sài Gòn 24/7"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                    <input required className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-200 outline-none transition"
                        value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="09xxxx"/>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-200 outline-none transition"
                        value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="admin@example.com"/>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giờ mở cửa</label>
                    <input type="time" required className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-200 outline-none"
                        value={form.openTime} onChange={e => setForm({...form, openTime: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giờ đóng cửa</label>
                    <input type="time" required className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-200 outline-none"
                        value={form.closeTime} onChange={e => setForm({...form, closeTime: e.target.value})} />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết <span className="text-red-500">*</span></label>
                <input required className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-200 outline-none transition"
                    value={form.addressDetail} onChange={e => setForm({...form, addressDetail: e.target.value})} placeholder="Số nhà, đường, phường..."/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
                <input required className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-200 outline-none transition"
                    value={form.province} onChange={e => setForm({...form, province: e.target.value})} placeholder="VD: Hà Nội, TP.HCM..."/>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">Hủy bỏ</button>
                <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                    {(isCreating || isUpdating) && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>}
                    {editingId ? "Lưu Cập Nhật" : "Thêm Trạm Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
