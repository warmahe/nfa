import React, { useState, useEffect } from 'react';
import { Bell, ShieldCheck, X, Plus, Package, Loader2, TrendingDown, Check } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebaseService';
import { Package as PackageType } from '../../types/database';
import { motion, AnimatePresence } from 'motion/react';

interface PriceAlert {
  id: string;
  packageId: string;
  packageTitle: string;
  currentPrice: number;
  targetPrice: number;
  currency: string;
  status: 'active' | 'triggered' | 'paused';
  email: string;
  createdAt: string;
}

const ALERT_STORAGE_KEY = 'nfa_price_alerts';

const loadAlerts = (): PriceAlert[] => {
  try {
    return JSON.parse(localStorage.getItem(ALERT_STORAGE_KEY) || '[]');
  } catch { return []; }
};

const saveAlerts = (alerts: PriceAlert[]) => {
  localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(alerts));
};

export const PriceAlerts = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({ packageId: '', targetPrice: '', email: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setAlerts(loadAlerts());
    const fetchPkgs = async () => {
      try {
        const snap = await getDocs(collection(db, 'packages'));
        setPackages(snap.docs.map(d => ({ id: d.id, ...d.data() } as PackageType)));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchPkgs();
  }, []);

  const addAlert = () => {
    if (!newAlert.packageId || !newAlert.targetPrice || !newAlert.email) {
      alert('Please fill all fields.');
      return;
    }
    const pkg = packages.find(p => p.id === newAlert.packageId);
    if (!pkg) return;

    const alert: PriceAlert = {
      id: `alert_${Date.now()}`,
      packageId: newAlert.packageId,
      packageTitle: pkg.title,
      currentPrice: pkg.pricing?.basePrice || 0,
      targetPrice: Number(newAlert.targetPrice),
      currency: pkg.pricing?.currency || 'INR',
      status: 'active',
      email: newAlert.email,
      createdAt: new Date().toISOString(),
    };

    const updated = [...alerts, alert];
    setAlerts(updated);
    saveAlerts(updated);
    setNewAlert({ packageId: '', targetPrice: '', email: '' });
    setIsAddOpen(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const removeAlert = (id: string) => {
    const updated = alerts.filter(a => a.id !== id);
    setAlerts(updated);
    saveAlerts(updated);
  };

  const togglePause = (id: string) => {
    const updated = alerts.map(a =>
      a.id === id ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } : a
    ) as PriceAlert[];
    setAlerts(updated);
    saveAlerts(updated);
  };

  const selectedPkg = packages.find(p => p.id === newAlert.packageId);

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-24 pb-24 px-[clamp(1rem,4vw,3rem)] nfa-texture">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="border-b-4 border-[#121212] pb-10 mb-16 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
            <h1 className="font-brand font-black text-[clamp(3rem,8vw,6rem)] uppercase tracking-tighter text-[#121212]">Price<br />Monitor.</h1>
            <p className="font-sans font-bold text-[10px] uppercase tracking-[0.3em] opacity-50 mt-2">Real-time alerts for your target expeditions.</p>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-3 bg-[#9E1B1D] text-white px-8 py-4 font-black text-[10px] uppercase tracking-widest shadow-[6px_6px_0px_0px_#121212] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            <Plus size={16} /> New Alert
          </button>
        </div>

        {/* Success Banner */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-green-50 border-2 border-green-600 p-4 mb-8 font-black text-xs uppercase tracking-widest text-green-700"
            >
              <Check size={16} /> Price alert created! We'll notify you at {newAlert.email || 'your email'} when the price drops.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: "Active Alerts", value: alerts.filter(a => a.status === 'active').length },
            { label: "Triggered", value: alerts.filter(a => a.status === 'triggered').length },
            { label: "Total Saved", value: alerts.length },
          ].map(stat => (
            <div key={stat.label} className="border-[3px] border-[#121212] bg-white p-6 text-center shadow-[4px_4px_0px_0px_#121212]">
              <div className="font-brand font-black text-5xl text-[#9E1B1D] mb-2">{stat.value}</div>
              <p className="font-black text-[9px] uppercase tracking-widest opacity-50">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Alerts List */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#9E1B1D]" size={40} /></div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-24 border-4 border-dashed border-[#121212]/10">
            <Bell size={48} className="mx-auto mb-6 opacity-10" />
            <p className="font-brand font-black text-3xl uppercase tracking-tight mb-4 opacity-20">No alerts set.</p>
            <p className="font-sans font-bold text-xs uppercase tracking-widest text-gray-400 mb-8">Create a price alert to get notified when prices drop.</p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="bg-[#121212] text-[#F4BF4B] px-10 py-4 font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_#9E1B1D] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              Set First Alert
            </button>
          </div>
        ) : (
          <div className="border-4 border-[#121212] bg-white shadow-[8px_8px_0px_0px_#F4BF4B]">
            <div className="p-6 border-b-2 border-[#121212]/10 flex items-center gap-3 text-[#9E1B1D]">
              <TrendingDown size={18} />
              <h3 className="font-black text-[10px] uppercase tracking-widest">Active Price Monitors</h3>
            </div>
            <div className="divide-y-2 divide-[#121212]/10">
              {alerts.map((alert) => {
                const saving = alert.currentPrice - alert.targetPrice;
                const savingPct = ((saving / alert.currentPrice) * 100).toFixed(0);
                return (
                  <div key={alert.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 px-6 gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`size-10 flex items-center justify-center border-2 border-[#121212] ${alert.status === 'active' ? 'bg-[#F4BF4B]' : alert.status === 'triggered' ? 'bg-green-400' : 'bg-gray-200'}`}>
                        <Bell size={16} className={alert.status === 'paused' ? 'opacity-40' : ''} />
                      </div>
                      <div>
                        <p className="font-black uppercase tracking-tight text-lg">{alert.packageTitle}</p>
                        <p className="font-sans font-bold text-[9px] uppercase tracking-widest text-gray-400">
                          Current: {alert.currency === 'INR' ? '₹' : '$'}{alert.currentPrice.toLocaleString()} → Alert at: {alert.currency === 'INR' ? '₹' : '$'}{alert.targetPrice.toLocaleString()}
                        </p>
                        <p className="font-sans font-bold text-[9px] uppercase tracking-widest text-[#9E1B1D]">
                          Potential saving: {alert.currency === 'INR' ? '₹' : '$'}{saving.toLocaleString()} ({savingPct}% off)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-black text-[9px] uppercase px-3 py-1 border ${
                        alert.status === 'active' ? 'text-green-700 bg-green-50 border-green-200' :
                        alert.status === 'triggered' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                        'text-gray-500 bg-gray-50 border-gray-200'
                      }`}>
                        {alert.status}
                      </span>
                      <button
                        onClick={() => togglePause(alert.id)}
                        className="font-black text-[9px] uppercase tracking-widest hover:text-[#9E1B1D] transition-colors"
                      >
                        {alert.status === 'active' ? 'Pause' : 'Activate'}
                      </button>
                      <button
                        onClick={() => removeAlert(alert.id)}
                        className="p-1.5 border-2 border-[#121212] hover:bg-[#9E1B1D] hover:text-white transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── ADD ALERT MODAL ── */}
      <AnimatePresence>
        {isAddOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#121212]/70 z-[1000]" onClick={() => setIsAddOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[1001] flex items-center justify-center p-6"
            >
              <div className="bg-[#FCFBF7] border-[4px] border-[#121212] p-8 md:p-12 w-full max-w-lg shadow-[12px_12px_0px_0px_#121212]">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="font-brand font-black text-3xl uppercase tracking-tight">New Alert</h2>
                  <button onClick={() => setIsAddOpen(false)} className="p-2 border-2 border-[#121212] hover:bg-[#9E1B1D] hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="font-black text-[9px] uppercase tracking-widest opacity-50 block mb-2">Select Package</label>
                    <select
                      value={newAlert.packageId}
                      onChange={e => setNewAlert(p => ({ ...p, packageId: e.target.value }))}
                      className="w-full border-2 border-[#121212] p-4 font-bold outline-none bg-white"
                    >
                      <option value="">Choose a package...</option>
                      {packages.map(pkg => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.title} — {pkg.pricing?.currency === 'INR' ? '₹' : '$'}{pkg.pricing?.basePrice?.toLocaleString()}
                        </option>
                      ))}
                    </select>
                    {selectedPkg && (
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#9E1B1D] mt-1">
                        Current price: ₹{selectedPkg.pricing?.basePrice?.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="font-black text-[9px] uppercase tracking-widest opacity-50 block mb-2">Alert me when price drops below (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 45000"
                      value={newAlert.targetPrice}
                      onChange={e => setNewAlert(p => ({ ...p, targetPrice: e.target.value }))}
                      className="w-full border-2 border-[#121212] p-4 font-bold outline-none focus:bg-[#F4BF4B]/10 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-black text-[9px] uppercase tracking-widest opacity-50 block mb-2">Notification Email</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={newAlert.email}
                      onChange={e => setNewAlert(p => ({ ...p, email: e.target.value }))}
                      className="w-full border-2 border-[#121212] p-4 font-bold outline-none focus:bg-[#F4BF4B]/10 bg-white"
                    />
                  </div>

                  <button
                    onClick={addAlert}
                    className="w-full bg-[#9E1B1D] text-white py-5 font-black text-sm uppercase tracking-[0.2em] shadow-[6px_6px_0px_0px_#121212] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-3"
                  >
                    <Bell size={16} /> Activate Alert
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};