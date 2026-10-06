import React from 'react';
import { PriorityBadge, StatusBadge, SentimentBadge } from './PriorityBadge';
import { Calendar, Building2, User, AlertTriangle, ArrowRight } from 'lucide-react';

export default function ComplaintCard({ complaint, onViewDetails }) {
  const formattedDate = new Date(complaint.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">#{complaint.id}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {complaint.category}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{complaint.title}</h4>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{complaint.description}</p>
        </div>

        {/* Duplicate warning tag if applicable */}
        {complaint.is_duplicate && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-800 text-[11px] font-semibold rounded-md border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span className="truncate">Possible Duplicate of #{complaint.duplicate_of_id}</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 truncate max-w-[120px]">
            <User className="w-3 h-3 text-slate-400" />
            {complaint.customer_name}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {formattedDate}
          </span>
        </div>

        <button
          onClick={() => onViewDetails(complaint.id)}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
        >
          Details
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
