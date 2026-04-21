export default function PromoMarquee() {
  return (
    <div className="fixed top-0 left-0 w-full z-[60] bg-[#05070a] border-b border-white/5 py-1.5 overflow-hidden whitespace-nowrap">
      <div className="inline-flex animate-[marquee_30s_linear_infinite]">
        {[...Array(6)].map((_, i) => (
          <span key={i} className="text-xs font-bold text-white tracking-wider mx-10">
            🔥 PROMO MINGGU INI: DISKON 10% UNTUK SEMUA TOP UP MENGGUNAKAN QRIS! 🔥
          </span>
        ))}
      </div>
    </div>
  );
}
