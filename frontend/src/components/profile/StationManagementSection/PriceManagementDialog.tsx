"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Pencil, X, Save } from "lucide-react";
import {
  useCreatePriceMutation,
  useDeletePriceMutation,
  useGetPricesByPoleQuery,
  useUpdatePriceMutation,
} from "@/lib/redux/services/priceApi";
import { PriceName } from "@/components/profile/types";
import ConfirmModal from "@/components/common/ConfirmModal";

interface PriceManagementDialogProps {
  poleId: number;
  poleName: string;
}

export function PriceManagementDialog({
  poleId,
  poleName,
}: PriceManagementDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // State quản lý Modal xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [priceToDeleteId, setPriceToDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: PriceName.CHARGING,
    price: 0,
    effectiveFrom: new Date().toISOString().split("T")[0],
    effectiveTo: "",
    startTime: "08:00",
    endTime: "18:00",
  });

  const { data: pricesData, isLoading } = useGetPricesByPoleQuery(poleId, {
    skip: !isOpen,
  });
  const [createPrice, { isLoading: isCreating }] = useCreatePriceMutation();
  const [updatePrice, { isLoading: isUpdating }] = useUpdatePriceMutation();
  const [deletePrice, { isLoading: isDeleting }] = useDeletePriceMutation();

  const isSubmitting = isCreating || isUpdating;

  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      price: item.price,
      effectiveFrom: item.effectiveFrom,
      effectiveTo: item.effectiveTo || "",
      startTime: item.startTime.substring(0, 5),
      endTime: item.endTime.substring(0, 5),
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: PriceName.CHARGING,
      price: 0,
      effectiveFrom: new Date().toISOString().split("T")[0],
      effectiveTo: "",
      startTime: "08:00",
      endTime: "18:00",
    });
  };

  const handleSubmit = async () => {
    try {
      const payloadData = {
        name: formData.name,
        price: Number(formData.price),
        effectiveFrom: formData.effectiveFrom,
        effectiveTo:
          formData.effectiveTo === "" ? undefined : formData.effectiveTo,
        startTime:
          formData.startTime.length === 5
            ? formData.startTime + ":00"
            : formData.startTime,
        endTime:
          formData.endTime.length === 5
            ? formData.endTime + ":00"
            : formData.endTime,
      };

      if (editingId) {
        await updatePrice({
          id: editingId,
          body: payloadData,
        }).unwrap();
        toast.success("Cập nhật giá thành công");
        handleCancelEdit();
      } else {
        await createPrice({
          chargingPoleId: poleId,
          ...payloadData,
        }).unwrap();
        toast.success("Thêm giá thành công");
        setFormData((prev) => ({ ...prev, price: 0 }));
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Lỗi khi lưu cấu hình giá");
    }
  };

  const handleDeleteClick = (id: number) => {
    setPriceToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!priceToDeleteId) return;
    try {
      await deletePrice(priceToDeleteId).unwrap();
      toast.success("Xóa thành công");
      if (editingId === priceToDeleteId) handleCancelEdit();
      setIsDeleteModalOpen(false);
      setPriceToDeleteId(null);
    } catch (error) {
      toast.error("Lỗi khi xóa");
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(val) => {
          setIsOpen(val);
          if (!val) handleCancelEdit();
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            Cấu hình giá
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quản lý giá - Trụ sạc: {poleName}</DialogTitle>
          </DialogHeader>

          {/* --- FORM NHẬP LIỆU --- */}
          <div
            className={`p-5 border rounded-xl mt-4 transition-all duration-200 ${
              editingId
                ? "bg-orange-50/50 border-orange-200 shadow-sm"
                : "bg-slate-50/50 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h4
                className={`text-sm font-semibold flex items-center gap-2 ${
                  editingId ? "text-orange-700" : "text-gray-700"
                }`}
              >
                {editingId ? (
                  <>
                    <Pencil className="size-4" /> Chỉnh sửa cấu hình giá
                  </>
                ) : (
                  <>
                    <Plus className="size-4" /> Thêm cấu hình giá mới
                  </>
                )}
              </h4>
              {editingId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="h-7 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3.5 w-3.5 mr-1" /> Hủy bỏ
                </Button>
              )}
            </div>

            <div className="grid grid-cols-12 gap-x-4 gap-y-4">
              {/* Hàng 1: Loại phí & Giá */}
              <div className="col-span-12 sm:col-span-4 space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Loại phí <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.name}
                  onValueChange={(val) =>
                    setFormData({ ...formData, name: val as PriceName })
                  }
                >
                  {/* 👇 ĐÃ THÊM: h-10 để đồng bộ chiều cao */}
                  <SelectTrigger className="bg-white h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PriceName.CHARGING}>Sạc điện</SelectItem>
                    <SelectItem value={PriceName.PENALTY}>
                      Phạt quá giờ
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Giá (VND/kWh hoặc /phút) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  {/* 👇 ĐÃ THÊM: h-10 để đồng bộ chiều cao */}
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Number(e.target.value),
                      })
                    }
                    className="bg-white pr-12 font-medium h-12"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">
                    VND
                  </span>
                </div>
              </div>

              <div className="hidden sm:block sm:col-span-4"></div>

              {/* Hàng 2: Thời gian áp dụng */}
              <div className="col-span-6 sm:col-span-4 space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Ngày bắt đầu
                </Label>
                <Input
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, effectiveFrom: e.target.value })
                  }
                  className="bg-white h-10"
                />
              </div>

              <div className="col-span-6 sm:col-span-4 space-y-1.5">
                <div className="flex justify-between">
                  <Label className="text-xs font-medium text-gray-600">
                    Ngày kết thúc
                  </Label>
                  <span className="text-[10px] text-gray-400 font-normal italic">
                    (Để trống = Vô hạn)
                  </span>
                </div>
                <Input
                  type="date"
                  value={formData.effectiveTo}
                  onChange={(e) =>
                    setFormData({ ...formData, effectiveTo: e.target.value })
                  }
                  className="bg-white h-10"
                />
              </div>

              {/* Hàng 3: Khung giờ */}
              <div className="col-span-6 sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Từ giờ
                </Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="bg-white text-center h-10"
                />
              </div>

              <div className="col-span-6 sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Đến giờ
                </Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="bg-white text-center h-10"
                />
              </div>

              {/* Nút Submit */}
              <div className="col-span-12 flex justify-end pt-2 border-t mt-2 border-gray-100">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={
                    editingId
                      ? "bg-orange-600 hover:bg-orange-700 min-w-[140px] h-10"
                      : "bg-blue-600 hover:bg-blue-700 min-w-[140px] h-10"
                  }
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  ) : editingId ? (
                    <>
                      <Save className="h-4 w-4 mr-2" /> Lưu thay đổi
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" /> Thêm cấu hình
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* --- BẢNG DANH SÁCH --- */}
          <div className="mt-6 border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <h3 className="font-semibold text-sm text-gray-700">
                Danh sách giá hiện tại
              </h3>
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                {pricesData?.data?.length || 0} bản ghi
              </span>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                    <TableHead className="w-[120px]">Loại phí</TableHead>
                    <TableHead className="w-[120px]">Đơn giá (VND)</TableHead>
                    <TableHead className="w-[140px]">Khung giờ</TableHead>
                    <TableHead>Hiệu lực từ - đến</TableHead>
                    <TableHead className="w-[120px]">Trạng thái</TableHead>
                    <TableHead className="w-[100px] text-right">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricesData?.data?.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground italic"
                      >
                        Chưa có cấu hình giá nào được thiết lập.
                      </TableCell>
                    </TableRow>
                  )}
                  {pricesData?.data?.map((price: any) => (
                    <TableRow
                      key={price.id}
                      className={
                        editingId === price.id
                          ? "bg-orange-50 border-l-2 border-l-orange-500"
                          : "hover:bg-gray-50"
                      }
                    >
                      <TableCell className="font-medium">
                        {price.name === PriceName.CHARGING ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded text-xs font-semibold border border-emerald-100">
                            Sạc điện
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-red-600 bg-red-50 w-fit px-2 py-0.5 rounded text-xs font-semibold border border-red-100">
                            Phạt
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-bold text-gray-700">
                        {price.price.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-gray-600 text-xs">
                        <div className="flex items-center gap-1 bg-gray-100 w-fit px-2 py-1 rounded">
                          {price.startTime.substring(0, 5)} -{" "}
                          {price.endTime.substring(0, 5)}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        <div className="flex flex-col">
                          <span>
                            Từ: <b>{price.effectiveFrom}</b>
                          </span>
                          {price.effectiveTo ? (
                            <span>
                              Đến: <b>{price.effectiveTo}</b>
                            </span>
                          ) : (
                            <span className="text-gray-400">Đến: Vô thời hạn</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {price.active ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                            ● Đang chạy
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
                            ○ Hết hạn
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-500 hover:text-orange-600 hover:bg-orange-50"
                            onClick={() => handleEditClick(price)}
                            disabled={isDeleting || !!editingId}
                            title="Chỉnh sửa"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteClick(price.id)}
                            disabled={isDeleting || !!editingId}
                            title="Xóa"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Xác nhận xóa cấu hình giá"
        description="Bạn có chắc chắn muốn xóa cấu hình giá này không? Hành động này sẽ ảnh hưởng đến việc tính tiền cho các phiên sạc trong tương lai."
        confirmLabel="Xóa vĩnh viễn"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
}