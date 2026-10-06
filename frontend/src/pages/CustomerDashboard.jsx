import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  PlusCircle, 
  ArrowRight, 
  FileText,
  AlertCircle,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import PriorityBadge, { StatusBadge } from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import complaintApi from '../services/api';

export default function CustomerDashboard({ user, onViewDetails, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, complaintsRes] = await Promise.all([
        complaintApi.getDashboardStats(),
        complaintApi.getComplaints({ limit: 10 }),
      ]);
      setStats(statsRes);
      setMyComplaints(complaintsRes);
    } catch (err) {
      console.error(err);
      setError('Unable to load your complaint history. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading your customer resolution dashboard..." size="lg" />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#120f29] via-[#1e1548] to-[#2d1b69] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-purple-950/20">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs text-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Customer Resolution Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome, {user?.name || 'Customer'}
            </h1>
            <p className="text-purple-200/80 text-xs sm:text-sm max-w-xl">
              Track the progress of your registered complaints in real time. Our Groq AI engine actively routes your issues to specialized support units.
            </p>
          </div>

          <button
            onClick={() => onNavigate('customer-new-complaint')}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit New Complaint</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span>{error}</span>
          </div>
          <button onClick={loadData} className="font-bold underline">Retry</button>
        </div>
      )}

      {/* 4 Customer Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="My Complaints"
          value={stats?.my_complaints ?? myComplaints.length}
          subtitle="Total tickets filed by you"
          icon={Inbox}
          color="indigo"
        />
        <StatsCard
          title="Pending"
          value={stats?.pending_complaints ?? 0}
          subtitle="Queued for triage"
          icon={Clock}
          color="amber"
          alert={(stats?.pending_complaints || 0) > 0}
        />
        <StatsCard
          title="In Progress"
          value={stats?.in_progress_complaints ?? 0}
          subtitle="Currently with support team"
          icon={Layers}
          color="blue"
        />
        <StatsCard
          title="Resolved"
          value={stats?.resolved_complaints ?? 0}
          subtitle="Successfully closed"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Main Section: My Recent Complaints */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">My Recent Complaints</h3>
            <p className="text-xs text-slate-500">Live overview of your personal grievance tickets</p>
          </div>
          <button
            onClick={() => onNavigate('customer-complaints')}
            className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors"
          >
            <span>View All ({myComplaints.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {myComplaints.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">You haven't submitted any complaints yet.</p>
            <p className="text-xs text-slate-400">If you are experiencing issues with an order or payment, file a complaint now.</p>
            <button
              onClick={() => onNavigate('customer-new-complaint')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit First Complaint</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myComplaints.map((c) => {
              const formattedDate = new Date(c.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={c.id}
                  onClick={() => onViewDetails(c.id)}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-purple-50/40 px-3 rounded-2xl cursor-pointer transition-colors group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-700 group-hover:text-purple-600 transition-colors">
                        #{c.id}
                      </span>
                      <span className="text-xs font-bold text-slate-900 truncate">{c.title}</span>
                      {c.order_id && (
                        <span className="text-[10px] font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                          {c.order_id}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{c.description}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                      {c.category}
                    </span>
                    <PriorityBadge priority={c.priority} />
                    <StatusBadge status={c.status} />
                    <span className="text-[11px] text-slate-400 ml-2 hidden md:inline">{formattedDate}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
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
