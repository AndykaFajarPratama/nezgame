import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import { ShieldCheck, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";

export default function OtpVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const data = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(data)) return;
    
    const newOtp = [...otp];
    data.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(data.length, 5)]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Silakan masukkan 6 digit kode OTP.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/auth/custom/register-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email!, otp: code }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Kode OTP salah atau sudah kadaluarsa.");
      } else {
        // Success - redirect to login showing success
        navigate("/login?verified=true");
      }
    } catch (err) {
      setError("Gagal memverifikasi OTP. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    setResending(true);
    setError(null);

    try {
      const { error: resendError } = await authClient.emailOtp.sendVerificationOtp({
        email: email!,
        type: "email-verification"
      });

      if (resendError) {
        setError(resendError.message || "Gagal mengirim ulang kode.");
      } else {
        setResendTimer(60); // 1 minute cooldown
      }
    } catch (err) {
      setError("Sistem sedang sibuk. Coba lagi nanti.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-600/10 blur-[150px] -z-10" />
      
      {/* Scanline Overlay */}
      <div className="scanline absolute inset-0 pointer-events-none opacity-[0.03] z-10" />

      <div className="w-full max-w-md relative">
        <div className="glass p-10 rounded-3xl border border-white/5 relative z-10 shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.6)] mb-6">
               <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-heading font-black text-white tracking-tighter">
              VERIFIKASI <span className="text-cyan-400">EMAIL</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 text-center">
              Masukkan 6-digit kode yang dikirim ke <br />
              <span className="text-blue-400 lowercase">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-8">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <p className="text-xs text-rose-400 font-bold uppercase tracking-tight">{error}</p>
              </div>
            )}

            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 bg-black/40 border border-white/10 rounded-xl text-center text-xl font-black text-blue-400 outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all"
                />
              ))}
            </div>

            <div className="space-y-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 transition-transform group-hover:scale-105" />
                <div className="relative py-4 flex items-center justify-center gap-2 text-white font-black text-xs uppercase tracking-widest">
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <>Verifikasi Sekarang <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                </div>
              </button>

              <button 
                type="button"
                onClick={handleResend}
                disabled={resending || resendTimer > 0}
                className="w-full text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-cyan-400 transition-colors disabled:opacity-50"
              >
                {resending ? "Mengirim..." : resendTimer > 0 ? `Kirim Ulang dalam ${resendTimer}s` : "Kirim Ulang Kode"}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
             <Link to="/register" className="text-slate-500 text-sm hover:text-blue-500 transition-colors">
                Salah memasukkan email? <span className="font-bold text-blue-500 italic">Ganti Email</span>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
