import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import { ShieldAlert, Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      
      if (!session.data) {
        navigate("/login");
        return;
      }

      // 1 = owner, 2 = admin
      const roleId = (session.data.user as any).roleId;
      if (roleId === 1 || roleId === 2) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Memverifikasi Akses...</p>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 text-center">
        <div className="glass p-12 rounded-3xl border border-rose-500/20 max-w-md space-y-6">
           <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert className="w-10 h-10 text-rose-500" />
           </div>
           <h2 className="text-3xl font-heading font-black text-white">AKSES DITOLAK</h2>
           <p className="text-slate-500 text-sm leading-relaxed">
             Halaman ini hanya dapat diakses oleh Administrator NezGame.
           </p>
           <button 
             onClick={() => navigate("/")}
             className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-xs"
           >
              Return to Grid
           </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
