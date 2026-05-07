import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, ArrowLeft, Save, 
  MapPin, Calendar, Clock, Star, Users, Info, 
  Layers, CheckCircle, XCircle, HelpCircle, Image as ImageIcon,
  ChevronRight, GripVertical, PlusCircle, Trash, X, Download,
  GripHorizontal
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { 
  collection, doc, getDocs, updateDoc, deleteDoc, 
  Timestamp, addDoc, query, orderBy, onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, getAllPackages, storage } from '../../services/firebaseService';
import { Package, ItineraryCity, ItineraryDay, TripPricingDate, TripHighlight } from '../../types/database';
import { ImageInput } from './ImageInput';
import { initializeFirestoreDatabase } from '../../services/firebaseSeeder';

// Types for Internal UI state
type EditorTab = 'OVERVIEW' | 'HIGHLIGHTS' | 'LOGISTICS' | 'ITINERARY' | 'PRICING' | 'INCLUSIONS' | 'MEDIA' | 'FAQS' | 'SLOTS' | 'PAYMENTS' | 'ADDONS';

// ─────────────────────────────────────────────────────────────────────────────
// PDF UPLOAD INPUT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface PDFUploadInputProps {
  onSave: (url: string) => void;
  storagePath: string;
  packageTitle: string;
}

