import React, { useState, useEffect } from 'react';
import { ContactInfo, Address, PageContent, RazorpaySettings } from '../../types/database';
import {
  getCollectionData,
  setDocument,
  updateDocument,
  deleteDocument,
} from '../../services/firebaseService';
import { Save, Check, Trash2, RefreshCw, Edit2 } from 'lucide-react';

export const AdminSettingsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contact' | 'address' | 'about' | 'contact-page' | 'payment'>('contact');
  const [contactInfo, setContactInfo] = useState<Partial<ContactInfo> | null>(null);
  const [address, setAddress] = useState<Partial<Address> | null>(null);
  const [aboutPage, setAboutPage] = useState<Partial<PageContent> | null>(null);
  const [contactPageContent, setContactPageContent] = useState<Partial<PageContent> | null>(null);
  const [razorpaySettings, setRazorpaySettings] = useState<Partial<RazorpaySettings> | null>(null);
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

      // Load Razorpay Settings
      const paymentData = await getCollectionData('payment-settings');
      const razorpay = (paymentData as any[])?.[0];
      if (razorpay) {
        setRazorpaySettings(razorpay);
      } else {
        setRazorpaySettings({
          keyId: '',
          keySecret: '',
          webhookUrl: '',
          webhookSecret: '',
          isActive: false,
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

  const handleRazorpayChange = (field: string, value: any) => {
    setRazorpaySettings(prev => ({ ...prev, [field]: value }));
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
      await updateDocument('settings', docId, {
        ...contactInfo,
        id: docId,
        pageType: 'contact-info',
        updatedAt: new Date(),
      });
      setSuccess('Contact information saved!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save: ' + (err as Error).message);
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

  const saveRazorpaySettings = async () => {
    if (!razorpaySettings?.keyId || !razorpaySettings?.keySecret || !razorpaySettings?.webhookUrl) {
      setError('Razorpay Key ID, Secret, and Webhook URL are required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const docId = (razorpaySettings as any)?.id || 'razorpay-settings';
      await updateDocument('payment-settings', docId, {
        ...razorpaySettings,
        id: docId,
        lastConfiguredAt: new Date(),
        configuredBy: 'admin',
        updatedAt: new Date(),
      });
      setSuccess('Razorpay settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save Razorpay settings: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const syncSettings = async () => {
    try {
      setSyncing(true);
      setError('');
      await loadSettings();
      setSuccess('Settings synced successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to sync settings: ' + (err as Error).message);
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
    return <div className="text-center py-12 font-black text-sm uppercase tracking-widest text-[#121212]/40">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">⚙️ Settings & Pages</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={syncSettings}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white hover:bg-[#F4BF4B]/10 font-black text-[11px] uppercase tracking-widest text-[#121212] transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync from Backend'}
          </button>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-2 px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 font-black text-[11px] uppercase tracking-widest transition-all ${
              editMode
                ? 'bg-[#F4BF4B]/20 text-[#121212] hover:bg-[#F4BF4B]/30'
                : 'bg-[#121212]/5 text-[#121212] hover:bg-[#121212]/10'
            }`}
          >
            <Edit2 size={18} />
            {editMode ? 'Viewing' : 'Edit'}
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
      <div className="rounded-[18px] bg-white border-2 border-[#121212]/10 shadow-[0_12px_24px_rgba(18,18,18,0.06)]">
        <div className="flex gap-0 border-b-2 border-[#121212]/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex-1 px-4 py-4 font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'contact'
                ? 'text-[#121212] border-b-2 border-[#F4BF4B] bg-[#F4BF4B]/10'
                : 'text-[#121212]/50 hover:text-[#121212] hover:bg-[#121212]/5'
            }`}
          >
            📞 Contact Information
          </button>
          <button
            onClick={() => setActiveTab('address')}
            className={`flex-1 px-4 py-4 font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'address'
                ? 'text-[#121212] border-b-2 border-[#F4BF4B] bg-[#F4BF4B]/10'
                : 'text-[#121212]/50 hover:text-[#121212] hover:bg-[#121212]/5'
            }`}
          >
            📍 Office Address
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 px-4 py-4 font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'about'
                ? 'text-[#121212] border-b-2 border-[#F4BF4B] bg-[#F4BF4B]/10'
                : 'text-[#121212]/50 hover:text-[#121212] hover:bg-[#121212]/5'
            }`}
          >
            ℹ️ About Page
          </button>
          <button
            onClick={() => setActiveTab('contact-page')}
            className={`flex-1 px-4 py-4 font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'contact-page'
                ? 'text-[#121212] border-b-2 border-[#F4BF4B] bg-[#F4BF4B]/10'
                : 'text-[#121212]/50 hover:text-[#121212] hover:bg-[#121212]/5'
            }`}
          >
            ✉️ Contact Page
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`flex-1 px-4 py-4 font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'payment'
                ? 'text-[#121212] border-b-2 border-[#F4BF4B] bg-[#F4BF4B]/10'
                : 'text-[#121212]/50 hover:text-[#121212] hover:bg-[#121212]/5'
            }`}
          >
            💳 Razorpay Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* Contact Information Tab */}
          {activeTab === 'contact' && contactInfo && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="font-brand font-black text-xl uppercase tracking-tight text-[#121212]">Contact Information</h3>

              {!editMode ? (
                <div className="rounded-[14px] bg-[#FCFBF7] p-6 space-y-4 border-2 border-[#121212]/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50 mb-1">Primary Phone</p>
                      <p className="text-sm font-black text-[#121212]">{contactInfo.primaryPhone || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50 mb-1">Secondary Phone</p>
                      <p className="text-sm font-black text-[#121212]">{contactInfo.secondaryPhone || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50 mb-1">Primary Email</p>
                      <p className="text-sm font-black text-[#121212]">{contactInfo.primaryEmail || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50 mb-1">Support Email</p>
                      <p className="text-sm font-black text-[#121212]">{contactInfo.supportEmail || 'Not set'}</p>
                    </div>
                  </div>
                  {(contactInfo.facebook || contactInfo.instagram || contactInfo.twitter || contactInfo.linkedin) && (
                    <div className="border-t-2 border-[#121212]/10 pt-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50 mb-3">Social Media & Messaging</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {contactInfo.facebook && <p className="text-xs font-bold text-[#121212]/70"><span className="font-black text-[#121212]">Facebook:</span> {contactInfo.facebook}</p>}
                        {contactInfo.instagram && <p className="text-xs font-bold text-[#121212]/70"><span className="font-black text-[#121212]">Instagram:</span> {contactInfo.instagram}</p>}
                        {contactInfo.twitter && <p className="text-xs font-bold text-[#121212]/70"><span className="font-black text-[#121212]">Twitter:</span> {contactInfo.twitter}</p>}
                        {contactInfo.linkedin && <p className="text-xs font-bold text-[#121212]/70"><span className="font-black text-[#121212]">LinkedIn:</span> {contactInfo.linkedin}</p>}
                        {contactInfo.whatsapp && <p className="text-xs font-bold text-[#121212]/70"><span className="font-black text-[#121212]">WhatsApp:</span> {contactInfo.whatsapp}</p>}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">
                    Primary Phone *
                  </label>
                  <input
                    type="tel"
                    value={contactInfo.primaryPhone || ''}
                    onChange={(e) => handleContactChange('primaryPhone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">
                    Secondary Phone
                  </label>
                  <input
                    type="tel"
                    value={contactInfo.secondaryPhone || ''}
                    onChange={(e) => handleContactChange('secondaryPhone', e.target.value)}
                    placeholder="+1 (555) 987-6543"
                    className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">
                    Primary Email *
                  </label>
                  <input
                    type="email"
                    value={contactInfo.primaryEmail || ''}
                    onChange={(e) => handleContactChange('primaryEmail', e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={contactInfo.supportEmail || ''}
                    onChange={(e) => handleContactChange('supportEmail', e.target.value)}
                    placeholder="support@company.com"
                    className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                  />
                </div>
              </div>

              <div className="border-t-2 border-[#121212]/10 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Social Media</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">Facebook</label>
                    <input
                      type="url"
                      value={contactInfo.facebook || ''}
                      onChange={(e) => handleContactChange('facebook', e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                      className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">Instagram</label>
                    <input
                      type="url"
                      value={contactInfo.instagram || ''}
                      onChange={(e) => handleContactChange('instagram', e.target.value)}
                      placeholder="https://instagram.com/yourpage"
                      className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">Twitter</label>
                    <input
                      type="url"
                      value={contactInfo.twitter || ''}
                      onChange={(e) => handleContactChange('twitter', e.target.value)}
                      placeholder="https://twitter.com/yourpage"
                      className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">LinkedIn</label>
                    <input
                      type="url"
                      value={contactInfo.linkedin || ''}
                      onChange={(e) => handleContactChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/company/yourpage"
                      className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">YouTube</label>
                    <input
                      type="url"
                      value={contactInfo.youtube || ''}
                      onChange={(e) => handleContactChange('youtube', e.target.value)}
                      placeholder="https://youtube.com/yourpage"
                      className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">WhatsApp</label>
                    <input
                      type="tel"
                      value={contactInfo.whatsapp || ''}
                      onChange={(e) => handleContactChange('whatsapp', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-end gap-3 pt-6 border-t-2 border-[#121212]/10">
                <button
                  onClick={() => setDeleteConfirm('contact')}
                  className="flex items-center gap-2 px-6 py-3 rounded-[14px] border-2 border-[#9E1B1D]/20 text-[#9E1B1D] font-black text-[11px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-all"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
                <button
                  onClick={saveContactInfo}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-[14px] bg-[#121212] text-[#F4BF4B] font-black text-[11px] uppercase tracking-widest shadow-[0_12px_24px_rgba(18,18,18,0.12)] hover:bg-[#9E1B1D] hover:text-white transition-all disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Contact Info'}
                </button>
              </div>
                </>
              )}
            </div>
          )}

          {/* Address Tab */}
          {activeTab === 'address' && address && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="font-brand font-black text-xl uppercase tracking-tight text-[#121212]">Office Address</h3>

              {!editMode ? (
                <div className="rounded-[14px] bg-[#FCFBF7] p-6 space-y-4 border-2 border-[#121212]/10">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50 mb-1">Street Address</p>
                      <p className="text-sm font-black text-[#121212]">{address.street || 'Not set'}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50 mb-1">City</p>
                        <p className="text-base font-semibold text-gray-900">{address.city || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50 mb-1">State</p>
                        <p className="text-base font-semibold text-gray-900">{address.state || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50 mb-1">Postal Code</p>
                        <p className="text-base font-semibold text-gray-900">{address.postalCode || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50 mb-1">Country</p>
                        <p className="text-base font-semibold text-gray-900">{address.country || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t-2 border-[#121212]/10 pt-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50 mb-3">Map Coordinates</p>
                    <div className="grid grid-cols-2 gap-4">
                      <p className="text-xs font-bold text-[#121212]/70"><span className="font-black text-[#121212]">Latitude:</span> {address.latitude || '0'}</p>
                      <p className="text-xs font-bold text-[#121212]/70"><span className="font-black text-[#121212]">Longitude:</span> {address.longitude || '0'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={address.street || ''}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    placeholder="123 Main Street"
                    className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">City *</label>
                  <input
                    type="text"
                    value={address.city || ''}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="New York"
                    className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">State/Province</label>
                  <input
                    type="text"
                    value={address.state || ''}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    placeholder="NY"
                    className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">Postal Code</label>
                  <input
                    type="text"
                    value={address.postalCode || ''}
                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                    placeholder="10001"
                    className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">Country</label>
                  <input
                    type="text"
                    value={address.country || ''}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                    placeholder="United States"
                    className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                  />
                </div>
              </div>

              <div className="border-t-2 border-[#121212]/10 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Map Coordinates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={address.latitude || 0}
                      onChange={(e) => handleCoordinatesChange('latitude', e.target.value)}
                      placeholder="40.7128"
                      className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={address.longitude || 0}
                      onChange={(e) => handleCoordinatesChange('longitude', e.target.value)}
                      placeholder="-74.0060"
                      className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-[#121212]/10 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Office Hours</h4>
                <div className="space-y-3">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                    <div key={day} className="flex items-center gap-4">
                      <label className="w-24 font-medium text-gray-700 capitalize">{day}</label>
                      <input
                        type="text"
                        value={address.officeHours?.[day as keyof typeof address.officeHours]?.open || ''}
                        onChange={(e) => handleOfficeHoursChange(day, 'open', e.target.value)}
                        placeholder="09:00 AM"
                        className="px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] font-bold text-sm text-[#121212] transition-all cursor-pointer"
                      />
                      <span className="text-sm font-bold text-[#121212]/60">-</span>
                      <input
                        type="text"
                        value={address.officeHours?.[day as keyof typeof address.officeHours]?.close || ''}
                        onChange={(e) => handleOfficeHoursChange(day, 'close', e.target.value)}
                        placeholder="06:00 PM"
                        className="px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] font-bold text-sm text-[#121212] transition-all cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
                </>
              )}

              <div className="flex flex-col md:flex-row justify-end gap-3 pt-6 border-t-2 border-[#121212]/10">
                <button
                  onClick={() => setDeleteConfirm('address')}
                  className="flex items-center gap-2 px-6 py-3 rounded-[14px] border-2 border-[#9E1B1D]/20 text-[#9E1B1D] font-black text-[11px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-all"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
                <button
                  onClick={saveAddress}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-[14px] bg-[#121212] text-[#F4BF4B] font-black text-[11px] uppercase tracking-widest shadow-[0_12px_24px_rgba(18,18,18,0.12)] hover:bg-[#9E1B1D] hover:text-white transition-all disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </div>
          )}

          {/* About Page Tab */}
          {activeTab === 'about' && aboutPage && (
            <div className="space-y-6 max-w-4xl">
              <h3 className="font-brand font-black text-xl uppercase tracking-tight text-[#121212]">About Page</h3>

              {!editMode ? (
                <div className="rounded-[14px] bg-[#FCFBF7] p-6 space-y-6 border-2 border-[#121212]/10">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50">Title</p>
                      <p className="text-sm font-bold text-[#121212] mt-1">{aboutPage.title || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50">Status</p>
                      <p className="text-sm font-bold text-[#121212] mt-1">{aboutPage.status || 'draft'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50">Content</p>
                    <div className="text-sm font-bold text-[#121212]/70 mt-2 bg-white p-4 rounded-[14px] border-2 border-[#121212]/10 font-mono max-h-32 overflow-y-auto">
                      {aboutPage.content ? aboutPage.content.substring(0, 200) + (aboutPage.content.length > 200 ? '...' : '') : 'Not set'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50">SEO Description</p>
                      <p className="text-sm font-bold text-[#121212]/70 mt-1 line-clamp-2">{aboutPage.seoDescription || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50">SEO Keywords</p>
                      <p className="text-sm font-bold text-[#121212]/70 mt-1 line-clamp-2">{aboutPage.seoKeywords?.join(', ') || 'Not set'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50">Published</p>
                    <p className="text-sm font-bold text-[#121212] mt-1">{aboutPage.published ? '✓ Yes' : '✗ No'}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">Title</label>
                    <input
                      type="text"
                      value={aboutPage.title || ''}
                      onChange={(e) => handlePageChange('title', e.target.value, 'about')}
                      placeholder="About Us"
                      className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">
                      Page Content (HTML supported)
                    </label>
                    <textarea
                      value={aboutPage.content || ''}
                      onChange={(e) => handlePageChange('content', e.target.value, 'about')}
                      placeholder="Enter about page content..."
                      rows={10}
                      className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">SEO Description</label>
                    <textarea
                      value={aboutPage.seoDescription || ''}
                      onChange={(e) => handlePageChange('seoDescription', e.target.value, 'about')}
                      placeholder="Meta description for search engines"
                      rows={2}
                      className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">
                      SEO Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      value={aboutPage.seoKeywords?.join(',') || ''}
                      onChange={(e) => handlePageChange('seoKeywords', e.target.value.split(',').map(k => k.trim()), 'about')}
                      placeholder="keyword1, keyword2, keyword3"
                      className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={aboutPage.published || false}
                        onChange={(e) => handlePageChange('published', e.target.checked, 'about')}
                        className="w-5 h-5 accent-[#121212] rounded"
                      />
                      <span className="text-xs font-bold uppercase tracking-widest text-[#121212]">Published</span>
                    </label>
                    <select
                      value={aboutPage.status || 'draft'}
                      onChange={(e) => handlePageChange('status', e.target.value, 'about')}
                      className="px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] font-bold text-sm text-[#121212] transition-all cursor-pointer"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex flex-col md:flex-row justify-end gap-3 pt-6 border-t-2 border-[#121212]/10">
                <button
                  onClick={() => setDeleteConfirm('about')}
                  className="flex items-center gap-2 px-6 py-3 rounded-[14px] border-2 border-[#9E1B1D]/20 text-[#9E1B1D] font-black text-[11px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-all"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
                <button
                  onClick={() => savePage('about')}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-[14px] bg-[#121212] text-[#F4BF4B] font-black text-[11px] uppercase tracking-widest shadow-[0_12px_24px_rgba(18,18,18,0.12)] hover:bg-[#9E1B1D] hover:text-white transition-all disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save About Page'}
                </button>
              </div>
            </div>
          )}

          {/* Contact Page Tab */}
          {activeTab === 'contact-page' && contactPageContent && (
            <div className="space-y-6 max-w-4xl">
              <h3 className="font-brand font-black text-xl uppercase tracking-tight text-[#121212]">Contact Page</h3>

              {!editMode ? (
                <div className="rounded-[14px] bg-[#FCFBF7] p-6 space-y-6 border-2 border-[#121212]/10">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50">Title</p>
                      <p className="text-sm font-bold text-[#121212] mt-1">{contactPageContent.title || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50">Status</p>
                      <p className="text-sm font-bold text-[#121212] mt-1">{contactPageContent.status || 'draft'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50">Content</p>
                    <div className="text-sm font-bold text-[#121212]/70 mt-2 bg-white p-4 rounded-[14px] border-2 border-[#121212]/10 font-mono max-h-32 overflow-y-auto">
                      {contactPageContent.content ? contactPageContent.content.substring(0, 200) + (contactPageContent.content.length > 200 ? '...' : '') : 'Not set'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50">SEO Description</p>
                      <p className="text-sm font-bold text-[#121212]/70 mt-1 line-clamp-2">{contactPageContent.seoDescription || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50">SEO Keywords</p>
                      <p className="text-sm font-bold text-[#121212]/70 mt-1 line-clamp-2">{contactPageContent.seoKeywords?.join(', ') || 'Not set'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50">Published</p>
                    <p className="text-sm font-bold text-[#121212] mt-1">{contactPageContent.published ? '✓ Yes' : '✗ No'}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">Title</label>
                    <input
                      type="text"
                      value={contactPageContent.title || ''}
                      onChange={(e) => handlePageChange('title', e.target.value, 'contact')}
                      placeholder="Contact Us"
                      className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">
                      Page Content (HTML supported)
                    </label>
                    <textarea
                      value={contactPageContent.content || ''}
                      onChange={(e) => handlePageChange('content', e.target.value, 'contact')}
                      placeholder="Enter contact page content..."
                      rows={10}
                      className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">SEO Description</label>
                    <textarea
                      value={contactPageContent.seoDescription || ''}
                      onChange={(e) => handlePageChange('seoDescription', e.target.value, 'contact')}
                      placeholder="Meta description for search engines"
                      rows={2}
                      className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">
                      SEO Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      value={contactPageContent.seoKeywords?.join(',') || ''}
                      onChange={(e) => handlePageChange('seoKeywords', e.target.value.split(',').map(k => k.trim()), 'contact')}
                      placeholder="keyword1, keyword2, keyword3"
                      className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={contactPageContent.published || false}
                        onChange={(e) => handlePageChange('published', e.target.checked, 'contact')}
                        className="w-5 h-5 accent-[#121212] rounded"
                      />
                      <span className="text-xs font-bold uppercase tracking-widest text-[#121212]">Published</span>
                    </label>
                    <select
                      value={contactPageContent.status || 'draft'}
                      onChange={(e) => handlePageChange('status', e.target.value, 'contact')}
                      className="px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] font-bold text-sm text-[#121212] transition-all cursor-pointer"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex flex-col md:flex-row justify-end gap-3 pt-6 border-t-2 border-[#121212]/10">
                <button
                  onClick={() => setDeleteConfirm('contact-page')}
                  className="flex items-center gap-2 px-6 py-3 rounded-[14px] border-2 border-[#9E1B1D]/20 text-[#9E1B1D] font-black text-[11px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-all"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
                <button
                  onClick={() => savePage('contact')}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-[14px] bg-[#121212] text-[#F4BF4B] font-black text-[11px] uppercase tracking-widest shadow-[0_12px_24px_rgba(18,18,18,0.12)] hover:bg-[#9E1B1D] hover:text-white transition-all disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Contact Page'}
                </button>
              </div>
            </div>
          )}

          {/* Razorpay Settings Tab */}
          {activeTab === 'payment' && razorpaySettings && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="font-brand font-black text-xl uppercase tracking-tight text-[#121212]">Razorpay Payment Configuration</h3>
              
              <div className="rounded-[14px] bg-[#F4BF4B]/10 border-2 border-[#F4BF4B]/30 p-4 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]">⚠️ Global Configuration</p>
                <p className="text-xs font-bold text-[#121212]/60">These settings will be used for ALL itineraries. Configure once and all packages will use these payment credentials.</p>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">Razorpay Key ID</label>
                <input
                  type="text"
                  value={razorpaySettings.keyId || ''}
                  onChange={(e) => handleRazorpayChange('keyId', e.target.value)}
                  placeholder="rzp_live_xxxxxxxxxxxxx"
                  className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all font-mono"
                />
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#121212]/40 mt-2">Your Razorpay public key (from Dashboard &gt; Settings &gt; API Keys)</p>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">Razorpay Key Secret</label>
                <input
                  type="password"
                  value={razorpaySettings.keySecret || ''}
                  onChange={(e) => handleRazorpayChange('keySecret', e.target.value)}
                  placeholder="••••••••••••••••••••"
                  className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all font-mono"
                />
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#121212]/40 mt-2">Your Razorpay secret key - keep this confidential (from Dashboard &gt; Settings &gt; API Keys)</p>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">Webhook URL</label>
                <input
                  type="url"
                  value={razorpaySettings.webhookUrl || ''}
                  onChange={(e) => handleRazorpayChange('webhookUrl', e.target.value)}
                  placeholder="https://yourdomain.com/api/webhooks/razorpay"
                  className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all font-mono"
                />
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#121212]/40 mt-2">Full URL where Razorpay will send payment notifications. Must be publicly accessible.</p>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">Webhook Secret</label>
                <input
                  type="password"
                  value={razorpaySettings.webhookSecret || ''}
                  onChange={(e) => handleRazorpayChange('webhookSecret', e.target.value)}
                  placeholder="••••••••••••••••••••"
                  className="w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all font-mono"
                />
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#121212]/40 mt-2">Webhook signature secret for verifying authentic Razorpay webhooks (from Dashboard &gt; Account &gt; Webhooks)</p>
              </div>

              <div className="flex items-center gap-3 bg-[#FCFBF7] p-4 rounded-[14px] border-2 border-[#121212]/10">
                <input
                  type="checkbox"
                  checked={razorpaySettings.isActive || false}
                  onChange={(e) => handleRazorpayChange('isActive', e.target.checked)}
                  className="w-5 h-5 accent-[#121212] rounded"
                />
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[#121212]">Enable Razorpay Payments</label>
                  <p className="text-[10px] font-bold text-[#121212]/50 mt-1">When disabled, payment options will be hidden from all booking pages</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-end gap-3 pt-6 border-t-2 border-[#121212]/10">
                <button
                  onClick={saveRazorpaySettings}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-[14px] bg-[#121212] text-[#F4BF4B] font-black text-[11px] uppercase tracking-widest shadow-[0_12px_24px_rgba(18,18,18,0.12)] hover:bg-[#9E1B1D] hover:text-white transition-all disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Razorpay Settings'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-[18px] p-6 lg:p-8 max-w-sm mx-4 space-y-4 shadow-[0_24px_48px_rgba(18,18,18,0.15)]">
            <h3 className="font-brand font-black text-lg uppercase tracking-tight text-[#121212]">Delete This Setting?</h3>
            <p className="text-sm font-bold text-[#121212]/60">
              This action cannot be undone. Are you sure you want to delete this setting?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-3 rounded-[14px] border-2 border-[#121212]/10 text-[#121212] font-black text-[11px] uppercase tracking-widest hover:bg-[#121212]/5 transition-colors"
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
                className="px-5 py-3 rounded-[14px] bg-[#9E1B1D] text-white font-black text-[11px] uppercase tracking-widest hover:bg-[#121212] transition-colors disabled:opacity-50"
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
