import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Mail, 
  User, 
  Clock, 
  Building2, 
  CheckCircle, 
  Copy, 
  Check, 
  AlertTriangle,
  Lightbulb,
  FileText,
  MessageSquare,
  Send,
  RefreshCw
} from 'lucide-react';
import { PriorityBadge, StatusBadge, SentimentBadge } from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import complaintApi from '../services/api';

export default function ComplaintDetails({ complaintId, onBack, onStatusUpdated }) {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status updating
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const [statusNotice, setStatusNotice] = useState(null);

  // AI Reply Generator state
  const [generatingReply, setGeneratingReply] = useState(false);
  const [generatedReply, setGeneratedReply] = useState('');
  const [customInstruction, setCustomInstruction] = useState('');
  const [copiedReply, setCopiedReply] = useState(false);

  // Instruction presets requested
  const instructionPresets = [
    'Make the response more apologetic.',
    'Make the response short and professional.',
    'Offer an expedited delivery guarantee within 24h.',
    'Confirm refund initiation with finance clearance.',
  ];

  useEffect(() => {
    loadComplaintDetails();
  }, [complaintId]);

  const loadComplaintDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await complaintApi.getComplaintById(complaintId);
      setComplaint(data);
      setSelectedStatus(data.status);
      if (data.suggested_response) {
        setGeneratedReply(data.suggested_response);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load complaint details. Please verify backend connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const updated = await complaintApi.updateStatus(complaintId, newStatus);
      setComplaint(updated);
      setSelectedStatus(updated.status);
      setStatusNotice(`Status updated to "${updated.status}"`);
      setTimeout(() => setStatusNotice(null), 3000);
      if (onStatusUpdated) onStatusUpdated(updated);
    } catch (err) {
      alert('Failed to update status: ' + (err.message || 'Server error'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleGenerateReply = async () => {
    try {
      setGeneratingReply(true);
      const res = await complaintApi.generateReply(complaintId, customInstruction);
      setGeneratedReply(res.generated_reply);
    } catch (err) {
      alert('Failed to generate AI reply: ' + (err.message || 'Server error'));
    } finally {
      setGeneratingReply(false);
    }
  };

  const handleCopyReply = () => {
    if (!generatedReply) return;
    navigator.clipboard.writeText(generatedReply);
    setCopiedReply(true);
    setTimeout(() => setCopiedReply(false), 2000);
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving complete complaint records & AI insights..." size="lg" />;
  }

  if (error || !complaint) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl space-y-3 shadow-2xs">
        <p className="font-semibold text-sm">{error || 'Complaint ticket not found.'}</p>
        <button
          onClick={onBack}
          className="text-xs font-bold px-3 py-1.5 bg-white border border-red-300 rounded-lg text-red-700 hover:bg-red-100"
        >
          Return to All Complaints
        </button>
      </div>
    );
  }

  const confidencePct = Math.round((complaint.confidence || 0.85) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Back Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Complaints</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Update Status:</span>
            {statusNotice && (
              <span className="text-xs font-semibold text-emerald-600 animate-pulse bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {statusNotice}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {['Pending', 'In Progress', 'Resolved'].map((st) => {
              const isSelected = selectedStatus === st;
              const buttonColors = {
                Pending: isSelected ? 'bg-amber-500 text-white ring-2 ring-amber-200' : 'bg-amber-50 text-amber-700 hover:bg-amber-100',
                'In Progress': isSelected ? 'bg-blue-600 text-white ring-2 ring-blue-200' : 'bg-blue-50 text-blue-700 hover:bg-blue-100',
                Resolved: isSelected ? 'bg-emerald-600 text-white ring-2 ring-emerald-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
              };

              return (
                <button
                  key={st}
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs disabled:opacity-50 ${buttonColors[st]}`}
                >
                  {updatingStatus && selectedStatus === st ? 'Saving...' : st}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Duplicate Alert if triggered */}
      {complaint.is_duplicate && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-2xl flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-bold text-amber-900">⚠ Possible Duplicate Complaint</h5>
            <p className="text-xs text-amber-800 mt-0.5">
              {complaint.duplicate_reason || 'A highly similar complaint was found in the database.'}{' '}
              {complaint.duplicate_of_id && (
                <span className="font-bold underline ml-1">
                  Original Reference: Complaint #{complaint.duplicate_of_id}
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Customer & Complaint (Left) + AI Analysis (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer & Ticket metadata */}
        <div className="lg:col-span-1 space-y-6">
          {/* Customer Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Customer Profile</h4>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Customer Name</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{complaint.customer_name}</p>
              </div>

              <div>
                <p className="text-slate-400 font-medium">Email Address</p>
                <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {complaint.customer_email}
                </p>
              </div>

              {complaint.order_id && (
                <div>
                  <p className="text-slate-400 font-medium">Order / Transaction ID</p>
                  <p className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg inline-block mt-0.5 border border-indigo-100">
                    {complaint.order_id}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <p className="text-slate-400 font-medium">Registered Date & Time</p>
                <p className="text-slate-700 mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(complaint.created_at).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Department & Triage Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Assigned Routing
            </h4>
            <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>{complaint.department}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 font-medium">Severity Priority:</span>
              <PriorityBadge priority={complaint.priority} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Customer Sentiment:</span>
              <SentimentBadge sentiment={complaint.sentiment} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Lifecycle Status:</span>
              <StatusBadge status={complaint.status} />
            </div>
          </div>
        </div>

        {/* Right Column: Complaint Text + AI Intelligence */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complaint Text Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Complaint Ticket #{complaint.id}
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {complaint.category}
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 leading-snug">{complaint.title}</h2>
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                {complaint.description}
              </div>
            </div>
          </div>

          {/* AI Intelligence Insights Card */}
          <div className="bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 rounded-2xl border border-indigo-100 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-indigo-100/60 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">AI Deep Analysis & Insights</h3>
              </div>
              <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                AI Confidence: {confidencePct}%
              </div>
            </div>

            {/* AI Summary */}
            {complaint.summary && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Executive Summary</p>
                <p className="text-sm text-slate-800 bg-white p-3.5 rounded-xl border border-slate-200/80 leading-relaxed">
                  {complaint.summary}
                </p>
              </div>
            )}

            {/* AI Recommended Action */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                <Lightbulb className="w-4 h-4 text-emerald-600" />
                Recommended Action for Support Team
              </div>
              <p className="text-sm text-emerald-950 font-medium leading-relaxed">
                {complaint.suggested_action || 'Review complaint details and route to the appropriate department.'}
              </p>
            </div>
          </div>

          {/* AI Customer Reply Generator Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">AI Customer Reply Assistant</h4>
                  <p className="text-xs text-slate-500">Generate or customize a polite response ready to send</p>
                </div>
              </div>

              <button
                onClick={handleGenerateReply}
                disabled={generatingReply}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs disabled:opacity-50"
              >
                {generatingReply ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Writing Reply with Groq...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Reply</span>
                  </>
                )}
              </button>
            </div>

            {/* Custom instruction presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600">
                  Custom Instruction or Tone:
                </label>
                <span className="text-[11px] text-slate-400">Click a preset below or type custom text</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {instructionPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomInstruction(preset)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="e.g. Make the response more apologetic / Make the response short and professional"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Reply Textarea & Copy Actions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Customer Reply (Editable)
                </span>
                <button
                  type="button"
                  onClick={handleCopyReply}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs active:scale-95"
                >
                  {copiedReply ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReply ? 'Copied to Clipboard!' : 'Copy Reply'}</span>
                </button>
              </div>

              <textarea
                rows={7}
                value={generatedReply}
                onChange={(e) => setGeneratedReply(e.target.value)}
                placeholder="Click 'Generate Reply' to generate a response tailored to this complaint."
                className="w-full text-xs sm:text-sm p-4 rounded-xl border border-slate-300 font-mono text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
