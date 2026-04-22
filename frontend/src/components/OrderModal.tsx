import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api"; // ✅ DITAMBAH

interface Product {
  sku_code: string;
  name: string;
  price_sell: number;
  needs_zone_id: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  needsZone: boolean;
  imageUrl?: string;
}

interface OrderModalProps {
  category: Category;
  onClose: () => void;
  initialData?: {
    targetId?: string;
    zoneId?: string;
    skuCode?: string;
  };
}

export default function OrderModal({ category, onClose, initialData }: OrderModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [targetId, setTargetId] = useState(initialData?.targetId || "");
  const [zoneId, setZoneId] = useState(initialData?.zoneId || "");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [processing, setProcessing] = useState(false);
  const [errorText, setErrorText] = useState("");

  const [validating, setValidating] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [validationError, setValidationError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("qris");

  const needsZone = products.some(p => p.needs_zone_id);

  useEffect(() => {
    document.body.classList.add('modal-open');

    apiFetch(`/api/products/${category.slug}`) // ✅ DIUBAH
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [category.slug]);

  const handleValidate = async () => {
    setAccountName("");
    setValidationError("");
    if (!targetId) return setValidationError("Masukkan User ID dulu.");
    if (needsZone && !zoneId) return setValidationError("Masukkan Zone ID dulu.");

    setValidating(true);
    try {
      const res = await apiFetch(`/api/validate/${category.slug}`, { // ✅ DIUBAH
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_id: targetId,
          zone_id: zoneId || null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAccountName(data.nickname);
      } else {
        setValidationError(data.message || "Akun tidak ditemukan");
      }
    } catch (err) {
      setValidationError("Gagal menghubungi server validasi.");
    } finally {
      setValidating(false);
    }
  };

  const handleCheckout = async () => {
    setErrorText("");
    if (!targetId) return setErrorText("Harap masukkan Target ID.");
    if (needsZone && !zoneId) return setErrorText("Harap masukkan Zone ID.");
    if (!selectedProduct) return setErrorText("Pilih nominal top up.");

    setProcessing(true);
    try {
      const res = await apiFetch("/api/checkout", { // ✅ DIUBAH
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku_code: selectedProduct.sku_code,
          target_id: targetId,
          zone_id: zoneId || null,
          payment_method: paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat transaksi");
      }

      onClose();

      // @ts-ignore
      if (window.snap) {
        // @ts-ignore
        window.snap.pay(data.snapToken, {
          onSuccess: function () {
            alert("Pembayaran berhasil!");
          },
          onPending: function () {
            alert("Menunggu pembayaran...");
          },
          onError: function () {
            alert("Pembayaran gagal!");
          },
        });
      } else {
        throw new Error("Midtrans Snap belum terisi. Silakan muat ulang halaman.");
      }

    } catch (err: any) {
      setErrorText(err.message);
    } finally {
      if (processing) setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-[#0d121b] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row">

        {/* Left Info Panel */}
        <div className="p-8 md:w-1/3 bg-white/[0.02] border-b md:border-b-0 md:border-r border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/5 filter blur-3xl rounded-full"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <img
              src={category.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(category.name)}&background=1e293b&color=38bdf8&bold=true&size=512&font-size=0.33`}
              alt={category.name}
              className="w-32 h-32 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.3)] mb-4 border border-white/10 object-cover"
            />
            <h3 className="text-2xl font-black mb-2">{category.name}</h3>
            <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-lg border border-green-500/20 mb-4 inline-block">
              Server Aktif
            </span>
            <p className="text-sm text-slate-400 leading-relaxed">
              Top up otomatis 24/7. Transaksi diproses dalam hitungan detik setelah pembayaran dikonfirmasi.
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 md:w-2/3">

          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xl font-black">Detail Order</h4>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500 hover:text-white transition">
              ✕
            </button>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-6 h-6 bg-blue-500 flex justify-center items-center rounded-md font-bold text-sm">1</span>
              <h5 className="font-bold">Informasi Akun</h5>
            </div>

            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Masukkan User ID..."
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full bg-[#05070a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
              {needsZone && (
                <input
                  type="text"
                  placeholder="Zone ID..."
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className="w-32 bg-[#05070a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                />
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleValidate}
                disabled={validating || !targetId || (needsZone && !zoneId)}
                className="bg-blue-500/10 text-cyan-400 border border-blue-500/30 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-500/20 transition disabled:opacity-50"
              >
                {validating ? "Mengecek..." : "Cek Akun"}
              </button>
              {accountName && (
                <div className="text-sm font-bold text-green-400">
                  ✓ {accountName}
                </div>
              )}
              {validationError && (
                <div className="text-sm font-bold text-red-400">
                  ✗ {validationError}
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-4">
              Contoh User ID biasanya ada di profil in-game (misal: 12345678).
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-6 h-6 bg-blue-500 flex justify-center items-center rounded-md font-bold text-sm">2</span>
              <h5 className="font-bold">Pilih Nominal Target</h5>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-20 skeleton-img rounded-xl border border-white/5 opacity-50"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {products.map((p) => (
                  <div
                    key={p.sku_code}
                    onClick={() => setSelectedProduct(p)}
                    className={`cursor-pointer border rounded-xl p-3 text-center transition ${selectedProduct?.sku_code === p.sku_code
                        ? "border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                        : "border-white/5 bg-black/40 hover:border-blue-500/40 hover:bg-blue-500/5"
                      }`}
                  >
                    <p className="text-xs text-slate-300 mb-1 font-medium">{p.name}</p>
                    <p className="text-[15px] font-black text-cyan-400">
                      Rp {p.price_sell.toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6 font-sans">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-6 h-6 bg-blue-500 flex justify-center items-center rounded-md font-bold text-sm">3</span>
              <h5 className="font-bold">Pilih Pembayaran</h5>
            </div>

            <div className="space-y-3">
              <div className="space-y-3">
                <div
                  onClick={() => setPaymentMethod("qris")}
                  className={`border rounded-2xl p-4 flex items-center justify-between group cursor-pointer transition-all ${paymentMethod === "qris"
                      ? "bg-blue-500/10 border-blue-500/50"
                      : "bg-white/5 border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl p-2 transition-all ${paymentMethod === "qris" ? "bg-white shadow-lg" : "bg-white/10"}`}>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg" alt="QRIS" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${paymentMethod === "qris" ? "text-slate-100" : "text-slate-300"}`}>QRIS & E-Wallet</p>
                      <p className="text-[10px] text-slate-400/80 uppercase tracking-widest">Otomatis • Konfirmasi Instan</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === "qris" ? "border-blue-500" : "border-white/20"}`}>
                    {paymentMethod === "qris" && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod("va")}
                  className={`border rounded-2xl p-4 flex items-center justify-between group cursor-pointer transition-all ${paymentMethod === "va"
                      ? "bg-blue-500/10 border-blue-500/50"
                      : "bg-white/5 border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl p-2 transition-all ${paymentMethod === "va" ? "bg-white shadow-lg" : "bg-white/10"}`}>
                      <span className="text-xl">🏦</span>
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${paymentMethod === "va" ? "text-slate-100" : "text-slate-300"}`}>Virtual Account</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Mandiri, BNI, BRI, Permata, CIMB</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === "va" ? "border-blue-500" : "border-white/20"}`}>
                    {paymentMethod === "va" && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-center text-slate-500 mt-6 uppercase tracking-extra-widest">
              ⚡ Powered by Midtrans Secure Payment
            </p>
          </div>

          {errorText && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
              ⚠️ {errorText}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold bg-white/5 text-slate-300 hover:bg-white/10 transition"
            >
              Batal
            </button>
            <button
              autoFocus
              onClick={handleCheckout}
              disabled={processing || !selectedProduct}
              className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:scale-105 transition shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {processing ? "Memproses..." : "Bayar Sekarang 🚀"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}