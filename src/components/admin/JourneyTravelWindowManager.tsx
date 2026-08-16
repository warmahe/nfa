import React, { useState } from 'react';
import {
  JourneyTravelWindow,
  DepartureAvailabilityStatus,
} from '../../types/database';
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  X,
  Layers,
} from 'lucide-react';

interface JourneyTravelWindowManagerProps {
  travelWindows: JourneyTravelWindow[];
  onChange: (updated: JourneyTravelWindow[]) => void;
}

export const JourneyTravelWindowManager: React.FC<JourneyTravelWindowManagerProps> = ({
  travelWindows = [],
  onChange,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JourneyTravelWindow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    label: string;
    from: string;
    to: string;
    status: DepartureAvailabilityStatus;
    note: string;
  }>({
    label: '',
    from: '',
    to: '',
    status: 'AVAILABLE',
    note: '',
  });

  const openAddModal = () => {
    setFormData({
      label: '',
      from: '',
      to: '',
      status: 'AVAILABLE',
      note: '',
    });
    setEditingItem(null);
    setFormError(null);
    setIsAddOpen(true);
  };

  const openEditModal = (item: JourneyTravelWindow) => {
    setFormData({
      label: item.label || '',
      from: item.from || '',
      to: item.to || '',
      status: item.status || 'AVAILABLE',
      note: item.note || '',
    });
    setEditingItem(item);
    setFormError(null);
    setIsAddOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.label.trim()) {
      setFormError('Please enter a seasonal label (e.g. "OCTOBER — DECEMBER").');
      return;
    }

    if (formData.from && formData.to && formData.from > formData.to) {
      setFormError('"From" date must be earlier than or equal to "To" date.');
      return;
    }

    const itemToSave: JourneyTravelWindow = {
      id: editingItem ? editingItem.id : `win_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      label: formData.label.trim(),
      from: formData.from,
      to: formData.to,
      status: formData.status,
      note: formData.note.trim() || undefined,
    };

    if (editingItem) {
      const updated = travelWindows.map((w) => (w.id === editingItem.id ? itemToSave : w));
      onChange(updated);
    } else {
      const updated = [...travelWindows, itemToSave];
      onChange(updated);
    }

    setIsAddOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = travelWindows.filter((w) => w.id !== id);
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
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-brand font-black text-lg uppercase tracking-tight text-slate-900 flex items-center gap-2">
            <Layers size={18} className="text-[#9E1B1D]" /> Flexible Seasonal Travel Windows
          </h4>
          <p className="text-xs text-slate-500">
            Define broad recommended travel periods and availability windows (e.g. October — December).
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors flex items-center gap-2 rounded shadow-xs cursor-pointer"
        >
          <Plus size={14} /> Add Travel Window
        </button>
      </div>

      {/* ── LIST ── */}
      {travelWindows.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2 bg-slate-50">
          <Layers size={28} className="mx-auto text-slate-400" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
            No flexible travel windows defined.
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Travel windows allow private travellers to see which seasonal windows are open for bespoke journeys.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {travelWindows.map((win) => {
            const fromStr = win.from
              ? new Date(win.from).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'Flexible';
            const toStr = win.to
              ? new Date(win.to).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'Flexible';

            return (
              <div
                key={win.id}
                className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col justify-between space-y-3 shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-brand font-black text-sm uppercase text-slate-900">
                      {win.label}
                    </span>
                    {getStatusBadge(win.status)}
                  </div>

                  {(win.from || win.to) && (
                    <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      <span>
                        {fromStr} &rarr; {toStr}
                      </span>
                    </div>
                  )}

                  {win.note && (
                    <p className="text-[11px] text-slate-500 italic">
                      "{win.note}"
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(win)}
                    className="px-2.5 py-1 text-[10px] font-bold uppercase text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-50 flex items-center gap-1"
                  >
                    <Edit2 size={11} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(win.id)}
                    className="px-2.5 py-1 text-[10px] font-bold uppercase text-rose-600 hover:text-rose-800 border border-rose-200 rounded hover:bg-rose-50 flex items-center gap-1"
                  >
                    <Trash2 size={11} /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border-4 border-[#121212] shadow-2xl p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-brand font-black text-lg uppercase text-slate-900 flex items-center gap-2">
                <Layers size={18} className="text-[#9E1B1D]" />
                {editingItem ? 'Edit Travel Window' : 'Add Travel Window'}
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
              <div>
                <label className="block font-black uppercase text-[10px] tracking-wider text-slate-700 mb-1">
                  Season / Window Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OCTOBER — DECEMBER or SPRING EXPEDITIONS"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 outline-none focus:border-[#121212]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black uppercase text-[10px] tracking-wider text-slate-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={formData.from}
                    onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-[#121212]"
                  />
                </div>

                <div>
                  <label className="block font-black uppercase text-[10px] tracking-wider text-slate-700 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-[#121212]"
                  />
                </div>
              </div>

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
                  <option value="LIMITED">Limited</option>
                  <option value="ON_REQUEST">On Request</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label className="block font-black uppercase text-[10px] tracking-wider text-slate-700 mb-1">
                  Public Guidance / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Recommended for autumn foliage and mild mountain weather"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-[#121212]"
                />
              </div>

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
                  {editingItem ? 'Save Changes' : 'Add Window'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
