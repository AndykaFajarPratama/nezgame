import React from "react";
import OwnerSidebar from "../components/owner/OwnerSidebar";
import { Bell, Search, Crown } from "lucide-react";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-transparent text-slate-100 font-sans selection:bg-amber-500/30">
      {/* Sidebar background glow — amber/gold */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-amber-600/5 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-orange-600/5 blur-[120px] pointer-events-none -z-10" />

      <OwnerSidebar />

      <div className="flex-1 flex flex-col relative overflow-x-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-8 owner-glass border-b border-amber-500/10 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-heading font-semibold text-slate-200">
              Owner Command Center
            </h2>
            <span className="hidden md:flex items-center px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/5 text-[10px] text-amber-400 font-bold uppercase tracking-widest">
              Owner Access
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg focus-within:border-amber-500/50 transition-all">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search data..."
                className="bg-transparent outline-none text-xs w-48 placeholder:text-slate-600"
              />
            </div>

            <button className="relative group">
              <Bell className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full border-2 border-[#05070a]" />
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-white/10 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white uppercase tracking-tight">
                  Owner
                </p>
                <p className="text-[10px] text-amber-500 italic font-bold">
                  Full Access
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center group-hover:border-amber-500/60 transition-all overflow-hidden shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Scanline Effect Overlay */}
        <div className="scanline absolute inset-0 pointer-events-none opacity-[0.02] z-50 overflow-hidden h-full w-full" />

        <main className="p-8 relative">{children}</main>
      </div>
    </div>
  );
}
