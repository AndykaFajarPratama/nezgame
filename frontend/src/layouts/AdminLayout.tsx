import React from "react";
import Sidebar from "../components/admin/Sidebar";
import { Bell, Search, User } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-transparent text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Sidebar background glow */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] pointer-events-none -z-10" />
      
      <Sidebar />

      <div className="flex-1 flex flex-col relative overflow-x-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-8 glass border-b border-blue-500/10 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-heading font-semibold text-slate-200">
              Panel Administrator
            </h2>
            <span className="hidden md:flex items-center px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/5 text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
              Sistem Online
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg focus-within:border-blue-500/50 transition-all">
              <Search className="w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Cari..." 
                className="bg-transparent outline-none text-xs w-48 placeholder:text-slate-600"
              />
            </div>
            
            <button className="relative group">
              <Bell className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#05070a]" />
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-white/10 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white uppercase tracking-tight">Administrator</p>
                <p className="text-[10px] text-slate-500 italic">Akses Penuh</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-blue-500/20 flex items-center justify-center group-hover:border-blue-500/50 transition-all overflow-hidden shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                <User className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Scanline Effect Overlay for Content */}
        <div className="scanline absolute inset-0 pointer-events-none opacity-[0.03] z-50 overflow-hidden h-full w-full" />

        <main className="p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
