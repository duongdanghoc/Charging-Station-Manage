export type VehicleType = 'CAR' | 'MOTORBIKE' | 'BICYCLE';
export type ConnectorType = 'TYPE1' | 'TYPE2' | 'CHADEMO' | 'CCS' | 'TESLA';

export interface Vehicle {
    id: number;
    vehicleType: VehicleType;
    brand: string;
    model: string;
    licensePlate: string;
    batteryCapacity: number;
    connectorType: ConnectorType;
    hasActiveSession: boolean;
}

export interface CreateVehicleRequest {
    vehicleType: VehicleType;
    brand: string;
    model: string;
    licensePlate: string;
    batteryCapacity: number;
    connectorType: ConnectorType;
}

export interface UpdateVehicleRequest {
    vehicleType: VehicleType;
    brand: string;
    model: string;
    licensePlate: string;
    batteryCapacity: number;
    connectorType: ConnectorType;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    // Get JWT token from localStorage (stored as 'authToken' by Redux)
    const token = localStorage.getItem('authToken');
    
    console.log('[VehicleService] API Request:', {
        url: `${API_BASE_URL}${url}`,
        method: options.method || 'GET',
        hasToken: !!token,
        token: token?.substring(0, 20) + '...',
    });
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };
    
    console.log('[VehicleService] Request headers:', headers);
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        credentials: 'include',
        headers,
    });

    console.log('[VehicleService] Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[VehicleService] Error response:', errorText);
        
        let errorMessage = 'Có lỗi xảy ra';
        
        try {
            const errorData = JSON.parse(errorText);
            // Prioritize the detailed message inside 'data' if available, otherwise use top-level message
            errorMessage = errorData.data?.message || errorData.message || errorData.error || errorText;
        } catch {
            errorMessage = errorText || response.statusText;
        }
        
        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

export const VehicleService = {
    async getVehicles(): Promise<Vehicle[]> {
        return apiRequest<Vehicle[]>('/api/vehicles');
    },

    async getVehicleById(id: number): Promise<Vehicle> {
        return apiRequest<Vehicle>(`/api/vehicles/${id}`);
    },

    async createVehicle(data: CreateVehicleRequest): Promise<Vehicle> {
        return apiRequest<Vehicle>('/api/vehicles', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async updateVehicle(id: number, data: UpdateVehicleRequest): Promise<Vehicle> {
        return apiRequest<Vehicle>(`/api/vehicles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async deleteVehicle(id: number): Promise<void> {
        return apiRequest<void>(`/api/vehicles/${id}`, {
            method: 'DELETE',
        });
    },
};

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
    CAR: 'Ô tô',
    MOTORBIKE: 'Xe máy',
    BICYCLE: 'Xe đạp điện',
};

export const CONNECTOR_TYPE_LABELS: Record<ConnectorType, string> = {
    TYPE1: 'Type 1',
    TYPE2: 'Type 2',
    CHADEMO: 'CHAdeMO',
    CCS: 'CCS',
    TESLA: 'Tesla',
};
