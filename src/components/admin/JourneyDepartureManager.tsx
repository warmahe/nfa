import React, { useState, useMemo } from 'react';
import {
  JourneyDepartureDate,
  DepartureAvailabilityStatus,
  DepartureType,
} from '../../types/database';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  X,
  Save,
  Tag,
} from 'lucide-react';

interface JourneyDepartureManagerProps {
  departures: JourneyDepartureDate[];
  onChange: (updated: JourneyDepartureDate[]) => void;
}

export const JourneyDepartureManager: React.FC<JourneyDepartureManagerProps> = ({
  departures = [],
  onChange,
}) => {
  const [filter, setFilter] = useState<
    'ALL' | 'UPCOMING' | 'PAST' | 'AVAILABLE' | 'LIMITED' | 'ON_REQUEST' | 'CLOSED'
  >('ALL');

  const [editingItem, setEditingItem] = useState<JourneyDepartureDate | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    date: string;
    status: DepartureAvailabilityStatus;
    type: DepartureType;
    remainingSpaces: string;
    minTravellers: string;
    maxTravellers: string;
    note: string;
  }>({
    date: '',
    status: 'AVAILABLE',
    type: 'FIXED_DEPARTURE',
    remainingSpaces: '',
    minTravellers: '',
    maxTravellers: '',
    note: '',
  });

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter & Counts calculation
  const counts = useMemo(() => {
    const total = departures.length;
    const upcoming = departures.filter((d) => d.date >= todayStr).length;
    const past = departures.filter((d) => d.date < todayStr).length;
    const available = departures.filter((d) => d.status === 'AVAILABLE').length;
    const limited = departures.filter((d) => d.status === 'LIMITED').length;
    const onRequest = departures.filter((d) => d.status === 'ON_REQUEST').length;
    const closed = departures.filter((d) => d.status === 'CLOSED').length;
    return { total, upcoming, past, available, limited, onRequest, closed };
  }, [departures, todayStr]);

  const filteredDepartures = useMemo(() => {
    return departures.filter((d) => {
      if (filter === 'UPCOMING') return d.date >= todayStr;
      if (filter === 'PAST') return d.date < todayStr;
      if (filter === 'AVAILABLE') return d.status === 'AVAILABLE';
      if (filter === 'LIMITED') return d.status === 'LIMITED';
      if (filter === 'ON_REQUEST') return d.status === 'ON_REQUEST';
      if (filter === 'CLOSED') return d.status === 'CLOSED';
      return true;
    });
  }, [departures, filter, todayStr]);

  const openAddModal = () => {
    setFormData({
      date: '',
      status: 'AVAILABLE',
      type: 'FIXED_DEPARTURE',
      remainingSpaces: '',
      minTravellers: '',
      maxTravellers: '',
      note: '',
    });
    setEditingItem(null);
    setFormError(null);
    setIsAddOpen(true);
  };

  const openEditModal = (item: JourneyDepartureDate) => {
    setFormData({
      date: item.date || '',
      status: item.status || 'AVAILABLE',
      type: item.type || 'FIXED_DEPARTURE',
      remainingSpaces: item.remainingSpaces !== undefined ? String(item.remainingSpaces) : '',
      minTravellers: item.minTravellers !== undefined ? String(item.minTravellers) : '',
      maxTravellers: item.maxTravellers !== undefined ? String(item.maxTravellers) : '',
      note: item.note || '',
    });
    setEditingItem(item);
    setFormError(null);
    setIsAddOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.date.trim()) {
      setFormError('Please select a valid departure date.');
      return;
    }

    const minT = formData.minTravellers ? parseInt(formData.minTravellers, 10) : undefined;
    const maxT = formData.maxTravellers ? parseInt(formData.maxTravellers, 10) : undefined;
    const rem = formData.remainingSpaces ? parseInt(formData.remainingSpaces, 10) : undefined;

    if (minT !== undefined && (isNaN(minT) || minT < 1)) {
      setFormError('Minimum travellers must be at least 1.');
      return;
    }

    if (maxT !== undefined && (isNaN(maxT) || (minT !== undefined && maxT < minT))) {
      setFormError('Maximum travellers must be greater than or equal to minimum travellers.');
      return;
    }

    if (rem !== undefined && (isNaN(rem) || rem < 0)) {
      setFormError('Remaining spaces cannot be negative.');
      return;
    }

    if (rem !== undefined && maxT !== undefined && rem > maxT) {
      setFormError('Remaining spaces cannot exceed maximum travellers.');
      return;
    }

    const itemToSave: JourneyDepartureDate = {
      id: editingItem ? editingItem.id : `dep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      date: formData.date,
      status: formData.status,
      type: formData.type,
      remainingSpaces: rem,
      minTravellers: minT,
      maxTravellers: maxT,
      note: formData.note.trim() || undefined,
    };

    if (editingItem) {
      const updated = departures.map((d) => (d.id === editingItem.id ? itemToSave : d));
      onChange(updated);
    } else {
      // Sort chronologically by date
      const updated = [...departures, itemToSave].sort((a, b) => a.date.localeCompare(b.date));
      onChange(updated);
    }

    setIsAddOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = departures.filter((d) => d.id !== id);
    onChange(updated);
  };

  const handleMove = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= departures.length) return;
    const updated = [...departures];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  const getStatusBadge = (status: DepartureAvailabilityStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 size={11} /> Available
          </span>
        );
      case 'LIMITED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
            <AlertTriangle size={11} /> Limited
          </span>
        );
      case 'ON_REQUEST':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1">
            <HelpCircle size={11} /> On Request
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1">
            <XCircle size={11} /> Closed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER & ADD ACTION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-brand font-black text-lg uppercase tracking-tight text-slate-900 flex items-center gap-2">
            <Calendar size={18} className="text-[#9E1B1D]" /> Fixed Departure Dates
          </h4>
          <p className="text-xs text-slate-500">
            Configure specific future departure dates, capacity guidance, and public availability statuses.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors flex items-center gap-2 rounded shadow-xs cursor-pointer"
        >
          <Plus size={14} /> Add Departure Date
        </button>
      </div>

      {/* ── FILTER PILLS ── */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
            filter === 'ALL'
              ? 'bg-[#121212] text-white border-[#121212]'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All ({counts.total})
        </button>

        <button
          type="button"
          onClick={() => setFilter('UPCOMING')}
          className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
            filter === 'UPCOMING'
              ? 'bg-[#121212] text-white border-[#121212]'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Upcoming ({counts.upcoming})
        </button>

        <button
          type="button"
          onClick={() => setFilter('AVAILABLE')}
          className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
            filter === 'AVAILABLE'
              ? 'bg-emerald-800 text-white border-emerald-800'
              : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          Available ({counts.available})
        </button>

        <button
          type="button"
          onClick={() => setFilter('LIMITED')}
          className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
            filter === 'LIMITED'
              ? 'bg-amber-800 text-white border-amber-800'
              : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
          }`}
        >
          Limited ({counts.limited})
        </button>

        <button
          type="button"
          onClick={() => setFilter('ON_REQUEST')}
          className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
            filter === 'ON_REQUEST'
              ? 'bg-blue-800 text-white border-blue-800'
              : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-50'
          }`}
        >
          On Request ({counts.onRequest})
        </button>

        <button
          type="button"
          onClick={() => setFilter('CLOSED')}
          className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
            filter === 'CLOSED'
              ? 'bg-rose-800 text-white border-rose-800'
              : 'bg-white text-rose-800 border-rose-200 hover:bg-rose-50'
          }`}
        >
          Closed ({counts.closed})
        </button>

        <button
          type="button"
          onClick={() => setFilter('PAST')}
          className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
            filter === 'PAST'
              ? 'bg-slate-700 text-white border-slate-700'
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Past ({counts.past})
        </button>
      </div>

      {/* ── DEPARTURES TABLE / LIST ── */}
      {filteredDepartures.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2 bg-slate-50">
          <Calendar size={28} className="mx-auto text-slate-400" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
            {departures.length === 0
              ? 'No fixed departures configured yet.'
              : 'No departure dates match the selected filter.'}
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Add upcoming dates to allow visitors to enquire for specific calendar departures.
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Departure Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Spaces / Capacity</th>
                <th className="py-3 px-4">Public Note</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDepartures.map((item, idx) => {
                const isPast = item.date < todayStr;
                const formattedDate = new Date(item.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <tr key={item.id} className={`hover:bg-slate-50/70 transition-colors ${isPast ? 'bg-slate-50/50 opacity-70' : ''}`}>
                    {/* Date */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span>{formattedDate}</span>
                      {isPast && (
                        <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] font-black uppercase">
                          Past
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Spaces / Party Size */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.remainingSpaces !== undefined ? (
                        <span className="font-bold text-slate-800">
                          {item.remainingSpaces} space{item.remainingSpaces !== 1 ? 's' : ''} left
                        </span>
                      ) : (
                        <span>—</span>
                      )}
                      {(item.minTravellers || item.maxTravellers) && (
                        <span className="text-[10px] text-slate-400 block">
                          Party: {item.minTravellers || 1}–{item.maxTravellers || 'Any'}
                        </span>
                      )}
                    </td>

                    {/* Note */}
                    <td className="py-3.5 px-4 text-slate-500 italic max-w-xs truncate">
                      {item.note || '—'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'UP')}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'DOWN')}
                          disabled={idx === filteredDepartures.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1 text-slate-500 hover:text-slate-900"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-rose-500 hover:text-rose-700"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border-4 border-[#121212] shadow-2xl p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-brand font-black text-lg uppercase text-slate-900 flex items-center gap-2">
                <Calendar size={18} className="text-[#9E1B1D]" />
                {editingItem ? 'Edit Departure Date' : 'Add Departure Date'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-lg flex items-center gap-2">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              {/* Date Input */}
              <div>
                <label className="block font-black uppercase text-[10px] tracking-wider text-slate-700 mb-1">
                  Departure Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 outline-none focus:border-[#121212]"
                />
              </div>

              {/* Status & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black uppercase text-[10px] tracking-wider text-slate-700 mb-1">
                    Availability Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as DepartureAvailabilityStatus,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 outline-none focus:border-[#121212]"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="LIMITED">Limited Availability</option>
                    <option value="ON_REQUEST">On Request</option>
                    <option value="CLOSED">Closed / Sold Out</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black uppercase text-[10px] tracking-wider text-slate-700 mb-1">
                    Format Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as DepartureType,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 outline-none focus:border-[#121212]"
                  >
                    <option value="FIXED_DEPARTURE">Fixed Group</option>
                    <option value="PRIVATE_FLEXIBLE">Private Window</option>
                    <option value="SEASONAL">Seasonal</option>
                    <option value="CUSTOM">Custom Expedition</option>
                  </select>
                </div>
              </div>

              {/* Capacity & Spaces */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-black uppercase text-[10px] tracking-wider text-slate-700 mb-1">
                    Remaining Spaces
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 6"
                    value={formData.remainingSpaces}
                    onChange={(e) => setFormData({ ...formData, remainingSpaces: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 outline-none focus:border-[#121212]"
                  />
                </div>

                <div>
                  <label className="block font-black uppercase text-[10px] tracking-wider text-slate-700 mb-1">
                    Min Travellers
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 2"
                    value={formData.minTravellers}
                    onChange={(e) => setFormData({ ...formData, minTravellers: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 outline-none focus:border-[#121212]"
                  />
                </div>

                <div>
                  <label className="block font-black uppercase text-[10px] tracking-wider text-slate-700 mb-1">
                    Max Travellers
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 12"
                    value={formData.maxTravellers}
                    onChange={(e) => setFormData({ ...formData, maxTravellers: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 outline-none focus:border-[#121212]"
                  />
                </div>
              </div>

              {/* Public Note */}
              <div>
                <label className="block font-black uppercase text-[10px] tracking-wider text-slate-700 mb-1">
                  Public Departure Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Peak wildflower bloom departure; small-group guaranteed"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-[#121212]"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs uppercase rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#121212] text-[#F4BF4B] font-bold text-xs uppercase rounded-lg hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Add Departure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
