import React from 'react';
import { Menu, User } from 'lucide-react';

export const MobileHeader: React.FC = () => {
    return (
        <div className="absolute top-0 left-0 right-0 z-[370] flex h-14 items-center justify-between bg-transparent px-4 py-2 pointer-events-none">
            {/* Left: Menu Button */}
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-md hover:bg-gray-50 pointer-events-auto">
                <Menu size={20} />
            </button>

            {/* Right: Avatar */}
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-md hover:bg-gray-50 pointer-events-auto overflow-hidden">
                <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                    <User size={20} />
                </div>
            </button>
        </div>
    );
};
