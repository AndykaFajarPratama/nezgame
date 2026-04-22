import { useRef, useState, useCallback, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { Card } from "./ui/card";
import { Spotlight } from "./ui/spotlight";
import { Sparkles, Zap, Diamond, Coins } from "lucide-react";

// ─── Floating particle (diamonds / coins around mascot) ────────
function FloatingParticle({
  icon: Icon,
  delay,
  x,
  y,
  size,
  color,
}: {
  icon: typeof Diamond;
  delay: number;
  x: number;
  y: number;
  size: number;
  color: string;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      animate={{
        y: [0, -20, 0],
        opacity: [0.3, 0.8, 0.3],
        rotate: [0, 360],
      }}
      transition={{
        duration: 4 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <Icon size={size} className={color} />
    </motion.div>
  );
}

// ─── Speech bubble messages ────────────────────────────────────
const MESSAGES = [
  "Hai! Klik aku dong! 😄",
  "Top up yuk? Harga termurah! 💎",
  "Proses otomatis 24 jam lho~ ⚡",
  "Mau diamond? Nez siap bantu! 🎮",
  "Wah kamu datang! Selamat datang~ 🌟",
  "Jangan lupa checkout ya! 🛒",
  "Nez selalu ada untukmu! 💙",
];

export default function InteractiveMascot() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [showBubble, setShowBubble] = useState(false);
  const [isExcited, setIsExcited] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // ─── Mouse tracking ──────────────────────────────────────
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 15, mass: 0.5 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Map mouse position to rotation/translation
  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8]);
  const translateX = useTransform(springX, [-0.5, 0.5], [-15, 15]);
  const translateY = useTransform(springY, [-0.5, 0.5], [-10, 10]);

  // Glow follows the mouse
  const glowX = useTransform(springX, [-0.5, 0.5], [30, 70]);
  const glowY = useTransform(springY, [-0.5, 0.5], [30, 70]);

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

  // Show initial bubble after 2s
  useEffect(() => {
    const t = setTimeout(() => setShowBubble(true), 2000);
    return () => clearTimeout(t);
  }, []);

  // Rotate messages every 6s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % MESSAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Handle mascot click
  const handleMascotClick = () => {
    setIsExcited(true);
    setClickCount((c) => c + 1);
    setShowBubble(true);
    setCurrentMessage((prev) => (prev + 1) % MESSAGES.length);
    setTimeout(() => setIsExcited(false), 800);
  };

  return (
    <section className="relative py-20 overflow-hidden" id="nez-interactive">
      <div className="max-w-7xl mx-auto px-6">
        <Card className="w-full min-h-[500px] md:h-[550px] bg-[#05070a]/90 relative overflow-hidden border-white/5">
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="#22d3ee"
          />

          <div className="flex flex-col md:flex-row h-full">
            {/* ─── Left: Text Content ────────────────────────── */}
            <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                  <Sparkles className="w-3 h-3" />
                  Nez Assistant
                </div>

                <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tighter text-white leading-[1.1]">
                  Kenalan dengan{" "}
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                    Nez!
                  </span>
                </h2>

                <p className="mt-5 text-slate-400 max-w-md leading-relaxed text-sm md:text-base">
                  Asisten virtualmu yang siap membantu top-up game 24 jam.
                  Cepat, aman, dan pastinya harga termurah! Coba gerakkan
                  mouse-mu atau klik Nez~
                </p>

                <div className="flex flex-wrap gap-4 mt-8">
                  {[
                    { icon: Zap, text: "Instan", color: "text-amber-400" },
                    {
                      icon: Diamond,
                      text: "Terjangkau",
                      color: "text-cyan-400",
                    },
                    {
                      icon: Coins,
                      text: "Terpercaya",
                      color: "text-emerald-400",
                    },
                  ].map(({ icon: Icon, text, color }) => (
                    <div
                      key={text}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5"
                    >
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Click counter easter-egg */}
                <AnimatePresence>
                  {clickCount >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-6 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 inline-block"
                    >
                      <p className="text-xs text-pink-300 font-bold">
                        🎉 Nez senang! Kamu sudah klik {clickCount}x!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* ─── Right: Interactive Mascot ──────────────────── */}
            <div
              ref={containerRef}
              className="flex-1 relative flex items-center justify-center min-h-[350px] md:min-h-0 cursor-pointer"
              onClick={handleMascotClick}
              style={{ perspective: "1000px" }}
            >
              {/* Animated background glow */}
              <motion.div
                className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full opacity-30 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(34,211,238,0.3), rgba(59,130,246,0.15), transparent 70%)`,
                }}
              />

              {/* Floating particles */}
              <FloatingParticle icon={Diamond} delay={0} x={15} y={20} size={14} color="text-cyan-400/40" />
              <FloatingParticle icon={Diamond} delay={1.5} x={80} y={15} size={10} color="text-blue-400/30" />
              <FloatingParticle icon={Coins} delay={0.8} x={10} y={70} size={12} color="text-amber-400/40" />
              <FloatingParticle icon={Coins} delay={2} x={85} y={65} size={14} color="text-amber-400/30" />
              <FloatingParticle icon={Sparkles} delay={1} x={75} y={80} size={10} color="text-emerald-400/40" />
              <FloatingParticle icon={Sparkles} delay={2.5} x={20} y={85} size={12} color="text-purple-400/30" />

              {/* Speech Bubble */}
              <AnimatePresence>
                {showBubble && (
                  <motion.div
                    key={currentMessage}
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 z-30"
                  >
                    <div className="relative bg-[#0d121b] border border-cyan-500/30 px-5 py-3 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.15)] max-w-[240px]">
                      <p className="text-[13px] font-medium text-slate-200 leading-snug text-center whitespace-nowrap">
                        {MESSAGES[currentMessage]}
                      </p>
                      {/* Tail */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0d121b] border-b border-r border-cyan-500/30 rotate-45" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* The Mascot */}
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
                      ? {
                          scale: [1, 1.15, 0.95, 1.05, 1],
                          rotate: [0, -5, 5, -3, 0],
                        }
                      : {
                          y: [0, -8, 0],
                        }
                  }
                  transition={
                    isExcited
                      ? { duration: 0.6 }
                      : {
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }
                  }
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <img
                    src="/images/nez_mascot_black.png"
                    alt="Nez - Maskot Interaktif NezGame"
                    className="w-[260px] md:w-[380px] drop-shadow-[0_0_40px_rgba(34,211,238,0.3)] select-none"
                    draggable={false}
                    style={{
                      mixBlendMode: "screen",
                      filter: isExcited
                        ? "brightness(1.3) contrast(1.1) drop-shadow(0 0 30px rgba(34,211,238,0.6))"
                        : "brightness(1.05) contrast(1.05) drop-shadow(0 0 20px rgba(59,130,246,0.3))",
                      WebkitMaskImage:
                        "radial-gradient(circle, black 70%, transparent 100%)",
                      maskImage:
                        "radial-gradient(circle, black 70%, transparent 100%)",
                      transition: "filter 0.3s ease",
                    }}
                  />
                </motion.div>

                {/* Click spark effect */}
                <AnimatePresence>
                  {isExcited && (
                    <>
                      {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                          key={`spark-${i}`}
                          className="absolute w-2 h-2 rounded-full bg-cyan-400 pointer-events-none"
                          style={{
                            top: "50%",
                            left: "50%",
                          }}
                          initial={{ scale: 0, opacity: 1 }}
                          animate={{
                            scale: [0, 1.5, 0],
                            opacity: [1, 0.8, 0],
                            x: Math.cos((i * Math.PI * 2) / 8) * 100,
                            y: Math.sin((i * Math.PI * 2) / 8) * 100,
                          }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.6 }}
                        />
                      ))}
                    </>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
