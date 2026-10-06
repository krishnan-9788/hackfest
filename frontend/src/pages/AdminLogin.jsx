import React, { useState } from 'react';
import { Sparkles, ShieldAlert, Lock, Mail, ArrowRight, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import complaintApi from '../services/api';

export default function AdminLogin({ onLoginSuccess, onNavigate }) {
  const [email, setEmail] = useState('admin@complaintintel.com');
  const [password, setPassword] = useState('Admin@ComplaintIntel2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await complaintApi.loginAdmin(email, password);
      if (onLoginSuccess) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Access denied: Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0d0b1a] relative overflow-hidden p-4 sm:p-8">
      {/* Background ambient security grid & glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top back button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => onNavigate('customer-login')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Customer Portal</span>
        </button>
      </div>

      {/* Main Admin Card */}
      <div className="relative z-10 w-full max-w-md bg-[#16132f]/90 border border-purple-500/20 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl shadow-purple-950/60 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-600/30">
            <KeyRound className="w-7 h-7" />
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-xl font-black text-white tracking-tight">ComplaintIntel</span>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                ADMIN PORTAL
              </span>
            </div>
            <p className="text-xs text-purple-200/60 font-medium mt-1">
              Secure administrator access & escalation control
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-200/80 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-purple-300/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@complaintintel.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-purple-500/25 text-white placeholder-purple-300/30 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-200/80 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-purple-300/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-purple-500/25 text-white placeholder-purple-300/30 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating Administrator...</span>
              </>
            ) : (
              <>
                <span>Secure Login</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Admin credentials quick fill */}
        <div className="bg-purple-950/40 border border-purple-500/20 rounded-2xl p-3 text-xs text-purple-200/80 flex items-center justify-between">
          <span>Admin: <strong className="text-white">admin@complaintintel.com</strong></span>
          <button
            type="button"
            onClick={() => {
              setEmail('admin@complaintintel.com');
              setPassword('Admin@ComplaintIntel2026');
            }}
            className="text-purple-300 font-bold hover:text-white transition-colors"
          >
            Fill Demo
          </button>
        </div>
      </div>
    </div>
  );
}
