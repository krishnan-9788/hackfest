import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Database,
  PlusCircle,
  CheckCircle2,
  Menu,
  X,
  LogOut,
  User,
  ShieldAlert,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import complaintApi from '../services/api';

export default function Navbar({
  user,
  currentTab,
  onNavigate,
  onLogout,
  onSeedCompleted,
  onToggleMobileMenu,
  mobileMenuOpen
}) {
  const [health, setHealth] = useState({
    status: 'checking',
    groq_configured: false,
    groq_connected: false,
    groq_status_text: 'Checking...'
  });
  const [seeding, setSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState(null);

  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  useEffect(() => {
    // Only query health on regular intervals if logged in
    const fetchHealth = async () => {
      try {
        const res = await complaintApi.getHealth();
        setHealth({
          status: res.status || 'healthy',
          groq_configured: !!res.groq_configured,
          groq_connected: !!res.groq_connected,
          groq_status_text: res.groq_status_text || (res.groq_connected ? 'Groq AI Connected' : 'AI Fallback Mode Active'),
        });
      } catch (e) {
        setHealth({
          status: 'offline',
          groq_configured: false,
          groq_connected: false,
          groq_status_text: 'Groq AI Unavailable'
        });
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 25000);
    return () => clearInterval(interval);
  }, []);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const res = await complaintApi.seedDemoData();
      setSeedNotice(res.message || 'Demo data loaded successfully!');
      if (onSeedCompleted) onSeedCompleted();
      setTimeout(() => setSeedNotice(null), 4000);
    } catch (e) {
      setSeedNotice('Failed to seed demo data. Please verify backend.');
      setTimeout(() => setSeedNotice(null), 3000);
    } finally {
      setSeeding(false);
    }
  };

  const getStatusDisplay = () => {
    if (health.status === 'offline') {
      return {
        dot: 'bg-rose-500',
        text: '🔴 Groq AI Unavailable',
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    }
    if (health.groq_connected) {
      return {
        dot: 'bg-emerald-500 animate-pulse',
        text: '🟢 Groq AI Connected',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    }
    return {
      dot: 'bg-amber-500',
      text: '🟡 AI Fallback Mode Active',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  };

  const statusDisplay = getStatusDisplay();

  const handleLogoClick = () => {
    if (isAdmin) {
      onNavigate('admin-dashboard');
    } else if (isCustomer) {
      onNavigate('customer-dashboard');
    } else {
      onNavigate('customer-login');
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Subtitle */}
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle button */}
            {user && (
              <button
                onClick={onToggleMobileMenu}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 md:hidden transition-colors"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <div
              className="flex items-center gap-2.5 cursor-pointer select-none group"
              onClick={handleLogoClick}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-cyan-200" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                    THE DEV FOUNDERS
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                    AI POWERED
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  Intelligent Complaint Classification & Triage
                </p>
              </div>
            </div>
          </div>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Real Groq AI Status (Visible to Admin or unauthenticated) */}
            {isAdmin && (
              <div
                className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusDisplay.badge} shadow-2xs transition-colors`}
                title={`LLM Endpoint Status: ${health.groq_status_text}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusDisplay.dot}`} />
                <span>{statusDisplay.text}</span>
              </div>
            )}

            {/* Seed Demo Data Button (Admin Only) */}
            {isAdmin && (
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs disabled:opacity-50"
                title="Seed demo complaints for hackathon demonstration"
              >
                <Database className={`w-3.5 h-3.5 ${seeding ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
                <span>{seeding ? 'Seeding...' : 'Seed Demo Data'}</span>
              </button>
            )}

            {/* Customer CTA to file new complaint */}
            {isCustomer && (
              <button
                onClick={() => onNavigate('customer-new-complaint')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Complaint</span>
              </button>
            )}

            {/* User Profile Pill & Logout */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div
                  onClick={() => onNavigate(isAdmin ? 'admin-dashboard' : 'customer-profile')}
                  className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-slate-50 transition-colors"
                  title="View Profile"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs ${isAdmin ? 'bg-gradient-to-tr from-purple-700 to-indigo-800' : 'bg-gradient-to-tr from-cyan-600 to-indigo-600'
                    }`}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[130px]">{user.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize font-medium">
                      {isAdmin ? 'System Admin' : 'Customer'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('customer-login')}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Customer Login
                </button>
                <button
                  onClick={() => onNavigate('admin-login')}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-2xs"
                >
                  Admin Portal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Notification Toast */}
      {seedNotice && (
        <div className="bg-indigo-600 text-white text-xs font-semibold py-2 px-4 text-center animate-fade-in flex items-center justify-center gap-2 shadow-md">
          <CheckCircle2 className="w-4 h-4" />
          <span>{seedNotice}</span>
        </div>
      )}
    </header>
  );
}
