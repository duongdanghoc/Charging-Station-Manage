// src/lib/services/StationService.ts
import type { Station } from "./StationPinTool";

const API_HOST = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_BASE = `${API_HOST}/api/stations`;

export interface FilterParams {
    search?: string;
    status?: number;
    vehicleType?: 'CAR' | 'MOTORBIKE' | 'BICYCLE';
    connectorType?: 'TYPE1' | 'TYPE2' | 'CHADEMO' | 'CCS' | 'TESLA';
    page?: number;
    size?: number;
}

export class StationService {
    /** Lưu trạm mới vào backend */
    static async saveStation(station: Omit<Station, "id">): Promise<Station> {
        const res = await fetch(`${API_BASE}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(station),
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Không thể lưu trạm: ${err}`);
        }

        return res.json();
    }

    /** Lấy tất cả các trạm */
    static async getAllStations(): Promise<Station[]> {
        const res = await fetch(`${API_BASE}`);
        if (!res.ok) throw new Error("Không thể lấy danh sách trạm");
        const data = await res.json();
        return this.processResponse(data);
    }

    /** Lọc trạm theo nhiều tiêu chí */
    static async filterStations(filters: FilterParams): Promise<Station[]> {
        const params = new URLSearchParams();
        
        if (filters.search) params.append('search', filters.search);
        if (filters.status !== undefined) params.append('status', filters.status.toString());
        if (filters.vehicleType) params.append('vehicleType', filters.vehicleType);
        if (filters.connectorType) params.append('connectorType', filters.connectorType);
        if (filters.page !== undefined) params.append('page', filters.page.toString());
        if (filters.size !== undefined) params.append('size', filters.size.toString());

        const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;
        const res = await fetch(url);
        
        if (!res.ok) throw new Error("Không thể lọc danh sách trạm");
        const data = await res.json();
        return this.processResponse(data);
    }

    /** Lấy trạm theo loại */
    static async getStationsByType(type: string): Promise<Station[]> {
        const res = await fetch(`${API_BASE}?type=${encodeURIComponent(type)}`);
        if (!res.ok) throw new Error("Không thể lấy trạm theo loại");
        const data = await res.json();
        return this.processResponse(data);
    }

    /** Lấy trạm trong vùng toạ độ */
    static async getStationsInBounds(bounds: {
        north: number;
        south: number;
        east: number;
        west: number;
    }): Promise<Station[]> {
        const query = new URLSearchParams({
            north: bounds.north.toString(),
            south: bounds.south.toString(),
            east: bounds.east.toString(),
            west: bounds.west.toString(),
        });
        const res = await fetch(`${API_BASE}/bounds?${query}`);
        if (!res.ok) throw new Error("Không thể lấy trạm trong khu vực");
        const data = await res.json();
        return this.processResponse(data);
    }

    /** Xử lý response từ API (hỗ trợ cả array và Page object) */
    private static processResponse(data: any): Station[] {
        const items = Array.isArray(data) ? data : (data.content || []);
        return items.map((item: any) => this.mapToStation(item));
    }

    /** Map dữ liệu từ API sang model Station của frontend */
    private static mapToStation(item: any): Station {
        return {
            id: item.id?.toString(),
            name: item.name,
            // Map API type (CAR/MOTORBIKE) to frontend type (charging/rescue)
            type: "charging", 
            lat: Number(item.latitude), // Ensure number
            lng: Number(item.longitude), // Ensure number
            description: item.address, 
            contact: item.vendorName,
            // Preserve original data and map extra fields for StationListItem
            ...item,
            rating: item.averageRating,
            status: item.status === 1 ? "Hoạt động" : "Bảo trì",
        };
    }

    /** Cập nhật thông tin trạm */
    static async updateStation(id: string, updates: Partial<Station>): Promise<Station> {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error("Không thể cập nhật trạm");
        return res.json();
    }

    /** Xóa trạm */
    static async deleteStation(id: string): Promise<void> {
        const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Không thể xóa trạm");
    }

    /** Tìm trạm gần nhất (client-side tính khoảng cách) */
    static async findNearestStations(
        lat: number,
        lng: number,
        type?: string,
        limit: number = 5
    ): Promise<Station[]> {
        const stations = type
            ? await this.getStationsByType(type)
            : await this.getAllStations();

        const stationsWithDistance = stations.map((station) => ({
            ...station,
            distance: this.calculateDistance(lat, lng, station.lat, station.lng),
        }));

        return stationsWithDistance
            .sort((a, b) => a.distance - b.distance)
            .slice(0, limit);
    }

    /** Tính khoảng cách giữa 2 điểm (Haversine formula) */
    private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371;
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(this.toRadians(lat1)) *
                Math.cos(this.toRadians(lat2)) *
                Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private static toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
}
