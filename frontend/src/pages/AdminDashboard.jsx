import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Clock, 
  AlertOctagon, 
  CheckCircle2, 
  Sparkles, 
  CopyCheck, 
  TrendingUp, 
  Building2, 
  AlertTriangle,
  ArrowRight,
  User,
  Calendar,
  Layers,
  ChevronRight,
  Database,
  ShieldCheck,
  Languages
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import PriorityBadge, { SentimentBadge, StatusBadge } from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import complaintApi from '../services/api';

export default function AdminDashboard({ onViewDetails, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, analyticsRes, complaintsRes] = await Promise.all([
        complaintApi.getDashboardStats(),
        complaintApi.getDashboardAnalytics(),
        complaintApi.getComplaints({ limit: 50 }),
      ]);
      setStats(statsRes);
      setAnalytics(analyticsRes);
      setAllComplaints(complaintsRes);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      setError('Unable to load dashboard metrics. Please ensure FastAPI backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const res = await complaintApi.seedDemoData();
      setSeedNotice(res.message || 'Demo data loaded successfully!');
      await loadDashboardData();
      setTimeout(() => setSeedNotice(null), 4000);
    } catch (e) {
      setSeedNotice('Failed to seed demo data.');
      setTimeout(() => setSeedNotice(null), 3000);
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Computing real-time AI intelligence metrics & charts..." size="lg" />;
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <AlertOctagon className="w-6 h-6 shrink-0 text-rose-600" />
          <div>
            <h4 className="font-bold text-sm">Dashboard Connection Error</h4>
            <p className="text-xs text-rose-600 mt-0.5">{error}</p>
          </div>
        </div>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-xs"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const priorityAttentionComplaints = allComplaints.filter(
    (c) => c.priority === 'Critical' || c.priority === 'High' || c.sentiment === 'Angry'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Admin Welcome & Action Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#120f29] via-[#1d1742] to-[#2a1b54] p-6 sm:p-7 text-white shadow-xl border border-indigo-900/60">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/40">
                Admin Console
              </span>
              <span className="text-xs text-indigo-300 font-medium">System Operator View</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              AI Operations & Triage Command Center
            </h1>
            <p className="text-indigo-200/90 text-xs sm:text-sm max-w-2xl">
              Real-time automated complaint classification, urgency detection, sentiment extraction, and intelligent customer response drafting powered by Groq LLM.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              title="Populate demo complaints for hackathon judges"
            >
              <Database className={`w-3.5 h-3.5 ${seeding ? 'animate-spin text-cyan-400' : 'text-cyan-400'}`} />
              <span>{seeding ? 'Seeding...' : 'Seed Demo Data'}</span>
            </button>
            <button
              onClick={loadDashboardData}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white transition-all shadow-md flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {seedNotice && (
          <div className="mt-4 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{seedNotice}</span>
          </div>
        )}
      </div>

      {/* 6 Key KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatsCard
          title="Total Complaints"
          value={stats?.total_complaints != null ? stats.total_complaints : 0}
          subtitle="All-time registered"
          icon={Inbox}
          color="indigo"
        />
        <StatsCard
          title="Pending Action"
          value={stats?.pending_complaints != null ? stats.pending_complaints : 0}
          subtitle="Awaiting triage"
          icon={Clock}
          color="amber"
          alert={(stats?.pending_complaints || 0) > 0}
        />
        <StatsCard
          title="High / Critical"
          value={stats?.high_critical_complaints != null ? stats.high_critical_complaints : 0}
          subtitle="Urgent resolution"
          icon={AlertOctagon}
          color="rose"
          alert={(stats?.high_critical_complaints || 0) > 0}
        />
        <StatsCard
          title="Resolved"
          value={stats?.resolved_complaints != null ? stats.resolved_complaints : 0}
          subtitle="Closed satisfactorily"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatsCard
          title="Duplicates"
          value={stats?.duplicate_count != null ? stats.duplicate_count : 0}
          subtitle="Flagged by system"
          icon={CopyCheck}
          color="blue"
        />
        <StatsCard
          title="AI Confidence"
          value={`${Math.round((stats?.avg_confidence || 0.85) * 100)}%`}
          subtitle="Average certainty"
          icon={Sparkles}
          color="purple"
        />
      </div>

      {/* Priority Attention Section */}
      <div className="bg-gradient-to-r from-rose-50/90 via-amber-50/40 to-slate-50 border border-rose-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100/90 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-600 text-white flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Priority Attention Queue</h3>
              <p className="text-xs text-rose-700 font-medium">
                Complaints requiring immediate executive intervention (Critical, High priority, or Angry sentiment)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
              {priorityAttentionComplaints.length} Urgent Tickets
            </span>
            <button
              onClick={() => onNavigate('admin-alerts')}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1"
            >
              <span>View All Alerts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {priorityAttentionComplaints.length === 0 ? (
          <div className="bg-white/80 rounded-xl p-6 text-center text-slate-500 text-xs border border-slate-200">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
            <p className="font-semibold text-slate-700">No urgent complaints requiring immediate attention.</p>
            <p className="text-slate-400 mt-0.5">All tickets are operating within standard SLA targets.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {priorityAttentionComplaints.slice(0, 6).map((c) => {
              const formattedDate = new Date(c.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={c.id}
                  onClick={() => onViewDetails(c.id)}
                  className="bg-white rounded-xl border border-rose-200/80 p-4 shadow-2xs hover:shadow-md hover:border-rose-300 cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                          #{c.id}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {c.category}
                        </span>
                      </div>
                      <PriorityBadge priority={c.priority} />
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={c.title}>
                      {c.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700 truncate">{c.customer_name}</span>
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <SentimentBadge sentiment={c.sentiment} />
                      <StatusBadge status={c.status} />
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {formattedDate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Category Distribution</h3>
              <p className="text-xs text-slate-400">Automated classification across 8 domain categories</p>
            </div>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="space-y-3 pt-1">
            {analytics?.by_category && analytics.by_category.length > 0 ? (
              analytics.by_category.map((cat) => {
                const total = stats?.total_complaints || 1;
                const percentage = Math.round((cat.count / total) * 100);
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{cat.name}</span>
                      <span className="text-slate-500">
                        {cat.count} tickets ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No category data recorded yet.</p>
            )}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Priority Distribution</h3>
              <p className="text-xs text-slate-400">Severity breakdown determined by Groq LLM</p>
            </div>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="space-y-3 pt-1">
            {analytics?.by_priority && analytics.by_priority.length > 0 ? (
              analytics.by_priority.map((p) => {
                const total = stats?.total_complaints || 1;
                const percentage = Math.round((p.count / total) * 100);
                const colorMap = {
                  Critical: 'bg-red-500',
                  High: 'bg-orange-500',
                  Medium: 'bg-amber-500',
                  Low: 'bg-emerald-500',
                };
                return (
                  <div key={p.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${colorMap[p.name] || 'bg-slate-400'}`}></span>
                        {p.name}
                      </span>
                      <span className="text-slate-500">
                        {p.count} tickets ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`${colorMap[p.name] || 'bg-slate-400'} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No priority data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
