// src/lib/services/StationService.ts
import type { Station } from "./StationPinTool";

const API_HOST = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
const API_BASE = `${API_HOST}/api/v1/stations`;

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
        return res.json();
    }

    /** Lấy trạm theo loại */
    static async getStationsByType(type: string): Promise<Station[]> {
        const res = await fetch(`${API_BASE}?type=${encodeURIComponent(type)}`);
        if (!res.ok) throw new Error("Không thể lấy trạm theo loại");
        return res.json();
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
        return res.json();
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
