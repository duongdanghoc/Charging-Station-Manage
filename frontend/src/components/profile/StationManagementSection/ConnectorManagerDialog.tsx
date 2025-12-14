"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Loader2, Plus, Trash2, Plug } from "lucide-react";
// Đảm bảo bạn đã có các hooks này trong stationApi.ts
import { 
    useCreateConnectorMutation, 
    useDeleteConnectorMutation,
    ChargingPole 
} from "@/lib/redux/services/stationApi";

interface ConnectorManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pole: ChargingPole | null;
}

export function ConnectorManagerDialog({ open, onOpenChange, pole }: ConnectorManagerDialogProps) {
  // API Hooks
  const [createConnector, { isLoading: isCreating }] = useCreateConnectorMutation();
  const [deleteConnector, { isLoading: isDeleting }] = useDeleteConnectorMutation();

  const [formData, setFormData] = useState({
    connectorType: "TYPE2",
    maxPower: 11,
  });

  if (!pole) return null;

  const handleAdd = async () => {
    if (formData.maxPower <= 0) {
      toast.error("Công suất phải lớn hơn 0");
      return;
    }
    try {
      await createConnector({
        poleId: pole.id,
        connectorType: formData.connectorType,
        maxPower: Number(formData.maxPower),
      }).unwrap();
      toast.success("Đã thêm đầu sạc");
    } catch (error: any) {
      toast.error(error?.data?.message || "Lỗi khi thêm đầu sạc");
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Bạn chắc chắn muốn gỡ bỏ đầu sạc này?")) return;
    try {
      await deleteConnector(id).unwrap();
      toast.success("Đã gỡ bỏ đầu sạc");
    } catch (error) {
      toast.error("Lỗi xóa đầu sạc");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-700">
            <Plug className="size-5"/> 
            Quản lý đầu sạc - Trụ #{pole.id}
          </DialogTitle>
        </DialogHeader>

        {/* --- DANH SÁCH ĐẦU SẠC HIỆN CÓ --- */}
        <div className="space-y-3 my-4">
            <h4 className="text-sm font-medium text-gray-700">Danh sách đầu sạc hiện tại:</h4>
            
            <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
                {pole.connectors.length === 0 && (
                    <div className="text-sm text-gray-400 italic text-center py-4 border border-dashed rounded bg-slate-50">
                        Chưa có đầu sạc nào được gắn.
                    </div>
                )}
                {pole.connectors.map(c => (
                    <div key={c.id} className="flex justify-between items-center p-3 border rounded-lg bg-white shadow-sm hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                                <Plug size={16} />
                            </div>
                            <div>
                                <div className="font-bold text-sm text-gray-800">{c.connectorType}</div>
                                <div className="text-xs text-gray-500 font-medium">Max {c.maxPower} kW</div>
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(c.id)}
                            disabled={isDeleting}
                        >
                            <Trash2 className="size-4"/>
                        </Button>
                    </div>
                ))}
            </div>
        </div>

        {/* --- FORM THÊM MỚI --- */}
        <div className="pt-4 border-t mt-2 bg-slate-50 -mx-6 -mb-6 p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Plus className="size-4"/> Thêm đầu sạc mới
            </h4>
            <div className="grid grid-cols-5 gap-3 items-end">
                <div className="col-span-2 space-y-1">
                    <Label className="text-xs font-medium">Loại chuẩn sạc</Label>
                    <Select 
                        value={formData.connectorType} 
                        onValueChange={(v) => setFormData({...formData, connectorType: v})}
                    >
                        <SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TYPE2">Type 2 (AC)</SelectItem>
                            <SelectItem value="CCS">CCS 2 (DC)</SelectItem>
                            <SelectItem value="CHADEMO">CHAdeMO</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="col-span-2 space-y-1">
                    <Label className="text-xs font-medium">Công suất (kW)</Label>
                    <Input 
                        type="number" 
                        className="h-9 bg-white"
                        value={formData.maxPower}
                        onChange={(e) => setFormData({...formData, maxPower: Number(e.target.value)})}
                    />
                </div>
                <div className="col-span-1">
                    <Button size="sm" className="w-full h-9 bg-blue-600 hover:bg-blue-700" onClick={handleAdd} disabled={isCreating}>
                        {isCreating ? <Loader2 className="animate-spin size-4"/> : <Plus className="size-4"/>}
                    </Button>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}