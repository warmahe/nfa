import React, { useState, useEffect } from 'react';
import { Package as PackageIcon, Settings, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { getCollectionData, updateDocument } from '../../services/firebaseService';
import { Package } from '../../types/database';
import { AdminPackageDetailsManager } from './AdminPackageDetailsManager';
import { AdminMediaManager } from './AdminMediaManager';
import { AdminPricingManager } from './AdminPricingManager';
import { AdminAvailabilityManager } from './AdminAvailabilityManager';
import { AdminItineraryBuilder } from './AdminItineraryBuilder';
import { AdminFAQsManager } from './AdminFAQsManager';
import { AdminJoiningPointsManager } from './AdminJoiningPointsManager';
import { AdminActivitiesManager } from './AdminActivitiesManager';

type AdminTab = 
  | 'packages' 
  | 'details' 
  | 'media' 
  | 'pricing' 
  | 'availability' 
  | 'itinerary' 
  | 'joining-points' 
  | 'activities' 
  | 'faqs';

export const ComprehensiveAdminDashboard: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('packages');

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await getCollectionData('packages');
      setPackages(data as Package[]);
      if (!selectedPackage && data.length > 0) {
        setSelectedPackage((data as Package[])[0]);
      }
    } catch (err) {
      setError('Failed to load packages: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewPackage = () => {
    setSelectedPackage({
      id: '',
      title: '',
      slug: '',
      overview: '',
      description: '',
      destinations: [],
      difficulty: 'Moderate',
      duration: '',
      maxTravelers: 10,
      status: 'draft',
      pricing: {
        basePrice: 0,
        currency: 'INR',
        seasonalPricing: [],
        groupPricing: [],
      },
      availability: {
        maxSlots: 10,
        bookings: 0,
      },
      media: {
        thumbnail: '',
        gallery: [],
        videos: [],
      },
      rating: {
        average: 0,
        totalReviews: 0,
        autoCalculated: 0,
      },
      joiningPointCount: 0,
      activitiesIncludedCount: 0,
      activitiesOptionalCount: 0,
      reviewsCount: 0,
      faqsCount: 0,
      createdBy: 'admin',
      updatedBy: 'admin',
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
    } as Package);
    setActiveTab('details');
  };

  const handlePackageUpdate = async (updates: Partial<Package>) => {
    if (!selectedPackage) return;

    try {
      await updateDocument('packages', selectedPackage.id, {
        ...updates,
        updatedAt: new Date(),
      });
      
      setSuccess('Package updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      loadPackages();
    } catch (err) {
      setError('Failed to update package: ' + (err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Packages View
  if (activeTab === 'packages') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📦 Package Manager</h1>
            <p className="text-gray-600 mt-1">
              Manage all package details, pricing, media, and more
            </p>
          </div>
          <button
            onClick={handleCreateNewPackage}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <Plus size={18} />
            Create New Package
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
            ✓ {success}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-gray-600 text-sm">Total Packages</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{packages.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-gray-600 text-sm">Active</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {packages.filter(p => p.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-gray-600 text-sm">Draft</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {packages.filter(p => p.status === 'draft').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-gray-600 text-sm">Archived</p>
            <p className="text-3xl font-bold text-gray-600 mt-2">
              {packages.filter(p => p.status === 'archived').length}
            </p>
          </div>
        </div>

        {/* Packages List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">All Packages</h3>
          {packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packages.map(pkg => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer space-y-4"
                  onClick={() => {
                    setSelectedPackage(pkg);
                    setActiveTab('details');
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {pkg.title}
                      </h4>
                      <p className="text-sm text-gray-600">{pkg.duration}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      pkg.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : pkg.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {pkg.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-2">
                    {pkg.overview}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600 text-xs">Difficulty</p>
                      <p className="font-semibold text-gray-900">{pkg.difficulty}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600 text-xs">Price</p>
                      <p className="font-semibold text-teal-600">
                        {pkg.pricing.basePrice} {pkg.pricing.currency}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600 text-xs">Rating</p>
                      <p className="font-semibold text-gray-900">
                        {pkg.rating.average.toFixed(1)} ⭐
                      </p>
                    </div>
                  </div>

                  <button
                    className="w-full bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Manage Package →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <PackageIcon className="mx-auto text-gray-400 mb-3" size={32} />
              <p className="text-gray-600 font-medium">No packages yet</p>
              <p className="text-sm text-gray-500 mb-4">
                Click "Create New Package" button to add your first package
              </p>
              <button
                onClick={handleCreateNewPackage}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg"
              >
                <Plus size={18} className="inline mr-2" />
                Create First Package
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Package Management Views
  if (!selectedPackage) {
    return (
      <div className="text-center py-12">
        <button
          onClick={() => setActiveTab('packages')}
          className="text-teal-600 hover:text-teal-900 font-semibold"
        >
          ← Back to Packages
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Package Selection */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setActiveTab('packages');
            setSelectedPackage(null);
          }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold"
        >
          <ArrowLeft size={20} />
          Back to Packages
        </button>
      </div>

      {/* Package Info Card */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold">{selectedPackage.title}</h2>
            <p className="text-teal-100 mt-2">{selectedPackage.overview}</p>
            <div className="flex gap-4 mt-4 text-sm">
              <span>📍 {selectedPackage.duration}</span>
              <span>👥 {selectedPackage.maxTravelers} max travelers</span>
              <span>💰 {selectedPackage.pricing.basePrice} {selectedPackage.pricing.currency}</span>
            </div>
          </div>
          <span className="text-3xl">
            {selectedPackage.status === 'active' ? '✅' : '📋'}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex flex-wrap gap-1 p-4 border-b border-gray-200">
          {[
            { id: 'details', label: '📋 Package Details', icon: '📋' },
            { id: 'media', label: '🎬 Media', icon: '🎬' },
            { id: 'pricing', label: '💰 Pricing', icon: '💰' },
            { id: 'availability', label: '📊 Availability', icon: '📊' },
            { id: 'itinerary', label: '📅 Itinerary', icon: '📅' },
            { id: 'joining-points', label: '🧭 Joining Points', icon: '🧭' },
            { id: 'activities', label: '🎯 Activities', icon: '🎯' },
            { id: 'faqs', label: '❓ FAQs', icon: '❓' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap text-sm ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              ✓ {success}
            </div>
          )}

          {activeTab === 'details' && (
            <AdminPackageDetailsManager
              packageId={selectedPackage.id}
              onBack={() => {
                setActiveTab('packages');
                setSelectedPackage(null);
              }}
            />
          )}

          {activeTab === 'media' && (
            <AdminMediaManager
              packageId={selectedPackage.id}
              packageTitle={selectedPackage.title}
              media={selectedPackage.media}
              onMediaUpdate={async (media) => {
                await handlePackageUpdate({ media });
              }}
            />
          )}

          {activeTab === 'pricing' && (
            <AdminPricingManager
              packageId={selectedPackage.id}
              packageTitle={selectedPackage.title}
              pricing={selectedPackage.pricing}
              onPricingUpdate={async (pricing) => {
                await handlePackageUpdate({ pricing });
              }}
            />
          )}

          {activeTab === 'availability' && (
            <AdminAvailabilityManager
              packageId={selectedPackage.id}
              packageTitle={selectedPackage.title}
              availability={selectedPackage.availability}
              maxTravelers={selectedPackage.maxTravelers}
              onAvailabilityUpdate={async (availability) => {
                await handlePackageUpdate({ availability });
              }}
            />
          )}

          {activeTab === 'itinerary' && (
            <AdminItineraryBuilder
              packageId={selectedPackage.id}
              packageTitle={selectedPackage.title}
              duration={selectedPackage.duration}
            />
          )}

          {activeTab === 'joining-points' && (
            <AdminJoiningPointsManager packageId={selectedPackage.id} />
          )}

          {activeTab === 'activities' && (
            <AdminActivitiesManager packageId={selectedPackage.id} />
          )}

          {activeTab === 'faqs' && (
            <AdminFAQsManager
              packageId={selectedPackage.id}
              packageTitle={selectedPackage.title}
            />
          )}
        </div>
      </div>
    </div>
  );
};
