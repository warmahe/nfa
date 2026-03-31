import React, { useState, useEffect } from 'react';
import { getCollectionData } from '../../services/firebaseService';
import { initializeFirestoreDatabase } from '../../services/firebaseSeeder';
import { Package } from '../../types/database';
import { AdminJoiningPointsManager } from './AdminJoiningPointsManager';
import { AdminActivitiesManager } from './AdminActivitiesManager';
import { AdminFAQsManager } from './AdminFAQsManager';
import { AdminDestinationManager } from './AdminDestinationManager';

export const AdminDashboard: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'joining-points' | 'activities' | 'itinerary-faqs' | 'website-faqs' | 'destinations'>('joining-points');

  useEffect(() => {
    loadPackages();
  }, []);

  useEffect(() => {
    if (packages.length > 0 && !selectedPackageId) {
      setSelectedPackageId(packages[0].id);
    }
  }, [packages, selectedPackageId]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await getCollectionData('packages');
      setPackages(data as Package[]);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    if (
      window.confirm(
        'This will seed your database with sample data. Continue?'
      )
    ) {
      try {
        setSeeding(true);
        setSeedSuccess(false);
        await initializeFirestoreDatabase();
        setSeedSuccess(true);
        loadPackages();
        setTimeout(() => setSeedSuccess(false), 5000);
      } catch (error) {
        console.error('Error seeding database:', error);
        alert('Error seeding database: ' + error);
      } finally {
        setSeeding(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage packages, joining points, and activities</p>
        </div>

        {/* Success Alert */}
        {seedSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            ✅ Database seeded successfully! 3 destinations and 2 packages created.
          </div>
        )}

        {/* Seed Database Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Database Setup</h2>
              <p className="text-gray-600">
                Click below to populate your database with sample destinations, packages, joining
                points, and activities.
              </p>
            </div>
            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-semibold whitespace-nowrap ml-4"
            >
              {seeding ? '🔄 Seeding...' : '🌱 Seed Database'}
            </button>
          </div>
        </div>

        {packages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">No packages found. Please seed the database first.</p>
            <button
              onClick={handleSeedDatabase}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Seed Database
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {/* Package Selector */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Package</h2>
              <div className="flex flex-wrap gap-2">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                      selectedPackageId === pkg.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {pkg.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Navigation */}
            {selectedPackageId && (
              <>
                <div className="bg-white rounded-lg shadow-md mb-6">
                  <div className="flex border-b overflow-x-auto">
                    <button
                      onClick={() => setActiveTab('joining-points')}
                      className={`flex-1 px-6 py-4 font-semibold text-center transition-colors whitespace-nowrap ${
                        activeTab === 'joining-points'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900 bg-gray-50'
                      }`}
                    >
                      Joining Points
                    </button>
                    <button
                      onClick={() => setActiveTab('activities')}
                      className={`flex-1 px-6 py-4 font-semibold text-center transition-colors whitespace-nowrap ${
                        activeTab === 'activities'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900 bg-gray-50'
                      }`}
                    >
                      Activities
                    </button>
                    <button
                      onClick={() => setActiveTab('itinerary-faqs')}
                      className={`flex-1 px-6 py-4 font-semibold text-center transition-colors whitespace-nowrap ${
                        activeTab === 'itinerary-faqs'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900 bg-gray-50'
                      }`}
                    >
                      Itinerary FAQs
                    </button>
                    <button
                      onClick={() => setActiveTab('website-faqs')}
                      className={`flex-1 px-6 py-4 font-semibold text-center transition-colors whitespace-nowrap ${
                        activeTab === 'website-faqs'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900 bg-gray-50'
                      }`}
                    >
                      Website FAQs
                    </button>
                    <button
                      onClick={() => setActiveTab('destinations')}
                      className={`flex-1 px-6 py-4 font-semibold text-center transition-colors whitespace-nowrap ${
                        activeTab === 'destinations'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900 bg-gray-50'
                      }`}
                    >
                      Destinations
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  {activeTab === 'joining-points' && (
                    <AdminJoiningPointsManager
                      packageId={selectedPackageId}
                      packageTitle={packages.find((p) => p.id === selectedPackageId)?.title || ''}
                    />
                  )}
                  {activeTab === 'activities' && (
                    <AdminActivitiesManager
                      packageId={selectedPackageId}
                      packageTitle={packages.find((p) => p.id === selectedPackageId)?.title || ''}
                    />
                  )}
                  {activeTab === 'itinerary-faqs' && (
                    <AdminFAQsManager
                      type="itinerary"
                      packageId={selectedPackageId}
                      packageTitle={packages.find((p) => p.id === selectedPackageId)?.title || ''}
                    />
                  )}
                  {activeTab === 'website-faqs' && (
                    <AdminFAQsManager
                      type="website"
                    />
                  )}
                  {activeTab === 'destinations' && (
                    <AdminDestinationManager />
                  )}
                </div>
              </>
            )}
          </div>
        )}
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      🧭 Joining Points
                    </button>
                    <button
                      onClick={() => setActiveTab('activities')}
                      className={`flex-1 px-6 py-4 font-semibold text-center transition-colors ${
                        activeTab === 'activities'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      🎯 Activities
                    </button>
                  </div>

                  <div className="p-6">
                    {activeTab === 'joining-points' && (
                      <AdminJoiningPointsManager packageId={selectedPackageId} />
                    )}
                    {activeTab === 'activities' && (
                      <AdminActivitiesManager packageId={selectedPackageId} />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
