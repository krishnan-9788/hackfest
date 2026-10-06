import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Shield, LogOut, CheckCircle, ArrowRight } from 'lucide-react';
import complaintApi from '../services/api';

export default function CustomerProfile({ user, onLogout, onNavigate }) {
  const currentUser = user || complaintApi.auth.getUser() || {};
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    if (currentUser.email) {
      navigator.clipboard.writeText(currentUser.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-purple-900 to-violet-950 p-7 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-black shadow-lg ring-4 ring-white/10">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">{currentUser.name || 'Valued Customer'}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                  Customer
                </span>
              </div>
              <p className="text-indigo-200 text-sm mt-0.5">ComplaintIntel Verified Member</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('customer-new-complaint')}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white transition-all shadow-md flex items-center gap-1.5"
            >
              <span>File Complaint</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Account Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
          <p className="text-xs text-slate-500 mt-0.5">Your registered customer profile details used for complaint verification</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{currentUser.name || 'Not provided'}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</p>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <p className="text-sm font-bold text-slate-900 truncate">{currentUser.email || 'Not provided'}</p>
                <button
                  onClick={handleCopyEmail}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium shrink-0"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{currentUser.phone || '+91 98765 43210'}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Role</p>
              <p className="text-sm font-bold text-emerald-700 mt-0.5 capitalize flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Verified Customer</span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onNavigate('customer-complaints')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View all your submitted complaints & status tracking</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-slate-400">Secured with PBKDF2-SHA256 & JWT</span>
        </div>
      </div>
    </div>
  );
}
