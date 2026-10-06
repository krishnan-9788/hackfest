import React from 'react';
import { PriorityBadge, StatusBadge, SentimentBadge } from './PriorityBadge';
import { Search, Filter, AlertTriangle, Eye, ArrowUpDown, ArrowDownUp } from 'lucide-react';

export default function ComplaintTable({
  complaints = [],
  onViewDetails,
  onFilterChange,
  activeFilters = {},
  searchTerm = '',
  onSearchChange,
  sortBy = 'newest',
  onSortChange,
}) {
  const categories = ['All', 'Payment', 'Delivery', 'Product', 'Refund', 'Account', 'Technical', 'Service', 'Other'];
  const priorities = ['All', 'Critical', 'High', 'Medium', 'Low'];
  const sentiments = ['All', 'Positive', 'Neutral', 'Negative', 'Angry'];
  const statuses = ['All', 'Pending', 'In Progress', 'Resolved'];

  const priorityWeights = { Critical: 4, High: 3, Medium: 2, Low: 1 };

  // Sorting
  const sortedComplaints = [...complaints].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    if (sortBy === 'priority') {
      const pA = priorityWeights[a.priority] || 0;
      const pB = priorityWeights[b.priority] || 0;
      if (pB !== pA) return pB - pA;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return 0;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5 animate-fade-in">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, email, title, description, order ID..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-2xs"
          />
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={activeFilters.category || 'All'}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={activeFilters.priority || 'All'}
            onChange={(e) => onFilterChange('priority', e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>
                Priority: {p}
              </option>
            ))}
          </select>

          {/* Sentiment Filter */}
          <select
            value={activeFilters.sentiment || 'All'}
            onChange={(e) => onFilterChange('sentiment', e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {sentiments.map((s) => (
              <option key={s} value={s}>
                Sentiment: {s}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={activeFilters.status || 'All'}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                Status: {s}
              </option>
            ))}
          </select>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1">
            <ArrowDownUp className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/50 text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="priority">Sort: Highest priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold text-xs uppercase tracking-wider">
              <th className="py-3 px-3">ID</th>
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3">Title & Summary</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Priority</th>
              <th className="py-3 px-3">Sentiment</th>
              <th className="py-3 px-3">Department</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Created</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedComplaints.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400 text-sm">
                  No complaints found matching your filters.
                </td>
              </tr>
            ) : (
              sortedComplaints.map((c) => {
                const isCritical = c.priority === 'Critical';
                const isAngry = c.sentiment === 'Angry';

                return (
                  <tr
                    key={c.id}
                    onClick={() => onViewDetails(c.id)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      isCritical ? 'bg-red-50/20' : isAngry ? 'bg-orange-50/15' : ''
                    }`}
                  >
                    {/* ID & Duplicate indicator */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">#{c.id}</span>
                        {c.is_duplicate && (
                          <span title={`Possible duplicate of ticket #${c.duplicate_of_id}`}>
                            <AlertTriangle className="w-4 h-4 text-amber-500 inline" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 text-xs">{c.customer_name}</div>
                      <div className="text-[11px] text-slate-400">{c.customer_email}</div>
                    </td>

                    {/* Title & Preview */}
                    <td className="py-3.5 px-3 max-w-xs">
                      <div className="font-medium text-slate-800 text-xs truncate" title={c.title}>
                        {c.title}
                      </div>
                      {c.order_id && (
                        <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                          {c.order_id}
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {c.category}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} />
                    </td>

                    {/* Sentiment */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <SentimentBadge sentiment={c.sentiment} />
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-xs text-slate-600 font-medium">
                      {c.department}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-xs text-slate-400">
                      {new Date(c.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(c.id);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
        <span>
          Showing <strong>{sortedComplaints.length}</strong> complaints
        </span>
        <span className="text-slate-400">Click any row to open complaint details</span>
      </div>
    </div>
  );
}
