import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import { LayoutDashboard, History, LogOut, ChevronDown } from "lucide-react";

export default function Navbar({ isScrolled }: { isScrolled: boolean }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    const { data } = await authClient.getSession();
    setSession(data);
  };

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setSession(null);
          navigate("/");
          window.location.reload();
        },
      },
    });
  };

  const isAdmin = session?.user?.roleId === 1 || session?.user?.roleId === 2;

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#05070a] border-b border-white/10 py-3 backdrop-blur-md shadow-lg shadow-blue-500/10"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 text-2xl font-black text-white decoration-none hover:-translate-y-1 transition duration-300">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex justify-center items-center text-xl shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            N
          </div>
          NezGame
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-8 list-none">
          {["Daftar Game", "Cara Order", "Testimoni", "FAQ"].map((item) => (
            <li key={item}>
              <a
                href={item === "Daftar Game" ? "#daftar-game" : `#${item.toLowerCase().replace(" ", "-")}`}
                className="text-slate-400 font-semibold hover:text-blue-500 hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-blue-500 after:to-cyan-500 hover:after:w-full after:transition-all after:duration-300"
              >
                {item}
              </a>
            </li>
          ))}
          
          {/* Auth Action Button */}
          <li className="relative">
            {session ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 border border-blue-500/50 rounded-xl text-blue-400 font-bold text-xs uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                
                {/* User Dropdown Trigger */}
                <div className="relative">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-2xl hover:border-blue-500/50 transition-all group"
                  >
                    <img 
                      src={session.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name)}&background=1e293b&color=38bdf8&bold=true`} 
                      className="w-8 h-8 rounded-xl border border-white/10"
                      alt={session.user.name}
                    />
                    <div className="text-left hidden lg:block">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">User</p>
                      <p className="text-xs font-bold text-white leading-none">{session.user.name.split(' ')[0]}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute top-[calc(100%+12px)] right-0 w-56 bg-[#0d121b] border border-white/10 rounded-2xl p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 shadow-blue-500/10">
                      <Link 
                        to="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-blue-400 transition-all"
                      >
                        <History className="w-4 h-4" />
                        <span className="text-sm font-bold">Riwayat Pesanan</span>
                      </Link>
                      <div className="h-px bg-white/5 my-1 mx-2" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-bold">Keluar Akun</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link 
                  to="/login" 
                  className="hidden sm:flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-white transition-all px-2"
                >
                  Masuk
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-white font-bold text-xs uppercase tracking-widest hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
                >
                  Daftar
                </Link>
              </div>
            )}
          </li>
        </ul>

        {/* Mobile Toggle */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className={`block w-6 h-[2px] bg-white rounded-md transition duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-[8px]' : ''}`}></span>
          <span className={`block w-6 h-[2px] bg-white rounded-md transition duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-[2px] bg-white rounded-md transition duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-[8px]' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-[100%] left-0 w-full bg-[#05070a]/95 backdrop-blur-xl border-b border-white/5 transition-all overflow-hidden ${
          isMobileMenuOpen ? "max-h-[500px] py-10" : "max-h-0 py-0"
        }`}
      >
        <ul className="flex flex-col items-center gap-6 text-center px-10">
          {["Daftar Game", "Cara Order", "Testimoni", "FAQ"].map((item) => (
            <li key={item} className="w-full">
              <a href={item === "Daftar Game" ? "#daftar-game" : `#${item.toLowerCase().replace(" ", "-")}`} className="text-slate-300 font-semibold text-lg hover:text-blue-400 block w-full py-2" onClick={() => setIsMobileMenuOpen(false)}>
                {item}
              </a>
            </li>
          ))}
          
          <div className="w-full h-px bg-white/5 my-4" />

          {session ? (
            <div className="w-full space-y-4">
              <Link 
                to="/dashboard"
                className="flex items-center justify-center gap-3 w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <History className="w-5 h-5 text-blue-400" />
                Riwayat Pesanan
              </Link>
              {isAdmin && (
                <Link 
                  to="/admin"
                  className="flex items-center justify-center gap-3 w-full py-4 bg-blue-500 rounded-2xl text-white font-bold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Admin Dashboard
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-3 w-full py-4 border border-rose-500/20 text-rose-400 rounded-2xl font-bold"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="w-full space-y-3">
              <Link 
                to="/register" 
                className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20" 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Daftar Sekarang
              </Link>
              <Link 
                to="/login" 
                className="flex items-center justify-center gap-3 w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-300 font-bold uppercase tracking-widest text-xs" 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Masuk
              </Link>
            </div>
          )}
        </ul>
      </div>
    </nav>
  );
}

