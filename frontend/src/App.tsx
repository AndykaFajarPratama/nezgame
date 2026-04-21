import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AdminOverview from "./pages/AdminOverview";
import AdminProducts from "./pages/AdminProducts";
import AdminTransactions from "./pages/AdminTransactions";
import AdminSettings from "./pages/AdminSettings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthGuard from "./components/AuthGuard";

// Owner Dashboard
import OwnerProtectedRoute from "./components/OwnerProtectedRoute";
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerAnalytics from "./pages/OwnerAnalytics";
import OwnerReports from "./pages/OwnerReports";
import OwnerAdmins from "./pages/OwnerAdmins";

// Customer Dashboard
import CustomerDashboard from "./pages/CustomerDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OtpVerification from "./pages/OtpVerification";

import AdminBackground from "./pages/AdminBackground";

function App() {
  // Global appearance management
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/settings`);
        const data = await response.json();
        if (data.background_url) {
          document.documentElement.style.setProperty('--site-bg-url', data.background_url);
        }
      } catch (err) {
        console.error("Failed to load site settings:", err);
      }
    };
    loadSettings();
  }, []);

  return (
    <>
      <div className="particles-bg"></div>
      <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<OtpVerification />} />
        
        {/* Customer Dashboard (Protected — roleId === 3 or generic auth) */}
        <Route path="/dashboard" element={<AuthGuard><CustomerDashboard /></AuthGuard>} />
        
        {/* Admin Routes (Protected — owner + admin) */}
        <Route path="/admin" element={<ProtectedRoute><AdminOverview /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/transactions" element={<ProtectedRoute><AdminTransactions /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
        <Route path="/admin/appearance" element={<ProtectedRoute><AdminBackground /></ProtectedRoute>} />

        {/* Owner Dashboard Routes (Owner only — roleId === 1) */}
        <Route path="/owner" element={<OwnerProtectedRoute><OwnerDashboard /></OwnerProtectedRoute>} />
        <Route path="/owner/analytics" element={<OwnerProtectedRoute><OwnerAnalytics /></OwnerProtectedRoute>} />
        <Route path="/owner/reports" element={<OwnerProtectedRoute><OwnerReports /></OwnerProtectedRoute>} />
        <Route path="/owner/admins" element={<OwnerProtectedRoute><OwnerAdmins /></OwnerProtectedRoute>} />
        
        {/* 404 Fallback */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col items-center justify-center bg-[#05070a] text-slate-100">
             <h1 className="text-9xl font-heading font-black text-rose-500 opacity-20 absolute -z-10">404</h1>
             <div className="glass p-12 rounded-3xl border border-rose-500/20 text-center space-y-6 max-w-lg">
                <p className="text-4xl font-heading font-extrabold text-white tracking-tighter uppercase">Halaman Tidak Ditemukan</p>
                <p className="text-slate-500 text-sm">Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-xs"
                >
                   Kembali ke Beranda
                </button>
             </div>
          </div>
        } />
      </Routes>
      </Router>
    </>
  );
}

export default App;
