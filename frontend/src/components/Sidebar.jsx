import React from 'react';
import { 
  LayoutDashboard, 
  Inbox, 
  PlusCircle, 
  Cpu, 
  ShieldCheck, 
  Languages, 
  Sparkles, 
  AlertTriangle,
  BarChart3,
  User,
  LogOut,
  FolderGit2
} from 'lucide-react';

export default function Sidebar({ user, currentTab, onNavigate, stats, mobileOpen, onCloseMobile, onLogout }) {
  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  // Admin menu items
  const adminMenuItems = [
    {
      id: 'admin-dashboard',
      label: 'Admin Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'admin-complaints',
      label: 'All Complaints',
      icon: Inbox,
      badge: stats?.total_complaints != null ? stats.total_complaints : null,
    },
    {
      id: 'admin-alerts',
      label: 'Priority Alerts',
      icon: AlertTriangle,
      badge: stats?.high_critical_complaints ? `${stats.high_critical_complaints}` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    },
    {
      id: 'admin-analytics',
      label: 'System Analytics',
      icon: BarChart3,
      badge: null,
    },
  ];

  // Customer menu items
  const customerMenuItems = [
    {
      id: 'customer-dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'customer-new-complaint',
      label: 'Submit Complaint',
      icon: PlusCircle,
      badge: 'AI',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    },
    {
      id: 'customer-complaints',
      label: 'My Complaints',
      icon: Inbox,
      badge: stats?.my_complaints != null ? stats.my_complaints : null,
    },
    {
      id: 'customer-profile',
      label: 'My Profile',
      icon: User,
      badge: null,
    },
  ];

  const menuItems = isAdmin ? adminMenuItems : customerMenuItems;

  const handleItemClick = (id) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  const content = (
    <div className="h-full flex flex-col justify-between p-4 bg-[#110d28] text-slate-300 border-r border-[#1e1742]">
      <div className="space-y-6">
        {/* User Role Card */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white ${
              isAdmin ? 'bg-gradient-to-tr from-purple-600 to-indigo-600' : 'bg-gradient-to-tr from-cyan-500 to-indigo-600'
            }`}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Guest'}</p>
              <p className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider">
                {isAdmin ? 'System Administrator' : 'Customer Account'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div>
          <p className="px-3 text-[10px] font-black uppercase tracking-wider text-indigo-300/60 mb-2">
            {isAdmin ? 'Management Operations' : 'Customer Portal'}
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-900/40'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge != null && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Platform Capabilities Section */}
        <div className="px-1 pt-3 border-t border-white/10">
          <p className="px-2 text-[10px] font-black uppercase tracking-wider text-indigo-300/60 mb-2.5">
            AI Platform Engine
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <Cpu className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <p className="font-semibold text-slate-200 text-xs">Groq AI Engine</p>
                <p className="text-[10px] text-slate-400">High-speed LLM inference</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-slate-200 text-xs">Duplicate Detection</p>
                <p className="text-[10px] text-slate-400">Fuzzy cross-matching</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <Languages className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <p className="font-semibold text-slate-200 text-xs">Tamil & English NLP</p>
                <p className="text-[10px] text-slate-400">Multilingual comprehension</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info & Sign out button */}
      <div className="space-y-3 pt-4 border-t border-white/10">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-indigo-800/40 text-xs">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hackathon Demo Ready</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 leading-snug">
            FastAPI Backend • SQLite • Groq LLaMA 3.3
          </p>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="w-64 shrink-0 hidden md:block min-h-[calc(100vh-4rem)]">
        {content}
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-50 animate-slide-in">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
