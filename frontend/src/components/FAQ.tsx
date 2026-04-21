import { useState } from "react";

const faqs = [
  {
    question: "Apa itu NezGame?",
    answer: "NezGame adalah platform top up game online terpercaya di Indonesia. Kami menyediakan layanan top up otomatis 24/7 untuk berbagai game populer seperti Mobile Legends, Free Fire, Genshin Impact, PUBG Mobile, Valorant, dan banyak lagi."
  },
  {
    question: "Berapa lama proses top up?",
    answer: "Proses top up di NezGame sepenuhnya otomatis. Setelah pembayaran dikonfirmasi, item akan masuk ke akun game kamu dalam 1-5 menit. Untuk beberapa game, prosesnya bahkan kurang dari 30 detik!"
  },
  {
    question: "Metode pembayaran apa saja yang tersedia?",
    answer: "Kami menerima berbagai metode pembayaran: QRIS (Gopay, OVO, Dana, ShopeePay), Transfer Bank (BCA, BNI, BRI, Mandiri), Indomaret, Alfamart, dan kartu kredit melalui Midtrans."
  },
  {
    question: "Apakah NezGame aman dan terpercaya?",
    answer: "Ya! Semua transaksi diproses melalui payment gateway resmi Midtrans yang sudah tersertifikasi PCI-DSS. Kami tidak menyimpan data pembayaran kamu dan semua komunikasi dienkripsi."
  },
  {
    question: "Bagaimana jika top up tidak masuk?",
    answer: "Jika dalam 30 menit item belum masuk setelah pembayaran berhasil, silakan hubungi CS kami via WhatsApp di 08223456889 dengan melampirkan nomor invoice. Kami akan segera membantu menyelesaikan masalah tersebut."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="scroll-mt-32">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-black mb-4">Pertanyaan Umum</h2>
        <p className="text-slate-400">Temukan jawaban untuk pertanyaan yang sering ditanyakan.</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className={`bg-[#0d121b] border rounded-3xl overflow-hidden transition-all duration-300 ${
              openIndex === index ? "border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.1)]" : "border-white/5"
            }`}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <span className={`font-bold transition-colors ${openIndex === index ? "text-blue-400" : "text-slate-200"}`}>
                {faq.question}
              </span>
              <span className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center border border-white/10 text-xl transition-transform duration-300 ${openIndex === index ? "rotate-45 bg-blue-500 text-white border-blue-500" : "text-slate-500"}`}>
                +
              </span>
            </button>
            <div 
              className={`transition-all duration-300 ease-in-out ${
                openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-6 pt-0 text-slate-400 text-sm leading-relaxed border-t border-white/5 mt-4 mx-6">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
