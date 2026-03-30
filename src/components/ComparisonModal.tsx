import React, { useEffect, useState } from "react";
import { X, Trash2, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getComparison,
  removeFromComparison,
  clearComparison,
  ComparisonItem,
} from "../services/comparisonService";

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<ComparisonItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPackages(getComparison());
    }
  }, [isOpen]);

  const handleRemove = (packageId: string) => {
    removeFromComparison(packageId);
    setPackages(getComparison());
  };

  const handleClearAll = () => {
    clearComparison();
    setPackages([]);
  };

  const handleBook = (destination: string) => {
    onClose();
    navigate(`/itinerary/${destination.toLowerCase()}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-orange-50">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Compare Packages
            </h2>
            <p className="text-gray-600 mt-1">
              {packages.length} of 3 packages selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X size={28} className="text-gray-700" />
          </button>
        </div>

        {/* Content Area */}
        {packages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <ShoppingCart size={64} className="text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500 font-medium">
                No packages to compare
              </p>
              <p className="text-gray-400 mt-2">
                Add up to 3 packages from the browse page to compare them
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            {/* Desktop/Tablet View */}
            <div className="hidden md:block">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-teal-300 transition-colors"
                  >
                    {/* Package Image */}
                    <div className="relative h-40 overflow-hidden bg-gray-200">
                      <img
                        src={pkg.image}
                        alt={pkg.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemove(pkg.id)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                        aria-label="Remove package"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Package Details */}
                    <div className="p-5">
                      {/* Title */}
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                        {pkg.title}
                      </h3>

                      {/* Destination */}
                      <p className="text-sm text-teal-600 font-semibold mt-2">
                        {pkg.destination.toUpperCase()}
                      </p>

                      {/* Price - Highlighted */}
                      <div className="mt-3 p-3 bg-gradient-to-r from-orange-100 to-orange-50 rounded-lg border border-orange-200">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">
                          Price
                        </p>
                        <p className="text-2xl font-bold text-orange-600">
                          {pkg.price}
                        </p>
                      </div>

                      {/* Rating */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="ml-1 font-semibold text-gray-900">
                            {pkg.rating}
                          </span>
                          <span className="text-gray-500 text-sm ml-1">
                            / 5.0
                          </span>
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold text-gray-900">
                          {pkg.duration}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mt-4 line-clamp-3">
                        {pkg.description}
                      </p>

                      {/* Book Button */}
                      <button
                        onClick={() => handleBook(pkg.destination)}
                        className="w-full mt-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold py-2 rounded-lg transition-all transform hover:scale-105 shadow-md"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile View - Horizontal Scroll */}
            <div className="md:hidden">
              <div className="flex gap-4 p-4 overflow-x-auto snap-x">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="flex-shrink-0 w-80 bg-gradient-to-br from-gray-50 to-white rounded-2xl overflow-hidden border-2 border-gray-100 snap-center"
                  >
                    {/* Package Image */}
                    <div className="relative h-32 overflow-hidden bg-gray-200">
                      <img
                        src={pkg.image}
                        alt={pkg.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemove(pkg.id)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Package Details */}
                    <div className="p-4">
                      <h3 className="text-base font-bold text-gray-900 line-clamp-2">
                        {pkg.title}
                      </h3>

                      <p className="text-xs text-teal-600 font-semibold mt-1">
                        {pkg.destination.toUpperCase()}
                      </p>

                      <div className="mt-2 p-2 bg-gradient-to-r from-orange-100 to-orange-50 rounded-lg border border-orange-200">
                        <p className="text-xs text-gray-600">Price</p>
                        <p className="text-xl font-bold text-orange-600">
                          {pkg.price}
                        </p>
                      </div>

                      <div className="mt-2 flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1 font-semibold text-gray-900">
                          {pkg.rating}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 mt-2">
                        Duration: {pkg.duration}
                      </p>

                      <button
                        onClick={() => handleBook(pkg.destination)}
                        className="w-full mt-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold py-2 rounded-lg text-sm transition-all"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {packages.length > 0 && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleClearAll}
              className="px-6 py-3 text-gray-700 hover:bg-gray-200 font-semibold rounded-lg transition-colors"
            >
              Clear All
            </button>
            <div className="text-sm text-gray-600">
              Select up to <span className="font-bold text-teal-600">3</span>{" "}
              packages to compare
            </div>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-md"
            >
              Done Comparing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
