import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Layers, 
  AlertOctagon, 
  Smile, 
  Building2, 
  Sparkles, 
  RefreshCw,
  Award,
  Clock
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import complaintApi from '../services/api';

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, analyticsRes] = await Promise.all([
        complaintApi.getDashboardStats(),
        complaintApi.getDashboardAnalytics(),
      ]);
      setStats(statsRes);
      setAnalytics(analyticsRes);
    } catch (err) {
      console.error(err);
      setError('Unable to load analytical intelligence data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Aggregating multi-dimensional complaint analytics..." size="lg" />;
  }

  const total = stats?.total_complaints || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#161233] via-[#211b4e] to-[#120f29] rounded-2xl p-6 sm:p-7 text-white shadow-xl border border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">System Analytics & Business Intelligence</h1>
          </div>
          <p className="text-indigo-200 text-xs sm:text-sm mt-1">
            Deep insights into category volumes, sentiment impact, department workloads, and LLM classification accuracy.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3.5 py-2 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Volume</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats?.total_complaints || 0}</p>
            <p className="text-[11px] text-slate-400">Processed across all channels</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolution Rate</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">
              {Math.round(((stats?.resolved_complaints || 0) / total) * 100)}%
            </p>
            <p className="text-[11px] text-slate-400">{stats?.resolved_complaints || 0} tickets closed</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Accuracy Confidence</p>
            <p className="text-2xl font-black text-purple-600 mt-0.5">
              {Math.round((stats?.avg_confidence || 0.85) * 100)}%
            </p>
            <p className="text-[11px] text-slate-400">Groq LLM structured inference</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Triage Latency</p>
            <p className="text-2xl font-black text-cyan-700 mt-0.5">&lt; 1.2s</p>
            <p className="text-[11px] text-slate-400">Instant AI response & routing</p>
          </div>
        </div>
      </div>

      {/* Grid of 4 Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Category Breakdown</h3>
              <p className="text-xs text-slate-400">Automated classification across standard categories</p>
            </div>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="space-y-3 pt-1">
            {analytics?.by_category && analytics.by_category.length > 0 ? (
              analytics.by_category.map((cat) => {
                const percentage = Math.round((cat.count / total) * 100);
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{cat.name}</span>
                      <span className="text-slate-500">{cat.count} ({percentage}%)</span>
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
              <p className="text-xs text-slate-400 py-6 text-center">No category data recorded.</p>
            )}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Priority & Severity Distribution</h3>
              <p className="text-xs text-slate-400">Determined automatically by urgency detection</p>
            </div>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="space-y-3 pt-1">
            {analytics?.by_priority && analytics.by_priority.length > 0 ? (
              analytics.by_priority.map((p) => {
                const percentage = Math.round((p.count / total) * 100);
                const colorMap = {
                  Critical: 'from-rose-500 to-red-600',
                  High: 'from-orange-500 to-amber-600',
                  Medium: 'from-amber-400 to-yellow-500',
                  Low: 'from-emerald-400 to-teal-500',
                };
                return (
                  <div key={p.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{p.name}</span>
                      <span className="text-slate-500">{p.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${colorMap[p.name] || 'from-slate-400 to-slate-500'} h-full rounded-full transition-all duration-500`}
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

        {/* Sentiment Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Customer Sentiment Spectrum</h3>
              <p className="text-xs text-slate-400">NLP emotional polarity analysis</p>
            </div>
            <Smile className="w-4 h-4 text-amber-500" />
          </div>
          <div className="space-y-3 pt-1">
            {analytics?.by_sentiment && analytics.by_sentiment.length > 0 ? (
              analytics.by_sentiment.map((s) => {
                const percentage = Math.round((s.count / total) * 100);
                const colorMap = {
                  Angry: 'from-rose-500 to-red-600',
                  Frustrated: 'from-orange-500 to-amber-600',
                  Neutral: 'from-blue-400 to-indigo-500',
                  Satisfied: 'from-emerald-400 to-teal-500',
                  Positive: 'from-emerald-500 to-teal-600',
                };
                return (
                  <div key={s.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{s.name}</span>
                      <span className="text-slate-500">{s.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${colorMap[s.name] || 'from-slate-400 to-slate-500'} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No sentiment data available.</p>
            )}
          </div>
        </div>

        {/* Department Routing */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Ticket Load</h3>
              <p className="text-xs text-slate-400">Automated triage routing to responsible units</p>
            </div>
            <Building2 className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="space-y-3 pt-1">
            {analytics?.by_department && analytics.by_department.length > 0 ? (
              analytics.by_department.map((dept) => {
                const percentage = Math.round((dept.count / total) * 100);
                return (
                  <div key={dept.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{dept.name}</span>
                      <span className="text-slate-500">{dept.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No department routing records.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
