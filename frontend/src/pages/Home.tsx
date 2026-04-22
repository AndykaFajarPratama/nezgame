import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import { ContainerScroll } from "../components/ui/container-scroll-animation";
import InteractiveMascot from "../components/InteractiveMascot";
import GameList from "../components/GameList";
import HowToOrder from "../components/HowToOrder";
import Features from "../components/Features";
import TransactionChecker from "../components/TransactionChecker";
import FAQ from "../components/FAQ";
import Testimonials from "../components/Testimonials";
import FloatingWhatsApp from "../components/FloatingWhatsApp";
import Footer from "../components/Footer";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen text-slate-100 font-sans">
      <Navbar isScrolled={isScrolled} />
      <Hero />

      {/* Daftar Game dengan animasi scroll */}
      <ContainerScroll
        titleComponent={
          <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tighter text-white uppercase">
            Pilih Game <br />
            <span className="text-4xl md:text-[5rem] font-black mt-1 leading-none text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400">
              Favoritmu
            </span>
          </h2>
        }
      >
        <div className="h-full w-full overflow-y-auto bg-[#05070a] p-4 md:p-8">
          <GameList />
        </div>
      </ContainerScroll>

      <main className="max-w-7xl mx-auto px-6 space-y-32 py-16">
        <Features />
        <HowToOrder />
        <InteractiveMascot />
        <TransactionChecker />
        <Testimonials />
        <FAQ />
      </main>
      <FloatingWhatsApp />
      <Footer />
    </div>
  );
}
