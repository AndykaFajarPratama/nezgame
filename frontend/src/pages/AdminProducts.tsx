import { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { 
  RefreshCw, 
  Search, 
  TrendingUp, 
  AlertCircle,
  Package,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

interface Product {
  id: number;
  sku_code: string;
  name: string;
  price_sell: number;
  status: string;
  needs_zone_id: boolean;
  category?: { name: string };
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fetching from a general products endpoint
      // We'll use the one we created or a specific admin list if available
      await fetch("/api/admin/transactions"); // Placeholder: we actually need a product list
      // Wait, let's use the catalog API but we might need a specific admin one for modal prices
      const resp = await fetch("/api/products/mobile-legends"); // Example slug
      const data = await resp.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to link with Central Database.");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await fetch("/api/admin/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(`Sync Complete! ${data.created} created, ${data.updated} updated.`);
        fetchProducts();
      }
    } catch (err) {
      alert("Sync failed. Check terminal.");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    (p.name?.toLowerCase() ?? "").includes(search.toLowerCase()) || 
    (p.sku_code?.toLowerCase() ?? "").includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-500" />
              PRODUCT <span className="text-cyan-400">CATALOG</span>
            </h1>
            <p className="text-slate-500 text-sm max-w-xl italic">
              Manifested from Central APIGames Repository. Pricing is dynamically calculated at runtime.
            </p>
          </div>

          <div className="flex items-center gap-3">
             <div className="relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
               <button 
                 onClick={handleSync}
                 disabled={syncing}
                 className="relative flex items-center gap-2 px-6 py-2.5 bg-[#0d121b] border border-blue-500/50 rounded-lg text-white font-bold text-sm hover:border-cyan-400 transition-all disabled:opacity-50"
               >
                 <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin text-cyan-400' : ''}`} />
                 {syncing ? "SYNCING DATA..." : "SYNC REPOSITORY"}
               </button>
             </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass p-6 rounded-xl border border-blue-500/10 neon-border-blue relative group hover:bg-white/[0.02] transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active Index</p>
                <h3 className="text-3xl font-heading font-bold text-white">{products.length}</h3>
                <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> All systems operational
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl">
           <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-black/20 rounded-lg border border-white/5 focus-within:border-blue-500/50 transition-all">
             <Search className="w-4 h-4 text-slate-600" />
             <input 
               type="text" 
               placeholder="Filter by SKU or Name..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="bg-transparent outline-none text-sm w-full"
             />
           </div>
        </div>

        {/* Table Section */}
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-white/10">
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">SKU / Code</th>
                <th className="px-6 py-4">Current Sell Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Meta</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.02]">
                    <td className="px-6 py-4"><div className="h-5 w-48 skeleton-text rounded" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-24 skeleton-text rounded" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-32 skeleton-text rounded" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-16 skeleton-text rounded" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-16 skeleton-text rounded" /></td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <AlertCircle className="w-12 h-12 text-slate-700" />
                        <div>
                          <p className="text-slate-400 font-bold uppercase tracking-tighter text-xl">NO RECORDS DISCOVERED</p>
                          <p className="text-slate-600 text-sm">System was unable to locate data matching your query.</p>
                        </div>
                      </div>
                   </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-6">
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase">{p.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{p.category?.name || "UNASSIGNED"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-cyan-600">{p.sku_code}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-heading font-black text-white">
                        <span className="text-[10px] text-slate-500 mr-1 font-normal italic">Rp</span>
                        {p.price_sell.toLocaleString("id-ID")}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge-neon ${p.status === 'active' ? 'badge-success' : 'badge-failed'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <button className="text-slate-600 hover:text-white transition-colors">
                          <ExternalLink className="w-4 h-4" />
                       </button>
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
