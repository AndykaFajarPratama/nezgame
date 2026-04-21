const testimonials = [
  {
    name: "Rizky A.",
    role: "Mobile Legends Player",
    stars: 5,
    text: "Top up ML di sini cepet banget, baru bayar udah langsung masuk diamond-nya. Harga juga paling murah dibanding yang lain!",
    avatar: "R"
  },
  {
    name: "Sarah M.",
    role: "Genshin Impact Player",
    stars: 5,
    text: "Udah langganan top up di NezGame dari awal. Proses otomatis 24 jam, jadi bisa top up kapan aja. Recommended banget!",
    avatar: "S"
  },
  {
    name: "Dani P.",
    role: "Free Fire Player",
    stars: 5,
    text: "Pembayarannya lengkap, bisa QRIS, GoPay, bahkan Indomaret. Prosesnya juga instan. Mantap lah NezGame! 🔥",
    avatar: "D"
  }
];

export default function Testimonials() {
  return (
    <section id="testimoni" className="scroll-mt-32">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-black mb-4">Suara Komunitas</h2>
        <p className="text-slate-400">Ribuan gamer sudah mempercayakan top up mereka kepada kami.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <div 
            key={i} 
            className="bg-[#0d121b] border border-white/5 rounded-3xl p-8 relative group transition-all duration-500 hover:border-blue-500/30 hover:shadow-[0_20px_40px_rgba(59,130,246,0.1)]"
          >
            <div className="flex text-amber-400 mb-6 text-sm">
              {"★".repeat(t.stars)}
            </div>
            
            <p className="text-slate-300 leading-relaxed mb-8 italic">
              "{t.text}"
            </p>

            <div className="flex items-center gap-4 mt-auto">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-black text-white shadow-lg">
                {t.avatar}
              </div>
              <div>
                <h4 className="font-bold text-slate-100">{t.name}</h4>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{t.role}</p>
              </div>
            </div>

            <div className="absolute top-6 right-8 text-blue-500/10 text-6xl font-serif">
              "
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