const PDFUploadInput: React.FC<PDFUploadInputProps> = ({ onSave, storagePath, packageTitle }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only');
      return;
    }

    // Validate file size (max 250MB)
    if (file.size > 250 * 1024 * 1024) {
      setError('File size must be less than 250MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const timestamp = Date.now();
      const filename = `${packageTitle.toLowerCase().replace(/\s+/g, '_')}_itinerary_${timestamp}.pdf`;
      const fileRef = ref(storage, `${storagePath}/itinerary/${filename}`);

      await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(fileRef);
      onSave(downloadUrl);
      setUploading(false);
    } catch (err) {
      console.error('PDF upload error:', err);
      setError('Failed to upload PDF. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block cursor-pointer">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id="pdf-upload"
        />
        <div className="border-2 border-dashed border-[#121212]/20 p-8 text-center hover:bg-[#F4BF4B]/5 rounded-[14px] transition-colors cursor-pointer">
          <Download size={32} className="mx-auto text-[#9E1B1D] mb-4" />
          <p className="font-black text-[10px] uppercase tracking-widest text-[#121212] mb-2">
            {uploading ? 'Uploading PDF...' : 'Click to Upload Itinerary PDF'}
          </p>
          <p className="text-[9px] text-gray-600">Maximum file size: 250MB</p>
        </div>
      </label>
      {error && (
        <div className="bg-red-50 border border-red-200 text-[#9E1B1D] p-3 text-[9px] font-bold uppercase">
          {error}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

export const AdminPackagesManager = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePackage, setActivePackage] = useState<Package | null>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>('OVERVIEW');
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    // Set up real-time listener for packages
    const q = query(collection(db, 'packages'), orderBy('title', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pkgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Package));
      setPackages(pkgs);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to packages:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const data = await getAllPackages();
      setPackages(data as Package[]);
    } catch (error) {
      console.error("Error loading packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    const newPackage: Partial<Package> = {
      title: 'New Adventure Trip',
      slug: `new-trip-${Date.now()}`,
      status: 'draft',
      difficulty: 'Moderate',
      duration: '5 Days / 4 Nights',
      maxTravelers: 12,
      pricing: {
        basePrice: 0,
        currency: 'INR',
        seasonalPricing: [],
        groupPricing: []
      },
      availability: { maxSlots: 12, bookings: 0 },
      media: { thumbnail: '', gallery: [], videos: [] },
      rating: { average: 5, totalReviews: 0, autoCalculated: 5 },
      joiningPointCount: 0,
      activitiesIncludedCount: 0,
      activitiesOptionalCount: 0,
      reviewsCount: 0,
      faqsCount: 0
    };

    try {
      const docRef = await addDoc(collection(db, 'packages'), {
        ...newPackage,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      loadPackages();
      const created = { id: docRef.id, ...newPackage } as Package;
      setActivePackage(created);
    } catch (error) {
      alert("Error creating package: " + error);
    }
  };

  const handleSave = async () => {
    if (!activePackage) return;
    if (!window.confirm("SAVE CHANGES: Are you sure you want to update the live trip data?")) return;
    
    setSaving(true);
    try {
      const { id, ...data } = activePackage;
      await updateDoc(doc(db, 'packages', id), {
        ...data,
        updatedAt: Timestamp.now()
      });
      await loadPackages();
      alert("Trip data updated successfully.");
    } catch (error) {
      alert("Error saving updates: " + error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("WARNING: This action cannot be undone. Are you sure you want to permanently delete this trip?")) return;
    try {
      await deleteDoc(doc(db, 'packages', id));
      loadPackages();
      alert("Trip deleted.");
    } catch (error) {
      alert("Error deleting trip: " + error);
    }
  };

  const updateActivePackage = (updates: Partial<Package>) => {
    if (!activePackage) return;
    setActivePackage({ ...activePackage, ...updates });
  };

  const filteredPackages = packages.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.destinations?.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Helper to render Lucide icons by name
  const IconPreview = ({ name, size = 16 }: { name: string, size?: number }) => {
    const Icon = (LucideIcons as any)[name] || LucideIcons.Sparkles;
    return <Icon size={size} />;
  };

  if (loading) return <div className="p-12 text-center font-black uppercase text-[#121212]/40 tracking-widest text-sm animate-pulse">Loading Data...</div>;

  // --- LIST VIEW ---
  if (!activePackage) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6">
          <div>
            <h2 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">Trip Inventory.</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#121212]/50 mt-1 flex items-center gap-2">
              <Layers size={14} className="text-[#9E1B1D]" /> Access and control all adventure parameters
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={async () => {
                if (window.confirm("WARNING: This will purge all existing packages and seed mock data. Proceed?")) {
                  setLoading(true);
                  await initializeFirestoreDatabase();
                  await loadPackages();
                  alert("Database seeded successfully!");
                  setLoading(false);
                }
              }}
              className="hidden lg:flex items-center gap-2 px-5 py-3 rounded-[14px] border-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 font-black text-[10px] uppercase tracking-widest transition-all"
            >
              ⚠ Seed Database
            </button>
            <button 
              onClick={handleCreateNew}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-[#121212] text-[#F4BF4B] font-black text-[11px] uppercase tracking-widest rounded-[18px] shadow-[0_12px_24px_rgba(18,18,18,0.12)] hover:bg-[#9E1B1D] hover:text-white transition-all group"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Add New Trip
            </button>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#121212]/30">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search by title, destination, or sector..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredPackages.map(pkg => (
            <div key={pkg.id} className="rounded-[18px] bg-white border-2 border-[#121212]/10 p-6 shadow-[0_12px_24px_rgba(18,18,18,0.06)] flex flex-col gap-5 hover:shadow-[0_16px_32px_rgba(18,18,18,0.1)] transition-all">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border-2 ${
                    pkg.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                  }`}>
                    System Status: {pkg.status}
                  </span>
                  <h3 className="font-brand font-black text-2xl uppercase leading-[0.9] mt-2 tracking-tighter">{pkg.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {pkg.destinations?.map((d, idx) => (
                      <span key={idx} className="bg-[#FCFBF7] rounded-full border border-[#121212]/10 px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-[#121212]/40">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setActivePackage(pkg)}
                    className="p-3 rounded-[12px] bg-white border-2 border-[#121212]/10 hover:bg-[#F4BF4B]/10 transition-all"
                    title="Edit System Data"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(pkg.id)}
                    className="p-3 rounded-[12px] bg-[#9E1B1D]/10 text-[#9E1B1D] border-2 border-[#9E1B1D]/20 hover:bg-[#9E1B1D] hover:text-white transition-all"
                    title="Delete Trip"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest text-[#121212]/40 mt-auto pt-5 border-t-2 border-[#121212]/10">
                <span className="flex items-center gap-2"><Clock size={14} className="text-[#9E1B1D]" /> {pkg.duration}</span>
                <span className="flex items-center gap-2"><Users size={14} className="text-[#9E1B1D]" /> {pkg.maxTravelers} Slots</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- EDITOR VIEW ---
  return (
    <div className="space-y-8">
      {/* Editor Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActivePackage(null)}
            className="p-3 rounded-[14px] border-2 border-[#121212]/10 bg-white hover:bg-[#F4BF4B]/10 transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="font-brand font-black text-xl md:text-2xl uppercase tracking-tight text-[#121212]">
              Config: {activePackage.title}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="font-mono text-[9px] font-black text-[#9E1B1D] bg-[#9E1B1D]/5 px-3 py-1 rounded-full tracking-widest">ID: {activePackage.id}</span>
              <span className="font-mono text-[9px] font-bold text-[#121212]/40 uppercase tracking-widest">Slug: {activePackage.slug}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#121212] text-[#F4BF4B] font-black text-[11px] uppercase tracking-widest rounded-[18px] shadow-[0_12px_24px_rgba(18,18,18,0.12)] hover:bg-[#9E1B1D] hover:text-white transition-all group"
        >
          <Save size={22} className="group-hover:scale-110 transition-transform" /> 
          {saving ? 'SAVING DATA...' : 'SAVE UPDATES'}
        </button>
      </div>

      {/* Editor Tabs */}
      <div className="flex flex-wrap gap-1 border-b-2 border-[#121212]/10 pb-2 overflow-x-auto">
        {(['OVERVIEW', 'HIGHLIGHTS', 'LOGISTICS', 'ITINERARY', 'PRICING', 'INCLUSIONS', 'MEDIA', 'FAQS', 'SLOTS', 'PAYMENTS', 'ADDONS'] as EditorTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-black text-[10px] uppercase tracking-widest transition-all border-b-2 rounded-t-[10px] ${
              activeTab === tab 
                ? "border-[#F4BF4B] text-[#121212] bg-[#F4BF4B]/10" 
                : "border-transparent text-[#121212]/50 hover:text-[#121212] hover:bg-[#121212]/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-[18px] bg-white p-6 lg:p-8 border-2 border-[#121212]/10 shadow-[0_12px_24px_rgba(18,18,18,0.06)]">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="p-6 bg-[#FCFBF7] rounded-[14px] border-2 border-[#121212]/10 space-y-6">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-[#9E1B1D] border-b-2 border-[#121212]/10 pb-4">Core Logistics</h4>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#121212]/60 block mb-2">Trip Title</label>
                  <input 
                    type="text" 
                    value={activePackage.title} 
                    onChange={e => updateActivePackage({ title: e.target.value })}
                    className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-black text-sm text-[#121212] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#121212]/60 block mb-2">Trip Destinations (Comma separated)</label>
                  <input 
                    type="text" 
                    value={activePackage.destinations?.join(', ') || ''} 
                    onChange={e => updateActivePackage({ destinations: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                    placeholder="e.g. ICELAND, NORWAY"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#121212]/60 block mb-2">System Status</label>
                    <select 
                      value={activePackage.status} 
                      onChange={e => updateActivePackage({ status: e.target.value as any })}
                      className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer"
                    >
                      <option value="draft">DRAFT / IN-PREP</option>
                      <option value="active">LIVE / ACTIVE</option>
                      <option value="archived">ARCHIVED / OFFLINE</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#121212]/60 block mb-2">Intensity Level</label>
                    <select 
                      value={activePackage.difficulty} 
                      onChange={e => updateActivePackage({ difficulty: e.target.value as any })}
                      className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer"
                    >
                      <option value="Easy">EASY / LEVEL 01</option>
                      <option value="Moderate">MODERATE / LEVEL 02</option>
                      <option value="Challenging">CHALLENGING / LEVEL 03</option>
                      <option value="Expert">EXPERT / LEVEL 04</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#FCFBF7] rounded-[14px] border-2 border-[#121212]/10 space-y-6">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-[#9E1B1D] border-b-2 border-[#121212]/10 pb-4">The Narrative (About Section)</h4>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#121212]/60 block mb-2">Section Header (Question)</label>
                  <input 
                    type="text" 
                    value={activePackage.aboutQuestion || ''} 
                    onChange={e => updateActivePackage({ aboutQuestion: e.target.value })}
                    className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                    placeholder="e.g. Why This Trip? / The Objective?"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#121212]/60 block mb-2">Section Title</label>
                  <input 
                    type="text" 
                    value={activePackage.aboutTitle || ''} 
                    onChange={e => updateActivePackage({ aboutTitle: e.target.value })}
                    className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-brand font-black text-lg uppercase tracking-tight text-[#121212] transition-all"
                    placeholder="e.g. THE JOURNEY."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#121212]/60 block mb-2">Mission Brief (Description)</label>
                  <textarea 
                    value={activePackage.description} 
                    onChange={e => updateActivePackage({ description: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all leading-relaxed resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="p-6 border-4 border-[#121212] bg-[#FCFBF7]">
                 <ImageInput 
                  label="Mission Documentation (About Image)"
                  value={activePackage.aboutImage || ''}
                  storagePath={`packages/${activePackage.slug}/about`}
                  onSave={(url) => updateActivePackage({ aboutImage: url })}
                  aspectClass="aspect-[4/5]"
                />
              </div>

              <div className="p-6 bg-[#FCFBF7] rounded-[14px] border-2 border-[#121212]/10 space-y-6">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-[#9E1B1D] border-b-2 border-[#121212]/10 pb-4">Timeline & Capacity</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#121212]/60 block mb-2">Duration</label>
                    <input 
                      type="text" 
                      value={activePackage.duration} 
                      onChange={e => updateActivePackage({ duration: e.target.value })}
                      className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-black uppercase text-xs text-[#121212] transition-all"
                      placeholder="e.g. 5 DAYS / 4 NIGHTS"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#121212]/60 block mb-2">Unit Capacity</label>
                    <input 
                      type="number" 
                      value={activePackage.maxTravelers} 
                      onChange={e => updateActivePackage({ maxTravelers: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-black text-xl text-[#121212] transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HIGHLIGHTS TAB */}
        {activeTab === 'HIGHLIGHTS' && (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="flex justify-between items-end border-b-4 border-[#121212] pb-6">
              <div>
                <h4 className="font-brand font-black text-3xl uppercase tracking-tighter text-[#121212]">Mission Highlights.</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">Key defining moments of the expedition</p>
              </div>
              <button 
                onClick={() => {
                  const h = [...(activePackage.highlights || [])];
                  h.push({ text: '', icon: 'CheckCircle' });
                  updateActivePackage({ highlights: h });
                }}
                className="bg-[#121212] text-[#F4BF4B] px-5 py-3 rounded-[14px] font-black text-[10px] uppercase tracking-widest shadow-[0_8px_16px_rgba(18,18,18,0.12)] hover:bg-[#9E1B1D] hover:text-white transition-all flex items-center gap-2"
              >
                <Plus size={16} /> ADD HIGHLIGHT
              </button>
            </div>
            
            <div className="space-y-4">
              {(activePackage.highlights || []).map((h, i) => (
                <div key={i} className="flex gap-4 items-center bg-[#FCFBF7] p-5 rounded-[14px] border-2 border-[#121212]/10 group hover:bg-white transition-colors">
                  <div className="cursor-move text-gray-300 group-hover:text-[#9E1B1D] transition-colors shrink-0">
                    <GripVertical size={20} />
                  </div>
                  
                  {/* Icon Selector / Preview */}
                  <div className="relative group/icon shrink-0">
                    <div className="size-14 bg-white rounded-[12px] border-2 border-[#121212]/10 flex items-center justify-center text-[#9E1B1D]">
                      <IconPreview name={h.icon || 'Sparkles'} />
                    </div>
                    <select 
                      value={h.icon || 'Sparkles'} 
                      onChange={e => {
                        const nh = [...(activePackage.highlights || [])];
                        nh[i].icon = e.target.value;
                        updateActivePackage({ highlights: nh });
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    >
                      {['CheckCircle', 'Star', 'MapPin', 'Target', 'Compass', 'Zap', 'Shield', 'Mountain', 'Camera', 'Flag', 'Award', 'Trophy', 'Activity', 'Sparkles', 'Anchor', 'Feather', 'Wind', 'Heart'].map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>

                  <input 
                    type="text" 
                    value={h.text} 
                    onChange={e => {
                      const nh = [...(activePackage.highlights || [])];
                      nh[i].text = e.target.value;
                      updateActivePackage({ highlights: nh });
                    }}
                    placeholder="Enter highlight description..."
                    className="flex-1 bg-transparent border-none outline-none font-bold text-sm uppercase tracking-tight placeholder:text-gray-300"
                  />
                  
                  <button 
                    onClick={() => {
                      if (window.confirm("Delete this highlight?")) {
                        const nh = [...(activePackage.highlights || [])];
                        nh.splice(i, 1);
                        updateActivePackage({ highlights: nh });
                      }
                    }}
                    className="p-3 text-gray-300 hover:text-[#9E1B1D] transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOGISTICS TAB (Dynamic Quick Info Bar Control) */}
        {activeTab === 'LOGISTICS' && (
          <div className="space-y-12">
            <div className="flex justify-between items-end border-b-4 border-[#121212] pb-6">
              <div>
                <h4 className="font-brand font-black text-3xl uppercase tracking-tighter text-[#121212]">Trip Logistics.</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">Add or remove tactical info slots for the trip page</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    const nq = [...(activePackage.quickInfo || [])];
                    nq.push({ label: '', value: '', icon: 'Compass' });
                    updateActivePackage({ quickInfo: nq });
                  }}
                  className="bg-[#121212] text-[#F4BF4B] px-5 py-3 rounded-[14px] font-black text-[10px] uppercase tracking-widest shadow-[0_8px_16px_rgba(18,18,18,0.12)] hover:bg-[#9E1B1D] hover:text-white transition-all flex items-center gap-2"
                >
                  <Plus size={16} /> ADD LOGISTIC SLOT
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm("RESET TO TRIP DEFAULTS: This will wipe custom slots and use system defaults. Continue?")) {
                      updateActivePackage({ quickInfo: [] });
                    }
                  }}
                  className="text-[10px] font-black uppercase tracking-widest text-[#9E1B1D] border-2 border-[#9E1B1D] px-4 py-2 hover:bg-[#9E1B1D] hover:text-white transition-all"
                >
                  Reset to Defaults
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(activePackage.quickInfo || []).map((info, idx) => {
                return (
                  <div key={idx} className="rounded-[14px] border-2 border-[#121212]/10 p-5 bg-[#FCFBF7] space-y-5 relative group">
                    <span className="absolute -top-3 -right-3 size-8 bg-[#121212] text-[#F4BF4B] flex items-center justify-center font-black text-xs border-2 border-[#F4BF4B]">0{idx + 1}</span>
                    
                    <button 
                      onClick={() => {
                        const nq = [...(activePackage.quickInfo || [])];
                        nq.splice(idx, 1);
                        updateActivePackage({ quickInfo: nq });
                      }}
                      className="absolute -top-3 -left-3 size-8 bg-white rounded-full border-2 border-[#9E1B1D]/30 text-[#9E1B1D] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove Slot"
                    >
                      <Trash size={14} />
                    </button>

                    <div className="flex gap-6 items-start">
                      <div className="relative group/icon shrink-0">
                        <div className="size-16 bg-white rounded-[14px] border-2 border-[#121212]/10 flex items-center justify-center text-[#9E1B1D]">
                          <IconPreview name={info.icon} size={24} />
                        </div>
                        <select 
                          value={info.icon} 
                          onChange={e => {
                            const nq = [...(activePackage.quickInfo || [])];
                            nq[idx].icon = e.target.value;
                            updateActivePackage({ quickInfo: nq });
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        >
                          {['Clock', 'Calendar', 'Users', 'Zap', 'BedDouble', 'Compass', 'Map', 'Shield', 'Target', 'Activity', 'Award', 'Briefcase', 'Camera', 'Car', 'Coffee', 'Cpu', 'Database', 'Flag', 'Gift', 'Globe', 'Heart', 'Home', 'Image', 'Info', 'Key', 'Layers', 'LifeBuoy', 'Lock', 'Mail', 'MapPin', 'Mic', 'Moon', 'Mountain', 'Music', 'Navigation', 'Package', 'Phone', 'Plane', 'Play', 'Power', 'Printer', 'Radio', 'Save', 'Search', 'Send', 'Settings', 'Share', 'ShoppingBag', 'ShoppingCart', 'Smartphone', 'Speaker', 'Star', 'Sun', 'Tag', 'Terminal', 'ThumbsUp', 'Trash', 'Truck', 'Tv', 'Umbrella', 'User', 'Video', 'Volume2', 'Watch', 'Wifi', 'Wind', 'Zap'].map(k => (
                            <option key={k} value={k}>{k}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div>
                          <label className="text-[8px] font-black uppercase text-gray-400 mb-1 block tracking-[0.2em]">Slot Label</label>
                          <input 
                            type="text" 
                            value={info.label}
                            onChange={e => {
                              const nq = [...(activePackage.quickInfo || [])];
                              nq[idx].label = e.target.value;
                              updateActivePackage({ quickInfo: nq });
                            }}
                            placeholder="e.g. DURATION"
                            className="w-full bg-transparent border-b-2 border-[#121212]/10 py-1 font-black text-xs uppercase tracking-widest focus:border-[#9E1B1D] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[8px] font-black uppercase text-gray-400 mb-1 block tracking-[0.2em]">Display Value</label>
                          <input 
                            type="text" 
                            value={info.value}
                            onChange={e => {
                              const nq = [...(activePackage.quickInfo || [])];
                              nq[idx].value = e.target.value;
                              updateActivePackage({ quickInfo: nq });
                            }}
                            placeholder="e.g. 5 DAYS / 4 NIGHTS"
                            className="w-full bg-transparent border-b-2 border-[#121212]/10 py-1 font-bold text-sm uppercase focus:border-[#F4BF4B] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ITINERARY TAB */}
        {activeTab === 'ITINERARY' && (
          <div className="space-y-12">
            <div className="flex justify-between items-end border-b-4 border-[#121212] pb-6">
              <div>
                <h4 className="font-brand font-black text-3xl uppercase tracking-tighter">Operational Timeline.</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">Vertical deployment schedule grouped by sector</p>
              </div>
              <button 
                onClick={() => {
                  const cities = [...(activePackage.itineraryCities || [])];
                  cities.push({ 
                    city: 'New Sector', 
                    country: '',
                    nights: 1, 
                    days: [{ day: 1, title: 'Insertion', description: '', textAlign: 'left' }] 
                  });
                  updateActivePackage({ itineraryCities: cities });
                }}
                className="bg-[#121212] text-[#F4BF4B] px-6 py-3 rounded-[14px] font-black text-[10px] uppercase tracking-widest shadow-[0_8px_16px_rgba(18,18,18,0.12)] hover:bg-[#9E1B1D] hover:text-white transition-all flex items-center gap-3"
              >
                <PlusCircle size={18} /> ADD SECTOR
              </button>
            </div>

            <div className="space-y-16">
              {(activePackage.itineraryCities || []).map((city, cIdx) => (
                <div key={cIdx} className="rounded-[18px] border-2 border-[#121212]/10 bg-white p-6 shadow-[0_12px_24px_rgba(18,18,18,0.06)] relative">
                  
                  {/* Arrival Transfer Controls */}
                  <div className="mb-10 p-4 border-2 border-dashed border-[#121212]/20 bg-[#FCFBF7]/50 flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex items-center gap-3 shrink-0">
                      <select 
                        value={city.arrivalTransfer?.type || 'flight'}
                        onChange={e => {
                          const nc = [...(activePackage.itineraryCities || [])];
                          nc[cIdx].arrivalTransfer = { 
                            type: e.target.value as any, 
                            text: nc[cIdx].arrivalTransfer?.text || '' 
                          };
                          updateActivePackage({ itineraryCities: nc });
                        }}
                        className="p-2 rounded-[10px] border-2 border-[#121212]/10 font-black text-[9px] uppercase tracking-widest outline-none bg-white focus:border-[#F4BF4B] transition-all"
                      >
                        <option value="flight">FLIGHT</option>
                        <option value="train">TRAIN</option>
                        <option value="bus">BUS</option>
                        <option value="ferry">FERRY</option>
                        <option value="car">CAR</option>
                      </select>
                    </div>
                    <input 
                      type="text" 
                      value={city.arrivalTransfer?.text || ''}
                      onChange={e => {
                        const nc = [...(activePackage.itineraryCities || [])];
                        nc[cIdx].arrivalTransfer = { 
                          type: nc[cIdx].arrivalTransfer?.type || 'flight', 
                          text: e.target.value 
                        };
                        updateActivePackage({ itineraryCities: nc });
                      }}
                      placeholder="e.g. Fly in to Barcelona on Day 1"
                      className="flex-1 bg-transparent border-b-2 border-[#121212]/10 p-2 font-bold text-sm outline-none focus:border-[#9E1B1D] transition-colors"
                    />
                    <button 
                      onClick={() => {
                        const nc = [...(activePackage.itineraryCities || [])];
                        delete nc[cIdx].arrivalTransfer;
                        updateActivePackage({ itineraryCities: nc });
                      }}
                      className="text-gray-300 hover:text-[#9E1B1D] p-2"
                      title="Clear Transfer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pb-6 border-b-2 border-[#121212]">
                    <div className="flex items-center gap-6 flex-1">
                      <div className="bg-[#121212] text-[#F4BF4B] p-3 rounded-[10px]">
                        <MapPin size={24} />
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[8px] font-black uppercase text-gray-400 mb-1 block">Sector Name</label>
                          <input 
                            type="text" 
                            value={city.city} 
                            onChange={e => {
                              const nc = [...(activePackage.itineraryCities || [])];
                              nc[cIdx].city = e.target.value;
                              updateActivePackage({ itineraryCities: nc });
                            }}
                            className="font-brand font-black text-3xl uppercase border-none outline-none w-full bg-transparent p-0"
                          />
                        </div>
                        <div>
                          <label className="text-[8px] font-black uppercase text-gray-400 mb-1 block">Country</label>
                          <input 
                            type="text" 
                            value={city.country || ''} 
                            onChange={e => {
                              const nc = [...(activePackage.itineraryCities || [])];
                              nc[cIdx].country = e.target.value;
                              updateActivePackage({ itineraryCities: nc });
                            }}
                            className="font-bold text-lg uppercase border-none outline-none w-full bg-transparent p-0"
                            placeholder="e.g. SPAIN"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <label className="text-[8px] font-black uppercase text-gray-400 mb-1 block tracking-widest">Duration</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            value={city.nights} 
                            onChange={e => {
                              const nc = [...(activePackage.itineraryCities || [])];
                              nc[cIdx].nights = parseInt(e.target.value);
                              updateActivePackage({ itineraryCities: nc });
                            }}
                            className="w-12 font-brand font-black text-2xl border-b-2 border-[#121212] outline-none text-center bg-transparent"
                          />
                          <span className="font-black text-xs uppercase tracking-widest">Nights</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          if (window.confirm("Delete this entire sector and all its days?")) {
                            const nc = [...(activePackage.itineraryCities || [])];
                            nc.splice(cIdx, 1);
                            updateActivePackage({ itineraryCities: nc });
                          }
                        }}
                        className="p-4 border-2 border-[#9E1B1D] text-[#9E1B1D] hover:bg-[#9E1B1D] hover:text-white transition-all"
                      >
                        <Trash size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-12">
                    {city.days.map((day, dIdx) => (
                      <div key={dIdx} className="pl-10 border-l-4 border-[#F4BF4B] space-y-6 relative">
                        <div className="absolute left-[-14px] top-0 size-6 rounded-full bg-[#F4BF4B] border-4 border-white shadow-[0_0_0_2px_#121212]" />
                        
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                          <div className="flex-1 space-y-4 w-full">
                            <div className="flex items-center gap-4">
                              <span className="font-brand font-black text-3xl text-[#F4BF4B]">DAY {day.day}.</span>
                              <input 
                                type="text" 
                                value={day.title} 
                                onChange={e => {
                                  const nc = [...(activePackage.itineraryCities || [])];
                                  nc[cIdx].days[dIdx].title = e.target.value;
                                  updateActivePackage({ itineraryCities: nc });
                                }}
                                className="font-black text-xl uppercase tracking-tighter border-none outline-none flex-1 bg-transparent"
                                placeholder="Day Objective"
                              />
                            </div>
                            
                            {/* Alignment Controls */}
                            <div className="flex items-center gap-2 border-b-2 border-[#121212]/10 pb-2">
                              <span className="text-[8px] font-black uppercase text-gray-300 tracking-widest mr-2">Alignment:</span>
                              {(['left', 'center', 'right'] as const).map(align => (
                                <button 
                                  key={align}
                                  onClick={() => {
                                    const nc = [...(activePackage.itineraryCities || [])];
                                    nc[cIdx].days[dIdx].textAlign = align;
                                    updateActivePackage({ itineraryCities: nc });
                                  }}
                                  className={`text-[8px] font-black uppercase px-2 py-0.5 border transition-all ${
                                    day.textAlign === align ? 'bg-[#121212] text-white border-[#121212]' : 'text-gray-400 border-[#121212]/10 hover:border-[#121212]'
                                  }`}
                                >
                                  {align}
                                </button>
                              ))}
                            </div>

                            <textarea 
                              value={day.description} 
                              onChange={e => {
                                const nc = [...(activePackage.itineraryCities || [])];
                                nc[cIdx].days[dIdx].description = e.target.value;
                                updateActivePackage({ itineraryCities: nc });
                              }}
                              className={`w-full px-4 py-4 rounded-[14px] bg-[#FCFBF7] border-2 border-[#121212]/10 outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 text-sm leading-relaxed min-h-[150px] font-bold transition-all ${
                                day.textAlign === 'center' ? 'text-center' : day.textAlign === 'right' ? 'text-right' : 'text-left'
                              }`}
                              placeholder="Mission briefing details..."
                            />

                            {/* Meals & Addons Controls */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="p-4 rounded-[10px] border-2 border-[#121212]/5 bg-[#FCFBF7]">
                                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-[#9E1B1D] mb-3 block">Meals Included</label>
                                <input 
                                  type="text" 
                                  value={day.meals?.join(', ') || ''}
                                  onChange={e => {
                                    const nc = [...(activePackage.itineraryCities || [])];
                                    nc[cIdx].days[dIdx].meals = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                    updateActivePackage({ itineraryCities: nc });
                                  }}
                                  placeholder="e.g. Breakfast, Dinner"
                                  className="w-full bg-transparent border-b border-[#121212]/10 p-1 font-bold text-xs outline-none"
                                />
                              </div>
                              <div className="p-4 rounded-[10px] border-2 border-[#121212]/5 bg-[#FCFBF7]">
                                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-[#F4BF4B] mb-3 block">Optional Add-ons</label>
                                <input 
                                  type="text" 
                                  value={day.addons?.join(', ') || ''}
                                  onChange={e => {
                                    const nc = [...(activePackage.itineraryCities || [])];
                                    nc[cIdx].days[dIdx].addons = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                    updateActivePackage({ itineraryCities: nc });
                                  }}
                                  placeholder="e.g. Sunset Boat Party +60"
                                  className="w-full bg-transparent border-b border-[#121212]/10 p-1 font-bold text-xs outline-none"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => {
                              if (window.confirm("Delete this day?")) {
                                const nc = [...(activePackage.itineraryCities || [])];
                                nc[cIdx].days.splice(dIdx, 1);
                                updateActivePackage({ itineraryCities: nc });
                              }
                            }}
                            className="text-gray-300 hover:text-[#9E1B1D] p-2"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => {
                        const nc = [...(activePackage.itineraryCities || [])];
                        const lastDay = nc[cIdx].days[nc[cIdx].days.length - 1]?.day || 0;
                        nc[cIdx].days.push({ 
                          day: lastDay + 1, 
                          title: 'New Objective', 
                          description: '', 
                          textAlign: 'left' 
                        });
                        updateActivePackage({ itineraryCities: nc });
                      }}
                      className="w-full py-6 border-2 border-dashed border-[#121212]/10 rounded-[14px] text-[11px] font-black uppercase tracking-[0.3em] text-gray-300 hover:bg-[#F4BF4B]/5 hover:border-[#F4BF4B] hover:text-[#121212] transition-all group flex items-center justify-center gap-4"
                    >
                      <Plus size={20} className="group-hover:rotate-180 transition-transform" />
                      APPEND DAY TO {city.city.toUpperCase()}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRICING TAB */}
        {activeTab === 'PRICING' && (
          <div className="space-y-12">
            <div className="max-w-xl">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-3">Base Price & Currency</label>
                  <div className="flex gap-4">
                    <input 
                      type="number" 
                      value={activePackage.pricing.basePrice} 
                      onChange={e => updateActivePackage({ pricing: { ...activePackage.pricing, basePrice: parseInt(e.target.value) } })}
                      className="flex-1 px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-black text-xl text-[#121212] transition-all"
                    />
                    <select 
                      value={activePackage.pricing.currency} 
                      onChange={e => updateActivePackage({ pricing: { ...activePackage.pricing, currency: e.target.value } })}
                      className="px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 font-black bg-white focus:outline-none focus:border-[#F4BF4B] transition-all cursor-pointer"
                    >
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center border-b-2 border-[#121212] pb-4">
                <h4 className="font-black text-xs uppercase tracking-widest">Departure Windows & Specific Pricing</h4>
                <button 
                  onClick={() => {
                    const dates = [...(activePackage.pricingDates || [])];
                    dates.push({ date_range: 'New Dates', price: activePackage.pricing.basePrice, status: 'available' });
                    updateActivePackage({ pricingDates: dates });
                  }}
                  className="bg-[#121212] text-[#F4BF4B] px-4 py-2 font-black text-[10px] uppercase tracking-widest"
                >
                  + Add Date Card
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activePackage.pricingDates || []).map((date, i) => (
                  <div key={i} className="rounded-[14px] border-2 border-[#121212]/10 p-5 bg-white space-y-4">
                    <div className="flex justify-between">
                      <span className="text-[9px] font-black uppercase tracking-tighter bg-gray-100 px-2 py-1">Slot #{i+1}</span>
                      <button 
                        onClick={() => {
                          const dates = [...(activePackage.pricingDates || [])];
                          dates.splice(i, 1);
                          updateActivePackage({ pricingDates: dates });
                        }}
                        className="text-[#9E1B1D]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-gray-400">Date Range</label>
                      <input 
                        type="text" 
                        value={date.date_range} 
                        onChange={e => {
                          const nd = [...(activePackage.pricingDates || [])];
                          nd[i].date_range = e.target.value;
                          updateActivePackage({ pricingDates: nd });
                        }}
                        className="w-full p-2 border-b-2 border-[#121212] outline-none font-bold text-sm"
                        placeholder="e.g. Oct 15 - Oct 22"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-black uppercase text-gray-400">Price</label>
                        <input 
                          type="number" 
                          value={date.price} 
                          onChange={e => {
                            const nd = [...(activePackage.pricingDates || [])];
                            nd[i].price = parseInt(e.target.value);
                            updateActivePackage({ pricingDates: nd });
                          }}
                          className="w-full p-2 border-b-2 border-[#121212] outline-none font-black"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase text-gray-400">Status</label>
                        <select 
                          value={date.status} 
                          onChange={e => {
                            const nd = [...(activePackage.pricingDates || [])];
                            nd[i].status = e.target.value as any;
                            updateActivePackage({ pricingDates: nd });
                          }}
                          className="w-full p-2 border-b-2 border-[#121212] outline-none font-black text-[10px] uppercase"
                        >
                          <option value="available">Available</option>
                          <option value="limited">Limited</option>
                          <option value="sold_out">Sold Out</option>
                          <option value="coming_soon">Coming Soon</option>
                        </select>
                      </div>
                    </div>
                    <input 
                      type="text" 
                      value={date.notes || ''} 
                      onChange={e => {
                        const nd = [...(activePackage.pricingDates || [])];
                        nd[i].notes = e.target.value;
                        updateActivePackage({ pricingDates: nd });
                      }}
                      className="w-full p-2 bg-red-50 text-[10px] font-bold text-[#9E1B1D] outline-none"
                      placeholder="Special notes (e.g. Only 2 seats left)"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* INCLUSIONS TAB (Redesigned) */}
        {activeTab === 'INCLUSIONS' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Inclusions */}
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b-4 border-green-600 pb-4">
                <div>
                  <h4 className="font-brand font-black text-2xl uppercase tracking-tighter text-green-600">Included.</h4>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mt-1">Operational support and assets</p>
                </div>
                <button 
                  onClick={() => {
                    const inc = [...(activePackage.inclusionsRich || [])];
                    inc.push({ text: '', category: 'General', icon: 'Check' });
                    updateActivePackage({ inclusionsRich: inc });
                  }}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-[10px] font-black text-[9px] uppercase tracking-widest hover:bg-[#121212] transition-all"
                >
                  + Add Item
                </button>
              </div>
              <div className="space-y-3">
                {(activePackage.inclusionsRich || []).map((item, idx) => (
                  <div key={idx} className="bg-white rounded-[14px] border-2 border-[#121212]/10 p-4 flex gap-4 items-start">
                    <div className="relative group/icon shrink-0 mt-1">
                      <div className="size-10 bg-green-50 border border-green-200 flex items-center justify-center text-green-600">
                        <IconPreview name={item.icon || 'Check'} size={20} />
                      </div>
                      <select 
                        value={item.icon || 'Check'} 
                        onChange={e => {
                          const n = [...(activePackage.inclusionsRich || [])];
                          n[idx].icon = e.target.value;
                          updateActivePackage({ inclusionsRich: n });
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      >
                        {['Check', 'Home', 'Truck', 'Utensils', 'Shield', 'User', 'Camera', 'Map', 'Coffee', 'Star', 'Gift'].map(k => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 space-y-2">
                      <select 
                        value={item.category || 'General'}
                        onChange={e => {
                          const n = [...(activePackage.inclusionsRich || [])];
                          n[idx].category = e.target.value;
                          updateActivePackage({ inclusionsRich: n });
                        }}
                        className="text-[8px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 outline-none"
                      >
                        <option value="Accommodation">Accommodation</option>
                        <option value="Transport">Transport</option>
                        <option value="Meals">Meals</option>
                        <option value="Guides">Guides</option>
                        <option value="General">General</option>
                      </select>
                      <input 
                        type="text" 
                        value={item.text}
                        onChange={e => {
                          const n = [...(activePackage.inclusionsRich || [])];
                          n[idx].text = e.target.value;
                          updateActivePackage({ inclusionsRich: n });
                        }}
                        placeholder="Inclusion detail..."
                        className="w-full border-none outline-none font-bold text-xs uppercase"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        const n = [...(activePackage.inclusionsRich || [])];
                        n.splice(idx, 1);
                        updateActivePackage({ inclusionsRich: n });
                      }}
                      className="text-gray-300 hover:text-[#9E1B1D] p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Exclusions */}
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b-4 border-[#9E1B1D] pb-4">
                <div>
                  <h4 className="font-brand font-black text-2xl uppercase tracking-tighter text-[#9E1B1D]">Excluded.</h4>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mt-1">External liabilities and costs</p>
                </div>
                <button 
                  onClick={() => {
                    const exc = [...(activePackage.exclusionsRich || [])];
                    exc.push({ text: '', category: 'General', icon: 'X' });
                    updateActivePackage({ exclusionsRich: exc });
                  }}
                  className="bg-[#9E1B1D] text-white px-4 py-2 rounded-[10px] font-black text-[9px] uppercase tracking-widest hover:bg-[#121212] transition-all"
                >
                  + Add Item
                </button>
              </div>
              <div className="space-y-3">
                {(activePackage.exclusionsRich || []).map((item, idx) => (
                  <div key={idx} className="bg-white rounded-[14px] border-2 border-[#121212]/10 p-4 flex gap-4 items-start">
                    <div className="relative group/icon shrink-0 mt-1">
                      <div className="size-10 bg-red-50 border border-red-200 flex items-center justify-center text-[#9E1B1D]">
                        <IconPreview name={item.icon || 'X'} size={20} />
                      </div>
                      <select 
                        value={item.icon || 'X'} 
                        onChange={e => {
                          const n = [...(activePackage.exclusionsRich || [])];
                          n[idx].icon = e.target.value;
                          updateActivePackage({ exclusionsRich: n });
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      >
                        {['X', 'DollarSign', 'CreditCard', 'ShieldOff', 'WifiOff', 'PlaneLanding'].map(k => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 space-y-2">
                       <select 
                        value={item.category || 'General'}
                        onChange={e => {
                          const n = [...(activePackage.exclusionsRich || [])];
                          n[idx].category = e.target.value;
                          updateActivePackage({ exclusionsRich: n });
                        }}
                        className="text-[8px] font-black uppercase tracking-widest text-[#9E1B1D] bg-red-50 px-2 py-0.5 outline-none"
                      >
                        <option value="Flights">Flights</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Personal">Personal</option>
                        <option value="General">General</option>
                      </select>
                      <input 
                        type="text" 
                        value={item.text}
                        onChange={e => {
                          const n = [...(activePackage.exclusionsRich || [])];
                          n[idx].text = e.target.value;
                          updateActivePackage({ exclusionsRich: n });
                        }}
                        placeholder="Exclusion detail..."
                        className="w-full border-none outline-none font-bold text-xs uppercase"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        const n = [...(activePackage.exclusionsRich || [])];
                        n.splice(idx, 1);
                        updateActivePackage({ exclusionsRich: n });
                      }}
                      className="text-gray-300 hover:text-[#9E1B1D] p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MEDIA TAB */}
        {activeTab === 'MEDIA' && (
          <div className="space-y-12">
            <div className="max-w-xl">
              <ImageInput 
                label="Primary Thumbnail (Hero)"
                value={activePackage.media.thumbnail}
                storagePath={`packages/${activePackage.slug}/hero`}
                onSave={(url) => updateActivePackage({ media: { ...activePackage.media, thumbnail: url } })}
                aspectClass="aspect-video"
              />
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center border-b-2 border-[#121212] pb-4">
                <h4 className="font-black text-xs uppercase tracking-widest">Gallery Assets</h4>
                <button 
                  onClick={() => {
                    const gal = [...(activePackage.media.gallery || [])];
                    gal.push('');
                    updateActivePackage({ media: { ...activePackage.media, gallery: gal } });
                  }}
                  className="bg-[#121212] text-[#F4BF4B] px-4 py-2 font-black text-[10px] uppercase tracking-widest"
                >
                  + Add Image Slot
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {(activePackage.media.gallery || []).map((img, i) => (
                  <div key={i} className="space-y-2">
                    <ImageInput 
                      label={`Gallery Image #${i+1}`}
                      value={img}
                      storagePath={`packages/${activePackage.slug}/gallery_${i}`}
                      onSave={(url) => {
                        const gal = [...(activePackage.media.gallery || [])];
                        gal[i] = url;
                        updateActivePackage({ media: { ...activePackage.media, gallery: gal } });
                      }}
                      aspectClass="aspect-square"
                    />
                    <button 
                      onClick={() => {
                        const gal = [...(activePackage.media.gallery || [])];
                        gal.splice(i, 1);
                        updateActivePackage({ media: { ...activePackage.media, gallery: gal } });
                      }}
                      className="w-full py-2 bg-red-50 text-[#9E1B1D] font-black text-[9px] uppercase tracking-widest hover:bg-red-100 transition-colors"
                    >
                      Delete Slot
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* PDF ITINERARY UPLOAD SECTION */}
            <div className="space-y-6 border-t-4 border-[#121212] pt-12">
              <div>
                <h4 className="font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ImageIcon size={16} /> Itinerary PDF Download
                </h4>
                <p className="text-[10px] text-gray-600 mb-4">Upload a PDF for users to download on the itinerary page</p>
              </div>
              
              <div className="border-4 border-dashed border-[#121212] bg-[#FCFBF7] p-8 relative">
                {activePackage.itineraryPDF ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-green-50 border-2 border-green-200 p-4 rounded-none">
                      <CheckCircle size={20} className="text-green-600" />
                      <div className="flex-1">
                        <p className="font-black text-[10px] uppercase tracking-widest text-green-700">PDF Uploaded</p>
                        <p className="text-[9px] text-green-600 mt-1 break-all">{activePackage.itineraryPDF.split('/').pop()}</p>
                      </div>
                    </div>
                    <a
                      href={activePackage.itineraryPDF}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#121212] text-[#F4BF4B] px-6 py-2 font-black text-[9px] uppercase tracking-widest hover:bg-[#9E1B1D] transition-colors"
                    >
                      <Download size={14} /> Preview PDF
                    </a>
                    <button
                      onClick={() => updateActivePackage({ itineraryPDF: undefined })}
                      className="block w-full py-2 bg-red-50 text-[#9E1B1D] font-black text-[9px] uppercase tracking-widest hover:bg-red-100 transition-colors"
                    >
                      Remove PDF
                    </button>
                  </div>
                ) : (
                  <PDFUploadInput
                    onSave={(url) => updateActivePackage({ itineraryPDF: url })}
                    storagePath={`packages/${activePackage.slug}`}
                    packageTitle={activePackage.title}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* FAQS TAB (Simplified sub-collection proxy) */}
        {activeTab === 'FAQS' && (
          <div className="p-12 text-center border-4 border-dashed border-[#121212]/10 bg-white">
            <HelpCircle size={48} className="mx-auto text-gray-200 mb-4" />
            <h4 className="font-brand font-black text-2xl uppercase text-[#121212]">Global Package FAQs</h4>
            <p className="font-bold text-xs uppercase tracking-widest text-gray-500 mt-2 max-w-md mx-auto">
              FAQs are currently managed via the database seeder. 
              Interactive FAQ management for individual packages is coming in the next administrative update.
            </p>
          </div>
        )}

        {/* SLOTS TAB */}
        {activeTab === 'SLOTS' && (
          <div className="space-y-12 max-w-2xl">
            <div className="border-4 border-[#121212] p-8 bg-white">
              <h3 className="font-black text-lg uppercase tracking-widest mb-8">Slot Management</h3>
              
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-3">Maximum Slots Available</label>
                  <input 
                    type="number" 
                    value={activePackage.maxSlots || 12} 
                    onChange={e => updateActivePackage({ maxSlots: parseInt(e.target.value) || 12 })}
                    className="w-full max-w-xs px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-black text-xl text-[#121212] transition-all"
                    placeholder="12"
                  />
                  <p className="text-[9px] text-gray-500 mt-2">Total number of seats available for this expedition</p>
                </div>

                <div className="bg-[#FCFBF7] border-2 border-[#F4BF4B] p-6 rounded">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest">Booked Slots (Auto-calculated)</span>
                    <span className="font-black text-2xl text-[#9E1B1D]">{activePackage.bookedSlots || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest">Available Slots</span>
                    <span className="font-black text-2xl text-green-600">{(activePackage.maxSlots || 12) - (activePackage.bookedSlots || 0)}</span>
                  </div>
                  <div className="mt-4 w-full bg-gray-200 h-3 rounded overflow-hidden">
                    <div 
                      className="h-full bg-[#9E1B1D] transition-all" 
                      style={{ width: `${((activePackage.bookedSlots || 0) / (activePackage.maxSlots || 12)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === 'PAYMENTS' && (
          <div className="space-y-12 max-w-2xl">
            <div className="border-4 border-[#121212] p-8 bg-white">
              <h3 className="font-black text-lg uppercase tracking-widest mb-8">Advance Payment Configuration</h3>
              
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-4">Payment Type</label>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-[#FCFBF7] p-3 rounded transition-colors">
                      <input 
                        type="checkbox" 
                        checked={!!activePackage.advancePaymentFixed}
                        onChange={e => updateActivePackage({ 
                          advancePaymentFixed: e.target.checked ? 5000 : undefined 
                        })}
                        className="w-5 h-5 rounded accent-[#121212]"
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest">Fixed Advance Amount</span>
                    </label>
                    {activePackage.advancePaymentFixed && (
                      <input 
                        type="number" 
                        value={activePackage.advancePaymentFixed} 
                        onChange={e => updateActivePackage({ advancePaymentFixed: parseInt(e.target.value) || 5000 })}
                        className="ml-6 w-full max-w-xs px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-black text-[#121212] transition-all"
                        placeholder="5000"
                      />
                    )}
                  </div>

                  <div className="space-y-4 mt-6">
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-[#FCFBF7] p-3 rounded transition-colors">
                      <input 
                        type="checkbox" 
                        checked={!!activePackage.advancePaymentPercentage}
                        onChange={e => updateActivePackage({ 
                          advancePaymentPercentage: e.target.checked ? 30 : undefined 
                        })}
                        className="w-5 h-5 rounded accent-[#121212]"
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest">Percentage of Total Price</span>
                    </label>
                    {activePackage.advancePaymentPercentage && (
                      <input 
                        type="number" 
                        value={activePackage.advancePaymentPercentage} 
                        onChange={e => updateActivePackage({ advancePaymentPercentage: parseInt(e.target.value) || 30 })}
                        className="ml-6 w-full max-w-xs px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-black text-[#121212] transition-all"
                        placeholder="30"
                        min="0"
                        max="100"
                      />
                    )}
                  </div>
                </div>

                {(activePackage.advancePaymentFixed || activePackage.advancePaymentPercentage) && (
                  <div className="bg-blue-50 border-2 border-blue-400 p-6 rounded">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-900">Preview:</p>
                    <p className="text-[9px] text-blue-800 mt-2">
                      {activePackage.advancePaymentFixed && `Fixed advance: ${activePackage.advancePaymentFixed} INR`}
                      {activePackage.advancePaymentFixed && activePackage.advancePaymentPercentage && ' OR '}
                      {activePackage.advancePaymentPercentage && `${activePackage.advancePaymentPercentage}% of total price`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ADD-ONS TAB */}
        {activeTab === 'ADDONS' && (
          <div className="space-y-12">
            <div className="border-4 border-[#121212] p-8 bg-white">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-black text-lg uppercase tracking-widest">Predefined Add-ons</h3>
                <button 
                  onClick={() => {
                    const addons = [...(activePackage.predefinedAddons || [])];
                    addons.push({ 
                      id: Date.now().toString(), 
                      name: 'New Add-on', 
                      description: '', 
                      price: 0, 
                      optional: true 
                    });
                    updateActivePackage({ predefinedAddons: addons });
                  }}
                  className="bg-[#121212] text-[#F4BF4B] px-4 py-2 rounded-[10px] font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-all"
                >
                  + Add Option
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(activePackage.predefinedAddons || []).map((addon, idx) => (
                  <div key={addon.id} className="rounded-[14px] border-2 border-[#121212]/10 p-5 bg-white space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-black uppercase tracking-tighter bg-gray-100 px-2 py-1">Add-on #{idx+1}</span>
                      <button 
                        onClick={() => {
                          const addons = [...(activePackage.predefinedAddons || [])];
                          addons.splice(idx, 1);
                          updateActivePackage({ predefinedAddons: addons });
                        }}
                        className="text-[#9E1B1D] hover:bg-red-50 p-1 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div>
                      <label className="text-[9px] font-black uppercase text-gray-400">Add-on Name</label>
                      <input 
                        type="text" 
                        value={addon.name} 
                        onChange={e => {
                          const addons = [...(activePackage.predefinedAddons || [])];
                          addons[idx].name = e.target.value;
                          updateActivePackage({ predefinedAddons: addons });
                        }}
                        className="w-full p-2 border-b-2 border-[#121212] outline-none font-bold text-sm"
                        placeholder="e.g. Professional Photography"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black uppercase text-gray-400">Description</label>
                      <input 
                        type="text" 
                        value={addon.description || ''} 
                        onChange={e => {
                          const addons = [...(activePackage.predefinedAddons || [])];
                          addons[idx].description = e.target.value;
                          updateActivePackage({ predefinedAddons: addons });
                        }}
                        className="w-full p-2 border-b-2 border-[#121212] outline-none font-bold text-sm"
                        placeholder="Brief description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-black uppercase text-gray-400">Price ({activePackage.pricing?.currency || 'INR'})</label>
                        <input 
                          type="number" 
                          value={addon.price} 
                          onChange={e => {
                            const addons = [...(activePackage.predefinedAddons || [])];
                            addons[idx].price = parseInt(e.target.value) || 0;
                            updateActivePackage({ predefinedAddons: addons });
                          }}
                          className="w-full p-2 border-b-2 border-[#121212] outline-none font-black"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase text-gray-400">Optional</label>
                        <label className="flex items-center gap-2 mt-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={addon.optional}
                            onChange={e => {
                              const addons = [...(activePackage.predefinedAddons || [])];
                              addons[idx].optional = e.target.checked;
                              updateActivePackage({ predefinedAddons: addons });
                            }}
                            className="w-5 h-5 rounded accent-[#121212]"
                          />
                          <span className="text-[8px] font-bold">Optional</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* INSURANCE OPTIONS */}
            <div className="border-4 border-[#121212] p-8 bg-white mt-12">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-black text-lg uppercase tracking-widest">Insurance Options</h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Configure insurance plans for travelers to choose from.</p>
                </div>
                <button 
                  onClick={() => {
                    const options = [...(activePackage.insuranceOptions || [])];
                    options.push({ 
                      id: Date.now().toString(), 
                      name: 'New Insurance Plan', 
                      description: '', 
                      pricePerPerson: 0, 
                      active: true 
                    });
                    updateActivePackage({ insuranceOptions: options });
                  }}
                  className="bg-[#121212] text-[#F4BF4B] px-4 py-2 rounded-[10px] font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-all"
                >
                  + Add Insurance
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(activePackage.insuranceOptions || []).map((ins, idx) => (
                  <div key={ins.id} className="rounded-[14px] border-2 border-[#121212]/10 p-5 bg-[#FCFBF7] space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-black uppercase tracking-tighter bg-[#F4BF4B] px-2 py-1 border border-[#121212]">Insurance #{idx+1}</span>
                      <button 
                        onClick={() => {
                          const options = [...(activePackage.insuranceOptions || [])];
                          options.splice(idx, 1);
                          updateActivePackage({ insuranceOptions: options });
                        }}
                        className="text-[#9E1B1D] hover:bg-red-50 p-1 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div>
                      <label className="text-[9px] font-black uppercase text-gray-400">Plan Name</label>
                      <input 
                        type="text" 
                        value={ins.name} 
                        onChange={e => {
                          const options = [...(activePackage.insuranceOptions || [])];
                          options[idx].name = e.target.value;
                          updateActivePackage({ insuranceOptions: options });
                        }}
                        className="w-full p-2 border-b-2 border-[#121212] outline-none font-bold text-sm bg-transparent"
                        placeholder="e.g. Basic Medical Cover"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black uppercase text-gray-400">Description</label>
                      <input 
                        type="text" 
                        value={ins.description || ''} 
                        onChange={e => {
                          const options = [...(activePackage.insuranceOptions || [])];
                          options[idx].description = e.target.value;
                          updateActivePackage({ insuranceOptions: options });
                        }}
                        className="w-full p-2 border-b-2 border-[#121212] outline-none font-bold text-sm bg-transparent"
                        placeholder="Brief description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-black uppercase text-gray-400">Price Per Person ({activePackage.pricing?.currency || 'INR'})</label>
                        <input 
                          type="number" 
                          value={ins.pricePerPerson} 
                          onChange={e => {
                            const options = [...(activePackage.insuranceOptions || [])];
                            options[idx].pricePerPerson = parseInt(e.target.value) || 0;
                            updateActivePackage({ insuranceOptions: options });
                          }}
                          className="w-full p-2 border-b-2 border-[#121212] outline-none font-black bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase text-gray-400">Status</label>
                        <label className="flex items-center gap-2 mt-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={ins.active}
                            onChange={e => {
                              const options = [...(activePackage.insuranceOptions || [])];
                              options[idx].active = e.target.checked;
                              updateActivePackage({ insuranceOptions: options });
                            }}
                            className="w-5 h-5 rounded accent-[#121212]"
                          />
                          <span className="text-[8px] font-bold">{ins.active ? 'Active' : 'Inactive'}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
