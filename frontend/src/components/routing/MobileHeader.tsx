"use client";

import React, { useState, useEffect } from 'react';
import {
    Menu, X, Box, ScanEye, TrafficCone, Activity,
    Compass, RotateCw, RotateCcw, LocateFixed,
    Maximize, MessageSquare
} from 'lucide-react';
import { createPortal } from "react-dom";

interface MobileHeaderProps {
    is3D: boolean;
    onToggle3D: () => void;
    angled: boolean;
    onToggleAngle: () => void;
    keepZoom: boolean;
    onToggleKeepZoom: () => void;
    showAllPopups: boolean;
    onToggleShowAllPopups: () => void;
    isTrafficVisible: boolean;
    toggleTraffic: () => void;
    isCongestionVisible: boolean;
    toggleCongestion: () => void;
    rotateBy: (deg: number) => void;
    resetNorth: () => void;
    onPinMyLocation: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
    is3D, onToggle3D,
    angled, onToggleAngle,
    keepZoom, onToggleKeepZoom,
    showAllPopups, onToggleShowAllPopups,
    isTrafficVisible, toggleTraffic,
    isCongestionVisible, toggleCongestion,
    rotateBy, resetNorth, onPinMyLocation
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            <div className="absolute top-0 left-0 right-0 z-[370] flex h-14 items-center bg-transparent px-4 py-2 pointer-events-none">
                {/* Left: Menu Button */}
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-md hover:bg-gray-50 pointer-events-auto"
                >
                    <Menu size={20} />
                </button>
            </div>

            {/* Menu Overlay */}
            {isOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[1000] bg-white animate-in slide-in-from-left duration-200">
                    <div className="flex flex-col h-full overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800">Công cụ Bản đồ</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-4 grid grid-cols-2 gap-3">
                            <button
                                onClick={onToggle3D}
                                className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${is3D ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-700'
                                    }`}
                            >
                                <Box size={18} />
                                3D Mode
                            </button>

                            <button
                                onClick={onToggleAngle}
                                className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${angled ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-700'
                                    }`}
                            >
                                <ScanEye size={18} />
                                Nghiêng
                            </button>

                            <button
                                onClick={toggleTraffic}
                                className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${isTrafficVisible ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-700'
                                    }`}
                            >
                                <TrafficCone size={18} />
                                Traffic
                            </button>

                            <button
                                onClick={toggleCongestion}
                                className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${isCongestionVisible ? 'bg-orange-50 border-orange-200 text-orange-700' : 'border-gray-200 text-gray-700'
                                    }`}
                            >
                                <Activity size={18} />
                                Kẹt xe
                            </button>

                            <button onClick={() => rotateBy(-10)} className="flex items-center justify-start gap-2 p-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
                                <RotateCcw size={18} />
                                Xoay Trái
                            </button>
                            <button onClick={() => rotateBy(10)} className="flex items-center justify-start gap-2 p-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
                                <RotateCw size={18} />
                                Xoay Phải
                            </button>

                            <button onClick={resetNorth} className="flex items-center justify-start gap-2 p-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
                                <Compass size={18} />
                                Hướng Bắc
                            </button>
                            <button onClick={onPinMyLocation} className="flex items-center justify-start gap-2 p-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
                                <LocateFixed size={18} />
                                Vị trí tôi
                            </button>

                            <button onClick={onToggleKeepZoom}
                                className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${keepZoom ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-700'
                                    }`}>
                                <Maximize size={18} />
                                {keepZoom ? 'Khóa Zoom' : 'Auto Zoom'}
                            </button>

                            <button onClick={onToggleShowAllPopups}
                                className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${showAllPopups ? 'bg-amber-50 border-amber-200 text-amber-700' : 'border-gray-200 text-gray-700'
                                    }`}>
                                <MessageSquare size={18} />
                                Popups: {showAllPopups ? 'All' : 'Step'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
