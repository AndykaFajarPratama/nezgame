import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  FileBarChart,
  Users,
  LogOut,
  ChevronRight,
  Crown,
  ArrowLeft,
} from "lucide-react";
import { authClient } from "../../lib/auth-client";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/owner" },
  { name: "Analytics", icon: TrendingUp, path: "/owner/analytics" },
  { name: "Reports", icon: FileBarChart, path: "/owner/reports" },
  { name: "Admin Team", icon: Users, path: "/owner/admins" },
];

export default function OwnerSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to sign out?")) return;
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => navigate("/login"),
      },
    });
  };

  return (
    <aside className="w-64 min-h-screen owner-glass border-r border-amber-500/20 flex flex-col z-20">
      <div className="p-6 border-b border-amber-500/10">
        <Link to="/owner" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tighter text-white group-hover:text-amber-400 transition-colors">
            NEZ<span className="text-amber-400">OWNER</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive =
            item.path === "/owner"
              ? location.pathname === "/owner"
              : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-6 py-3.5 transition-all duration-300 group ${
                isActive
                  ? "owner-sidebar-active"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={`w-5 h-5 ${
                    isActive ? "text-amber-400" : "group-hover:text-amber-400"
                  }`}
                />
                <span className="font-medium text-sm tracking-wide">
                  {item.name}
                </span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-amber-500" />}
            </Link>
          );
        })}
      </nav>

      {/* Go to Admin Panel */}
      <div className="px-6 pb-2">
        <Link
          to="/admin"
          className="flex items-center gap-3 text-slate-500 hover:text-blue-400 transition-colors w-full px-2 py-2 rounded hover:bg-blue-500/5 group text-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Admin Panel</span>
        </Link>
      </div>

      <div className="p-6 border-t border-amber-500/10 mb-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-rose-400 hover:text-rose-300 transition-colors w-full px-2 py-2 rounded hover:bg-rose-500/5 group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
