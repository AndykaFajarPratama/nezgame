import { useState, useEffect } from "react";
import OwnerLayout from "../layouts/OwnerLayout";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Users,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
  monthlyData: Array<{
    month: string;
    revenue: number;
    cost: number;
    profit: number;
    count: number;
  }>;
  paymentBreakdown: Array<{
    method: string;
    revenue: number;
    count: number;
  }>;
  statusCounts: Record<string, number>;
}

const MOCK_DAILY = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const rev = Math.floor(Math.random() * 800000) + 200000;
  const cost = Math.floor(rev * (0.82 + Math.random() * 0.08));
  return {
    date: date.toISOString().split("T")[0],
    revenue: rev,
    cost: cost,
    profit: rev - cost,
    count: Math.floor(Math.random() * 20) + 5,
  };
});

const MOCK_MONTHLY = [
  { month: "2026-01", revenue: 8500000, cost: 7200000, profit: 1300000, count: 120 },
  { month: "2026-02", revenue: 9200000, cost: 7800000, profit: 1400000, count: 145 },
  { month: "2026-03", revenue: 11000000, cost: 9100000, profit: 1900000, count: 180 },
  { month: "2026-04", revenue: 12450000, cost: 10200000, profit: 2250000, count: 210 },
];

const MOCK_PAYMENTS = [
  { method: "QRIS", revenue: 5200000, count: 120 },
  { method: "GoPay", revenue: 3100000, count: 85 },
  { method: "OVO", revenue: 2400000, count: 62 },
  { method: "Bank Transfer", revenue: 1750000, count: 30 },
];

function formatRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatShortRupiah(n: number): string {
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
            {formatRupiah(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function OwnerDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [range, setRange] = useState("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/owner/analytics?range=${range}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      } else {
        // Use mock data for demo
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
          monthlyData: MOCK_MONTHLY,
          paymentBreakdown: MOCK_PAYMENTS,
          statusCounts: { SUCCESS: 380, PAID: 25, FAILED: 32, UNPAID: 15 },
        });
      }
    } catch {
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
        monthlyData: MOCK_MONTHLY,
        paymentBreakdown: MOCK_PAYMENTS,
        statusCounts: { SUCCESS: 380, PAID: 25, FAILED: 32, UNPAID: 15 },
      });
    } finally {
      setLoading(false);
    }
  };

  const s = analytics?.summary;

  return (
    <OwnerLayout>
      <div className="space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-heading font-black text-white tracking-tighter flex items-center gap-4">
              <Crown className="w-10 h-10 text-amber-400 fill-amber-400/20" />
              OWNER DASHBOARD
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Complete financial overview for NezGame platform.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {["7d", "30d", "90d", "365d"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  range === r
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                    : "bg-white/5 text-slate-500 border border-white/5 hover:text-white hover:bg-white/10"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <OwnerStatCard
            title="Total Revenue"
            value={formatRupiah(s?.totalRevenue || 0)}
            icon={DollarSign}
            trend="+12.5%"
            positive
            color="amber"
            loading={loading}
          />
          <OwnerStatCard
            title="Net Profit"
            value={formatRupiah(s?.totalProfit || 0)}
            icon={TrendingUp}
            trend={`${s?.profitMargin?.toFixed(1) || 0}% margin`}
            positive
            color="emerald"
            loading={loading}
          />
          <OwnerStatCard
            title="Total Orders"
            value={s?.totalTransactions?.toLocaleString("id-ID") || "0"}
            icon={ShoppingCart}
            trend="+18.4%"
            positive
            color="blue"
            loading={loading}
          />
          <OwnerStatCard
            title="Avg. Order Value"
            value={formatRupiah(s?.avgOrderValue || 0)}
            icon={Wallet}
            trend="+5.2%"
            positive
            color="purple"
            loading={loading}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Trend — Line Chart (2 cols) */}
          <div className="lg:col-span-2 owner-card rounded-2xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] -z-10 group-hover:bg-amber-500/10 transition-all duration-700" />
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-heading font-bold text-xl text-white">
                  Revenue Trend
                </h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                  Daily revenue over {range}
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Revenue
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Profit
                </span>
              </div>
            </div>
            <div className="h-72">
              {loading ? (
                <div className="w-full h-full skeleton-img rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={analytics?.dailyData || []}
                    margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="gradRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#f59e0b"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="100%"
                          stopColor="#f59e0b"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="gradProfit"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
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
                      tickFormatter={(v) => formatShortRupiah(v)}
                      tick={{ fill: "#475569", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={50}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fill="url(#gradRevenue)"
                      animationDuration={1500}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      name="Profit"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#gradProfit)"
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="owner-card rounded-2xl p-8 space-y-6">
            <h3 className="font-heading font-bold text-xl text-white mb-2">
              Payment Methods
            </h3>
            <div className="space-y-4">
              {(analytics?.paymentBreakdown || MOCK_PAYMENTS).map((pm, i) => {
                const maxRevenue = Math.max(
                  ...(analytics?.paymentBreakdown || MOCK_PAYMENTS).map(
                    (p) => p.revenue
                  )
                );
                const pct = (pm.revenue / maxRevenue) * 100;
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300 font-medium">
                        {pm.method}
                      </span>
                      <span className="text-xs font-bold text-amber-400 font-mono">
                        {formatRupiah(pm.revenue)}
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-600 font-medium">
                      {pm.count} transactions
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Status Overview */}
            <div className="pt-6 border-t border-white/5 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Order Status
              </h4>
              {Object.entries(analytics?.statusCounts || { SUCCESS: 380, PAID: 25, FAILED: 32, UNPAID: 15 }).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between py-1"
                  >
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        status === "SUCCESS"
                          ? "text-emerald-400"
                          : status === "PAID"
                          ? "text-blue-400"
                          : status === "FAILED"
                          ? "text-rose-400"
                          : "text-amber-400"
                      }`}
                    >
                      {status}
                    </span>
                    <span className="text-sm font-heading font-bold text-white">
                      {count}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Monthly Revenue vs Profit Bar Chart */}
        <div className="owner-card rounded-2xl p-8 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/5 blur-[100px] -z-10 group-hover:bg-orange-500/8 transition-all duration-700" />
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-heading font-bold text-xl text-white">
                Monthly Comparison
              </h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                Revenue vs Cost vs Profit
              </p>
            </div>
          </div>
          <div className="h-72">
            {loading ? (
              <div className="w-full h-full skeleton-img rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics?.monthlyData || MOCK_MONTHLY}
                  margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.03)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#475569", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => formatShortRupiah(v)}
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
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="#f59e0b"
                    radius={[6, 6, 0, 0]}
                    animationDuration={1200}
                  />
                  <Bar
                    dataKey="cost"
                    name="Cost"
                    fill="#334155"
                    radius={[6, 6, 0, 0]}
                    animationDuration={1400}
                  />
                  <Bar
                    dataKey="profit"
                    name="Profit"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    animationDuration={1600}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Stat Card Component
// ═══════════════════════════════════════════════════════════════

function OwnerStatCard({
  title,
  value,
  icon: Icon,
  trend,
  positive,
  color,
  loading,
}: {
  title: string;
  value: string;
  icon: any;
  trend: string;
  positive: boolean;
  color: string;
  loading: boolean;
}) {
  const colorMap: Record<string, string> = {
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };

  if (loading) {
    return (
      <div className="owner-card p-6 rounded-2xl">
        <div className="h-12 w-12 skeleton-img rounded-xl mb-4" />
        <div className="h-3 w-24 skeleton-text rounded mb-2" />
        <div className="h-7 w-36 skeleton-text rounded" />
      </div>
    );
  }

  return (
    <div className="owner-card p-6 rounded-2xl relative group hover:bg-white/[0.02] transition-all">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/3 blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 border ${colorMap[color]}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        {title}
      </p>
      <div className="flex items-end justify-between mt-1">
        <h3 className="text-2xl font-heading font-black text-white">{value}</h3>
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
            positive
              ? "text-emerald-400 bg-emerald-400/10"
              : "text-rose-400 bg-rose-400/10"
          }`}
        >
          {positive ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {trend}
        </span>
      </div>
    </div>
  );
}
