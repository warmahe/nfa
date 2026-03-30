import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Info, AlertCircle } from 'lucide-react';
import { getSubcollectionData } from '../services/firebaseService';
import { JoiningPoint } from '../types/database';

interface JoiningPointsDisplayProps {
  packageId: string;
  packageTitle: string;
}

export const JoiningPointsDisplay: React.FC<JoiningPointsDisplayProps> = ({
  packageId,
  packageTitle,
}) => {
  const [joiningPoints, setJoiningPoints] = useState<JoiningPoint[]>([]);
  const [selectedPointId, setSelectedPointId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJoiningPoints();
  }, [packageId]);

  const loadJoiningPoints = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSubcollectionData('packages', packageId, 'joiningPoints');
      const sorted = (data as JoiningPoint[]).sort((a, b) => (a.order || 0) - (b.order || 0));
      setJoiningPoints(sorted);
      if (sorted.length > 0) {
        setSelectedPointId(sorted[0].id);
      }
    } catch (err) {
      console.error('Error loading joining points:', err);
      setError('Could not load joining points. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="border-b border-gray-200 pb-16">
        <h2 className="text-4xl font-bold text-teal-700 mb-6 border-b-2 border-teal-200 pb-4">
          🧭 JOINING POINTS
        </h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
          <span className="ml-3 text-gray-600">Loading joining points...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="border-b border-gray-200 pb-16">
        <h2 className="text-4xl font-bold text-teal-700 mb-6 border-b-2 border-teal-200 pb-4">
          🧭 JOINING POINTS
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex gap-4">
          <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Error Loading Joining Points</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (joiningPoints.length === 0) {
    return (
      <section className="border-b border-gray-200 pb-16">
        <h2 className="text-4xl font-bold text-teal-700 mb-6 border-b-2 border-teal-200 pb-4">
          🧭 JOINING POINTS
        </h2>
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 text-center">
          <p className="text-gray-600">No joining points available for this package.</p>
        </div>
      </section>
    );
  }

  const selectedPoint = joiningPoints.find((p) => p.id === selectedPointId) || joiningPoints[0];

  return (
    <section className="border-b border-gray-200 pb-16">
      <h2 className="text-4xl font-bold text-teal-700 mb-6 border-b-2 border-teal-200 pb-4">
        🧭 JOINING POINTS
      </h2>

      {/* Joining Point Selector */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-gray-600 mb-3">SELECT YOUR DEPARTURE POINT</p>
        <div className="flex flex-wrap gap-3">
          {joiningPoints.map((point) => (
            <button
              key={point.id}
              onClick={() => setSelectedPointId(point.id)}
              className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all border-2 flex items-center gap-2 ${
                selectedPointId === point.id
                  ? 'border-teal-700 bg-teal-700 text-white shadow-lg'
                  : 'border-gray-300 bg-white text-gray-900 hover:border-teal-400 hover:bg-gray-50'
              }`}
            >
              <MapPin size={16} />
              {point.city}
              {point.included ? (
                <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                  Included
                </span>
              ) : (
                <span className="ml-1 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                  +€{point.additionalCost}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Point Details */}
      {selectedPoint && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Details */}
          <div className="space-y-6">
            {/* Location Card */}
            <div className="border border-gray-300 p-6 bg-gray-50 rounded-lg hover:border-teal-300 transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="text-teal-700" size={24} />
                {selectedPoint.location}
              </h3>
              <p className="text-gray-600 mb-4">
                <span className="font-semibold">City:</span> {selectedPoint.city}
              </p>
              {selectedPoint.coordinates && (
                <p className="text-xs text-gray-500">
                  Coordinates: {selectedPoint.coordinates.latitude.toFixed(4)}°,{' '}
                  {selectedPoint.coordinates.longitude.toFixed(4)}°
                </p>
              )}
            </div>

            {/* Pickup Time */}
            <div className="border border-gray-300 p-6 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                <Clock className="text-blue-600" size={18} />
                Pickup Time
              </h4>
              <p className="text-lg font-bold text-blue-700">{selectedPoint.pickupTime}</p>
            </div>

            {/* Cost Information */}
            <div
              className={`border-2 p-6 rounded-lg text-center ${
                selectedPoint.included
                  ? 'bg-green-50 border-green-300'
                  : 'bg-orange-50 border-orange-300'
              }`}
            >
              <p className="text-sm font-semibold text-gray-600 mb-1">COST</p>
              {selectedPoint.included ? (
                <>
                  <p className="text-3xl font-bold text-green-700">✓ Included</p>
                  <p className="text-xs text-green-600 mt-1">
                    This joining point is included in your package price
                  </p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold text-orange-700">
                    +€{selectedPoint.additionalCost}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    Additional cost per person
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Right: Instructions & Map Preview */}
          <div className="space-y-6">
            {/* Instructions */}
            <div className="border border-gray-300 p-6 bg-white rounded-lg">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Info className="text-teal-700" size={18} />
                Meeting Instructions
              </h4>
              <p className="text-gray-700 leading-relaxed">{selectedPoint.instructions}</p>
            </div>

            {/* Map Preview (Static Map) */}
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100 h-64">
              {selectedPoint.coordinates ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                  <div className="text-center">
                    <MapPin className="text-teal-700 mx-auto mb-2 opacity-50" size={32} />
                    <p className="text-sm font-semibold text-gray-600">
                      {selectedPoint.location}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedPoint.coordinates.latitude.toFixed(2)}°N,{' '}
                      {selectedPoint.coordinates.longitude.toFixed(2)}°E
                    </p>
                    <p className="text-xs text-gray-400 mt-3">
                      Interactive map coming soon
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Map data not available</p>
                </div>
              )}
            </div>

            {/* Selection Note */}
            <div className="bg-teal-50 border border-teal-200 p-4 rounded-lg">
              <p className="text-xs font-semibold text-teal-700 mb-1">💡 TIP</p>
              <p className="text-xs text-teal-800">
                You'll select your final joining point during checkout. This ensures we book your
                transfer from the right location.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
