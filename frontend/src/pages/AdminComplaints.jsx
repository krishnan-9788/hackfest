import React, { useState, useEffect } from 'react';
import ComplaintTable from '../components/ComplaintTable';
import ComplaintCard from '../components/ComplaintCard';
import LoadingSpinner from '../components/LoadingSpinner';
import complaintApi from '../services/api';
import { LayoutGrid, List, RefreshCw, AlertCircle, CopyCheck, Filter } from 'lucide-react';

export default function AdminComplaints({ onViewDetails, onNavigate }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'priority'
  const [duplicateOnly, setDuplicateOnly] = useState(false);
  const [filters, setFilters] = useState({
    category: 'All',
    priority: 'All',
    status: 'All',
    sentiment: 'All',
  });

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await complaintApi.getComplaints({
        search: searchTerm,
        category: filters.category,
        priority: filters.priority,
        status: filters.status,
        sentiment: filters.sentiment,
      });
      setComplaints(data);
    } catch (err) {
      console.error(err);
      setError('Unable to load complaints. Please check the backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [filters, searchTerm]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const priorityWeights = { Critical: 4, High: 3, Medium: 2, Low: 1 };

  let filteredComplaints = duplicateOnly
    ? complaints.filter((c) => c.is_duplicate)
    : complaints;

  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
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
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Complaints Repository</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
              Admin View
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Global view of all submitted complaints across customers, departments, and languages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Duplicate filter toggle */}
          <button
            onClick={() => setDuplicateOnly(!duplicateOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-2xs ${
              duplicateOnly
                ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-200'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <CopyCheck className="w-3.5 h-3.5" />
            <span>{duplicateOnly ? 'Showing Duplicates Only' : 'Filter Duplicates'}</span>
          </button>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={loadComplaints}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadComplaints}
            className="text-xs font-bold px-3 py-1 bg-white border border-red-300 rounded-lg text-red-700 hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main View Area */}
      {loading ? (
        <LoadingSpinner text="Retrieving complaints repository..." size="lg" />
      ) : viewMode === 'table' ? (
        <ComplaintTable
          complaints={sortedComplaints}
          onViewDetails={onViewDetails}
          onFilterChange={handleFilterChange}
          activeFilters={filters}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <input
              type="text"
              placeholder="Search complaints by title, text, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-72"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="priority">Highest priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedComplaints.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                No complaints found matching the criteria.
              </div>
            ) : (
              sortedComplaints.map((c) => (
                <ComplaintCard key={c.id} complaint={c} onViewDetails={onViewDetails} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
