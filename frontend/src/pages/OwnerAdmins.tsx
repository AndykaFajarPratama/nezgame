import { useState, useEffect } from "react";
import OwnerLayout from "../layouts/OwnerLayout";
import {
  Users,
  UserPlus,
  Trash2,
  X,
  Crown,
  Shield,
  Mail,
  Lock,
  User,
  AlertTriangle,
  Check,
  Loader2,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  roleId: number;
  roleName: string;
  createdAt: string;
  sessionCount: number;
}

export default function OwnerAdmins() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/owner/admins");
      if (res.ok) {
        setAdmins(await res.json());
      } else {
        useMockData();
      }
    } catch {
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  const useMockData = () => {
    setAdmins([
      {
        id: "owner-001",
        name: "NezGame Owner",
        email: "owner@nezgame.com",
        image: null,
        roleId: 1,
        roleName: "owner",
        createdAt: "2026-01-01T00:00:00Z",
        sessionCount: 42,
      },
      {
        id: "admin-001",
        name: "Admin Alpha",
        email: "admin@nezgame.com",
        image: null,
        roleId: 2,
        roleName: "admin",
        createdAt: "2026-02-15T00:00:00Z",
        sessionCount: 18,
      },
      {
        id: "admin-002",
        name: "Admin Beta",
        email: "beta@nezgame.com",
        image: null,
        roleId: 2,
        roleName: "admin",
        createdAt: "2026-03-20T00:00:00Z",
        sessionCount: 7,
      },
    ]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const res = await fetch("/api/owner/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setFormSuccess(data.message);
        setFormData({ name: "", email: "", password: "" });
        fetchAdmins();
        setTimeout(() => {
          setShowModal(false);
          setFormSuccess(null);
        }, 1500);
      } else {
        setFormError(data.message || "Failed to create admin.");
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (admin: AdminUser) => {
    if (admin.roleId === 1) {
      alert("Cannot delete owner account.");
      return;
    }
    if (
      !confirm(
        `Remove admin "${admin.name}" (${admin.email})? This action cannot be undone.`
      )
    )
      return;

    try {
      const res = await fetch(`/api/owner/admins/${admin.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        fetchAdmins();
      } else {
        alert(data.message || "Failed to remove admin.");
      }
    } catch {
      alert("Network error.");
    }
  };

  const getRoleBadge = (roleName: string) => {
    if (roleName === "owner") {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border text-amber-400 border-amber-500/50 bg-amber-500/10">
          <Crown className="w-3 h-3" />
          Owner
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border text-blue-400 border-blue-500/50 bg-blue-500/10">
        <Shield className="w-3 h-3" />
        Admin
      </span>
    );
  };

  return (
    <OwnerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-amber-500" />
              ADMIN <span className="text-amber-400">MANAGEMENT</span>
            </h1>
            <p className="text-slate-500 text-sm italic mt-1">
              Manage access credentials for your team.
            </p>
          </div>
          <button
            onClick={() => {
              setShowModal(true);
              setFormError(null);
              setFormSuccess(null);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Add Admin
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="owner-card p-5 rounded-xl border border-amber-500/10">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Total Personnel
            </p>
            <p className="text-2xl font-heading font-black text-white mt-1">
              {admins.length}
            </p>
          </div>
          <div className="owner-card p-5 rounded-xl border border-amber-500/10">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Owners
            </p>
            <p className="text-2xl font-heading font-black text-amber-400 mt-1">
              {admins.filter((a) => a.roleName === "owner").length}
            </p>
          </div>
          <div className="owner-card p-5 rounded-xl border border-blue-500/10">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Admins
            </p>
            <p className="text-2xl font-heading font-black text-blue-400 mt-1">
              {admins.filter((a) => a.roleName === "admin").length}
            </p>
          </div>
        </div>

        {/* Admin List */}
        <div className="owner-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Sessions</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b border-white/[0.02]">
                        <td colSpan={6} className="px-6 py-5">
                          <div className="h-12 skeleton-text rounded w-full" />
                        </td>
                      </tr>
                    ))
                  : admins.map((admin) => (
                      <tr
                        key={admin.id}
                        className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                                admin.roleName === "owner"
                                  ? "bg-amber-500/10 border-amber-500/20"
                                  : "bg-blue-500/10 border-blue-500/20"
                              }`}
                            >
                              {admin.roleName === "owner" ? (
                                <Crown className="w-5 h-5 text-amber-400" />
                              ) : (
                                <User className="w-5 h-5 text-blue-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">
                                {admin.name}
                              </p>
                              <p className="text-[10px] text-slate-600 font-mono">
                                ID: {admin.id.substring(0, 12)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm text-slate-300">{admin.email}</p>
                        </td>
                        <td className="px-6 py-5">{getRoleBadge(admin.roleName)}</td>
                        <td className="px-6 py-5">
                          <span className="text-sm text-slate-400 font-mono">
                            {admin.sessionCount}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-xs text-slate-400">
                            {new Date(admin.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-5">
                          {admin.roleName === "owner" ? (
                            <span className="text-[10px] text-slate-700 italic font-bold uppercase">
                              Protected
                            </span>
                          ) : (
                            <button
                              onClick={() => handleDelete(admin)}
                              className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                              title="Remove Admin"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !formLoading && setShowModal(false)}
          />
          <div className="relative w-full max-w-md owner-glass p-8 rounded-3xl border border-amber-500/20 shadow-[0_0_60px_rgba(245,158,11,0.1)]">
            {/* Close */}
            <button
              onClick={() => !formLoading && setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-xl text-white">
                  Add New Admin
                </h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                  Create admin credentials
                </p>
              </div>
            </div>

            {formError && (
              <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <p className="text-xs text-rose-400 font-bold">{formError}</p>
              </div>
            )}

            {formSuccess && (
              <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-xs text-emerald-400 font-bold">
                  {formSuccess}
                </p>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-600" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Admin Name"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-amber-500/50 transition-all text-sm text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-600" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="admin@nezgame.com"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-amber-500/50 transition-all text-sm text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-600" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Min. 8 characters"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-amber-500/50 transition-all text-sm text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <p className="text-[10px] text-amber-400/70 leading-relaxed italic">
                  The new admin will have access to products, transactions,
                  and settings. They will NOT have access to the Owner
                  Dashboard.
                </p>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full relative group overflow-hidden rounded-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative py-3.5 flex items-center justify-center gap-2 text-white font-black text-xs uppercase tracking-widest">
                  {formLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Create Admin Account
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
