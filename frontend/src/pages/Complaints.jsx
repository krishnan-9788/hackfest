import React, { useState, useEffect } from 'react';
import ComplaintTable from '../components/ComplaintTable';
import ComplaintCard from '../components/ComplaintCard';
import LoadingSpinner from '../components/LoadingSpinner';
import complaintApi from '../services/api';
import { LayoutGrid, List, RefreshCw, PlusCircle, AlertCircle, ArrowDownUp } from 'lucide-react';

export default function Complaints({ onViewDetails, onNavigate }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'priority'
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

  // Sort complaints for grid view as well
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
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Customer Complaints Management</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter, view AI assessments, and update resolution lifecycle states.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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

          <button
            onClick={() => onNavigate('new-complaint')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Complaint</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
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
        <LoadingSpinner text="Retrieving complaints records..." size="lg" />
      ) : viewMode === 'table' ? (
        <ComplaintTable
          complaints={complaints}
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
          {/* Quick controls bar for grid view */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
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
