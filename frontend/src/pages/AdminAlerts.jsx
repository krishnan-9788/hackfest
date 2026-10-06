import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Flame, 
  CopyCheck, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Clock, 
  ShieldAlert,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import PriorityBadge, { SentimentBadge, StatusBadge } from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import complaintApi from '../services/api';

export default function AdminAlerts({ onViewDetails }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('critical'); // 'critical', 'angry', 'duplicate'
  const [error, setError] = useState(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await complaintApi.getComplaints({ limit: 100 });
      setComplaints(data);
    } catch (err) {
      console.error(err);
      setError('Unable to load triage alert queues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const criticalComplaints = complaints.filter(
    (c) => c.priority === 'Critical' || c.priority === 'High'
  );
  const angryComplaints = complaints.filter(
    (c) => c.sentiment === 'Angry' || c.sentiment === 'Frustrated'
  );
  const duplicateComplaints = complaints.filter((c) => c.is_duplicate);

  const currentList =
    activeTab === 'critical'
      ? criticalComplaints
      : activeTab === 'angry'
      ? angryComplaints
      : duplicateComplaints;

  if (loading) {
    return <LoadingSpinner text="Scanning complaint streams for urgency anomalies & duplicate alerts..." size="lg" />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#161233] via-[#211b4e] to-[#120f29] rounded-2xl p-6 sm:p-7 text-white shadow-xl border border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Executive Priority Alerts & Triage</h1>
          </div>
          <p className="text-indigo-200 text-xs sm:text-sm mt-1">
            Real-time automated incident detection for SLA breaches, angry customers, and duplicate spam submissions.
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="px-3.5 py-2 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Feeds</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setActiveTab('critical')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'critical'
              ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-400/40 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical & High Priority</span>
            <AlertTriangle className={`w-4 h-4 ${activeTab === 'critical' ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <p className="text-2xl font-black text-rose-700">{criticalComplaints.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Urgent SLA risk / financial loss tickets</p>
        </button>

        <button
          onClick={() => setActiveTab('angry')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'angry'
              ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/40 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Angry / Churn Risk</span>
            <Flame className={`w-4 h-4 ${activeTab === 'angry' ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <p className="text-2xl font-black text-amber-700">{angryComplaints.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Dissatisfied customers needing empathy</p>
        </button>

        <button
          onClick={() => setActiveTab('duplicate')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'duplicate'
              ? 'bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-400/40 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duplicate Submissions</span>
            <CopyCheck className={`w-4 h-4 ${activeTab === 'duplicate' ? 'text-indigo-600' : 'text-slate-400'}`} />
          </div>
          <p className="text-2xl font-black text-indigo-700">{duplicateComplaints.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Cross-customer / repeated spam entries</p>
        </button>
      </div>

      {/* Alert Items List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Showing {currentList.length} {activeTab} incidents
          </span>
          <span className="text-xs text-slate-500">Click any ticket to inspect & generate AI response</span>
        </div>

        {currentList.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No active alerts in this queue.</p>
            <p className="text-xs text-slate-400">All metrics are within nominal operational parameters.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {currentList.map((c) => {
              const formattedDate = new Date(c.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={c.id}
                  onClick={() => onViewDetails(c.id)}
                  className="p-5 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                        #{c.id}
                      </span>
                      <PriorityBadge priority={c.priority} />
                      <SentimentBadge sentiment={c.sentiment} />
                      <StatusBadge status={c.status} />
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {c.category}
                      </span>
                      {c.is_duplicate && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                          <CopyCheck className="w-3 h-3" />
                          <span>Duplicate #{c.duplicate_of_id || 'Matched'}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {c.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {c.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span>Customer: <strong className="text-slate-600">{c.customer_name}</strong> ({c.customer_email})</span>
                      <span>•</span>
                      <span>Assigned: <strong className="text-slate-600">{c.department}</strong></span>
                      <span>•</span>
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(c.id);
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <span>Triage & Resolve</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
