import { useState, useEffect } from "react";

export default function FloatingWhatsApp() {
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowBubble(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-[999] group flex flex-col items-end gap-3 translate-y-0 hover:-translate-y-2 transition-transform duration-300">
      {/* Chat Bubble */}
      {showBubble && (
        <div className="bg-[#0d121b] border border-white/10 px-4 py-3 rounded-2xl rounded-br-none shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500 max-w-[200px]">
          <p className="text-[13px] font-medium text-slate-200 leading-tight">
            Hai! Ada yang bisa Nez bantu? 👋
          </p>
          <button 
            onClick={() => setShowBubble(false)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-lg border border-white/20"
          >
            ✕
          </button>
        </div>
      )}

      {/* WhatsApp Button */}
      <a 
        href="https://wa.me/628223456889" 
        target="_blank" 
        rel="noopener noreferrer"
        className="relative w-16 h-16 rounded-full overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.5)] transition-all duration-300 border border-white/20 hover:scale-110 active:scale-95 flex items-center justify-center p-1"
      >
        <div className="absolute inset-0 bg-[#0d121b]"></div>
        <img 
          src="/images/nez_mascot_black.png" 
          alt="Nez Assistant" 
          className="relative z-10 w-full h-full object-contain p-1.5 transition-transform group-hover:scale-110" 
          style={{ 
            filter: 'brightness(1.5) contrast(1.1) drop-shadow(0 0 10px rgba(59,130,246,0.5))',
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/favicon.svg"; // Fallback to site logo
          }}
        />
        
        {/* Pulsing Aura */}
        <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-pulse -z-10"></div>
      </a>
    </div>
  );
}
