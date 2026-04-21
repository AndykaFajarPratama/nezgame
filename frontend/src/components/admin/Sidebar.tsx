import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  History, 
  Settings, 
  LogOut,
  ChevronRight,
  ShieldAlert,
  Crown,
  Palette
} from "lucide-react";

import { authClient } from "../../lib/auth-client";

const menuItems = [
  { name: "Ringkasan", icon: LayoutDashboard, path: "/admin" },
  { name: "Produk", icon: Package, path: "/admin/products" },
  { name: "Transaksi", icon: History, path: "/admin/transactions" },
  { name: "Tampilan", icon: Palette, path: "/admin/appearance" },
  { name: "Pengaturan", icon: Settings, path: "/admin/settings" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!confirm("Apakah Anda yakin ingin keluar?")) return;
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => navigate("/login"),
      },
    });
  };

  return (
    <aside className="w-64 min-h-screen glass border-r border-blue-500/20 flex flex-col z-20">
      <div className="p-6 border-b border-blue-500/10">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tighter text-white group-hover:text-cyan-400 transition-colors">
            NEZ<span className="text-cyan-400">GAME</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-6 py-3.5 transition-all duration-300 group ${
                isActive ? "sidebar-link-active" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${isActive ? "text-blue-400" : "group-hover:text-blue-400"}`} />
                <span className="font-medium text-sm tracking-wide">{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-blue-500" />}
            </Link>
          );
        })}
      </nav>

      {/* Owner Dashboard Link */}
      <div className="px-6 pb-2">
        <Link
          to="/owner"
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all group"
        >
          <Crown className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Owner Dashboard</span>
        </Link>
      </div>

      <div className="p-6 border-t border-blue-500/10 mb-4">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 text-rose-400 hover:text-rose-300 transition-colors w-full px-2 py-2 rounded hover:bg-rose-500/5 group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold">Keluar Akun</span>
        </button>
      </div>
    </aside>
  );
}
