import React from 'react';

export function PriorityBadge({ priority }) {
  const p = (priority || 'Medium').toLowerCase();
  
  if (p === 'critical') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 shadow-2xs animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
        Critical
      </span>
    );
  }
  if (p === 'high') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>
        High
      </span>
    );
  }
  if (p === 'medium') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        Medium
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
      Low
    </span>
  );
}

export function SentimentBadge({ sentiment }) {
  const s = (sentiment || 'Neutral').toLowerCase();

  if (s === 'angry') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-700 border border-red-300 shadow-2xs">
        😡 Angry
      </span>
    );
  }
  if (s === 'negative') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-300">
        😟 Negative
      </span>
    );
  }
  if (s === 'positive') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-300">
        😊 Positive
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
      😐 Neutral
    </span>
  );
}

export function StatusBadge({ status }) {
  const st = (status || 'Pending').toLowerCase();

  if (st === 'resolved') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        Resolved
      </span>
    );
  }
  if (st === 'in progress') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-300">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
        In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
      Pending
    </span>
  );
}

export default PriorityBadge;
