import React, { useState } from 'react';
import { Send, Sparkles, AlertCircle, CheckCircle, Languages, ArrowRight, User, Mail, ShieldAlert } from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../components/PriorityBadge';
import complaintApi from '../services/api';

export default function CustomerNewComplaint({ user, onComplaintCreated, onViewDetails }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order_id: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const samplePresets = [
    {
      label: 'Tamil Delivery Delay',
      title: 'ஆர்டர் இன்னும் வரவில்லை',
      order_id: 'ORD-98213',
      description: 'என்னோட order இன்னும் வரல. 10 நாள் ஆகுது. customer support phone எடுத்தா cut பண்ணுறாங்க.',
    },
    {
      label: 'Critical Payment Debit',
      title: 'Amount debited twice from bank account',
      order_id: 'ORD-4491',
      description: 'During checkout on order #ORD-4491, payment showed failed but ₹8,999 was deducted twice from my bank account. Please reverse the extra charge immediately!',
    },
    {
      label: 'Defective Product & Angry',
      title: 'Completely broken display screen upon unboxing',
      order_id: 'ORD-6620',
      description: 'This is unacceptable! I opened package #ORD-6620 and the monitor screen is completely shattered! I need a replacement or refund right now.',
    },
  ];

  const handleApplyPreset = (preset) => {
    setFormData({
      title: preset.title,
      description: preset.description,
      order_id: preset.order_id,
    });
    setError(null);
    setResult(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please provide both a complaint title and description.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        order_id: formData.order_id.trim() || null,
        customer_name: user?.name,
        customer_email: user?.email,
      };

      const res = await complaintApi.createComplaint(payload);
      setResult(res);
      if (onComplaintCreated) onComplaintCreated(res);
    } catch (err) {
      setError(err.message || 'Failed to submit complaint. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-bold text-xs uppercase tracking-wider mb-2 border border-purple-100">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Customer Intake Portal</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Register a New Complaint
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Submissions are automatically analyzed by Groq AI to extract category, urgency, and route to the correct team.
        </p>
      </div>

      {/* Quick Demo Presets */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Languages className="w-4 h-4 text-purple-600" />
          <span>Quick Demo Presets:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-400 hover:text-purple-700 transition-all active:scale-95 shadow-2xs"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        {/* User Identity Banner (Pre-filled from session) */}
        <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
              {user?.name?.[0] || 'C'}
            </div>
            <div>
              <p className="font-bold text-slate-800">{user?.name || 'Customer'}</p>
              <p className="text-slate-500">{user?.email}</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-purple-700 bg-purple-100/60 px-2.5 py-1 rounded-lg self-start sm:self-auto">
            Account Verified & Auto-Linked
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Complaint Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                disabled={loading}
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief summary of the issue (e.g. Order delayed for 10 days)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-2xs disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Order / Transaction ID <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                name="order_id"
                disabled={loading}
                value={formData.order_id}
                onChange={handleChange}
                placeholder="e.g. ORD-98213"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-2xs disabled:bg-slate-50"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Complaint Description <span className="text-red-500">*</span>
              </label>
              <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-100">
                Supports English & Tamil text
              </span>
            </div>
            <textarea
              name="description"
              required
              rows={5}
              disabled={loading}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your issue in detail. You can type in English or Tamil (e.g. 'என்னோட order இன்னும் வரல. 10 நாள் ஆகுது.')."
              className="w-full p-4 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-2xs disabled:bg-slate-50"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing complaint with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Complaint</span>
                  <Send className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Customer-Safe AI Analysis Result Card */}
      {result && (
        <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-8 shadow-sm space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
            <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-sm">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Complaint submitted successfully. Ticket #{result.id} is now registered.</span>
            </div>
            {onViewDetails && (
              <button
                type="button"
                onClick={() => onViewDetails(result.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs self-start sm:self-auto"
              >
                <span>View Full Ticket</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {result.is_duplicate && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-xl flex items-center gap-2.5 text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Notice: Similar ongoing ticket #{result.duplicate_of_id} was identified in our system. Both are linked for faster resolution.</span>
            </div>
          )}

          {/* Customer-safe fields */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Ticket ID</p>
              <p className="text-sm font-black text-slate-800 mt-0.5">#{result.id}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Category</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{result.category}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Priority Urgency</p>
              <div className="mt-1"><PriorityBadge priority={result.priority} /></div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
              <div className="mt-1"><StatusBadge status={result.status} /></div>
            </div>
          </div>

          {result.summary && (
            <div className="p-4 bg-purple-50/40 rounded-2xl border border-purple-100 space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-purple-700">AI Complaint Summary</p>
              <p className="text-xs text-slate-700 leading-relaxed">{result.summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
