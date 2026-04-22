import { useState, useEffect } from "react";
import OrderModal from "./OrderModal";
import { apiFetch } from "../lib/api"; // ✅ DITAMBAH

interface Category {
  id: number;
  name: string;
  slug: string;
  needsZone: boolean;
  imageUrl?: string;
  activeProductCount: number;
}

export default function GameList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    apiFetch("/api/categories") // ✅ DIUBAH
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <section id="daftar-game" className="scroll-mt-32">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-4 border border-cyan-500/20">
          KATEGORI GAME
        </span>
        <h2 className="text-3xl md:text-4xl font-black mb-4">Daftar Kategori Game</h2>
        <div className="relative max-w-sm mx-auto">
          <input
            type="text"
            placeholder="Cari nama game..."
            className="w-full bg-[#0d121b] border border-white/10 rounded-full py-3 px-5 text-sm focus:border-blue-500 outline-none text-white shadow-inner"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-[#0d121b] rounded-3xl p-4 border border-white/5 opacity-60">
              <div className="skeleton-img w-full aspect-square rounded-2xl mb-4"></div>
              <div className="skeleton-text h-4 w-3/4 mx-auto rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {categories.map((cat) => {
            const isComingSoon = cat.activeProductCount === 0;
            return (
              <div
                key={cat.id}
                onClick={() => !isComingSoon && setSelectedCategory(cat)}
                className={`bg-[#0d121b] rounded-3xl p-4 border border-white/5 text-center group transition-all duration-300 relative overflow-hidden ${isComingSoon
                    ? "opacity-60 grayscale-[0.5] cursor-not-allowed"
                    : "cursor-pointer hover:-translate-y-3 hover:border-blue-500/40 hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)]"
                  }`}
              >
                {isComingSoon && (
                  <div className="absolute top-4 right-4 z-10 transform rotate-12">
                    <span className="bg-amber-500/90 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-tight">Soon</span>
                  </div>
                )}

                <div className="relative overflow-hidden rounded-2xl mb-4 shadow-xl bg-slate-900/50 p-2">
                  <img
                    src={cat.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(cat.name)}&background=1e293b&color=38bdf8&bold=true&size=512&font-size=0.33`}
                    alt={cat.name}
                    className={`w-full aspect-square object-contain transition-transform duration-500 ${!isComingSoon ? "group-hover:scale-110 logo-glow" : ""}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cat.name)}&background=1e293b&color=38bdf8&bold=true&size=512&font-size=0.33`;
                    }}
                    style={{
                      filter: isComingSoon
                        ? "drop-shadow(0 0 4px rgba(255, 255, 255, 0.1)) brightness(0.8)"
                        : "drop-shadow(0 0 8px rgba(59, 130, 246, 0.4)) brightness(1.2)"
                    }}
                  />
                  {!isComingSoon && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  )}
                </div>
                <h4 className={`text-sm font-bold transition ${isComingSoon ? "text-slate-500" : "text-slate-200 group-hover:text-blue-400"}`}>
                  {cat.name}
                </h4>

                {!isComingSoon ? (
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 rounded-full text-[10px] font-black uppercase text-white opacity-0 transition-all duration-300 group-hover:bottom-2 group-hover:opacity-100 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                    Top Up!
                  </div>
                ) : (
                  <div className="mt-2 text-[9px] font-black uppercase text-slate-500 tracking-wider">
                    Coming Soon
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedCategory && (
        <OrderModal
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </section>
  );
}