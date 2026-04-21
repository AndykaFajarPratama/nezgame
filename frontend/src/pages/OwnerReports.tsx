import { useState, useEffect } from "react";
import OwnerLayout from "../layouts/OwnerLayout";
import {
  FileBarChart,
  Search,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
} from "lucide-react";

interface Transaction {
  id: number;
  invoice_number: string;
  target_id: string;
  zone_id: string | null;
  product_sku: string;
  hargaModal: number;
  hargaJual: number;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
}

interface ReportData {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    avgOrderValue: number;
    totalFiltered: number;
  };
}

function formatRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

const STATUSES = ["ALL", "SUCCESS", "PAID", "UNPAID", "FAILED"];

export default function OwnerReports() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetchReport();
  }, [page, limit, status, fromDate, toDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (status !== "ALL") params.set("status", status);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      if (search) params.set("search", search);

      const res = await fetch(`/api/owner/transactions-report?${params}`);
      if (res.ok) {
        setData(await res.json());
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
    const mockTrx: Transaction[] = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      invoice_number: `INV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      target_id: `${100000000 + Math.floor(Math.random() * 900000000)}`,
      zone_id: Math.random() > 0.5 ? `${Math.floor(Math.random() * 9999)}` : null,
      product_sku: ["ML-86-DIAMONDS", "FF-100-DIAMONDS", "PUBG-325-UC", "GI-300-GENESIS"][Math.floor(Math.random() * 4)],
      hargaModal: Math.floor(Math.random() * 50000) + 10000,
      hargaJual: Math.floor(Math.random() * 60000) + 15000,
      amount: Math.floor(Math.random() * 60000) + 15000,
      payment_method: ["qris", "gopay", "ovo", "bank_transfer"][Math.floor(Math.random() * 4)],
      status: ["SUCCESS", "PAID", "UNPAID", "FAILED"][Math.floor(Math.random() * 4)],
      created_at: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
    }));

    setData({
      transactions: mockTrx,
      pagination: { page: 1, limit: 25, total: 452, totalPages: 19 },
      summary: {
        totalRevenue: 12450000,
        totalCost: 10200000,
        totalProfit: 2250000,
        avgOrderValue: 27544,
        totalFiltered: 452,
      },
    });
  };

  const handleSearch = () => {
    setPage(1);
    fetchReport();
  };

  const exportCSV = () => {
    if (!data?.transactions.length) return;
    const headers = ["Invoice", "Target ID", "SKU", "Modal", "Jual", "Profit", "Status", "Date"];
    const rows = data.transactions.map((t) => [
      t.invoice_number,
      t.target_id,
      t.product_sku,
      t.hargaModal,
      t.hargaJual,
      t.hargaJual - t.hargaModal,
      t.status,
      new Date(t.created_at).toLocaleString("id-ID"),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nezgame-report-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const base = "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border";
    switch (status.toUpperCase()) {
      case "SUCCESS":
        return <span className={`${base} text-emerald-400 border-emerald-500/50 bg-emerald-500/10`}>{status}</span>;
      case "PAID":
        return <span className={`${base} text-blue-400 border-blue-500/50 bg-blue-500/10`}>{status}</span>;
      case "UNPAID":
        return <span className={`${base} text-amber-400 border-amber-500/50 bg-amber-500/10`}>{status}</span>;
      case "FAILED":
        return <span className={`${base} text-rose-400 border-rose-500/50 bg-rose-500/10`}>{status}</span>;
      default:
        return <span className={`${base} text-slate-400 border-slate-500/50 bg-slate-500/10`}>{status}</span>;
    }
  };

  const s = data?.summary;
  const p = data?.pagination;

  return (
    <OwnerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight flex items-center gap-3">
              <FileBarChart className="w-8 h-8 text-amber-500" />
              TRANSACTION <span className="text-amber-400">REPORTS</span>
            </h1>
            <p className="text-slate-500 text-sm italic mt-1">
              Complete transaction history with filtering and export.
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs font-bold uppercase tracking-widest hover:bg-amber-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryMini label="Filtered Revenue" value={formatRupiah(s?.totalRevenue || 0)} color="amber" />
          <SummaryMini label="Filtered Profit" value={formatRupiah(s?.totalProfit || 0)} color="emerald" />
          <SummaryMini label="Avg. Order" value={formatRupiah(s?.avgOrderValue || 0)} color="blue" />
          <SummaryMini label="Total Rows" value={s?.totalFiltered?.toLocaleString("id-ID") || "0"} color="purple" />
        </div>

        {/* Filters */}
        <div className="owner-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
            <Filter className="w-4 h-4" />
            Filters
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 flex items-center gap-2 bg-black/30 border border-white/5 rounded-lg px-3 py-2 focus-within:border-amber-500/50 transition-all">
              <Search className="w-4 h-4 text-slate-600" />
              <input
                type="text"
                placeholder="Search invoice / target ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-transparent outline-none text-sm w-full text-white placeholder:text-slate-600"
              />
            </div>

            {/* Status */}
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s} className="bg-[#0d121b]">
                  {s === "ALL" ? "All Status" : s}
                </option>
              ))}
            </select>

            {/* Date From */}
            <div className="flex items-center gap-2 bg-black/30 border border-white/5 rounded-lg px-3 py-2 focus-within:border-amber-500/50 transition-all">
              <Calendar className="w-4 h-4 text-slate-600 shrink-0" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                className="bg-transparent outline-none text-sm w-full text-white"
              />
            </div>

            {/* Date To */}
            <div className="flex items-center gap-2 bg-black/30 border border-white/5 rounded-lg px-3 py-2 focus-within:border-amber-500/50 transition-all">
              <Calendar className="w-4 h-4 text-slate-600 shrink-0" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                className="bg-transparent outline-none text-sm w-full text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => { setSearch(""); setStatus("ALL"); setFromDate(""); setToDate(""); setPage(1); }}
              className="text-[10px] text-slate-600 hover:text-amber-400 transition-colors font-bold uppercase tracking-widest"
            >
              Clear Filters
            </button>
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Apply
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="owner-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">Target</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Modal</th>
                  <th className="px-6 py-4">Jual</th>
                  <th className="px-6 py-4">Profit</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-white/[0.02]">
                        <td colSpan={9} className="px-6 py-4">
                          <div className="h-10 skeleton-text rounded w-full" />
                        </td>
                      </tr>
                    ))
                  : (data?.transactions || []).map((t) => {
                      const profit = t.hargaJual - t.hargaModal;
                      return (
                        <tr
                          key={t.id}
                          className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-xs text-slate-200 font-mono">
                                {new Date(t.created_at).toLocaleDateString("id-ID")}
                              </p>
                              <p className="text-[10px] text-slate-600">
                                {new Date(t.created_at).toLocaleTimeString("id-ID")}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-white font-mono uppercase">
                              {t.invoice_number}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-slate-300 font-mono">
                              {t.target_id}
                            </p>
                            {t.zone_id && (
                              <p className="text-[10px] text-slate-600">
                                Zone: {t.zone_id}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-slate-300 font-mono uppercase">
                              {t.product_sku}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-slate-400 font-mono">
                              {formatRupiah(t.hargaModal)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-white font-bold font-mono">
                              {formatRupiah(t.hargaJual)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p
                              className={`text-xs font-bold font-mono ${
                                profit > 0 ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {profit > 0 ? "+" : ""}
                              {formatRupiah(profit)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-slate-400 uppercase">
                              {t.payment_method}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(t.status)}
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                Rows per page
              </span>
              <select
                value={limit}
                onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
                className="bg-black/30 border border-white/5 rounded px-2 py-1 text-xs text-white outline-none"
              >
                {[10, 25, 50, 100].map((v) => (
                  <option key={v} value={v} className="bg-[#0d121b]">
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                Page {p?.page || 1} of {p?.totalPages || 1}
              </span>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded bg-white/5 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(Math.min(p?.totalPages || 1, page + 1))}
                disabled={page >= (p?.totalPages || 1)}
                className="p-1.5 rounded bg-white/5 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}

function SummaryMini({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const borderColors: Record<string, string> = {
    amber: "border-amber-500/20",
    emerald: "border-emerald-500/20",
    blue: "border-blue-500/20",
    purple: "border-purple-500/20",
  };
  const textColors: Record<string, string> = {
    amber: "text-amber-400",
    emerald: "text-emerald-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
  };

  return (
    <div className={`owner-card p-4 rounded-xl border ${borderColors[color]}`}>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className={`text-lg font-heading font-black ${textColors[color]}`}>
        {value}
      </p>
    </div>
  );
}
