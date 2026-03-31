import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check, DollarSign, AlertCircle } from 'lucide-react';
import { getSubcollectionData } from '../services/firebaseService';
import { Activity } from '../types/database';

interface InclusionsLayoutProps {
  packageId: string;
  packageTitle: string;
  selectedCurrency?: 'EUR' | 'USD' | 'INR' | 'GBP';
}

export const InclusionsLayout: React.FC<InclusionsLayoutProps> = ({
  packageId,
  packageTitle,
  selectedCurrency = 'INR',
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    destinations: false,
    meals: false,
    transport: false,
    accommodation: false,
    includedsActivities: true,
    optionalActivities: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActivities();
  }, [packageId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSubcollectionData('packages', packageId, 'activities');
      const sorted = (data as Activity[]).sort((a, b) => (a.order || 0) - (b.order || 0));
      setActivities(sorted);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError('Could not load activity details.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const includedActivities = activities.filter((a) => a.isIncluded);
  const optionalActivities = activities.filter((a) => !a.isIncluded);

  // Mock inclusions data (would come from database in full implementation)
  const inclusionsData = {
    destinations: [
      'Golden Circle (Þingvellir, Geysir, Gullfoss)',
      'Blue Lagoon Geothermal Area',
      'Vatnajökull Glacier Region',
      'National Parks & Protected Areas',
    ],
    meals: [
      'Breakfast (daily)',
      'Lunch (daily)',
      'Dinner (daily prepared by local chefs)',
      'Snacks & energy bars',
      'Hot beverages (tea, coffee)',
    ],
    transport: [
      'Airport transfers (included joining point)',
      '4x4 vehicle transportation',
      'Inter-location transport',
      'Day excursion transport',
    ],
    accommodation: [
      'Basecamp lodges (3-star equivalent)',
      'Camping sites (prepared)',
      'All bedding & linens',
      'WiFi at lodges',
    ],
  };

  const InclusionSection = ({
    title,
    icon,
    items,
    sectionKey,
    bgColor,
  }: {
    title: string;
    icon: React.ReactNode;
    items: string[];
    sectionKey: keyof typeof expandedSections;
    bgColor: string;
  }) => {
    const isExpanded = expandedSections[sectionKey];

    return (
      <div className={`${bgColor} rounded-lg border border-gray-300 overflow-hidden hover:border-teal-300 transition-all`}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full p-4 flex items-center justify-between hover:bg-opacity-80 transition-all"
        >
          <span className="flex items-center gap-3 font-semibold text-gray-900">
            {icon}
            {title} ({items.length})
          </span>
          {isExpanded ? (
            <ChevronUp size={20} className="text-gray-700" />
          ) : (
            <ChevronDown size={20} className="text-gray-700" />
          )}
        </button>
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-300 bg-opacity-50">
            <ul className="space-y-3">
              {items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm font-medium text-gray-700">
                  <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const ActivityCard = ({
    activity,
    isIncluded,
  }: {
    activity: Activity;
    isIncluded: boolean;
  }) => {
    return (
      <div
        className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
          isIncluded
            ? 'bg-green-50 border-green-200 hover:border-green-400'
            : 'bg-orange-50 border-orange-200 hover:border-orange-400'
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-bold text-gray-900 flex-1">{activity.title}</h4>
          {isIncluded ? (
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ml-2">
              ✓ Included
            </span>
          ) : (
            <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ml-2">
              +{activity.currency} {activity.price}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-700 mb-3 leading-relaxed">{activity.description}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {activity.day && (
            <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded">
              Day {activity.day}
            </span>
          )}
          {activity.duration && (
            <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded">
              {activity.duration}
            </span>
          )}
          {activity.startTime && (
            <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded">
              {activity.startTime}
            </span>
          )}
          {activity.ageRestriction && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              {activity.ageRestriction}
            </span>
          )}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <section className="border-b border-gray-200 pb-16">
        <h2 className="text-4xl font-bold text-teal-700 mb-6 border-b-2 border-teal-200 pb-4">
          📋 INCLUSIONS & ACTIVITIES
        </h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex gap-4">
          <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-1">Partial Data Available</h3>
            <p className="text-yellow-700 text-sm">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-gray-200 pb-16">
      <h2 className="text-4xl font-bold text-teal-700 mb-6 border-b-2 border-teal-200 pb-4">
        📋 INCLUSIONS & ACTIVITIES
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT COLUMN: What's Included */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            ✓ What's Included
          </h3>

          <InclusionSection
            title="Destinations"
            icon="🗺️"
            items={inclusionsData.destinations}
            sectionKey="destinations"
            bgColor="bg-blue-50"
          />

          <InclusionSection
            title="Meals"
            icon="🍽️"
            items={inclusionsData.meals}
            sectionKey="meals"
            bgColor="bg-amber-50"
          />

          <InclusionSection
            title="Transport"
            icon="🚐"
            items={inclusionsData.transport}
            sectionKey="transport"
            bgColor="bg-purple-50"
          />

          <InclusionSection
            title="Accommodation"
            icon="🏨"
            items={inclusionsData.accommodation}
            sectionKey="accommodation"
            bgColor="bg-pink-50"
          />
        </div>

        {/* RIGHT COLUMN: Activities */}
        <div className="space-y-4">
          {/* Included Activities */}
          {!loading && includedActivities.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                🎯 Included Activities ({includedActivities.length})
              </h3>
              <div className="space-y-4 mb-8">
                {includedActivities.slice(0, 3).map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} isIncluded={true} />
                ))}
              </div>
              {includedActivities.length > 3 && (
                <button className="w-full py-2 text-teal-700 font-semibold hover:bg-teal-50 rounded transition-colors text-sm">
                  Show All {includedActivities.length} Activities →
                </button>
              )}
            </div>
          )}

          {/* Optional Activities */}
          {!loading && optionalActivities.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                💰 Optional Add-Ons ({optionalActivities.length})
              </h3>
              <div className="space-y-4">
                {optionalActivities.slice(0, 3).map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} isIncluded={false} />
                ))}
              </div>
              {optionalActivities.length > 3 && (
                <button className="w-full py-2 text-orange-700 font-semibold hover:bg-orange-50 rounded transition-colors text-sm">
                  Show All {optionalActivities.length} Add-Ons →
                </button>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="min-h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700 mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">Loading activities...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && includedActivities.length === 0 && optionalActivities.length === 0 && (
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-600">No activities available for this package.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Summary */}
      <div className="mt-10 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-6">
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <DollarSign size={20} className="text-teal-700" />
          Pricing Notes
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            • <span className="font-semibold">All prices in {selectedCurrency}</span> - Multi-currency
            support available at checkout
          </li>
          <li>
            • <span className="font-semibold">Group discounts</span> apply automatically for 6+ people
          </li>
          <li>
            • <span className="font-semibold">Optional activities</span> can be added or removed during
            booking
          </li>
          <li>
            • <span className="font-semibold">Travel insurance</span> is mandatory and billed separately
          </li>
        </ul>
      </div>
    </section>
  );
};
