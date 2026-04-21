import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await authClient.signIn.email({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || "Gagal masuk. Silakan periksa kembali email dan kata sandi Anda.");
      } else {
        // Fetch session again to get the user object with roleId
        const { data: session } = await authClient.getSession();
        
        if ((session?.user as any)?.roleId === 1 || (session?.user as any)?.roleId === 2) {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem saat mencoba masuk.");
    } finally {
      setLoading(false);
    }
  };

  const isVerified = new URLSearchParams(window.location.search).get("verified") === "true";

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 blur-[150px] -z-10" />
      
      {/* Scanline Overlay */}
      <div className="scanline absolute inset-0 pointer-events-none opacity-[0.03] z-10" />

      <div className="w-full max-w-md relative">
        <div className="glass p-10 rounded-3xl border border-white/5 relative z-10 shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.6)] mb-6 group hover:scale-105 transition-transform">
               <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-heading font-black text-white tracking-tighter">
              MASUK <span className="text-cyan-400">AKUN</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Masuk ke Dashboard NezGame</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {isVerified && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-5 h-5 text-emerald-500" />
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-tight">Akun Berhasil Diverifikasi! Silakan Masuk.</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <p className="text-xs text-rose-400 font-bold tracking-tight">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-blue-500 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kata Sandi</label>
                <Link to="/forgot-password" className="text-[9px] text-blue-500 font-bold hover:text-cyan-400 transition-colors uppercase tracking-widest">Lupa Sandi?</Link>
              </div>
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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-2xl mt-4"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 transition-transform group-hover:scale-105" />
              <div className="relative py-4 flex items-center justify-center gap-2 text-white font-black text-xs uppercase tracking-widest">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <>Masuk Sekarang <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
              </div>
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
             <p className="text-slate-500 text-sm mb-4">
               Belum punya akun?{" "}
               <Link to="/register" className="text-blue-500 font-bold hover:text-cyan-400 transition-colors">Daftar Sekarang</Link>
             </p>
             <p className="text-slate-700 text-[9px] italic uppercase tracking-widest text-center">
                NezGame Terminal v4.0.1
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}
