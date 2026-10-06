import React from 'react';
import ComplaintForm from '../components/ComplaintForm';
import { Sparkles, Shield, Cpu, MessageSquare } from 'lucide-react';

export default function NewComplaint({ onComplaintCreated, onViewDetails }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Automated AI Intake Portal</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Register a New Customer Complaint</h2>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          Submissions are immediately evaluated by Groq AI to extract category, urgency, sentiment, departmental routing, and draft customer responses.
        </p>
      </div>

      {/* Feature Highlights Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Groq AI Engine</p>
            <p className="text-[11px] text-slate-400">Sub-second classification</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Duplicate Shield</p>
            <p className="text-[11px] text-slate-400">Flags redundant tickets</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Multilingual NLP</p>
            <p className="text-[11px] text-slate-400">English & தமிழ் Support</p>
          </div>
        </div>
      </div>

      {/* Main Complaint Form Component */}
      <ComplaintForm onComplaintCreated={onComplaintCreated} onViewDetails={onViewDetails} />
    </div>
  );
}
