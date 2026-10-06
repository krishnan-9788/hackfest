import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Clock, CheckCircle, FileText, User, Mail, ShieldAlert } from 'lucide-react';
import PriorityBadge, { StatusBadge } from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import complaintApi from '../services/api';

export default function CustomerComplaintDetails({ complaintId, onBack }) {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await complaintApi.getComplaintById(complaintId);
        setComplaint(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load complaint details. You can only view complaints associated with your account.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [complaintId]);

  if (loading) {
    return <LoadingSpinner text="Retrieving ticket details..." size="lg" />;
  }

  if (error || !complaint) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl space-y-3">
        <p className="font-semibold text-sm">{error || 'Complaint not found.'}</p>
        <button
          onClick={onBack}
          className="text-xs font-bold px-4 py-2 bg-white border border-red-300 rounded-xl text-red-700 hover:bg-red-50"
        >
          Return to My Complaints
        </button>
      </div>
    );
  }

  // Lifecycle steps
  const steps = ['Pending', 'In Progress', 'Resolved'];
  const currentStepIdx = steps.indexOf(complaint.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header & Back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Complaints</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Ticket Status:</span>
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {/* Resolution Progress Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Resolution Progress</h4>
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-purple-600 transition-all duration-500 z-0"
            style={{ width: `${(Math.max(0, currentStepIdx) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((st, idx) => {
            const isCompleted = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div key={st} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-[11px] font-bold mt-2 ${isCurrent ? 'text-purple-700' : 'text-slate-500'}`}>
                  {st}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Complaint Information */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900">Ticket #{complaint.id}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
              {complaint.category}
            </span>
            <PriorityBadge priority={complaint.priority} />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">{complaint.title}</h2>
          {complaint.order_id && (
            <p className="text-xs text-slate-500">
              Order Reference:{' '}
              <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                {complaint.order_id}
              </span>
            </p>
          )}

          <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
            {complaint.description}
          </div>
        </div>

        {/* AI Summary (Customer-safe) */}
        {complaint.summary && (
          <div className="p-4 bg-purple-50/40 rounded-2xl border border-purple-100 space-y-1">
            <div className="flex items-center gap-1.5 text-purple-800 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Triage Summary</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{complaint.summary}</p>
          </div>
        )}

        {/* Latest Customer Update / Response */}
        {complaint.suggested_response && (
          <div className="p-5 bg-blue-50/40 rounded-2xl border border-blue-200/70 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Official Resolution Message
            </p>
            <p className="text-xs sm:text-sm text-blue-950 italic leading-relaxed whitespace-pre-wrap">
              "{complaint.suggested_response}"
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
          <span>Registered on: {new Date(complaint.created_at).toLocaleString()}</span>
          <span>Assigned Team: {complaint.department}</span>
        </div>
      </div>
    </div>
  );
}
