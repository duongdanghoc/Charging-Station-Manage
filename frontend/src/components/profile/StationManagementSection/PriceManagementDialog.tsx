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
import { Loader2, Plus, Trash2, Pencil, X } from "lucide-react"; 
import {
  useCreatePriceMutation,
  useDeletePriceMutation,
  useGetPricesByPoleQuery,
  useUpdatePriceMutation,
} from "@/lib/redux/services/priceApi";
import { PriceName } from "@/components/profile/types";

interface PriceManagementDialogProps {
  poleId: number;
  poleName: string;
}

export function PriceManagementDialog({ poleId, poleName }: PriceManagementDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // State để biết đang sửa ID nào (null = đang thêm mới)
  const [editingId, setEditingId] = useState<number | null>(null);

  // State Form
  const [formData, setFormData] = useState({
    name: PriceName.CHARGING,
    price: 0,
    effectiveFrom: new Date().toISOString().split("T")[0],
    effectiveTo: "",
    startTime: "08:00",
    endTime: "18:00",
  });

  // API Hooks
  const { data: pricesData, isLoading } = useGetPricesByPoleQuery(poleId, {
    skip: !isOpen,
  });
  const [createPrice, { isLoading: isCreating }] = useCreatePriceMutation();
  const [updatePrice, { isLoading: isUpdating }] = useUpdatePriceMutation();
  const [deletePrice, { isLoading: isDeleting }] = useDeletePriceMutation();

  const isSubmitting = isCreating || isUpdating;

  // --- HÀM XỬ LÝ KHI BẤM NÚT SỬA ---
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

  // --- HÀM HỦY CHẾ ĐỘ SỬA ---
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

  // --- HÀM SUBMIT (CHUNG CHO CẢ THÊM VÀ SỬA) ---
  const handleSubmit = async () => {
    try {
      // Chuẩn bị dữ liệu payload
      const payloadData = {
        name: formData.name,
        price: Number(formData.price),
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo === "" ? undefined : formData.effectiveTo,
        startTime: formData.startTime.length === 5 ? formData.startTime + ":00" : formData.startTime,
        endTime: formData.endTime.length === 5 ? formData.endTime + ":00" : formData.endTime,
      };

      if (editingId) {
        // === LOGIC SỬA ===
        await updatePrice({
          id: editingId,
          // 👇 ĐÃ SỬA: Chỉ gửi payloadData, không gửi chargingPoleId khi update
          body: payloadData 
        }).unwrap();
        toast.success("Cập nhật giá thành công");
        handleCancelEdit(); 
      } else {
        // === LOGIC THÊM MỚI ===
        await createPrice({
          chargingPoleId: poleId,
          ...payloadData
        }).unwrap();
        toast.success("Thêm giá thành công");
        setFormData(prev => ({ ...prev, price: 0 }));
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Lỗi khi lưu cấu hình giá");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa cấu hình giá này?")) return;
    try {
      await deletePrice(id).unwrap();
      toast.success("Xóa thành công");
      if (editingId === id) handleCancelEdit();
    } catch (error) {
      toast.error("Lỗi khi xóa");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => {
      setIsOpen(val);
      if (!val) handleCancelEdit();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Cấu hình giá
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quản lý giá - Trụ sạc: {poleName}</DialogTitle>
        </DialogHeader>

        {/* --- FORM NHẬP LIỆU --- */}
        <div className={`grid grid-cols-6 gap-3 p-4 border rounded-lg mt-4 transition-colors ${editingId ? "bg-orange-50 border-orange-200" : "bg-slate-50"}`}>
          <div className="col-span-1">
            <Label>Loại phí</Label>
            <Select
              value={formData.name}
              onValueChange={(val) => setFormData({ ...formData, name: val as PriceName })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PriceName.CHARGING}>Sạc điện</SelectItem>
                <SelectItem value={PriceName.PENALTY}>Phạt quá giờ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-1">
            <Label>Giá (VND)</Label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            />
          </div>
          <div className="col-span-1">
            <Label>Ngày hiệu lực</Label>
            <Input
              type="date"
              value={formData.effectiveFrom}
              onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
            />
          </div>
          <div className="col-span-1">
            <Label>Đến ngày (Tùy chọn)</Label>
            <Input
              type="date"
              value={formData.effectiveTo}
              onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
              className="text-xs"
            />
            <span className="text-[10px] text-gray-400">(Trống = Vô hạn)</span>
          </div>
          <div className="col-span-1">
            <Label>Bắt đầu (Giờ)</Label>
            <Input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
          </div>
          <div className="col-span-1">
            <Label>Kết thúc (Giờ)</Label>
            <Input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />
          </div>

          {/* NÚT ACTION */}
          <div className="col-span-full flex justify-end gap-2 mt-2">
            {editingId && (
              <Button variant="outline" onClick={handleCancelEdit} type="button">
                <X className="h-4 w-4 mr-1" /> Hủy
              </Button>
            )}
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting} 
              className={editingId ? "bg-orange-600 hover:bg-orange-700 min-w-[120px]" : "min-w-[120px]"}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : editingId ? (
                <>
                  <Pencil className="h-4 w-4 mr-1" /> Lưu thay đổi
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" /> Thêm giá
                </>
              )}
            </Button>
          </div>
        </div>

        {/* --- BẢNG DANH SÁCH --- */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Danh sách cấu hình giá hiện tại</h3>
          {isLoading ? (
            <div className="text-center py-4">Đang tải...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loại</TableHead>
                  <TableHead>Giá/kWh (VND)</TableHead>
                  <TableHead>Khung giờ</TableHead>
                  <TableHead>Ngày hiệu lực</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricesData?.data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Chưa có cấu hình giá nào
                    </TableCell>
                  </TableRow>
                )}
                {/* 👇 ĐÃ SỬA: Thêm : any vào biến price để TypeScript không báo lỗi */}
                {pricesData?.data?.map((price: any) => (
                  <TableRow key={price.id} className={editingId === price.id ? "bg-orange-50" : ""}>
                    <TableCell className="font-medium">
                      {price.name === PriceName.CHARGING ? (
                        <span className="text-green-600">Sạc điện</span>
                      ) : (
                        <span className="text-red-600">Phạt</span>
                      )}
                    </TableCell>
                    <TableCell>{price.price.toLocaleString()}</TableCell>
                    <TableCell>
                      {price.startTime.substring(0, 5)} - {price.endTime.substring(0, 5)}
                    </TableCell>
                    <TableCell>
                      {price.effectiveFrom}
                      {price.effectiveTo ? ` ➝ ${price.effectiveTo}` : " ➝ ∞"}
                    </TableCell>
                    <TableCell>
                      {price.active ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Đang áp dụng
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">Không hiệu lực</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-100"
                          onClick={() => handleEditClick(price)}
                          disabled={isDeleting}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          onClick={() => handleDelete(price.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
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
  );
}