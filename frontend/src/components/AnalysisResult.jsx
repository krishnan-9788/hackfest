import React, { useState } from 'react';
import { PriorityBadge, SentimentBadge } from './PriorityBadge';
import { 
  Sparkles, 
  Building2, 
  Activity, 
  CheckCircle2, 
  Copy, 
  Check, 
  AlertTriangle,
  Lightbulb,
  MessageSquareQuote
} from 'lucide-react';

export default function AnalysisResult({ analysis, isDuplicate, duplicateReason, duplicateOfId }) {
  const [copied, setCopied] = useState(false);

  if (!analysis) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confidencePct = Math.round((analysis.confidence || 0.85) * 100);

  return (
    <div className="bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 rounded-2xl border border-indigo-100 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-50/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">AI Intelligence Analysis</h4>
            <p className="text-xs text-slate-500">Classified in real-time via Groq LLM</p>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-600">AI Confidence:</span>
          <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                confidencePct >= 90 ? 'bg-emerald-500' : confidencePct >= 75 ? 'bg-indigo-500' : 'bg-amber-500'
              }`}
              style={{ width: `${confidencePct}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-800">{confidencePct}%</span>
        </div>
      </div>

      {/* Duplicate Alert if triggered */}
      {isDuplicate && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-bold text-amber-900">Possible Duplicate Complaint Detected</h5>
            <p className="text-xs text-amber-800 mt-0.5">
              {duplicateReason || 'A similar complaint was identified in the database.'}{' '}
              {duplicateOfId && (
                <span className="font-semibold underline">Related Reference: Ticket #{duplicateOfId}</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Structured Categorization Tags Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Category</p>
          <p className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            {analysis.category || 'Other'}
          </p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Priority</p>
          <div className="mt-1">
            <PriorityBadge priority={analysis.priority} />
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sentiment</p>
          <div className="mt-1">
            <SentimentBadge sentiment={analysis.sentiment} />
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Assigned Dept</p>
          <p className="text-xs font-bold text-slate-800 mt-1 truncate flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{analysis.department || 'Customer Service'}</span>
          </p>
        </div>
      </div>

      {/* Summary */}
      {analysis.summary && (
        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
            Executive Summary
          </h5>
          <p className="text-sm text-slate-700 leading-relaxed">{analysis.summary}</p>
        </div>
      )}

      {/* Recommendations & Action */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Suggested Action */}
        <div className="bg-emerald-50/60 border border-emerald-200/70 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-1.5">
              <Lightbulb className="w-4 h-4 text-emerald-600" />
              Recommended Staff Action
            </div>
            <p className="text-sm text-emerald-950 font-medium leading-relaxed">
              {analysis.suggested_action || 'Contact the customer and investigate.'}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-200/60 flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Automated internal guidance
          </div>
        </div>

        {/* Suggested Customer Response */}
        <div className="bg-blue-50/60 border border-blue-200/70 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <div className="flex items-center gap-1.5 text-blue-800 font-bold text-xs uppercase tracking-wider">
                <MessageSquareQuote className="w-4 h-4 text-blue-600" />
                Draft Customer Response
              </div>
              <button
                type="button"
                onClick={() => handleCopy(analysis.suggested_response)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-white text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors shadow-2xs"
                title="Copy response to clipboard"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-blue-950 italic leading-relaxed">
              "{analysis.suggested_response || 'We are looking into your concern and will contact you shortly.'}"
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-blue-200/60 text-[11px] text-blue-700 font-medium">
            Ready to paste or edit in customer communications
          </div>
        </div>
      </div>
    </div>
  );
}
