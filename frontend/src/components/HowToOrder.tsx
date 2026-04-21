export default function HowToOrder() {
  const steps = [
    { num: "1", title: "Pilih Game", desc: "Pilih game favorit yang ingin kamu top up dari daftar yang tersedia." },
    { num: "2", title: "Masukkan ID", desc: "Masukkan User ID / Server ID sesuai dengan profil game kamu." },
    { num: "3", title: "Pilih Nominal", desc: "Pilih jumlah diamond/koin yang ingin kamu beli." },
    { num: "4", title: "Pembayaran", desc: "Selesaikan pembayaran via QRIS/E-Wallet dan diamond langsung masuk!" }
  ];

  return (
    <section id="cara-order">
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-cyan-400 text-xs font-black uppercase tracking-widest mb-4 border border-cyan-500/20">
          Super Gampang
        </span>
        <h2 className="text-3xl md:text-4xl font-black">Cara Top Up</h2>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-6 flex-wrap">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center">
            <div className="bg-[#0d121b] border border-white/5 rounded-3xl p-8 text-center min-w-[240px] max-w-[280px] transition duration-300 hover:-translate-y-2 hover:border-blue-500/20 hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)]">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex justify-center items-center font-black text-xl mx-auto mb-5 shadow-[0_0_20px_rgba(59,130,246,0.4)] text-white">
                {step.num}
              </div>
              <h4 className="text-lg font-black mb-2">{step.title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
            {i !== steps.length - 1 && (
              <div className="hidden md:block mx-4 text-3xl font-black text-blue-500/40">
                ›
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
