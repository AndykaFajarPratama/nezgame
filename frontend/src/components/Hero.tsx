import { useRef, useState, useCallback, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { Sparkles } from "lucide-react";

const MESSAGES = [
  "Hai! Klik aku dong! 😄",
  "Top up yuk? Harga termurah! 💎",
  "Proses otomatis 24 jam lho~ ⚡",
  "Mau diamond? Nez siap bantu! 🎮",
  "Selamat datang di NezGame! 🌟",
  "Jangan lupa checkout ya! 🛒",
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExcited, setIsExcited] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [clickCount, setClickCount] = useState(0);

  // Mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 150, damping: 15, mass: 0.5 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // 3D transforms
  const rotateX = useTransform(springY, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-12, 12]);
  const translateX = useTransform(springX, [-0.5, 0.5], [-20, 20]);
  const translateY = useTransform(springY, [-0.5, 0.5], [-15, 15]);

  // Glow follows mouse
  const glowX = useTransform(springX, [-0.5, 0.5], [20, 80]);
  const glowY = useTransform(springY, [-0.5, 0.5], [20, 80]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMouseMove);
    return () => el.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // Show bubble after 3s
  useEffect(() => {
    const t = setTimeout(() => setShowBubble(true), 3000);
    return () => clearTimeout(t);
  }, []);

  // Rotate messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % MESSAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    setIsExcited(true);
    setClickCount((c) => c + 1);
    setShowBubble(true);
    setCurrentMessage((prev) => (prev + 1) % MESSAGES.length);
    setTimeout(() => setIsExcited(false), 700);
  };

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

        {/* Right: 3D Interactive Mascot */}
        <div
          ref={containerRef}
          className="flex-1 flex justify-center items-center mt-12 md:mt-0 relative cursor-pointer"
          onClick={handleClick}
          style={{ perspective: "1000px" }}
        >
          {/* Dynamic glow that follows mouse */}
          <motion.div
            className="absolute w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full pointer-events-none z-0"
            style={{
              background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(34,211,238,0.25), rgba(59,130,246,0.1), transparent 70%)`,
            }}
          />

          {/* Speech Bubble */}
          <AnimatePresence>
            {showBubble && (
              <motion.div
                key={currentMessage}
                initial={{ opacity: 0, y: 8, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute -top-2 md:top-2 left-1/2 -translate-x-1/2 z-30"
              >
                <div className="relative bg-[#0d121b]/95 border border-cyan-500/30 px-4 py-2.5 rounded-2xl shadow-[0_0_25px_rgba(34,211,238,0.12)] backdrop-blur-sm">
                  <p className="text-[12px] font-medium text-slate-200 leading-snug text-center whitespace-nowrap">
                    {MESSAGES[currentMessage]}
                  </p>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0d121b]/95 border-b border-r border-cyan-500/30 rotate-45" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3D Mascot */}
          <motion.div
            className="relative z-20"
            style={{
              rotateX,
              rotateY,
              x: translateX,
              y: translateY,
              transformStyle: "preserve-3d",
            }}
          >
            <motion.div
              animate={
                isExcited
                  ? { scale: [1, 1.18, 0.92, 1.06, 1], rotate: [0, -6, 6, -3, 0] }
                  : { y: [0, -10, 0] }
              }
              transition={
                isExcited
                  ? { duration: 0.6 }
                  : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
              }
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.9 }}
            >
              <img 
                src="/images/nez_mascot_black.png" 
                alt="Nez Mascot" 
                className="w-full max-w-[280px] md:max-w-[420px] select-none pointer-events-none" 
                draggable={false}
                style={{ 
                  mixBlendMode: 'screen',
                  filter: isExcited
                    ? 'brightness(1.4) contrast(1.1) drop-shadow(0 0 35px rgba(34,211,238,0.6))'
                    : 'brightness(1.05) contrast(1.05) drop-shadow(0 0 20px rgba(59,130,246,0.3))',
                  WebkitMaskImage: 'radial-gradient(circle, black 70%, transparent 100%)',
                  maskImage: 'radial-gradient(circle, black 70%, transparent 100%)',
                  transition: 'filter 0.3s ease',
                }}
              />
            </motion.div>

            {/* Click spark burst */}
            <AnimatePresence>
              {isExcited && (
                <>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={`spark-${i}`}
                      className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400 pointer-events-none"
                      style={{ top: "50%", left: "50%" }}
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{
                        scale: [0, 1.5, 0],
                        opacity: [1, 0.7, 0],
                        x: Math.cos((i * Math.PI * 2) / 8) * 80,
                        y: Math.sin((i * Math.PI * 2) / 8) * 80,
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Easter egg sparkle badge */}
          <AnimatePresence>
            {clickCount >= 5 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30"
              >
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 backdrop-blur-sm">
                  <Sparkles className="w-3 h-3 text-pink-400" />
                  <span className="text-[10px] font-bold text-pink-300">Nez loves you! ×{clickCount}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
