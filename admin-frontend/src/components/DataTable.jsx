import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, MoreVertical, Trash2, AlertTriangle, X } from 'lucide-react';

export default function DataTable({
  columns,
  data = [],
  loading = false,
  onEdit,
  onDelete,
  onBulkDelete,
  customRowActions = [], // Array of { label, onClick, className }
  searchableKeys = ['title', 'name', 'email', 'slug', 'commentText'],
  defaultPageSize = 15
}) {
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Confirm Delete Modal State
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null); // row item or 'bulk'

  // Filter Data
  const filteredData = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(item => {
      return searchableKeys.some(key => {
        const val = item[key];
        return val && String(val).toLowerCase().includes(q);
      });
    });
  }, [data, search, searchableKeys]);

  // Sort Data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Pagination Slice
  const totalEntries = sortedData.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const handleSort = (key) => {
    if (sortColumn === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length && paginatedData.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map(item => item.id)));
    }
  };

  const toggleSelectRow = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleExecuteDelete = () => {
    if (deleteConfirmTarget === 'bulk') {
      if (onBulkDelete) onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    } else if (deleteConfirmTarget && onDelete) {
      onDelete(deleteConfirmTarget);
    }
    setDeleteConfirmTarget(null);
  };

  return (
    <div className="space-y-4">
      {/* Table Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        {/* Entries Per Page Dropdown */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="px-3 py-1.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20"
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>entries</span>

          {selectedIds.size > 0 && onBulkDelete && (
            <button
              onClick={() => setDeleteConfirmTarget('bulk')}
              className="ml-4 flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors shadow-sm"
            >
              <Trash2 size={14} /> Bulk Delete ({selectedIds.size})
            </button>
          )}
        </div>

        {/* Live Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search records…"
            className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A] w-64"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="p-12 text-center text-gray-400 font-medium text-sm">
            No data available in table
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-600 select-none">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === paginatedData.length && paginatedData.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded text-[#B3732A] focus:ring-[#B3732A]"
                    />
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable !== false && handleSort(col.key)}
                      className={`px-4 py-3 font-semibold ${col.sortable !== false ? 'cursor-pointer hover:text-gray-900' : ''} ${col.className || ''}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.label}</span>
                        {col.sortable !== false && (
                          <ArrowUpDown size={13} className={`text-gray-400 ${sortColumn === col.key ? 'text-[#B3732A]' : ''}`} />
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 font-semibold text-right w-36">Options</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item) => {
                  const isChecked = selectedIds.has(item.id);
                  const isDropdownOpen = openDropdownId === item.id;

                  return (
                    <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(item.id)}
                          className="rounded text-[#B3732A] focus:ring-[#B3732A]"
                        />
                      </td>

                      {columns.map((col) => (
                        <td key={col.key} className={`px-4 py-3 ${col.cellClassName || ''}`}>
                          {col.render ? col.render(item[col.key], item) : (item[col.key] ?? '—')}
                        </td>
                      ))}

                      {/* Action Dropdown Column */}
                      <td className="px-4 py-3 text-right relative">
                        <div className="inline-block text-left">
                          <button
                            type="button"
                            onClick={() => setOpenDropdownId(isDropdownOpen ? null : item.id)}
                            className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors inline-flex items-center gap-1"
                          >
                            <span>Select an option</span>
                            <MoreVertical size={14} />
                          </button>

                          {isDropdownOpen && (
                            <div
                              className="absolute right-4 mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 text-left animate-fade-in"
                              onMouseLeave={() => setOpenDropdownId(null)}
                            >
                              {onEdit && (
                                <button
                                  onClick={() => { setOpenDropdownId(null); onEdit(item); }}
                                  className="w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
                                >
                                  Edit Record
                                </button>
                              )}

                              {customRowActions.map((act, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => { setOpenDropdownId(null); act.onClick(item); }}
                                  className={`w-full px-4 py-2 text-xs flex items-center gap-2 font-medium hover:bg-gray-50 ${act.className || 'text-gray-700'}`}
                                >
                                  {act.label}
                                </button>
                              ))}

                              {onDelete && (
                                <button
                                  onClick={() => { setOpenDropdownId(null); setDeleteConfirmTarget(item); }}
                                  className="w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium border-t border-gray-100"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500">
          <div>
            Showing <span className="font-bold text-gray-800">{totalEntries > 0 ? startIndex + 1 : 0}</span> to{' '}
            <span className="font-bold text-gray-800">{endIndex}</span> of{' '}
            <span className="font-bold text-gray-800">{totalEntries}</span> entries
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  currentPage === pageNum
                    ? 'bg-[#B3732A] text-white shadow-sm'
                    : 'border border-gray-200 hover:bg-white text-gray-700'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <h3 className="font-bold text-gray-800 text-base">Confirm Delete Action</h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure? This action cannot be undone and will permanently remove{' '}
              {deleteConfirmTarget === 'bulk' ? `all ${selectedIds.size} selected items` : 'this record'}.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
