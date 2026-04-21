import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import { Crown, Loader2 } from "lucide-react";

export default function OwnerProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();

      if (!session.data) {
        navigate("/login");
        return;
      }

      const roleId = (session.data.user as any).roleId;
      // Only owner (roleId === 1)
      if (roleId === 1) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isOwner === null) {
    return (
      <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
          Verifying Owner Credentials...
        </p>
      </div>
    );
  }

  if (isOwner === false) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 text-center">
        <div className="glass p-12 rounded-3xl border border-amber-500/20 max-w-md space-y-6">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <Crown className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-3xl font-heading font-black text-white italic">
            OWNER ACCESS ONLY
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            This command center is restricted to NezGame platform owner. Contact
            your administrator for access.
          </p>
          <button
            onClick={() => navigate("/admin")}
            className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-xs"
          >
            Return to Admin Panel
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
