import { useState } from "react";
import { apiFetch } from "../lib/api"; // ✅ DITAMBAH

interface TransactionStatus {
  invoice_number: string;
  target_id: string;
  zone_id: string | null;
  product_sku: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string | null;
}

export default function TransactionChecker() {
  const [invoice, setInvoice] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TransactionStatus | null>(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!invoice) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await apiFetch(`/api/transaction/${invoice}`); // ✅ DIUBAH
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.message || "Transaksi tidak ditemukan.");
      }
    } catch (err) {
      setError("Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    UNPAID: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    PAID: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    SUCCESS: "text-green-400 bg-green-400/10 border-green-400/20",
    FAILED: "text-red-400 bg-red-400/10 border-red-400/20",
  };

  return (
    <section id="cek-transaksi" className="scroll-mt-32">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-black mb-4">Cek Transaksi</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Masukkan nomor invoice untuk melihat status transaksi kamu secara real-time.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-[#0d121b] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 filter blur-3xl -mr-32 -mt-32 rounded-full"></div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <input
                type="text"
                placeholder="Contoh: INV-A1B2C3D4"
                value={invoice}
                onChange={(e) => setInvoice(e.target.value)}
                className="flex-1 bg-[#05070a] border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-blue-500 outline-none text-white transition-all shadow-inner"
              />
              <button
                onClick={handleCheck}
                disabled={loading || !invoice}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-2xl font-black text-sm hover:scale-105 transition shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? "Mengecek..." : "Cek Status"}
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-bold text-center mb-6">
                ⚠️ {error}
              </div>
            )}

            {result && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                  <span className="text-sm text-slate-400">Status</span>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${statusColors[result.status] || "text-slate-400 bg-slate-400/10 border-slate-400/20"}`}>
                    {result.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Invoice</p>
                    <p className="text-sm font-bold">{result.invoice_number}</p>
                  </div>
                  <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Target ID</p>
                    <p className="text-sm font-bold">{result.target_id}{result.zone_id ? ` (${result.zone_id})` : ""}</p>
                  </div>
                  <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Item SKU</p>
                    <p className="text-sm font-bold uppercase">{result.product_sku}</p>
                  </div>
                  <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Metode</p>
                    <p className="text-sm font-bold">{result.payment_method}</p>
                  </div>
                </div>
                <div className="p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-center mt-6">
                  <p className="text-xs text-slate-400 mb-1">Total Pembayaran</p>
                  <p className="text-2xl font-black text-cyan-400">Rp {result.amount.toLocaleString("id-ID")}</p>
                </div>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-white/5">
              <h5 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                Informasi
              </h5>
              <ul className="space-y-3 text-xs text-slate-500">
                <li className="flex gap-2"><span>•</span> Status diperbarui otomatis setelah pembayaran dikonfirmasi.</li>
                <li className="flex gap-2"><span>•</span> Proses top up membutuhkan waktu 1-5 menit.</li>
                <li className="flex gap-2"><span>•</span> Hubungi CS jika status tidak berubah dalam 30 menit.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}