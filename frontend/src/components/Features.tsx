export default function Features() {
  const feats = [
    {
      icon: "⚡",
      title: "Proses Otomatis",
      desc: "Orderan kamu langsung diproses oleh sistem dalam hitungan detik setelah pembayaran terverifikasi."
    },
    {
      icon: "💸",
      title: "Harga Terbaik",
      desc: "Kami menawarkan harga yang kompetitif dan transparan karena bekerja sama langsung dengan penyedia resmi."
    },
    {
      icon: "🛡️",
      title: "Keamanan 100%",
      desc: "Tidak ada data akun yang kami simpan. Transaksi menggunakan ID Player dijamin aman dari ban."
    }
  ];

  return (
    <section>
      <div className="text-center mb-16 reveal revealed">
        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-4 border border-cyan-500/20">
          KEUNGGULAN PLATFORM
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-white">Layanan Terbaik Kami</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {feats.map((feat, i) => (
          <div key={i} className="bg-[#0d121b] border border-white/5 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/20 hover:shadow-[0_10px_40px_rgba(59,130,246,0.1)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-2xl border border-blue-500/15 mb-5">
              {feat.icon}
            </div>
            
            <h4 className="text-lg font-black mb-3">{feat.title}</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              {feat.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
