import React, { useState } from 'react';
import { Send, Sparkles, AlertCircle, CheckCircle, RefreshCw, Languages, ArrowRight } from 'lucide-react';
import complaintApi from '../services/api';
import AnalysisResult from './AnalysisResult';

export default function ComplaintForm({ onComplaintCreated, onViewDetails }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    title: '',
    description: '',
    order_id: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);

  // Quick demo presets requested
  const samplePresets = [
    {
      label: 'Tamil Delivery Delay',
      customer_name: 'சரவணன் குமார்',
      customer_email: 'saravanan.k@example.com',
      title: 'ஆர்டர் இன்னும் வந்து சேரவில்லை',
      description: 'என்னோட order இன்னும் வரல. 10 நாள் ஆகுது. customer support phone எடுத்தா cut பண்ணுறாங்க. உடனே அனுப்ப ஏற்பாடு பண்ணுங்க.',
      order_id: 'ORD-99321',
    },
    {
      label: 'Critical Payment Debit',
      customer_name: 'Anjali Verma',
      customer_email: 'anjali.v@example.com',
      title: 'Double charged ₹8,999 on credit card',
      description: 'During checkout on order #ORD-4491, payment showed failed but ₹8,999 was deducted twice from my ICICI credit card. Please reverse the extra charge immediately!',
      order_id: 'ORD-4491',
    },
    {
      label: 'Defective Product & Angry',
      customer_name: 'Rohan Mehra',
      customer_email: 'rohan.m@example.com',
      title: 'Completely broken display screen upon unboxing',
      description: 'This is ridiculous! I opened package #ORD-6620 and the monitor screen is completely shattered! I need a replacement or refund right now or I will contact consumer forum.',
      order_id: 'ORD-6620',
    },
  ];

  const handleApplyPreset = (preset) => {
    setFormData({
      customer_name: preset.customer_name,
      customer_email: preset.customer_email,
      title: preset.title,
      description: preset.description,
      order_id: preset.order_id,
    });
    setError(null);
    setSuccessResult(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate submission

    // Basic frontend validation
    if (!formData.customer_name.trim() || !formData.customer_email.trim() || !formData.title.trim() || !formData.description.trim()) {
      setError('Please complete all mandatory fields marked with an asterisk (*).');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await complaintApi.createComplaint(formData);
      setSuccessResult(result);
      if (onComplaintCreated) {
        onComplaintCreated(result);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit complaint. Please check your inputs and backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      customer_name: '',
      customer_email: '',
      title: '',
      description: '',
      order_id: '',
    });
    setSuccessResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Preset Quick Fill Bar for Hackathon Demo */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Languages className="w-4 h-4 text-indigo-600" />
          <span>Quick Demo Presets:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-2xs active:scale-95"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Submission Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customer_name"
                required
                disabled={loading}
                value={formData.customer_name}
                onChange={handleChange}
                placeholder="e.g. Ramesh"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:opacity-75"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Customer Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="customer_email"
                required
                disabled={loading}
                value={formData.customer_email}
                onChange={handleChange}
                placeholder="e.g. ramesh@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:opacity-75"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Complaint Title */}
            <div className="md:col-span-2">
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
                placeholder="e.g. Order delayed for 10 days"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:opacity-75"
              />
            </div>

            {/* Order/Transaction ID */}
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:opacity-75"
              />
            </div>
          </div>

          {/* Complaint Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Complaint Description <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
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
              placeholder="Describe the complaint in detail. You can write in English or Tamil (e.g. 'என்னோட order இன்னும் வரல. 10 நாள் ஆகுது.')."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:opacity-75"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2.5 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Form
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing complaint with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze & Register Complaint</span>
                  <Send className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Real-time AI Analysis Result Display */}
      {successResult && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 px-5 py-3 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-sm">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Complaint #{successResult.id} Registered & AI Analyzed Successfully!</span>
            </div>
            {onViewDetails && (
              <button
                type="button"
                onClick={() => onViewDetails(successResult.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs self-start sm:self-auto"
              >
                <span>Open Ticket Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <AnalysisResult
            analysis={{
              category: successResult.category,
              priority: successResult.priority,
              department: successResult.department,
              sentiment: successResult.sentiment,
              summary: successResult.summary,
              suggested_action: successResult.suggested_action,
              suggested_response: successResult.suggested_response,
              confidence: successResult.confidence,
            }}
            isDuplicate={successResult.is_duplicate}
            duplicateReason={successResult.duplicate_reason}
            duplicateOfId={successResult.duplicate_of_id}
          />
        </div>
      )}
    </div>
  );
}
