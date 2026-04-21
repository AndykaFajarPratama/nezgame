import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import { Loader2 } from "lucide-react";

/**
 * Basic guard that only ensures the user is authenticated.
 * Used for the Customer Dashboard.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      if (!session.data) {
        navigate("/login");
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Memverifikasi Akses...</p>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}
