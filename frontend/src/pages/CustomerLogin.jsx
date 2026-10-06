import React, { useState } from 'react';
import { Sparkles, Shield, Languages, Cpu, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import complaintApi from '../services/api';

export default function CustomerLogin({ onLoginSuccess, onNavigate }) {
  const [email, setEmail] = useState('ramesh@example.com');
  const [password, setPassword] = useState('Test@12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forgotMsg, setForgotMsg] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await complaintApi.loginCustomer(email, password);
      if (onLoginSuccess) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f8f9fd]">
      {/* Left side: Hero & Feature Showcase */}
      <div className="lg:w-1/2 bg-gradient-to-br from-[#120f29] via-[#1a1440] to-[#251854] text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Glow ambient background circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">ComplaintIntel</span>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full">
                  AI POWERED
                </span>
              </div>
              <p className="text-xs text-purple-200/80 font-medium">Intelligent Complaint Classification & Triage</p>
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="my-12 relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI-powered customer resolution portal</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            Fast, transparent resolution for every customer grievance.
          </h1>
          <p className="text-purple-200/80 text-sm max-w-lg leading-relaxed">
            Submit your complaints in English or Tamil. Our Groq AI engine classifies urgency, routes to specialized teams, and ensures rapid escalation.
          </p>

          {/* 3 Modern Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-1.5 hover:border-purple-400/30 transition-all">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">AI Classification</h4>
              <p className="text-[11px] text-purple-200/70 leading-tight">Instant triage across 8 distinct categories</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-1.5 hover:border-cyan-400/30 transition-all">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                <Languages className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Tamil + English</h4>
              <p className="text-[11px] text-purple-200/70 leading-tight">Native multilingual query understanding</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-1.5 hover:border-pink-400/30 transition-all">
              <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Smart Priority</h4>
              <p className="text-[11px] text-purple-200/70 leading-tight">Critical escalation and duplicate detection</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-purple-300/60 flex items-center justify-between border-t border-white/10 pt-4">
          <span>&copy; 2026 ComplaintIntel SaaS</span>
          <button
            onClick={() => onNavigate('admin-login')}
            className="text-purple-300 hover:text-white font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Admin Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right side: Login Card */}
      <div className="lg:w-1/2 p-8 lg:p-14 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Customer Authentication
            </span>
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Track your registered complaints and view real-time AI status updates.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {forgotMsg && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-blue-600" />
              <span>Password recovery instructions have been sent to your email address if registered.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForgotMsg(true)}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-md hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Login as Customer</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Pill for Judges */}
          <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3 flex items-center justify-between text-xs">
            <span className="text-purple-900 font-medium">Demo Customer: <strong className="font-bold">ramesh@example.com</strong> / Test@12345</span>
            <button
              type="button"
              onClick={() => {
                setEmail('ramesh@example.com');
                setPassword('Test@12345');
              }}
              className="text-purple-700 font-bold hover:underline"
            >
              Fill
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center text-xs text-slate-600 pt-2">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('customer-register')}
              className="font-bold text-purple-600 hover:text-purple-800 transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
