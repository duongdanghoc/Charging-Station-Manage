'use client';

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import StationDetailSheet from "./StationDetailSheet";
import StationListTable from "./StationListTable";
import StationFormDialog from "./StationFormDialog";
import ConfirmModal from "@/components/common/ConfirmModal";

import {
    useGetMyStationsQuery,
    useCreateStationMutation,
    useUpdateStationMutation,
    useDeleteStationMutation,
    type Station,
    type CreateStationRequest
} from "@/lib/redux/services/stationApi";

export type StationItem = Station;
export type StationStatus = "ACTIVE" | "INACTIVE";

const StationManagementSection: React.FC = () => {
    // --- State Management ---
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [stationToDelete, setStationToDelete] = useState<number | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailStation, setDetailStation] = useState<Station | null>(null);

    // --- API Integration ---
    const { data: stationPage, isLoading } = useGetMyStationsQuery({ page: 0, size: 100 });
    const [createStation, { isLoading: isCreating }] = useCreateStationMutation();
    const [updateStation, { isLoading: isUpdating }] = useUpdateStationMutation();
    const [deleteStation] = useDeleteStationMutation();

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

            {/* Actions Bar */}
            <div className="flex justify-end">
                <Button onClick={handleOpenCreate} className="flex items-center gap-2">
                    <Plus className="size-4" /> Thêm trạm mới
                </Button>
            </div>

            {/* Main Content: Sử dụng Table Component */}
            {isLoading ? (
                <div className="text-center py-10 text-gray-500">Đang tải dữ liệu trạm sạc...</div>
            ) : (
                <StationListTable
                    stations={stationPage?.content || []}
                    onViewDetail={handleViewDetail}
                    onEdit={handleEdit}
                    onDelete={onClickDelete}
                    onToggleStatus={handleToggleStatus}
                />
            )}

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
