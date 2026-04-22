import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const token = searchParams.get("token");

  useEffect(() => {
    if (token && typeof token === "string") {
      authClient.verifyEmail({ query: { token } })
        .then(({ error }) => {
          if (error) setStatus("error");
          else setStatus("success");
        })
        .catch(() => setStatus("error"));
    } else {
      setStatus("error");
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] -z-10 animate-pulse" />
      
      <div className="w-full max-w-md relative">
        <div className="glass p-10 rounded-3xl border border-white/5 relative z-10 shadow-2xl text-center">
          {status === "loading" && (
            <div className="space-y-6 py-8">
              <RefreshCw className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
              <div className="space-y-2">
                <h2 className="text-2xl font-heading font-black text-white italic">VERIFIKASI...</h2>
                <p className="text-slate-500 text-sm italic">Sedang memproses tautan verifikasi Anda.</p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6 py-8">
              <div className="p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-3xl inline-block">
                <CheckCircle2 className="w-16 h-16 text-cyan-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-heading font-black text-white italic tracking-tighter">SUCCESS!</h2>
                <p className="text-slate-400 text-sm">Akun Anda telah diverifikasi. Selamat bergabung di NezGame!</p>
              </div>
              <Link 
                to="/login"
                className="w-full inline-block py-4 mt-6 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-105 transition-transform"
              >
                Login Sekarang
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6 py-8">
              <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-3xl inline-block">
                <XCircle className="w-16 h-16 text-rose-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-heading font-black text-white italic tracking-tighter">INVALID LINK</h2>
                <p className="text-slate-400 text-sm italic">Tautan verifikasi salah atau sudah kadaluarsa.</p>
              </div>
              <Link 
                to="/register"
                className="inline-block mt-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-cyan-400 transition-colors"
              >
                Daftar Ulang / Kirim Ulang Email
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
