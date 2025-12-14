import React from 'react';
import { Layers, Box, ScanEye, TrafficCone, Activity, Map } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type MobileLayerControlProps = {
    is3D: boolean;
    onToggle3D: () => void;
    angled: boolean;
    onToggleAngle: () => void;
    isTrafficVisible?: boolean;
    toggleTraffic?: () => void;
    isCongestionVisible?: boolean;
    toggleCongestion?: () => void;
};

export const MobileLayerControl: React.FC<MobileLayerControlProps> = ({
    is3D,
    onToggle3D,
    angled,
    onToggleAngle,
    isTrafficVisible,
    toggleTraffic,
    isCongestionVisible,
    toggleCongestion,
}) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-md hover:bg-gray-50 focus:outline-none">
                    <Layers size={20} />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
                <div className="space-y-1">
                    <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-gray-500">Chế độ bản đồ</h3>

                    <button
                        onClick={onToggle3D}
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors ${is3D ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <Box size={16} />
                        <span>Bản đồ 3D</span>
                    </button>

                    <button
                        onClick={onToggleAngle}
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors ${angled ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <ScanEye size={16} />
                        <span>Góc nhìn nghiêng</span>
                    </button>

                    {toggleTraffic && (
                        <button
                            onClick={toggleTraffic}
                            className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors ${isTrafficVisible ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <TrafficCone size={16} />
                            <span>Hiển thị Traffic</span>
                        </button>
                    )}

                    {toggleCongestion && (
                        <button
                            onClick={toggleCongestion}
                            className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors ${isCongestionVisible ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Activity size={16} />
                            <span>Thông tin kẹt xe</span>
                        </button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};
