export default function Hero() {
  return (
    <>
      <section className="pt-48 pb-12 relative flex flex-col md:flex-row items-center max-w-7xl mx-auto px-6 h-screen md:h-auto min-h-[600px]">
        {/* Left Content */}
        <div className="flex-1 z-10 text-center md:text-left space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 border border-cyan-500/20">
            Layanan Top Up Game Terpercaya
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-[1.1] text-white tracking-tighter">
            Top Up Game <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Cepat & Aman</span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-lg mx-auto md:mx-0 leading-relaxed">
            Dapatkan diamond, skin, dan voucher game favoritmu dengan harga terbaik. 
            Proses otomatis 24 jam, instan, dan aman 100%.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
            <a href="#daftar-game" className="px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl font-black text-white text-xs uppercase tracking-widest transition hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] shadow-lg shadow-blue-500/20">
              Top Up Sekarang
            </a>
            <a href="#cara-order" className="px-10 py-4 bg-transparent border-2 border-white/10 rounded-2xl font-black text-slate-300 text-xs uppercase tracking-widest transition hover:bg-white/5 hover:border-white/20">
              Panduan Order
            </a>
          </div>
        </div>

        {/* Right Mascot */}
        <div className="flex-1 flex justify-center items-center mt-12 md:mt-0 relative group">
          <div className="absolute w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-blue-500/10 rounded-full mix-blend-screen filter blur-[100px] z-[-1]"></div>
          <div className="relative flex justify-center items-center">
            <img 
              src="/images/nez_mascot_black.png" 
              alt="Nez Mascot" 
              className="w-full max-w-[280px] md:max-w-[420px] drop-shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:scale-105 transition duration-700 pointer-events-none" 
              style={{ 
                mixBlendMode: 'screen',
                filter: 'brightness(1.05) contrast(1.05)',
                WebkitMaskImage: 'radial-gradient(circle, black 70%, transparent 100%)',
                maskImage: 'radial-gradient(circle, black 70%, transparent 100%)'
              }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
