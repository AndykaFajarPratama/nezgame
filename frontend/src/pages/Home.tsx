import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import HeroScroll from "../components/HeroScroll";
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
      <HeroScroll />
      <main className="max-w-7xl mx-auto px-6 space-y-32 py-16">
        <Features />
        <GameList />
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
