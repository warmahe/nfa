import React, { useState, useEffect } from 'react';
import { ContactInfo, Address, PageContent } from '../../types/database';
import {
  getCollectionData,
  setDocument,
  updateDocument,
  deleteDocument,
} from '../../services/firebaseService';
import { Save, Check, Trash2, RefreshCw, Edit2 } from 'lucide-react';

export const AdminSettingsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contact' | 'address' | 'about' | 'contact-page'>('contact');
  const [contactInfo, setContactInfo] = useState<Partial<ContactInfo> | null>(null);
  const [address, setAddress] = useState<Partial<Address> | null>(null);
  const [aboutPage, setAboutPage] = useState<Partial<PageContent> | null>(null);
  const [contactPageContent, setContactPageContent] = useState<Partial<PageContent> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');

      // Load Contact Info
      const contactData = await getCollectionData('settings');
      const contact = (contactData as any[]).find(item => item.pageType === 'contact-info' || item.id === 'contact-info');
      if (contact) {
        setContactInfo(contact);
      } else {
        setContactInfo({
          primaryPhone: '',
          primaryEmail: '',
          active: true,
        });
      }

      // Load Address
      const addressData = (contactData as any[]).find(item => item.pageType === 'address' || item.id === 'address');
      if (addressData) {
        setAddress(addressData);
      } else {
        setAddress({
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: '',
          latitude: 0,
          longitude: 0,
          officeHours: {
            monday: { open: '09:00 AM', close: '06:00 PM' },
            tuesday: { open: '09:00 AM', close: '06:00 PM' },
            wednesday: { open: '09:00 AM', close: '06:00 PM' },
            thursday: { open: '09:00 AM', close: '06:00 PM' },
            friday: { open: '09:00 AM', close: '06:00 PM' },
            saturday: { open: '10:00 AM', close: '04:00 PM' },
            sunday: { open: 'Closed', close: 'Closed' },
          },
          active: true,
        });
      }

      // Load About Page
      const aboutData = (contactData as any[]).find(item => item.pageType === 'about');
      if (aboutData) {
        setAboutPage(aboutData);
      } else {
        setAboutPage({
          pageType: 'about',
          title: 'About Us',
          slug: 'about',
          content: '',
          status: 'draft',
          published: false,
          createdBy: 'admin',
          updatedBy: 'admin',
        });
      }

      // Load Contact Page
      const contactPageData = (contactData as any[]).find(item => item.pageType === 'contact');
      if (contactPageData) {
        setContactPageContent(contactPageData);
      } else {
        setContactPageContent({
          pageType: 'contact',
          title: 'Contact Us',
          slug: 'contact',
          content: '',
          status: 'draft',
          published: false,
          createdBy: 'admin',
          updatedBy: 'admin',
        });
      }

    } catch (err) {
      setError('Failed to load settings: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleContactChange = (field: string, value: any) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: string, value: any) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleOfficeHoursChange = (day: string, field: string, value: string) => {
    setAddress(prev => ({
      ...prev,
      officeHours: {
        ...prev?.officeHours,
        [day]: { ...prev?.officeHours?.[day as keyof typeof prev.officeHours], [field]: value },
      },
    }));
  };

  const handleCoordinatesChange = (field: string, value: string) => {
    setAddress(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  const handlePageChange = (field: string, value: any, page: 'about' | 'contact') => {
    if (page === 'about') {
      setAboutPage(prev => ({ ...prev, [field]: value }));
    } else {
      setContactPageContent(prev => ({ ...prev, [field]: value }));
    }
  };

  const saveContactInfo = async () => {
    if (!contactInfo?.primaryPhone || !contactInfo?.primaryEmail) {
      setError('Phone and email are required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const docId = (contactInfo as any)?.id || 'contact-info';
      
      // Save with merge: true so it creates document if it does not exist yet
      await setDocument('settings', docId, {
        ...contactInfo,
        id: docId,
        pageType: 'contact-info',
        updatedAt: new Date(),
      }, true);

      // Also save to secondary document and localStorage for instant client fallback
      if (contactInfo?.whatsapp) {
        const cleanWhatsapp = contactInfo.whatsapp.replace(/\D/g, '');
        localStorage.setItem('nfa_admin_whatsapp', contactInfo.whatsapp);
        await setDocument('settings', 'whatsapp', {
          number: contactInfo.whatsapp,
          cleanNumber: cleanWhatsapp,
          updatedAt: new Date(),
        }, true).catch(() => {});
      }

      setSuccess('Contact & WhatsApp Dispatch settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save settings: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const saveAddress = async () => {
    if (!address?.street || !address?.city) {
      setError('Street and city are required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const docId = (address as any)?.id || 'address';
      await updateDocument('settings', docId, {
        ...address,
        id: docId,
        pageType: 'address',
        updatedAt: new Date(),
      });
      setSuccess('Address saved!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const savePage = async (page: 'about' | 'contact') => {
    const content = page === 'about' ? aboutPage : contactPageContent;

    if (!content?.title || !content?.content) {
      setError('Title and content are required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const docId = (content as any)?.id || `${content.pageType}-page`;
      await updateDocument('settings', docId, {
        ...content,
        id: docId,
        updatedAt: new Date(),
        updatedBy: 'admin',
      });
      setSuccess(`${content.title} saved!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };



  const syncSettings = async () => {
    try {
      setSyncing(true);
      setError('');
      await loadSettings();
      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Couldn\'t save settings. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const deleteContactInfo = async () => {
    try {
      setSaving(true);
      const docId = (contactInfo as any)?.id || 'contact-info';
      await deleteDocument('settings', docId);
      setSuccess('Contact information deleted!');
      setDeleteConfirm(null);
      loadSettings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async () => {
    try {
      setSaving(true);
      const docId = (address as any)?.id || 'address';
      await deleteDocument('settings', docId);
      setSuccess('Address deleted!');
      setDeleteConfirm(null);
      loadSettings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deletePageContent = async (page: 'about' | 'contact') => {
    try {
      setSaving(true);
      const content = page === 'about' ? aboutPage : contactPageContent;
      const docId = (content as any)?.id || `${content?.pageType}-page`;
      await deleteDocument('settings', docId);
      setSuccess(`${content?.title} deleted!`);
      setDeleteConfirm(null);
      loadSettings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 font-medium text-xs text-slate-400 uppercase tracking-wider">Loading settings...</div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="font-sans font-bold text-lg text-slate-900 tracking-tight">System Settings & Pages</h2>
          <p className="text-xs text-slate-500 mt-0.5">Configure organization contacts, office locations, and static page content</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={syncSettings}
            disabled={syncing}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-xs text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Saving...' : 'Refresh Settings'}
          </button>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border font-semibold text-xs transition-colors cursor-pointer ${
              editMode
                ? 'bg-amber-500/15 border-amber-400 text-slate-900'
                : 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <Edit2 size={14} />
            {editMode ? 'View Mode' : 'Edit Mode'}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-[14px] bg-red-50 border-2 border-red-200 text-red-700 font-bold text-xs uppercase tracking-widest flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <h3 className="font-semibold">Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-[14px] bg-green-50 border-2 border-green-200 text-green-700 font-bold text-xs uppercase tracking-widest flex items-center gap-3">
          <Check size={20} />
          <div>
            <h3 className="font-semibold">Success</h3>
            <p>{success}</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="saas-card bg-white border-slate-200/80 overflow-hidden">
        <div className="flex gap-1.5 p-3 border-b border-slate-100 bg-slate-50/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-3.5 py-2 font-semibold text-xs rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-slate-900 text-amber-400 font-bold shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            📞 Contact Information
          </button>
          <button
            onClick={() => setActiveTab('address')}
            className={`px-3.5 py-2 font-semibold text-xs rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'address'
                ? 'bg-slate-900 text-amber-400 font-bold shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            📍 Office Address
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-3.5 py-2 font-semibold text-xs rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'about'
                ? 'bg-slate-900 text-amber-400 font-bold shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            ℹ️ About Page
          </button>
          <button
            onClick={() => setActiveTab('contact-page')}
            className={`px-3.5 py-2 font-semibold text-xs rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'contact-page'
                ? 'bg-slate-900 text-amber-400 font-bold shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            ✉️ Contact Page
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Contact Information Tab */}
          {activeTab === 'contact' && contactInfo && (
            <div className="space-y-5 max-w-2xl">
              <h3 className="font-sans font-bold text-base text-slate-900">Contact Information</h3>

              {!editMode ? (
                <div className="saas-card bg-slate-50/50 p-5 space-y-4 border-slate-200/80">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-0.5">Primary Phone</p>
                      <p className="text-xs font-bold text-slate-900">{contactInfo.primaryPhone || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-0.5">Secondary Phone</p>
                      <p className="text-xs font-bold text-slate-900">{contactInfo.secondaryPhone || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-0.5">Primary Email</p>
                      <p className="text-xs font-bold text-slate-900">{contactInfo.primaryEmail || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-0.5">Support Email</p>
                      <p className="text-xs font-bold text-slate-900">{contactInfo.supportEmail || 'Not set'}</p>
                    </div>
                  </div>
                  {(contactInfo.facebook || contactInfo.instagram || contactInfo.twitter || contactInfo.linkedin) && (
                    <div className="border-t border-slate-200/60 pt-3.5">
                      <p className="text-xs font-semibold text-slate-500 mb-2">Social Media & Messaging</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {contactInfo.facebook && <p className="text-slate-600"><span className="font-semibold text-slate-900">Facebook:</span> {contactInfo.facebook}</p>}
                        {contactInfo.instagram && <p className="text-slate-600"><span className="font-semibold text-slate-900">Instagram:</span> {contactInfo.instagram}</p>}
                        {contactInfo.twitter && <p className="text-slate-600"><span className="font-semibold text-slate-900">Twitter:</span> {contactInfo.twitter}</p>}
                        {contactInfo.linkedin && <p className="text-slate-600"><span className="font-semibold text-slate-900">LinkedIn:</span> {contactInfo.linkedin}</p>}
                        {contactInfo.whatsapp && <p className="text-slate-600"><span className="font-semibold text-slate-900">WhatsApp:</span> {contactInfo.whatsapp}</p>}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Phone *
                  </label>
                  <input
                    type="tel"
                    value={contactInfo.primaryPhone || ''}
                    onChange={(e) => handleContactChange('primaryPhone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="saas-input w-full text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Secondary Phone
                  </label>
                  <input
                    type="tel"
                    value={contactInfo.secondaryPhone || ''}
                    onChange={(e) => handleContactChange('secondaryPhone', e.target.value)}
                    placeholder="+1 (555) 987-6543"
                    className="saas-input w-full text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Email *
                  </label>
                  <input
                    type="email"
                    value={contactInfo.primaryEmail || ''}
                    onChange={(e) => handleContactChange('primaryEmail', e.target.value)}
                    placeholder="contact@company.com"
                    className="saas-input w-full text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={contactInfo.supportEmail || ''}
                    onChange={(e) => handleContactChange('supportEmail', e.target.value)}
                    placeholder="support@company.com"
                    className="saas-input w-full text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Dedicated Expedition WhatsApp Dispatch Card */}
              <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💬</span>
                    <h4 className="font-bold text-xs text-emerald-900 uppercase tracking-wider">
                      Expedition WhatsApp Dispatch Number
                    </h4>
                  </div>
                  {contactInfo.whatsapp && (
                    <a
                      href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hello NFA Admin, testing WhatsApp integration.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-emerald-700 underline flex items-center gap-1 hover:text-emerald-900"
                    >
                      <span>Test WhatsApp Link</span> ↗
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                  When travelers click <strong>ENQUIRE NOW</strong>, their itinerary details will be automatically pre-filled and dispatched to this WhatsApp number.
                </p>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                    WhatsApp Number (Include Country Code e.g. +91 or +41) *
                  </label>
                  <input
                    type="tel"
                    value={contactInfo.whatsapp || ''}
                    onChange={(e) => {
                      handleContactChange('whatsapp', e.target.value);
                      localStorage.setItem('nfa_admin_whatsapp', e.target.value);
                    }}
                    placeholder="e.g. +91 98765 43210 or 919876543210"
                    className="saas-input w-full text-xs font-bold text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">Social Media Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Facebook</label>
                    <input
                      type="url"
                      value={contactInfo.facebook || ''}
                      onChange={(e) => handleContactChange('facebook', e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                      className="saas-input w-full text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Instagram</label>
                    <input
                      type="url"
                      value={contactInfo.instagram || ''}
                      onChange={(e) => handleContactChange('instagram', e.target.value)}
                      placeholder="https://instagram.com/yourpage"
                      className="saas-input w-full text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Twitter</label>
                    <input
                      type="url"
                      value={contactInfo.twitter || ''}
                      onChange={(e) => handleContactChange('twitter', e.target.value)}
                      placeholder="https://twitter.com/yourpage"
                      className="saas-input w-full text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn</label>
                    <input
                      type="url"
                      value={contactInfo.linkedin || ''}
                      onChange={(e) => handleContactChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/company/yourpage"
                      className="saas-input w-full text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">YouTube</label>
                    <input
                      type="url"
                      value={contactInfo.youtube || ''}
                      onChange={(e) => handleContactChange('youtube', e.target.value)}
                      placeholder="https://youtube.com/yourpage"
                      className="saas-input w-full text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setDeleteConfirm('contact')}
                  className="px-4 py-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
                <button
                  onClick={saveContactInfo}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-[#121212] text-[#F4BF4B] font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Save size={15} />
                  {saving ? 'Saving...' : 'Save Contact Info'}
                </button>
              </div>
                </>
              )}
            </div>
          )}

          {/* Address Tab */}
          {activeTab === 'address' && address && (
            <div className="space-y-5 max-w-2xl">
              <h3 className="font-sans font-bold text-base text-slate-900">Office Address</h3>

              {!editMode ? (
                <div className="saas-card bg-slate-50/50 p-5 space-y-4 border-slate-200/80">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-0.5">Street Address</p>
                      <p className="text-xs font-bold text-slate-900">{address.street || 'Not set'}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-0.5">City</p>
                        <p className="text-xs font-bold text-slate-900">{address.city || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-0.5">State</p>
                        <p className="text-xs font-bold text-slate-900">{address.state || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-0.5">Postal Code</p>
                        <p className="text-xs font-bold text-slate-900">{address.postalCode || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-0.5">Country</p>
                        <p className="text-xs font-bold text-slate-900">{address.country || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-200/60 pt-3.5">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Map Coordinates</p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <p className="text-slate-600"><span className="font-semibold text-slate-900">Latitude:</span> {address.latitude || '0'}</p>
                      <p className="text-slate-600"><span className="font-semibold text-slate-900">Longitude:</span> {address.longitude || '0'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={address.street || ''}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    placeholder="123 Main Street"
                    className="saas-input w-full text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={address.city || ''}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="New York"
                    className="saas-input w-full text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State/Province</label>
                  <input
                    type="text"
                    value={address.state || ''}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    placeholder="NY"
                    className="saas-input w-full text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={address.postalCode || ''}
                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                    placeholder="10001"
                    className="saas-input w-full text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={address.country || ''}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                    placeholder="United States"
                    className="saas-input w-full text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">Map Coordinates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={address.latitude || 0}
                      onChange={(e) => handleCoordinatesChange('latitude', e.target.value)}
                      placeholder="40.7128"
                      className="saas-input w-full text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={address.longitude || 0}
                      onChange={(e) => handleCoordinatesChange('longitude', e.target.value)}
                      placeholder="-74.0060"
                      className="saas-input w-full text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">Office Hours</h4>
                <div className="space-y-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                    <div key={day} className="flex items-center gap-3">
                      <label className="w-24 text-xs font-semibold text-slate-700 capitalize">{day}</label>
                      <input
                        type="text"
                        value={address.officeHours?.[day as keyof typeof address.officeHours]?.open || ''}
                        onChange={(e) => handleOfficeHoursChange(day, 'open', e.target.value)}
                        placeholder="09:00 AM"
                        className="saas-input text-xs text-slate-900 w-32"
                      />
                      <span className="text-xs text-slate-400 font-semibold">-</span>
                      <input
                        type="text"
                        value={address.officeHours?.[day as keyof typeof address.officeHours]?.close || ''}
                        onChange={(e) => handleOfficeHoursChange(day, 'close', e.target.value)}
                        placeholder="06:00 PM"
                        className="saas-input text-xs text-slate-900 w-32"
                      />
                    </div>
                  ))}
                </div>
              </div>
                </>
              )}

              <div className="flex flex-col md:flex-row justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setDeleteConfirm('address')}
                  className="px-4 py-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
                <button
                  onClick={saveAddress}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-[#121212] text-[#F4BF4B] font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Save size={15} />
                  {saving ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </div>
          )}

          {/* About Page Tab */}
          {activeTab === 'about' && aboutPage && (
            <div className="space-y-5 max-w-4xl">
              <h3 className="font-sans font-bold text-base text-slate-900">About Page Settings</h3>

              {!editMode ? (
                <div className="saas-card bg-slate-50/50 p-5 space-y-4 border-slate-200/80">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-0.5">Title</p>
                      <p className="text-xs font-bold text-slate-900">{aboutPage.title || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-0.5">Status</p>
                      <p className="text-xs font-bold text-slate-900 capitalize">{aboutPage.status || 'draft'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Content Preview</p>
                    <div className="text-xs font-mono text-slate-700 bg-white p-3 rounded-lg border border-slate-200/80 max-h-32 overflow-y-auto">
                      {aboutPage.content ? aboutPage.content.substring(0, 200) + (aboutPage.content.length > 200 ? '...' : '') : 'Not set'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-0.5">SEO Description</p>
                      <p className="text-xs text-slate-600 line-clamp-2">{aboutPage.seoDescription || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-0.5">SEO Keywords</p>
                      <p className="text-xs text-slate-600 line-clamp-2">{aboutPage.seoKeywords?.join(', ') || 'Not set'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-0.5">Published Status</p>
                    <p className="text-xs font-bold text-slate-900">{aboutPage.published ? '✓ Published' : '✗ Draft'}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={aboutPage.title || ''}
                      onChange={(e) => handlePageChange('title', e.target.value, 'about')}
                      placeholder="About Us"
                      className="saas-input w-full text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Page Content (HTML supported)
                    </label>
                    <textarea
                      value={aboutPage.content || ''}
                      onChange={(e) => handlePageChange('content', e.target.value, 'about')}
                      placeholder="Enter about page content..."
                      rows={8}
                      className="saas-input w-full text-xs text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">SEO Description</label>
                    <textarea
                      value={aboutPage.seoDescription || ''}
                      onChange={(e) => handlePageChange('seoDescription', e.target.value, 'about')}
                      placeholder="Meta description for search engines"
                      rows={2}
                      className="saas-input w-full text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      SEO Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      value={aboutPage.seoKeywords?.join(',') || ''}
                      onChange={(e) => handlePageChange('seoKeywords', e.target.value.split(',').map(k => k.trim()), 'about')}
                      placeholder="keyword1, keyword2, keyword3"
                      className="saas-input w-full text-xs text-slate-900"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aboutPage.published || false}
                        onChange={(e) => handlePageChange('published', e.target.checked, 'about')}
                        className="w-4 h-4 accent-[#121212] rounded cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-800">Published</span>
                    </label>
                    <select
                      value={aboutPage.status || 'draft'}
                      onChange={(e) => handlePageChange('status', e.target.value, 'about')}
                      className="saas-input text-xs text-slate-900 w-36 cursor-pointer"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex flex-col md:flex-row justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setDeleteConfirm('about')}
                  className="px-4 py-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
                <button
                  onClick={() => savePage('about')}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-[#121212] text-[#F4BF4B] font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Save size={15} />
                  {saving ? 'Saving...' : 'Save About Page'}
                </button>
              </div>
            </div>
          )}

          {/* Contact Page Tab */}
          {activeTab === 'contact-page' && contactPageContent && (
            <div className="space-y-5 max-w-4xl">
              <h3 className="font-sans font-bold text-base text-slate-900">Contact Page Settings</h3>

              {!editMode ? (
                <div className="saas-card bg-slate-50/50 p-5 space-y-4 border-slate-200/80">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-0.5">Title</p>
                      <p className="text-xs font-bold text-slate-900">{contactPageContent.title || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-0.5">Status</p>
                      <p className="text-xs font-bold text-slate-900 capitalize">{contactPageContent.status || 'draft'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Content Preview</p>
                    <div className="text-xs font-mono text-slate-700 bg-white p-3 rounded-lg border border-slate-200/80 max-h-32 overflow-y-auto">
                      {contactPageContent.content ? contactPageContent.content.substring(0, 200) + (contactPageContent.content.length > 200 ? '...' : '') : 'Not set'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-0.5">SEO Description</p>
                      <p className="text-xs text-slate-600 line-clamp-2">{contactPageContent.seoDescription || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-0.5">SEO Keywords</p>
                      <p className="text-xs text-slate-600 line-clamp-2">{contactPageContent.seoKeywords?.join(', ') || 'Not set'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-0.5">Published Status</p>
                    <p className="text-xs font-bold text-slate-900">{contactPageContent.published ? '✓ Published' : '✗ Draft'}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={contactPageContent.title || ''}
                      onChange={(e) => handlePageChange('title', e.target.value, 'contact')}
                      placeholder="Contact Us"
                      className="saas-input w-full text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Page Content (HTML supported)
                    </label>
                    <textarea
                      value={contactPageContent.content || ''}
                      onChange={(e) => handlePageChange('content', e.target.value, 'contact')}
                      placeholder="Enter contact page content..."
                      rows={8}
                      className="saas-input w-full text-xs text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">SEO Description</label>
                    <textarea
                      value={contactPageContent.seoDescription || ''}
                      onChange={(e) => handlePageChange('seoDescription', e.target.value, 'contact')}
                      placeholder="Meta description for search engines"
                      rows={2}
                      className="saas-input w-full text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      SEO Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      value={contactPageContent.seoKeywords?.join(',') || ''}
                      onChange={(e) => handlePageChange('seoKeywords', e.target.value.split(',').map(k => k.trim()), 'contact')}
                      placeholder="keyword1, keyword2, keyword3"
                      className="saas-input w-full text-xs text-slate-900"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={contactPageContent.published || false}
                        onChange={(e) => handlePageChange('published', e.target.checked, 'contact')}
                        className="w-4 h-4 accent-[#121212] rounded cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-800">Published</span>
                    </label>
                    <select
                      value={contactPageContent.status || 'draft'}
                      onChange={(e) => handlePageChange('status', e.target.value, 'contact')}
                      className="saas-input text-xs text-slate-900 w-36 cursor-pointer"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex flex-col md:flex-row justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setDeleteConfirm('contact-page')}
                  className="px-4 py-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
                <button
                  onClick={() => savePage('contact')}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-[#121212] text-[#F4BF4B] font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Save size={15} />
                  {saving ? 'Saving...' : 'Save Contact Page'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="saas-card bg-white p-6 max-w-sm w-full border-slate-200 shadow-xl space-y-4">
            <h3 className="font-sans font-bold text-base text-slate-900">Delete This Setting?</h3>
            <p className="text-xs text-slate-500">
              This action cannot be undone. Are you sure you want to delete this setting?
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm === 'contact') deleteContactInfo();
                  else if (deleteConfirm === 'address') deleteAddress();
                  else if (deleteConfirm === 'about') deletePageContent('about');
                  else if (deleteConfirm === 'contact-page') deletePageContent('contact');
                }}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
