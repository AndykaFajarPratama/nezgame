import { useState, useEffect } from "react";
import OwnerLayout from "../layouts/OwnerLayout";
import { apiFetch } from "../lib/api"; // ✅ DITAMBAH
import {
  TrendingUp,
  Target,
  Percent,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Area,
} from "recharts";

interface Analytics {
  summary: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    totalTransactions: number;
    avgOrderValue: number;
    profitMargin: number;
  };
  dailyData: Array<{
    date: string;
    revenue: number;
    cost: number;
    profit: number;
    count: number;
  }>;
  topProducts: Array<{
    sku: string;
    revenue: number;
    profit: number;
    count: number;
  }>;
}

const MOCK_DAILY = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const rev = Math.floor(Math.random() * 800000) + 200000;
  const cost = Math.floor(rev * (0.82 + Math.random() * 0.08));
  return {
    date: date.toISOString().split("T")[0],
    revenue: rev,
    cost,
    profit: rev - cost,
    count: Math.floor(Math.random() * 20) + 5,
    margin: Math.round(((rev - cost) / rev) * 100 * 100) / 100,
  };
});

const MOCK_TOP_PRODUCTS = [
  { sku: "ML-86-DIAMONDS", revenue: 3200000, profit: 580000, count: 85 },
  { sku: "FF-100-DIAMONDS", revenue: 2100000, profit: 420000, count: 72 },
  { sku: "PUBG-325-UC", revenue: 1800000, profit: 340000, count: 45 },
  { sku: "GI-300-GENESIS", revenue: 1500000, profit: 290000, count: 38 },
  { sku: "ML-172-DIAMONDS", revenue: 1200000, profit: 230000, count: 32 },
  { sku: "CODM-80-CP", revenue: 900000, profit: 180000, count: 28 },
  { sku: "VL-1000-VP", revenue: 750000, profit: 150000, count: 22 },
  { sku: "AOV-190-VOUCHER", revenue: 600000, profit: 120000, count: 18 },
];

function formatRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}
function formatShort(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`;
  return n.toString();
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="owner-glass rounded-xl p-4 border border-amber-500/20 shadow-2xl min-w-[180px]">
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">
        {label}
      </p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 py-1">
          <span className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="text-xs text-slate-300 capitalize">
              {entry.name}
            </span>
          </span>
          <span className="text-xs font-bold text-white font-mono">
            {entry.name === "Margin"
              ? `${entry.value}%`
              : formatRupiah(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function OwnerAnalytics() {
  const [range, setRange] = useState("30d");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/owner/analytics?range=${range}`); // ✅ DIUBAH
      if (res.ok) {
        const data = await res.json();
        data.dailyData = data.dailyData.map((d: any) => ({
          ...d,
          margin:
            d.revenue > 0
              ? Math.round(((d.revenue - d.cost) / d.revenue) * 100 * 100) /
              100
              : 0,
        }));
        setAnalytics(data);
      } else {
        useMockData();
      }
    } catch {
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  const useMockData = () => {
    setAnalytics({
      summary: {
        totalRevenue: 12450000,
        totalCost: 10200000,
        totalProfit: 2250000,
        totalTransactions: 452,
        avgOrderValue: 27544,
        profitMargin: 18.07,
      },
      dailyData: MOCK_DAILY,
      topProducts: MOCK_TOP_PRODUCTS,
    });
  };

  const dailyData = analytics?.dailyData || MOCK_DAILY;
  const topProducts = analytics?.topProducts || MOCK_TOP_PRODUCTS;
  const s = analytics?.summary;

  return (
    <OwnerLayout>
      <div className="space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-heading font-black text-white tracking-tighter flex items-center gap-4">
              <TrendingUp className="w-10 h-10 text-emerald-400" />
              PROFIT ANALYTICS
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Deep-dive into margins, costs, and product performance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {["7d", "30d", "90d", "365d"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${range === r
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                    : "bg-white/5 text-slate-500 border border-white/5 hover:text-white hover:bg-white/10"
                  }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="owner-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Percent className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Profit Margin
              </p>
            </div>
            <h3 className="text-3xl font-heading font-black text-emerald-400">
              {loading ? "--" : `${s?.profitMargin?.toFixed(1)}%`}
            </h3>
          </div>
          <div className="owner-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Total Cost (Modal)
              </p>
            </div>
            <h3 className="text-3xl font-heading font-black text-white">
              {loading ? "--" : formatRupiah(s?.totalCost || 0)}
            </h3>
          </div>
          <div className="owner-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Net Profit
              </p>
            </div>
            <h3 className="text-3xl font-heading font-black text-white">
              {loading ? "--" : formatRupiah(s?.totalProfit || 0)}
            </h3>
          </div>
        </div>

        {/* Profit Margin Trend */}
        <div className="owner-card rounded-2xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -z-10 group-hover:bg-emerald-500/10 transition-all duration-700" />
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-heading font-bold text-xl text-white">
                Profit Margin Over Time
              </h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                Daily margin percentage
              </p>
            </div>
          </div>
          <div className="h-72">
            {loading ? (
              <div className="w-full h-full skeleton-img rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.03)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => v.substring(5)}
                    tick={{ fill: "#475569", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fill: "#475569", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, "auto"]}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="margin"
                    name="Margin"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{
                      r: 6,
                      stroke: "#10b981",
                      strokeWidth: 2,
                      fill: "#05070a",
                    }}
                    animationDuration={2000}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Revenue vs Cost vs Profit */}
        <div className="owner-card rounded-2xl p-8 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 blur-[100px] -z-10" />
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-heading font-bold text-xl text-white">
                Revenue vs Cost Breakdown
              </h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                Daily comparison with profit overlay
              </p>
            </div>
          </div>
          <div className="h-80">
            {loading ? (
              <div className="w-full h-full skeleton-img rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dailyData}>
                  <defs>
                    <linearGradient id="gradProfit2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.03)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => v.substring(5)}
                    tick={{ fill: "#475569", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => formatShort(v)}
                    tick={{ fill: "#475569", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px", color: "#64748b" }}
                  />
                  <Bar dataKey="revenue" name="Revenue" fill="#f59e0b" opacity={0.7} radius={[3, 3, 0, 0]} barSize={8} />
                  <Bar dataKey="cost" name="Cost" fill="#334155" opacity={0.8} radius={[3, 3, 0, 0]} barSize={8} />
                  <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} fill="url(#gradProfit2)" />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="owner-card rounded-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-heading font-bold text-xl text-white">
                Top Products by Profit
              </h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                Best performing SKUs
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                  <th className="pb-4 pr-6">#</th>
                  <th className="pb-4 pr-6">Product SKU</th>
                  <th className="pb-4 pr-6">Revenue</th>
                  <th className="pb-4 pr-6">Profit</th>
                  <th className="pb-4 pr-6">Margin</th>
                  <th className="pb-4">Orders</th>
                </tr>
              </thead>
              <tbody>
                {(loading ? Array.from({ length: 5 }) : topProducts).map((product: any, i) => {
                  if (loading) {
                    return (
                      <tr key={i} className="border-b border-white/[0.02]">
                        <td colSpan={6} className="py-4">
                          <div className="h-8 skeleton-text rounded w-full" />
                        </td>
                      </tr>
                    );
                  }
                  const margin =
                    product.revenue > 0
                      ? ((product.profit / product.revenue) * 100).toFixed(1)
                      : "0";
                  const maxProfit = topProducts[0]?.profit || 1;
                  const barWidth = (product.profit / maxProfit) * 100;
                  return (
                    <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group">
                      <td className="py-4 pr-6">
                        <span className={`text-xs font-black ${i < 3 ? "text-amber-400" : "text-slate-600"}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-4 pr-6">
                        <span className="text-sm font-bold text-white font-mono uppercase tracking-tight">
                          {product.sku}
                        </span>
                      </td>
                      <td className="py-4 pr-6">
                        <span className="text-sm text-slate-300 font-mono">
                          {formatRupiah(product.revenue)}
                        </span>
                      </td>
                      <td className="py-4 pr-6">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-emerald-400 font-mono">
                            {formatRupiah(product.profit)}
                          </span>
                          <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden hidden lg:block">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-6">
                        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                          {margin}%
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-slate-400 font-mono">
                          {product.count}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}