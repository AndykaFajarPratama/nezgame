import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import { Lock, ArrowRight, AlertCircle, RefreshCw, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Better Auth usually passes the token in the URL or handles it automatically if configured
  // but we can manually handle it if needed.

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      const { error: authError } = await authClient.resetPassword({
        newPassword: password,
      });

      if (authError) {
        setError(authError.message || "Gagal mengatur ulang password.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      setError("Kesalahan sistem. Link mungkin sudah kadaluarsa.");
    } finally {
      setLoading(false);
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
               <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-heading font-black text-white tracking-tighter text-center">
              RESET <span className="text-cyan-400 uppercase">Password</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Buat Password Baru Anda</p>
          </div>

          {!success ? (
            <form onSubmit={handleReset} className="space-y-6">
              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  <p className="text-xs text-rose-400 font-bold tracking-tight uppercase">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Password Baru</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-blue-500 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all text-sm"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-slate-600 hover:text-blue-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Konfirmasi Password Baru</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-blue-500 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all text-sm"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-2xl mt-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 transition-transform group-hover:scale-105" />
                <div className="relative py-4 flex items-center justify-center gap-2 text-white font-black text-xs uppercase tracking-widest">
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <>Update Password <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                </div>
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6 py-4">
              <div className="p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-3xl inline-block">
                <CheckCircle2 className="w-12 h-12 text-cyan-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-heading font-black text-white italic">BERHASIL!</h3>
                <p className="text-slate-400 text-sm">
                  Kata sandi Anda telah diperbarui. Mengalihkan Anda ke halaman login...
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
             <Link to="/login" className="text-slate-500 text-sm hover:text-blue-500 transition-colors">
                Kembali ke Login
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
