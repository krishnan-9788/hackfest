import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Customer Pages
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegister from './pages/CustomerRegister';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerNewComplaint from './pages/CustomerNewComplaint';
import CustomerComplaints from './pages/CustomerComplaints';
import CustomerComplaintDetails from './pages/CustomerComplaintDetails';
import CustomerProfile from './pages/CustomerProfile';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminComplaints from './pages/AdminComplaints';
import AdminComplaintDetails from './pages/AdminComplaintDetails';
import AdminAlerts from './pages/AdminAlerts';
import AdminAnalytics from './pages/AdminAnalytics';

import complaintApi from './services/api';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return complaintApi?.auth?.getUser ? complaintApi.auth.getUser() : null;
    } catch {
      return null;
    }
  });

  const [currentTab, setCurrentTab] = useState(() => {
    try {
      const path = typeof window !== 'undefined' ? window.location.pathname : '/';
      const initialUser = complaintApi?.auth?.getUser ? complaintApi.auth.getUser() : null;

      if (path.includes('/customer/register')) return 'customer-register';
      if (path.includes('/customer/login')) return 'customer-login';
      if (path.includes('/admin/login')) return 'admin-login';
      if (path.includes('/customer/new-complaint')) return 'customer-new-complaint';
      if (path.includes('/customer/complaints')) return 'customer-complaints';
      if (path.includes('/customer/profile')) return 'customer-profile';
      if (path.includes('/admin/complaints')) return 'admin-complaints';
      if (path.includes('/admin/alerts')) return 'admin-alerts';
      if (path.includes('/admin/analytics')) return 'admin-analytics';
      if (path.includes('/admin/dashboard')) return 'admin-dashboard';
      if (path.includes('/customer/dashboard')) return 'customer-dashboard';

      // Default based on login state
      if (initialUser?.role === 'admin') return 'admin-dashboard';
      if (initialUser?.role === 'customer') return 'customer-dashboard';
      return 'customer-login';
    } catch {
      return 'customer-login';
    }
  });

  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [stats, setStats] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync URL bar with tab
  const syncUrl = (tab, id = null) => {
    let path = '/';
    switch (tab) {
      case 'customer-login':
        path = '/customer/login';
        break;
      case 'customer-register':
        path = '/customer/register';
        break;
      case 'admin-login':
        path = '/admin/login';
        break;
      case 'customer-dashboard':
        path = '/customer/dashboard';
        break;
      case 'customer-new-complaint':
        path = '/customer/new-complaint';
        break;
      case 'customer-complaints':
        path = '/customer/complaints';
        break;
      case 'customer-complaint-details':
        path = id ? `/customer/complaints/${id}` : '/customer/complaints';
        break;
      case 'customer-profile':
        path = '/customer/profile';
        break;
      case 'admin-dashboard':
        path = '/admin/dashboard';
        break;
      case 'admin-complaints':
        path = '/admin/complaints';
        break;
      case 'admin-complaint-details':
        path = id ? `/admin/complaints/${id}` : '/admin/complaints';
        break;
      case 'admin-alerts':
        path = '/admin/alerts';
        break;
      case 'admin-analytics':
        path = '/admin/analytics';
        break;
      default:
        path = '/';
    }
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await complaintApi.getDashboardStats();
      setStats(data);
    } catch (e) {
      // User might be logged out or server offline
    }
  };

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, currentTab]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.includes('/customer/register')) setCurrentTab('customer-register');
      else if (path.includes('/customer/login')) setCurrentTab('customer-login');
      else if (path.includes('/admin/login')) setCurrentTab('admin-login');
      else if (path.includes('/customer/new-complaint')) setCurrentTab('customer-new-complaint');
      else if (path.includes('/customer/complaints/')) {
        const id = parseInt(path.split('/customer/complaints/')[1]);
        if (id) {
          setSelectedComplaintId(id);
          setCurrentTab('customer-complaint-details');
        }
      } else if (path.includes('/customer/complaints')) setCurrentTab('customer-complaints');
      else if (path.includes('/customer/profile')) setCurrentTab('customer-profile');
      else if (path.includes('/admin/complaints/')) {
        const id = parseInt(path.split('/admin/complaints/')[1]);
        if (id) {
          setSelectedComplaintId(id);
          setCurrentTab('admin-complaint-details');
        }
      } else if (path.includes('/admin/complaints')) setCurrentTab('admin-complaints');
      else if (path.includes('/admin/alerts')) setCurrentTab('admin-alerts');
      else if (path.includes('/admin/analytics')) setCurrentTab('admin-analytics');
      else if (path.includes('/admin/dashboard')) setCurrentTab('admin-dashboard');
      else if (path.includes('/customer/dashboard')) setCurrentTab('customer-dashboard');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (tab) => {
    // Role-based route guard
    if (tab.startsWith('admin-') && user?.role !== 'admin') {
      tab = user?.role === 'customer' ? 'customer-dashboard' : 'admin-login';
    } else if (tab.startsWith('customer-') && tab !== 'customer-login' && tab !== 'customer-register' && user?.role !== 'customer') {
      tab = user?.role === 'admin' ? 'admin-dashboard' : 'customer-login';
    }

    setCurrentTab(tab);
    setMobileMenuOpen(false);
    if (!tab.endsWith('-details')) {
      setSelectedComplaintId(null);
    }
    syncUrl(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (id) => {
    setSelectedComplaintId(id);
    const targetTab = user?.role === 'admin' ? 'admin-complaint-details' : 'customer-complaint-details';
    setCurrentTab(targetTab);
    setMobileMenuOpen(false);
    syncUrl(targetTab, id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    if (userData.role === 'admin') {
      setCurrentTab('admin-dashboard');
      syncUrl('admin-dashboard');
    } else {
      setCurrentTab('customer-dashboard');
      syncUrl('customer-dashboard');
    }
  };

  const handleLogout = () => {
    complaintApi.auth.clear();
    setUser(null);
    setSelectedComplaintId(null);
    setCurrentTab('customer-login');
    syncUrl('customer-login');
  };

  // Determine if full-screen auth layout (login/register)
  const isAuthPage = ['customer-login', 'customer-register', 'admin-login'].includes(currentTab);

  return (
    <div className="w-full min-h-screen bg-[#f8f9fd] flex flex-col text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        user={user}
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onSeedCompleted={fetchStats}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
      />

      {/* Main Screen Layout Container - 100% Edge-to-Edge */}
      <div className="flex-1 w-full flex">
        {/* Render dark sidebar only when logged in */}
        {!isAuthPage && user && (
          <Sidebar
            user={user}
            currentTab={currentTab}
            onNavigate={handleNavigate}
            stats={stats}
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
            onLogout={handleLogout}
          />
        )}

        {/* Dynamic Content View Area */}
        <main className={`flex-1 min-w-0 ${isAuthPage ? 'p-0 flex items-center justify-center' : 'p-4 sm:p-6 lg:p-8'}`}>
          {/* Public / Auth Pages */}
          {currentTab === 'customer-login' && (
            <div className="w-full">
              <CustomerLogin
                onLoginSuccess={handleLoginSuccess}
                onNavigate={handleNavigate}
                onNavigateToRegister={() => handleNavigate('customer-register')}
                onNavigateToAdmin={() => handleNavigate('admin-login')}
              />
            </div>
          )}

          {currentTab === 'customer-register' && (
            <div className="w-full">
              <CustomerRegister
                onRegisterSuccess={handleLoginSuccess}
                onNavigate={handleNavigate}
                onNavigateToLogin={() => handleNavigate('customer-login')}
              />
            </div>
          )}

          {currentTab === 'admin-login' && (
            <div className="w-full">
              <AdminLogin
                onLoginSuccess={handleLoginSuccess}
                onNavigate={handleNavigate}
                onNavigateToCustomer={() => handleNavigate('customer-login')}
              />
            </div>
          )}

          {/* Customer Authenticated Pages */}
          {currentTab === 'customer-dashboard' && (
            <CustomerDashboard
              user={user}
              onNavigate={handleNavigate}
              onViewDetails={handleViewDetails}
            />
          )}

          {currentTab === 'customer-new-complaint' && (
            <CustomerNewComplaint
              user={user}
              onViewDetails={handleViewDetails}
            />
          )}

          {currentTab === 'customer-complaints' && (
            <CustomerComplaints
              onViewDetails={handleViewDetails}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'customer-complaint-details' && selectedComplaintId && (
            <CustomerComplaintDetails
              complaintId={selectedComplaintId}
              onBack={() => handleNavigate('customer-complaints')}
            />
          )}

          {currentTab === 'customer-profile' && (
            <CustomerProfile
              user={user}
              onLogout={handleLogout}
              onNavigate={handleNavigate}
            />
          )}

          {/* Admin Authenticated Pages */}
          {currentTab === 'admin-dashboard' && (
            <AdminDashboard
              onViewDetails={handleViewDetails}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'admin-complaints' && (
            <AdminComplaints
              onViewDetails={handleViewDetails}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'admin-complaint-details' && selectedComplaintId && (
            <AdminComplaintDetails
              complaintId={selectedComplaintId}
              onBack={() => handleNavigate('admin-complaints')}
              onStatusUpdated={fetchStats}
            />
          )}

          {currentTab === 'admin-alerts' && (
            <AdminAlerts
              onViewDetails={handleViewDetails}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'admin-analytics' && (
            <AdminAnalytics />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (When Logged In) */}
      {!isAuthPage && user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#110d28]/95 backdrop-blur-md border-t border-[#1e1742] z-30 flex justify-around py-2 px-3 shadow-2xl text-slate-300">
          {user.role === 'admin' ? (
            <>
              <button
                onClick={() => handleNavigate('admin-dashboard')}
                className={`text-[11px] font-bold flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
                  currentTab === 'admin-dashboard' ? 'text-indigo-400 bg-white/10' : 'text-slate-400'
                }`}
              >
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => handleNavigate('admin-complaints')}
                className={`text-[11px] font-bold flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
                  currentTab === 'admin-complaints' ? 'text-indigo-400 bg-white/10' : 'text-slate-400'
                }`}
              >
                <span>Complaints</span>
              </button>
              <button
                onClick={() => handleNavigate('admin-alerts')}
                className={`text-[11px] font-bold flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
                  currentTab === 'admin-alerts' ? 'text-rose-400 bg-white/10' : 'text-slate-400'
                }`}
              >
                <span>Alerts</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavigate('customer-dashboard')}
                className={`text-[11px] font-bold flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
                  currentTab === 'customer-dashboard' ? 'text-cyan-400 bg-white/10' : 'text-slate-400'
                }`}
              >
                <span>Home</span>
              </button>
              <button
                onClick={() => handleNavigate('customer-complaints')}
                className={`text-[11px] font-bold flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
                  currentTab === 'customer-complaints' ? 'text-cyan-400 bg-white/10' : 'text-slate-400'
                }`}
              >
                <span>Complaints</span>
              </button>
              <button
                onClick={() => handleNavigate('customer-new-complaint')}
                className={`text-[11px] font-bold flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
                  currentTab === 'customer-new-complaint' ? 'text-cyan-400 bg-white/10' : 'text-slate-400'
                }`}
              >
                <span>+ New</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
