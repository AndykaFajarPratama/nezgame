import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { 
  Settings, 
  Percent, 
  Save, 
  Lock, 
  HelpCircle,
  AlertTriangle,
  RefreshCw
} from "lucide-react";

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [settings, setSettings] = useState({
    profit_margin_low: "12",
    profit_margin_mid: "10",
    profit_margin_high: "8",
    midtrans_client_key: "",
    midtrans_webhook_key: ""
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/settings`);
        const data = await response.json();
        setSettings(prev => ({ ...prev, ...data }));
      } catch (err) {
        console.error("Gagal memuat pengaturan:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Save all updated keys
      for (const [key, value] of Object.entries(settings)) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value })
        });
      }
      alert("Konfigurasi berhasil disimpan ke sistem!");
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan pengaturan.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-10 animate-in fade-in duration-500">
        <div className="space-y-2">
          <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-500" />
            KONFIGURASI <span className="text-cyan-400">SISTEM</span>
          </h1>
          <p className="text-slate-500 text-sm italic">
            Ubah preferensi sistem. Perubahan akan langsung diterapkan.
          </p>
        </div>

        {fetching ? (
          <div className="flex justify-center items-center h-48">
             <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Pricing Margin Section */}
            <div className="glass p-8 rounded-2xl border border-white/5 space-y-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                  <Percent className="w-24 h-24" />
               </div>
               
               <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                     <Percent className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-white uppercase tracking-tight">Margin Keuntungan</h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Margin Tier Rendah (&lt; 10rb)</label>
                        <HelpCircle className="w-4 h-4 text-slate-700 hover:text-blue-500 cursor-help" />
                     </div>
                     <div className="relative">
                        <input 
                          type="number" 
                          value={settings.profit_margin_low}
                          onChange={(e) => handleChange("profit_margin_low", e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 transition-all font-mono text-white"
                        />
                        <span className="absolute right-4 top-3.5 text-slate-600">%</span>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Margin Tier Menengah (10rb - 50rb)</label>
                     <div className="relative">
                        <input 
                          type="number" 
                          value={settings.profit_margin_mid}
                          onChange={(e) => handleChange("profit_margin_mid", e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 transition-all font-mono text-white"
                        />
                        <span className="absolute right-4 top-3.5 text-slate-600">%</span>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Margin Tier Tinggi (&gt; 50rb)</label>
                     <div className="relative">
                        <input 
                          type="number" 
                          value={settings.profit_margin_high}
                          onChange={(e) => handleChange("profit_margin_high", e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 transition-all font-mono text-white"
                        />
                        <span className="absolute right-4 top-3.5 text-slate-600">%</span>
                     </div>
                  </div>
               </div>

               <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />
                  <p className="text-[11px] text-orange-400/80 leading-relaxed italic">
                     Warning: Margin ini mempengaruhi perhitungan profit SEBELUM dipotong biaya payment gateway. Disarankan minimal margin 5%.
                  </p>
               </div>
            </div>

            {/* Payment Gateway Tokens */}
            <div className="glass p-8 rounded-2xl border border-white/5 space-y-6">
               <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                     <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-white uppercase tracking-tight">Keamanan & Integrasi</h3>
               </div>

               <div className="space-y-6">
                  <div className="space-y-4">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Midtrans Client Key</label>
                     <input 
                        type="text" 
                        value={settings.midtrans_client_key}
                        onChange={(e) => handleChange("midtrans_client_key", e.target.value)}
                        placeholder="Kunci disembunyikan..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 transition-all font-mono text-white"
                     />
                  </div>

                  <div className="space-y-4">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Webhook Signature Key</label>
                     <input 
                        type="password" 
                        value={settings.midtrans_webhook_key}
                        onChange={(e) => handleChange("midtrans_webhook_key", e.target.value)}
                        placeholder="Kunci disembunyikan..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 transition-all font-mono text-white"
                     />
                  </div>
               </div>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-end gap-4 pt-4">
               <button 
                 type="submit" 
                 disabled={loading}
                 className="relative group overflow-hidden rounded-xl"
               >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative px-8 py-3 flex items-center gap-3 text-white font-black text-sm uppercase tracking-tighter">
                   <Save className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
                   {loading ? "MENYIMPAN..." : "SIMPAN KONFIGURASI"}
                </div>
             </button>
          </div>
        </form>
        )}
      </div>
    </AdminLayout>
  );
}
