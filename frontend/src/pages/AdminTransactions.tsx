import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { 
  History, 
  Search, 
  RefreshCw, 
  AlertCircle,
  Clock,
  ExternalLink,
  RotateCcw
} from "lucide-react";

interface Transaction {
  id: number;
  invoice_number: string;
  target_id: string;
  product_sku: string;
  amount: number;
  hargaModal: number;
  hargaJual: number;
  status: string;
  created_at: string;
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [polling, setPolling] = useState(true);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/admin/transactions");
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    
    // Setup polling every 10 seconds
    const interval = setInterval(() => {
      if (polling) fetchTransactions();
    }, 10000);

    return () => clearInterval(interval);
  }, [polling]);

  const handleRetry = async (invoice: string) => {
    if (!confirm(`Retry order ${invoice}?`)) return;
    try {
      const res = await fetch(`/api/admin/transaction/${invoice}/retry`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert("Retry Success!");
        fetchTransactions();
      } else {
        alert("Retry Failed: " + data.message);
      }
    } catch (err) {
      alert("System error during retry.");
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClass = "badge-neon";
    switch (status.toUpperCase()) {
      case "PAID": return <span className={`${baseClass} badge-paid`}>PAID</span>;
      case "UNPAID": return <span className={`${baseClass} badge-unpaid`}>UNPAID</span>;
      case "SUCCESS": return <span className={`${baseClass} badge-success`}>SUCCESS</span>;
      case "FAILED": return <span className={`${baseClass} badge-failed`}>FAILED</span>;
      default: return <span className={baseClass}>{status}</span>;
    }
  };

  const filtered = transactions.filter(t => 
    (t.invoice_number?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
    (t.target_id?.toLowerCase() ?? "").includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight flex items-center gap-3">
              <History className="w-8 h-8 text-blue-500" />
              ORDER <span className="text-cyan-400">NETWORK</span>
            </h1>
            <p className="text-slate-500 text-sm italic">
              Real-time synchronization with node cluster. Auto-polling active.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setPolling(!polling)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold transition-all ${
                polling 
                ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/5" 
                : "border-slate-700 text-slate-500 bg-transparent"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${polling ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
              {polling ? "POLLING ACTIVE" : "POLLING PAUSED"}
            </button>
            <button 
              onClick={fetchTransactions}
              className="p-2.5 glass border border-white/10 rounded-lg hover:border-blue-500/50 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl">
           <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-black/20 rounded-lg border border-white/5 focus-within:border-blue-500/50 transition-all">
             <Search className="w-4 h-4 text-slate-600" />
             <input 
               type="text" 
               placeholder="Search by Invoice or Target ID..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="bg-transparent outline-none text-sm w-full"
             />
           </div>
        </div>

        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-white/10">
                <th className="px-6 py-4">Timeline</th>
                <th className="px-6 py-4">Invoice / ID</th>
                <th className="px-6 py-4">Revenue (Modal)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.02]">
                    <td colSpan={5} className="px-6 py-4"><div className="h-12 w-full skeleton-text rounded" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-50">
                        <Clock className="w-12 h-12" />
                        <p className="font-bold uppercase tracking-widest">No Recent Activity Detected</p>
                      </div>
                   </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 group-hover:bg-blue-400 transition-colors" />
                         <div>
                            <p className="text-xs text-slate-200 font-mono">
                               {new Date(t.created_at).toLocaleTimeString()}
                            </p>
                            <p className="text-[10px] text-slate-600 uppercase">
                               {new Date(t.created_at).toLocaleDateString()}
                            </p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-white uppercase tracking-tight">{t.invoice_number}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{t.target_id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-heading font-black text-white">
                          <span className="text-[10px] text-slate-500 mr-1 italic">Rp</span>
                          {t.hargaJual.toLocaleString("id-ID")}
                        </p>
                        <p className="text-[10px] text-emerald-500 font-bold">
                          Profit: Rp {(t.hargaJual - t.hargaModal).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       {getStatusBadge(t.status)}
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          {t.status === 'FAILED' && (
                            <button 
                              onClick={() => handleRetry(t.invoice_number)}
                              className="p-1.5 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                              title="Retry Order"
                            >
                               <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button className="p-1.5 rounded bg-white/5 text-slate-400 hover:text-white transition-all">
                             <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
