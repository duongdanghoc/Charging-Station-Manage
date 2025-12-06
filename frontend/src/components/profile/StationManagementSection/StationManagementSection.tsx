'use client';

import React, { useState } from "react";
import { ListIcon, MapIcon, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import StationDetailSheet from "./StationDetailSheet";
import StationListTable from "./StationListTable";
import StationFormDialog from "./StationFormDialog";
import ConfirmModal from "@/components/common/ConfirmModal";
import StationMapList from "./StationMapList";

import {
    useGetMyStationsQuery,
    useCreateStationMutation,
    useUpdateStationMutation,
    useDeleteStationMutation,
    type Station,
    type CreateStationRequest
} from "@/lib/redux/services/stationApi";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type StationItem = Station;
export type StationStatus = "ACTIVE" | "INACTIVE";

const StationManagementSection: React.FC = () => {
    // --- State Filter ---
    const [viewMode, setViewMode] = useState<"list" | "map">("list");
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all"); // "all" | "1" | "0"
    const [filterType, setFilterType] = useState<string>("all");

    // --- State Management ---
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [stationToDelete, setStationToDelete] = useState<number | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailStation, setDetailStation] = useState<Station | null>(null);

    // --- API Integration ---
    const [createStation, { isLoading: isCreating }] = useCreateStationMutation();
    const [updateStation, { isLoading: isUpdating }] = useUpdateStationMutation();
    const [deleteStation] = useDeleteStationMutation();

    // --- API Call với Filter ---
    const queryParams = {
        page: 0,
        size: 100, // Load nhiều để hiện lên Map
        search: searchText || undefined,
        status: filterStatus !== "all" ? parseInt(filterStatus) : undefined,
        type: filterType !== "all" ? (filterType as any) : undefined,
    };

    const { data: stationPage, isLoading } = useGetMyStationsQuery(queryParams);

    // --- Handlers ---
    const handleViewDetail = (station: Station) => {
        setDetailStation(station);
        setIsDetailOpen(true);
    };

    const handleOpenCreate = () => {
        setSelectedStation(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (station: Station) => {
        setSelectedStation(station);
        setIsDialogOpen(true);
    };

    const onClickDelete = (id: number) => {
        setStationToDelete(id);
        setIsDeleteModalOpen(true);
    };

    // 2. Hàm thực sự gọi API xóa (được gọi khi bấm nút Xác nhận trong Modal)
    const onConfirmDelete = async () => {
        if (!stationToDelete) return;

        try {
            await deleteStation(stationToDelete).unwrap();
            toast.success("Đã xóa trạm sạc thành công!");

            setIsDeleteModalOpen(false);
            setStationToDelete(null);
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Xóa thất bại. Vui lòng thử lại sau.");
            
            setIsDeleteModalOpen(false);
        }
    };

    const handleToggleStatus = async (station: Station) => {
        try {
            // Logic: 1 (Active) <-> 0 (Inactive)
            const newStatus = station.status === 1 ? 0 : 1;
            await updateStation({
                id: station.id,
                data: { status: newStatus }
            }).unwrap();

            const statusText = newStatus === 1 ? "kích hoạt" : "vô hiệu hóa";
            toast.success(`Đã ${statusText} trạm thành công`);
        } catch (error) {
            console.error("Toggle status error:", error);
            toast.error("Không thể cập nhật trạng thái");
        }
    }

    const handleFormSubmit = async (formData: CreateStationRequest) => {
        try {
            if (selectedStation) {
                // Logic Update
                await updateStation({ id: selectedStation.id, data: formData }).unwrap();
                toast.success("Cập nhật thông tin trạm thành công");
            } else {
                // Logic Create
                await createStation(formData).unwrap();
                toast.success("Thêm trạm mới thành công");
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Có lỗi xảy ra, vui lòng kiểm tra lại thông tin nhập vào");
        }
    };

    return (
        <section className="space-y-6" aria-labelledby="station-management-section">
            <div className="flex flex-col gap-3">
                <h2 id="station-management-section" className="text-xl font-semibold text-gray-900">
                    Quản lý trạm sạc
                </h2>
                <p className="text-sm text-gray-600 max-w-3xl">
                    Bảng điều khiển giúp chủ trạm theo dõi trạng thái hoạt động, cập nhật thông tin chi tiết và bật/tắt trạm sạc.
                </p>
            </div>

            {/* --- TOOLBAR: SEARCH & FILTER & VIEW MODE --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">

                {/* Left: Search & Filters */}
                <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full items-center">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Tìm kiếm trạm..."
                            className="pl-9"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>

                    {/* Filter Status */}
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="1">Đang hoạt động</SelectItem>
                            <SelectItem value="0">Ngưng hoạt động</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Filter Type */}
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-full sm:w-[140px]">
                            <SelectValue placeholder="Loại xe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả loại xe</SelectItem>
                            <SelectItem value="CAR">Ô tô</SelectItem>
                            <SelectItem value="MOTORBIKE">Xe máy</SelectItem>
                            <SelectItem value="BICYCLE">Xe đạp</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Right: View Mode & Add Button */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-md border">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-1.5 rounded-sm transition-all ${viewMode === "list" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                            title="Xem danh sách"
                        >
                            <ListIcon className="size-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("map")}
                            className={`p-1.5 rounded-sm transition-all ${viewMode === "map" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                            title="Xem bản đồ"
                        >
                            <MapIcon className="size-4" />
                        </button>
                    </div>

                    <Button onClick={handleOpenCreate} className="flex items-center gap-2">
                        <Plus className="size-4" /> <span className="hidden sm:inline">Thêm mới</span>
                    </Button>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="min-h-[400px]">
                {isLoading ? (
                    <div className="text-center py-20 text-gray-500">Đang tải dữ liệu...</div>
                ) : viewMode === "list" ? (
                    // LIST VIEW
                    <StationListTable
                        stations={stationPage?.content || []}
                        onViewDetail={handleViewDetail}
                        onEdit={handleEdit}
                        onDelete={onClickDelete}
                        onToggleStatus={handleToggleStatus}
                    />
                ) : (
                    // MAP VIEW (Component mới)
                    <StationMapList
                        stations={stationPage?.content || []}
                        onStationClick={handleViewDetail} // Click marker -> Mở chi tiết
                    />
                )}
            </div>

            {/* Modal Form: Sử dụng Dialog Component */}
            <StationFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSubmit={handleFormSubmit}
                initialData={selectedStation}
                isLoading={isCreating || isUpdating}
            />

            <ConfirmModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                title="Xóa trạm sạc?"
                description={
                    <span>
                        Bạn có chắc chắn muốn xóa trạm sạc này không? <br />
                        Hành động này <b>không thể hoàn tác</b> và dữ liệu liên quan có thể bị ảnh hưởng.
                    </span>
                }
                onConfirm={onConfirmDelete}
                confirmLabel="Xóa"
                cancelLabel="Giữ lại"
                isLoading={false}
            />

            <StationDetailSheet
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                station={detailStation}
            />
        </section>
    );
};

export default StationManagementSection;
