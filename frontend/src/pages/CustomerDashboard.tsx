import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StatusTimeline from "../components/StatusTimeline";
import OrderModal from "../components/OrderModal";
import { apiFetch } from "../lib/api"; // ✅ DITAMBAH
import {
  History,
  ArrowRight,
  RefreshCcw,
  ChevronDown,
  ExternalLink,
  Package,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { authClient } from "../lib/auth-client";

interface Transaction {
  id: number;
  invoiceNumber: string;
  targetId: string;
  zoneId: string | null;
  productSku: string;
  productName: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  categoryImage: string | null;
  amount: number;
  status: "UNPAID" | "PAID" | "SUCCESS" | "FAILED";
  createdAt: string;
}

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  const [repeatCategory, setRepeatCategory] = useState<any>(null);
  const [repeatData, setRepeatData] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchSession();
    fetchOrders();
  }, []);

  const fetchSession = async () => {
    const { data } = await authClient.getSession();
    setSession(data);
  };

  const fetchOrders = async () => {
    try {
      const res = await apiFetch("/api/user/orders"); // ✅ DIUBAH
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRepeatOrder = (order: Transaction) => {
    if (!order.categorySlug) return;

    setRepeatCategory({
      name: order.categoryName || "Game",
      slug: order.categorySlug,
      imageUrl: order.categoryImage,
    });
    setRepeatData({
      targetId: order.targetId,
      zoneId: order.zoneId || "",
      skuCode: order.productSku,
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return { color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2, label: "Berhasil" };
      case "PAID":
        return { color: "text-blue-400 bg-blue-400/10 border-blue-500/20", icon: Package, label: "Proses" };
      case "UNPAID":
        return { color: "text-amber-400 bg-amber-400/10 border-amber-400/20", icon: CreditCard, label: "Menunggu" };
      case "FAILED":
        return { color: "text-rose-400 bg-rose-400/10 border-rose-500/20", icon: AlertCircle, label: "Gagal" };
      default:
        return { color: "text-slate-400 bg-slate-400/10 border-slate-400/20", icon: History, label: status };
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 font-sans">
      <Navbar isScrolled={true} />

      <main className="max-w-5xl mx-auto px-6 py-32">
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Riwayat Pesanan</h1>
              <p className="text-slate-400 text-sm">Halo, {session?.user?.name || "Customer"}! Pantau status top up kamu di sini.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#0d121b] border border-white/5 rounded-3xl p-6 h-32 animate-pulse"></div>
            ))
          ) : orders.length === 0 ? (
            <div className="text-center py-24 bg-[#0d121b] border border-white/5 rounded-3xl border-dashed">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600">
                <Package className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-2">Belum ada transaksi</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">Sepertinya kamu belum melakukan pemesanan apa pun. Yuk, pilih game favoritmu sekarang!</p>
              <a href="/#daftar-game" className="inline-flex items-center gap-2 bg-blue-500 text-white px-8 py-3 rounded-2xl font-black text-sm hover:scale-105 transition shadow-lg shadow-blue-500/20">
                Mulai Belanja <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ) : (
            orders.map((order) => {
              const config = getStatusConfig(order.status);
              const isExpanded = expandedId === order.id;

              return (
                <div
                  key={order.id}
                  className={`bg-[#0d121b] border transition-all duration-300 rounded-3xl overflow-hidden group ${isExpanded ? "border-blue-500/40 shadow-2xl shadow-blue-500/5" : "border-white/5 hover:border-white/10"
                    }`}
                >
                  <div
                    className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <img
                          src={order.categoryImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.categoryName || "?")}&background=1e293b&color=38bdf8&bold=true&size=128`}
                          className="w-16 h-16 rounded-2xl object-cover border border-white/10"
                          alt={order.categoryName || "Game"}
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-[#0d121b] border border-white/10 flex items-center justify-center">
                          <config.icon className={`w-3.5 h-3.5 ${config.color.split(' ')[0]}`} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${config.color}`}>
                            {config.label}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">{order.invoiceNumber}</span>
                        </div>
                        <h4 className="font-bold text-lg leading-tight uppercase tracking-tight">{order.productName || order.productSku}</h4>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                          <span className="flex items-center gap-1.5 font-mono">ID: {order.targetId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">Total Pembayaran</p>
                        <p className="text-xl font-black text-white">Rp {order.amount.toLocaleString("id-ID")}</p>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-600 transition-transform duration-300 ${isExpanded ? "rotate-180 text-blue-500" : ""}`} />
                    </div>
                  </div>

                  <div className={`transition-all duration-500 overflow-hidden ${isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="px-8 pb-8 pt-2 space-y-8 border-t border-white/5">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/80 mb-6">Status Real-Time</p>
                        <StatusTimeline status={order.status} />
                      </div>

                      <div className="flex flex-wrap gap-4 pt-6">
                        <button
                          onClick={() => handleRepeatOrder(order)}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-blue-500 hover:text-white transition-all group"
                        >
                          <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                          Repeat Order
                        </button>
                        <button
                          onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL || ""}/api/transaction/${order.invoiceNumber}`, '_blank')} // ✅ DIUBAH
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Cek Struk
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>

      {repeatCategory && (
        <OrderModal
          category={repeatCategory}
          initialData={repeatData}
          onClose={() => {
            setRepeatCategory(null);
            setRepeatData(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
}