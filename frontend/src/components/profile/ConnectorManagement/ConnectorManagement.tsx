'use client';

import React, { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

import ConnectorListTable from "./ConnectorListTable";
import ConnectorFormDialog from "./ConnectorFormDialog";
import ConnectorDetailSheet from "./ConnectorDetailSheet";
import ConfirmModal from "@/components/common/ConfirmModal";

import {
    useSearchConnectorsQuery,
    useCreateConnectorMutation,
    useUpdateConnectorMutation,
    useUpdateConnectorStatusMutation,
    useDeleteConnectorMutation,
    type Connector,
    type CreateConnectorRequest,
    type ConnectorSearchParams
} from "@/lib/redux/services/connectorApi";

interface ConnectorManagementProps {
    stationId?: number;
}

const ConnectorManagement: React.FC<ConnectorManagementProps> = ({ stationId }) => {
    // --- State Filter ---
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterType, setFilterType] = useState<string>("all");

    // --- State Management ---
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [connectorToDelete, setConnectorToDelete] = useState<number | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailConnector, setDetailConnector] = useState<Connector | null>(null);

    // --- API Integration ---
    const [createConnector, { isLoading: isCreating }] = useCreateConnectorMutation();
    const [updateConnector, { isLoading: isUpdating }] = useUpdateConnectorMutation();
    const [updateConnectorStatus] = useUpdateConnectorStatusMutation();
    const [deleteConnector] = useDeleteConnectorMutation();

    // --- Build Query Params ---
    const queryParams: ConnectorSearchParams = {
        page: 0,
        size: 100,
        ...(stationId && { stationId }),
        ...(filterStatus !== "all" && { status: filterStatus }),
        ...(filterType !== "all" && { connectorType: filterType }),
    };

    const { data: connectorPage, isLoading } = useSearchConnectorsQuery(queryParams);

    // --- Filter Logic ---
    const filteredConnectors = React.useMemo(() => {
        if (!connectorPage?.content) return [];
        
        return connectorPage.content.filter((connector) => {
            const matchesSearch = !searchText || 
                connector.stationName?.toLowerCase().includes(searchText.toLowerCase()) ||
                connector.poleName?.toLowerCase().includes(searchText.toLowerCase()) ||
                connector.id.toString().includes(searchText);
            
            return matchesSearch;
        });
    }, [connectorPage, searchText]);

    // --- Handlers ---
    const handleViewDetail = (connector: Connector) => {
        setDetailConnector(connector);
        setIsDetailOpen(true);
    };

    const handleOpenCreate = () => {
        setSelectedConnector(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (connector: Connector) => {
        setSelectedConnector(connector);
        setIsDialogOpen(true);
    };

    const onClickDelete = (id: number) => {
        setConnectorToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const onConfirmDelete = async () => {
        if (!connectorToDelete) return;

        try {
            await deleteConnector(connectorToDelete).unwrap();
            toast.success("Đã xóa connector thành công!");
            setIsDeleteModalOpen(false);
            setConnectorToDelete(null);
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Xóa thất bại. Vui lòng thử lại sau.");
            setIsDeleteModalOpen(false);
        }
    };

    const handleToggleStatus = async (connector: Connector) => {
        try {
            const newStatus = connector.status === "AVAILABLE" ? "MAINTENANCE" : "AVAILABLE";
            await updateConnectorStatus({
                id: connector.id,
                status: newStatus
            }).unwrap();

            const statusText = newStatus === "AVAILABLE" ? "sẵn sàng" : "bảo trì";
            toast.success(`Đã chuyển connector sang trạng thái ${statusText}`);
        } catch (error) {
            console.error("Toggle status error:", error);
            toast.error("Không thể cập nhật trạng thái");
        }
    };

    const handleFormSubmit = async (formData: CreateConnectorRequest) => {
        try {
            if (selectedConnector) {
                // Logic Update
                await updateConnector({ 
                    id: selectedConnector.id, 
                    data: formData 
                }).unwrap();
                toast.success("Cập nhật connector thành công");
            } else {
                // Logic Create
                await createConnector(formData).unwrap();
                toast.success("Thêm connector mới thành công");
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Có lỗi xảy ra, vui lòng kiểm tra lại thông tin nhập vào");
        }
    };

    return (
        <section className="space-y-6" aria-labelledby="connector-management-section">
            <div className="flex flex-col gap-3">
                <h3 className="text-lg font-semibold text-gray-900">
                    Quản lý Connector
                </h3>
                <p className="text-sm text-gray-600 max-w-3xl">
                    Quản lý các đầu cắm sạc (connector) cho từng trụ sạc. Thêm, chỉnh sửa hoặc xóa connector.
                </p>
            </div>

            {/* --- TOOLBAR: SEARCH & FILTER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                {/* Left: Search & Filters */}
                <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full items-center">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Tìm kiếm connector..."
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
                            <SelectItem value="AVAILABLE">Sẵn sàng</SelectItem>
                            <SelectItem value="IN_USE">Đang sử dụng</SelectItem>
                            <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                            <SelectItem value="OUT_OF_SERVICE">Ngưng hoạt động</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Filter Type */}
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-full sm:w-[140px]">
                            <SelectValue placeholder="Loại connector" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả loại</SelectItem>
                            <SelectItem value="TYPE_1">Type 1</SelectItem>
                            <SelectItem value="TYPE_2">Type 2</SelectItem>
                            <SelectItem value="CCS1">CCS1</SelectItem>
                            <SelectItem value="CCS2">CCS2</SelectItem>
                            <SelectItem value="CHADEMO">CHAdeMO</SelectItem>
                            <SelectItem value="GB_T">GB/T</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Right: Add Button */}
                <Button onClick={handleOpenCreate} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm Connector
                </Button>
            </div>

            {/* --- TABLE --- */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <ConnectorListTable
                    connectors={filteredConnectors}
                    onViewDetail={handleViewDetail}
                    onEdit={handleEdit}
                    onDelete={onClickDelete}
                    onToggleStatus={handleToggleStatus}
                />
            )}

            {/* --- DIALOGS & MODALS --- */}
            <ConnectorFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                connector={selectedConnector}
                onSubmit={handleFormSubmit}
                isLoading={isCreating || isUpdating}
            />

            <ConnectorDetailSheet
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                connector={detailConnector}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={onConfirmDelete}
                title="Xác nhận xóa connector"
                message="Bạn có chắc chắn muốn xóa connector này? Hành động này không thể hoàn tác."
            />
        </section>
    );
};

export default ConnectorManagement;