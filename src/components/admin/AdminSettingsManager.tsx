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
    return <div className="text-center py-12 text-gray-600">Loading settings...</div>;
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync from Backend'}
          </button>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-lg transition-colors ${
              editMode
                ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Edit2 size={18} />
            {editMode ? 'Viewing' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <h3 className="font-semibold">Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start gap-3">
          <Check size={20} />
          <div>
            <h3 className="font-semibold">Success</h3>
            <p>{success}</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex gap-0 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors ${
              activeTab === 'contact'
                ? 'text-teal-700 border-b-2 border-teal-700 bg-teal-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📞 Contact Information
          </button>
          <button
            onClick={() => setActiveTab('address')}
            className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors ${
              activeTab === 'address'
                ? 'text-teal-700 border-b-2 border-teal-700 bg-teal-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📍 Office Address
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors ${
              activeTab === 'about'
                ? 'text-teal-700 border-b-2 border-teal-700 bg-teal-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ℹ️ About Page
          </button>
          <button
            onClick={() => setActiveTab('contact-page')}
            className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors ${
              activeTab === 'contact-page'
                ? 'text-teal-700 border-b-2 border-teal-700 bg-teal-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ✉️ Contact Page
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* Contact Information Tab */}
          {activeTab === 'contact' && contactInfo && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>

              {!editMode ? (
                <div className="bg-gray-50 rounded-lg p-6 space-y-4 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-tight mb-1">Primary Phone</p>
                      <p className="text-lg font-semibold text-gray-900">{contactInfo.primaryPhone || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-tight mb-1">Secondary Phone</p>
                      <p className="text-lg font-semibold text-gray-900">{contactInfo.secondaryPhone || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-tight mb-1">Primary Email</p>
                      <p className="text-lg font-semibold text-gray-900">{contactInfo.primaryEmail || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-tight mb-1">Support Email</p>
                      <p className="text-lg font-semibold text-gray-900">{contactInfo.supportEmail || 'Not set'}</p>
                    </div>
                  </div>
                  {(contactInfo.facebook || contactInfo.instagram || contactInfo.twitter || contactInfo.linkedin) && (
                    <div className="border-t border-gray-300 pt-4">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-tight mb-3">Social Media & Messaging</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {contactInfo.facebook && <p className="text-sm"><span className="font-medium">Facebook:</span> {contactInfo.facebook}</p>}
                        {contactInfo.instagram && <p className="text-sm"><span className="font-medium">Instagram:</span> {contactInfo.instagram}</p>}
                        {contactInfo.twitter && <p className="text-sm"><span className="font-medium">Twitter:</span> {contactInfo.twitter}</p>}
                        {contactInfo.linkedin && <p className="text-sm"><span className="font-medium">LinkedIn:</span> {contactInfo.linkedin}</p>}
                        {contactInfo.whatsapp && <p className="text-sm"><span className="font-medium">WhatsApp:</span> {contactInfo.whatsapp}</p>}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Phone *
                  </label>
                  <input
                    type="tel"
                    value={contactInfo.primaryPhone || ''}
                    onChange={(e) => handleContactChange('primaryPhone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Phone
                  </label>
                  <input
                    type="tel"
                    value={contactInfo.secondaryPhone || ''}
                    onChange={(e) => handleContactChange('secondaryPhone', e.target.value)}
                    placeholder="+1 (555) 987-6543"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Email *
                  </label>
                  <input
                    type="email"
                    value={contactInfo.primaryEmail || ''}
                    onChange={(e) => handleContactChange('primaryEmail', e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={contactInfo.supportEmail || ''}
                    onChange={(e) => handleContactChange('supportEmail', e.target.value)}
                    placeholder="support@company.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Social Media</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                    <input
                      type="url"
                      value={contactInfo.facebook || ''}
                      onChange={(e) => handleContactChange('facebook', e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                    <input
                      type="url"
                      value={contactInfo.instagram || ''}
                      onChange={(e) => handleContactChange('instagram', e.target.value)}
                      placeholder="https://instagram.com/yourpage"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                    <input
                      type="url"
                      value={contactInfo.twitter || ''}
                      onChange={(e) => handleContactChange('twitter', e.target.value)}
                      placeholder="https://twitter.com/yourpage"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                    <input
                      type="url"
                      value={contactInfo.linkedin || ''}
                      onChange={(e) => handleContactChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/company/yourpage"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
                    <input
                      type="url"
                      value={contactInfo.youtube || ''}
                      onChange={(e) => handleContactChange('youtube', e.target.value)}
                      placeholder="https://youtube.com/yourpage"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                    <input
                      type="tel"
                      value={contactInfo.whatsapp || ''}
                      onChange={(e) => handleContactChange('whatsapp', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setDeleteConfirm('contact')}
                  className="flex items-center gap-2 px-6 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
                <button
                  onClick={saveContactInfo}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg disabled:opacity-50"
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
              <h3 className="text-xl font-bold text-gray-900">Office Address</h3>

              {!editMode ? (
                <div className="bg-gray-50 rounded-lg p-6 space-y-4 border border-gray-200">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-tight mb-1">Street Address</p>
                      <p className="text-lg font-semibold text-gray-900">{address.street || 'Not set'}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-tight mb-1">City</p>
                        <p className="text-base font-semibold text-gray-900">{address.city || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-tight mb-1">State</p>
                        <p className="text-base font-semibold text-gray-900">{address.state || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-tight mb-1">Postal Code</p>
                        <p className="text-base font-semibold text-gray-900">{address.postalCode || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-tight mb-1">Country</p>
                        <p className="text-base font-semibold text-gray-900">{address.country || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-300 pt-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-tight mb-3">Map Coordinates</p>
                    <div className="grid grid-cols-2 gap-4">
                      <p className="text-sm"><span className="font-medium">Latitude:</span> {address.latitude || '0'}</p>
                      <p className="text-sm"><span className="font-medium">Longitude:</span> {address.longitude || '0'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={address.street || ''}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    placeholder="123 Main Street"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    value={address.city || ''}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="New York"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                  <input
                    type="text"
                    value={address.state || ''}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    placeholder="NY"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                  <input
                    type="text"
                    value={address.postalCode || ''}
                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                    placeholder="10001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={address.country || ''}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                    placeholder="United States"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Map Coordinates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={address.latitude || 0}
                      onChange={(e) => handleCoordinatesChange('latitude', e.target.value)}
                      placeholder="40.7128"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={address.longitude || 0}
                      onChange={(e) => handleCoordinatesChange('longitude', e.target.value)}
                      placeholder="-74.0060"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
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
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <span className="text-gray-600">-</span>
                      <input
                        type="text"
                        value={address.officeHours?.[day as keyof typeof address.officeHours]?.close || ''}
                        onChange={(e) => handleOfficeHoursChange(day, 'close', e.target.value)}
                        placeholder="06:00 PM"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setDeleteConfirm('address')}
                  className="flex items-center gap-2 px-6 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
                <button
                  onClick={saveAddress}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg disabled:opacity-50"
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
              <h3 className="text-xl font-bold text-gray-900">About Page</h3>

              {!editMode ? (
                <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</p>
                      <p className="text-gray-900 font-medium mt-1">{aboutPage.title || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</p>
                      <p className="text-gray-900 font-medium mt-1">{aboutPage.status || 'draft'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Content</p>
                    <div className="text-gray-700 mt-2 bg-white p-4 rounded border border-gray-200 font-mono text-sm max-h-32 overflow-y-auto">
                      {aboutPage.content ? aboutPage.content.substring(0, 200) + (aboutPage.content.length > 200 ? '...' : '') : 'Not set'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">SEO Description</p>
                      <p className="text-gray-700 mt-1 text-sm line-clamp-2">{aboutPage.seoDescription || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">SEO Keywords</p>
                      <p className="text-gray-700 mt-1 text-sm line-clamp-2">{aboutPage.seoKeywords?.join(', ') || 'Not set'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Published</p>
                    <p className="text-gray-900 font-medium mt-1">{aboutPage.published ? '✓ Yes' : '✗ No'}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={aboutPage.title || ''}
                      onChange={(e) => handlePageChange('title', e.target.value, 'about')}
                      placeholder="About Us"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Content (HTML supported)
                    </label>
                    <textarea
                      value={aboutPage.content || ''}
                      onChange={(e) => handlePageChange('content', e.target.value, 'about')}
                      placeholder="Enter about page content..."
                      rows={10}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
                    <textarea
                      value={aboutPage.seoDescription || ''}
                      onChange={(e) => handlePageChange('seoDescription', e.target.value, 'about')}
                      placeholder="Meta description for search engines"
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      value={aboutPage.seoKeywords?.join(',') || ''}
                      onChange={(e) => handlePageChange('seoKeywords', e.target.value.split(',').map(k => k.trim()), 'about')}
                      placeholder="keyword1, keyword2, keyword3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={aboutPage.published || false}
                        onChange={(e) => handlePageChange('published', e.target.checked, 'about')}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">Published</span>
                    </label>
                    <select
                      value={aboutPage.status || 'draft'}
                      onChange={(e) => handlePageChange('status', e.target.value, 'about')}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setDeleteConfirm('about')}
                  className="flex items-center gap-2 px-6 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
                <button
                  onClick={() => savePage('about')}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg disabled:opacity-50"
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
              <h3 className="text-xl font-bold text-gray-900">Contact Page</h3>

              {!editMode ? (
                <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</p>
                      <p className="text-gray-900 font-medium mt-1">{contactPageContent.title || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</p>
                      <p className="text-gray-900 font-medium mt-1">{contactPageContent.status || 'draft'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Content</p>
                    <div className="text-gray-700 mt-2 bg-white p-4 rounded border border-gray-200 font-mono text-sm max-h-32 overflow-y-auto">
                      {contactPageContent.content ? contactPageContent.content.substring(0, 200) + (contactPageContent.content.length > 200 ? '...' : '') : 'Not set'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">SEO Description</p>
                      <p className="text-gray-700 mt-1 text-sm line-clamp-2">{contactPageContent.seoDescription || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">SEO Keywords</p>
                      <p className="text-gray-700 mt-1 text-sm line-clamp-2">{contactPageContent.seoKeywords?.join(', ') || 'Not set'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Published</p>
                    <p className="text-gray-900 font-medium mt-1">{contactPageContent.published ? '✓ Yes' : '✗ No'}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={contactPageContent.title || ''}
                      onChange={(e) => handlePageChange('title', e.target.value, 'contact')}
                      placeholder="Contact Us"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Content (HTML supported)
                    </label>
                    <textarea
                      value={contactPageContent.content || ''}
                      onChange={(e) => handlePageChange('content', e.target.value, 'contact')}
                      placeholder="Enter contact page content..."
                      rows={10}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
                    <textarea
                      value={contactPageContent.seoDescription || ''}
                      onChange={(e) => handlePageChange('seoDescription', e.target.value, 'contact')}
                      placeholder="Meta description for search engines"
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      value={contactPageContent.seoKeywords?.join(',') || ''}
                      onChange={(e) => handlePageChange('seoKeywords', e.target.value.split(',').map(k => k.trim()), 'contact')}
                      placeholder="keyword1, keyword2, keyword3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={contactPageContent.published || false}
                        onChange={(e) => handlePageChange('published', e.target.checked, 'contact')}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">Published</span>
                    </label>
                    <select
                      value={contactPageContent.status || 'draft'}
                      onChange={(e) => handlePageChange('status', e.target.value, 'contact')}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setDeleteConfirm('contact-page')}
                  className="flex items-center gap-2 px-6 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
                <button
                  onClick={() => savePage('contact')}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Contact Page'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Delete This Setting?</h3>
            <p className="text-gray-600">
              This action cannot be undone. Are you sure you want to delete this setting?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
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
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg disabled:opacity-50"
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
