"use client";

import { useState } from 'react';
import { LayoutDashboard, Users, Zap } from "lucide-react";

// --- IMPORT CÁC FILE VỪA TẠO ---
import AdminCheck from "./_AdminCheck";
import StationManagement from "./StationManagement";
import UserManagement from "./UserManagement";

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'stations' | 'users'>('stations');

    return (
        <AdminCheck fallback={<div className="min-h-screen flex items-center justify-center font-medium text-gray-500">Đang tải quyền Admin...</div>}>
            <div className="min-h-screen bg-gray-50 flex">

                {/* SIDEBAR: w-56 */}
                <aside className="w-56 bg-slate-900 text-white flex flex-col fixed left-0 top-16 bottom-0 z-10 shadow-xl overflow-y-auto">
                    <div className="p-6 border-b border-slate-800">
                        <h1 className="text-lg font-bold tracking-wider flex items-center gap-2">
                            <LayoutDashboard className="text-blue-400 w-5 h-5" /> ADMIN
                        </h1>
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                        <div className="text-xs font-semibold text-slate-500 uppercase mb-2 px-2">Hệ thống</div>

                        <button
                            onClick={() => setActiveTab('stations')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                activeTab === 'stations'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <Zap className="w-5 h-5" />
                            <span className="font-medium">Trạm Sạc</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('users')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                activeTab === 'users'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <Users className="w-5 h-5" />
                            <span className="font-medium">Người Dùng</span>
                        </button>
                    </nav>
                </aside>

                {/* MAIN CONTENT: ml-56 (tránh sidebar) + pt-24 (tránh header) */}
                <main className="flex-1 w-full ml-56 p-8 pt-24 min-h-screen">
                    {activeTab === 'stations' ? <StationManagement /> : <UserManagement />}
                </main>
            </div>
        </AdminCheck>
    );
}
