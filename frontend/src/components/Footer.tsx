export default function Footer() {
  return (
    <footer className="bg-[#030406] pt-24 pb-12 mt-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="max-w-xs">
            <a href="#" className="flex items-center gap-3 text-2xl font-black text-white hover:opacity-90 mb-6">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex justify-center items-center text-xl shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                N
              </div>
              NezGame
            </a>
            <p className="text-sm text-slate-400 mb-6 font-medium">
              Platform top up game terpercaya di Indonesia. Layanan otomatis 24/7 dan aman 100%.
            </p>
            <div className="flex gap-3">
              {['fb', 'ig', 'tw'].map((social) => (
                <a key={social} href="#" className="w-10 h-10 flex justify-center items-center rounded-xl bg-white/5 border border-white/5 text-slate-400 transition hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/30 hover:-translate-y-1">
                  X
                </a>
              ))}
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-white font-black text-sm mb-6">Peta Situs</h4>
            <ul className="flex flex-col gap-3">
              <li><a href="#daftar-game" className="text-sm text-slate-400 hover:text-blue-400">Daftar Game</a></li>
              <li><a href="#cek-transaksi" className="text-sm text-slate-400 hover:text-blue-400">Cek Transaksi</a></li>
              <li><a href="#cara-order" className="text-sm text-slate-400 hover:text-blue-400">Cara Order</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-white font-black text-sm mb-6">Dukungan</h4>
            <ul className="flex flex-col gap-3">
              <li><a href="#" className="text-sm text-slate-400 hover:text-blue-400">Hubungi Kami (WA)</a></li>
              <li><a href="#faq" className="text-sm text-slate-400 hover:text-blue-400">FAQ</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-blue-400">Syarat Ketentuan</a></li>
            </ul>
          </div>
          
          {/* Copyright */}
          <div>
             <h4 className="text-white font-black text-sm mb-6">Metode Pembayaran</h4>
             <div className="flex flex-wrap gap-2 opacity-50">
                <div className="w-12 h-8 bg-white/20 rounded"></div>
                <div className="w-12 h-8 bg-white/20 rounded"></div>
                <div className="w-12 h-8 bg-white/20 rounded"></div>
             </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} NezGame. Hak Cipta Dilindungi Undang-Undang.
          </p>
        </div>
      </div>
    </footer>
  );
}
