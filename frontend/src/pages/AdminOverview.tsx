import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  Activity,
  Zap,
  ShieldCheck
} from "lucide-react";

interface DashboardStats {
  revenue: number;
  users: number;
  orders: number;
  uptime: string;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    revenue: 0,
    users: 0,
    orders: 0,
    uptime: "99.9%"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/admin/stats`);
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <AdminLayout>
      <div className="space-y-10">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-heading font-black text-white tracking-tighter flex items-center gap-4">
              <Zap className="w-10 h-10 text-yellow-400 fill-yellow-400/20" />
              RINGKASAN <span className="text-cyan-400">PANEL</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Selamat datang kembali. Semua sistem berjalan normal.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
             <ShieldCheck className="w-5 h-5 text-blue-400" />
             <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Akses Administrator</span>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Pendapatan" value={loading ? "..." : formatCurrency(stats.revenue)} icon={CreditCard} trend="Bulan Ini" color="blue" />
          <StatCard title="Pengguna Aktif" value={loading ? "..." : stats.users.toLocaleString()} icon={Users} trend="Total" color="teal" />
          <StatCard title="Total Pesanan" value={loading ? "..." : stats.orders.toLocaleString()} icon={BarChart3} trend="Total" color="purple" />
          <StatCard title="Uptime Sistem" value={stats.uptime} icon={Activity} trend="NORMAL" color="emerald" />
        </div>

        {/* Charts / Activity Grid placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 glass rounded-2xl border border-white/5 p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] -z-10 group-hover:bg-blue-500/10 transition-all duration-700" />
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-heading font-bold text-xl text-white">Statistik Transaksi</h3>
                 <div className="p-2 border border-white/5 bg-white/5 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Live Monitor
                 </div>
              </div>
              <div className="h-64 w-full flex items-end gap-3 px-2">
                 {[40, 70, 45, 90, 65, 85, 40, 100, 60, 80, 50, 95].map((h, i) => (
                    <div key={i} className="flex-1 group/bar relative">
                       <div 
                         style={{ height: `${h}%` }} 
                         className="w-full bg-gradient-to-t from-blue-600/20 to-blue-400/60 rounded-t-sm group-hover/bar:to-cyan-400 transition-all duration-500 relative shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                       />
                    </div>
                 ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] text-slate-600 font-bold uppercase tracking-widest px-2">
                 <span>00:00</span>
                 <span>06:00</span>
                 <span>12:00</span>
                 <span>18:00</span>
                 <span>23:59</span>
              </div>
           </div>

           <div className="glass rounded-2xl border border-white/5 p-8 space-y-6">
              <h3 className="font-heading font-bold text-xl text-white mb-4">Pemberitahuan Sistem</h3>
              <div className="space-y-4">
                 <AlertItem type="success" msg="Database backup terverifikasi." time="1 jam lalu" />
                 <AlertItem type="info" msg="Server pusat berjalan optimal." time="15 mnt lalu" />
                 <AlertItem type="warning" msg="Latency API meningkat di region AS-SG." time="Sekarang" />
                 <AlertItem type="error" msg="Percobaan login gagal terdeteksi." time="3 jam lalu" />
              </div>
              <button className="w-full py-3 border border-white/5 hover:bg-white/5 rounded-xl text-xs font-bold text-slate-400 transition-all uppercase tracking-widest mt-4">
                 Lihat Riwayat Log
              </button>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon: Icon, trend, color }: any) {
  const colors: any = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    teal: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  };

  return (
    <div className="glass p-6 rounded-2xl border border-white/5 relative group hover:bg-white/[0.02] transition-all">
       <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${colors[color]}`}>
          <Icon className="w-6 h-6" />
       </div>
       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</p>
       <div className="flex items-end justify-between mt-1">
          <h3 className="text-2xl font-heading font-black text-white">{value}</h3>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-slate-400 bg-slate-400/10">
             {trend}
          </span>
       </div>
    </div>
  );
}

function AlertItem({ type, msg, time }: any) {
  const icons: any = {
    warning: <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />,
    info: <div className="w-2 h-2 rounded-full bg-blue-500" />,
    success: <div className="w-2 h-2 rounded-full bg-emerald-500" />,
    error: <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />,
  };
  return (
    <div className="flex gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group cursor-default">
       <div className="mt-1.5">{icons[type]}</div>
       <div className="flex-1">
          <p className="text-xs text-slate-300 leading-relaxed font-medium group-hover:text-white transition-colors">{msg}</p>
          <p className="text-[10px] text-slate-600 font-bold mt-1 uppercase italic">{time}</p>
       </div>
    </div>
  );
}
