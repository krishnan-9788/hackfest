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
  ChevronRight
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import PriorityBadge, { SentimentBadge, StatusBadge } from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import complaintApi from '../services/api';

export default function Dashboard({ onViewDetails, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      console.error('Failed to load dashboard:', err);
      setError('Unable to load dashboard metrics. Please ensure the FastAPI backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Computing real-time AI intelligence metrics & charts..." size="lg" />;
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <AlertOctagon className="w-6 h-6 flex-shrink-0 text-rose-600" />
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

  // Filter for Priority Attention complaints: Critical, High priority, or Angry sentiment
  const priorityAttentionComplaints = allComplaints.filter(
    (c) => c.priority === 'Critical' || c.priority === 'High' || c.sentiment === 'Angry'
  );

  const recentComplaintsPreview = allComplaints.slice(0, 6);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner & Quick Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Executive Intelligence Dashboard</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time automated complaint classification, sentiment detection, urgency triage, and routing.
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          className="self-start sm:self-auto text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs flex items-center gap-1.5"
          title="Refresh metrics from backend"
        >
          <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 6 Key KPI Metric Cards (Real backend numbers) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
      <div className="bg-gradient-to-r from-rose-50/80 via-amber-50/40 to-slate-50 border border-rose-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Priority Attention</h3>
              <p className="text-xs text-rose-700 font-medium">
                Complaints requiring immediate executive intervention (Critical, High priority, or Angry sentiment)
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 self-start sm:self-auto">
            {priorityAttentionComplaints.length} Urgent Tickets
          </span>
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
                  className="bg-white rounded-xl border border-rose-200/70 p-4 shadow-2xs hover:shadow-md hover:border-rose-300 cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    {/* Header: ID, Category & Priority */}
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

                    {/* Title */}
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={c.title}>
                      {c.title}
                    </h4>

                    {/* Customer */}
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                      <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="font-medium text-slate-700 truncate">{c.customer_name}</span>
                    </p>
                  </div>

                  {/* Footer: Sentiment, Status, Date */}
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

      {/* Visual Analytics Charts Grid (4 Charts from Backend) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Category Distribution Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Category Distribution</h3>
              <p className="text-xs text-slate-400">Automated classification across 8 controlled domains</p>
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
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
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

        {/* 2. Priority Distribution Chart */}
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

        {/* 3. Sentiment Distribution Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sentiment Distribution</h3>
              <p className="text-xs text-slate-400">Customer tone and emotional state assessment</p>
            </div>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {[
              { name: 'Positive', emoji: '😊', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
              { name: 'Neutral', emoji: '😐', bg: 'bg-slate-50 text-slate-800 border-slate-300' },
              { name: 'Negative', emoji: '😟', bg: 'bg-orange-50 text-orange-800 border-orange-300' },
              { name: 'Angry', emoji: '😡', bg: 'bg-red-50 text-red-800 border-red-300' },
            ].map((sItem) => {
              const item = analytics?.by_sentiment?.find(
                (s) => s.name.toLowerCase() === sItem.name.toLowerCase()
              );
              const count = item ? item.count : 0;
              const total = stats?.total_complaints || 1;
              const pct = Math.round((count / total) * 100);

              return (
                <div
                  key={sItem.name}
                  className={`p-4 rounded-xl border ${sItem.bg} flex flex-col items-center justify-center text-center space-y-1 shadow-2xs`}
                >
                  <span className="text-2xl">{sItem.emoji}</span>
                  <p className="text-xs font-bold uppercase tracking-wider">{sItem.name}</p>
                  <p className="text-xl font-black">{count}</p>
                  <p className="text-[11px] opacity-75">{pct}% of total</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Department Routing Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Routing</h3>
              <p className="text-xs text-slate-400">Automated triage destinations</p>
            </div>
            <Building2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="space-y-3 pt-1">
            {analytics?.by_department && analytics.by_department.length > 0 ? (
              analytics.by_department.map((dept) => {
                const total = stats?.total_complaints || 1;
                const percentage = Math.round((dept.count / total) * 100);
                return (
                  <div key={dept.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {dept.name}
                      </span>
                      <span className="text-slate-500">
                        {dept.count} tickets ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No department routing records yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Table Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Complaints Queue</h3>
            <p className="text-xs text-slate-500">Latest tickets ingested and processed by the intelligence engine</p>
          </div>
          <button
            onClick={() => onNavigate('complaints')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            <span>View All ({stats?.total_complaints || 0})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentComplaintsPreview.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No complaints registered yet. Try submitting one!</p>
          ) : (
            recentComplaintsPreview.map((c) => (
              <div
                key={c.id}
                onClick={() => onViewDetails(c.id)}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl cursor-pointer transition-colors group"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">
                      #{c.id}
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate">{c.title}</span>
                    {c.is_duplicate && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        Duplicate
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{c.description}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {c.category}
                  </span>
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors hidden sm:block" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
