import { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { Image as ImageIcon, Check, Save, Globe, RefreshCw, Layers } from "lucide-react";

const PRESETS = [
  { id: "default", name: "Default Cyber", url: "url('/images/nez_game_hero_bg_1775398869356.png')", preview: "/images/nez_game_hero_bg_1775398869356.png" },
  { id: "neon", name: "Neon Blue", url: "linear-gradient(to bottom, #05070a, #0c4a6e)", preview: "" },
  { id: "purple", name: "Cyber Purple", url: "linear-gradient(to bottom, #05070a, #4c1d95)", preview: "" },
  { id: "dark", name: "Stealth Dark", url: "linear-gradient(to bottom, #020617, #0f172a)", preview: "" },
];

export default function AdminBackground() {
  const [selected, setSelected] = useState<string>("default");
  const [customUrl, setCustomUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/settings`);
      const data = await response.json();
      if (data.background_url) {
        setCustomUrl(data.background_url.replace(/url\(['"]?|['"]?\)/g, ''));
        // Find if matches preset
        const preset = PRESETS.find(p => p.url === data.background_url);
        if (preset) setSelected(preset.id);
        else setSelected("custom");
      }
    } catch (err) {
      console.error("Error fetching background settings:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const finalUrl = selected === "custom" ? `url('${customUrl}')` : PRESETS.find(p => p.id === selected)?.url;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "background_url", value: finalUrl }),
      });

      if (response.ok) {
        // Apply locally to see immediate change
        document.documentElement.style.setProperty('--site-bg-url', finalUrl || "");
        alert("Background berhasil diperbarui!");
      }
    } catch (err) {
      alert("Gagal memperbarui background.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl space-y-10 animate-in fade-in duration-700">
        <div className="space-y-2">
          <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-blue-500" />
            TAMPILAN <span className="text-cyan-400">WEBSITE</span>
          </h1>
          <p className="text-slate-500 text-sm">
            Kustomisasi latar belakang halaman utama dan dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preset Selector */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-xl text-white uppercase tracking-tight">Pilih Preset</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p.id)}
                    className={`group relative aspect-square rounded-2xl border-2 transition-all overflow-hidden ${
                      selected === p.id ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center" 
                      style={{ background: p.url.includes('url') ? p.url : p.url }} 
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                    <div className="absolute bottom-3 left-3 text-[10px] font-black text-white uppercase tracking-widest">{p.name}</div>
                    {selected === p.id && (
                      <div className="absolute top-3 right-3 bg-blue-500 rounded-full p-1 shadow-lg">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => setSelected("custom")}
                     className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${
                       selected === "custom" ? "bg-blue-500 text-white" : "text-slate-500 hover:text-white"
                     }`}
                   >
                     Gunakan URL Kustom
                   </button>
                </div>
                
                {selected === "custom" && (
                  <div className="relative group animate-in slide-in-from-top-2 duration-300">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://example.com/background.jpg"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-blue-500/50 transition-all text-sm text-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Column */}
          <div className="space-y-6">
             <div className="glass p-8 rounded-3xl border border-white/5 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                   <ImageIcon className="w-24 h-24" />
                </div>
                
                <h3 className="font-heading font-bold text-lg text-white">Simpan Perubahan</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Perubahan akan langsung diterapkan ke seluruh halaman website untuk semua pengunjung.
                </p>

                <button 
                  onClick={handleSave}
                  disabled={loading || fetching}
                  className="w-full relative group overflow-hidden rounded-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 transition-transform group-hover:scale-105" />
                  <div className="relative py-4 flex items-center justify-center gap-2 text-white font-black text-xs uppercase tracking-widest">
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Terapkan Sekarang</>}
                  </div>
                </button>
             </div>

             <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl space-y-3">
                <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest">Tips Desain</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                  Gunakan gambar dengan resolusi tinggi (FHD) dan warna yang dominan gelap agar teks tetap mudah dibaca.
                </p>
             </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
