import React, { useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { GALLERY_IMAGES } from "../constants";

export const Gallery = () => {
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const destinations = ["ALL", ...Array.from(new Set(GALLERY_IMAGES.map(img => img.destination)))];
  const categories = ["ALL", ...Array.from(new Set(GALLERY_IMAGES.map(img => img.category)))];

  const filteredImages = useMemo(() => {
    return GALLERY_IMAGES.filter(img => {
      const destMatch = selectedDestination === "ALL" || img.destination === selectedDestination;
      const catMatch = selectedCategory === "ALL" || img.category === selectedCategory;
      return destMatch && catMatch;
    });
  }, [selectedDestination, selectedCategory]);

  const selectedImage = GALLERY_IMAGES.find(img => img.id === selectedImageId);
  const selectedImageIndex = GALLERY_IMAGES.findIndex(img => img.id === selectedImageId);

  const handlePrevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageId(GALLERY_IMAGES[selectedImageIndex - 1].id);
    } else {
      setSelectedImageId(GALLERY_IMAGES[GALLERY_IMAGES.length - 1].id);
    }
  };

  const handleNextImage = () => {
    if (selectedImageIndex < GALLERY_IMAGES.length - 1) {
      setSelectedImageId(GALLERY_IMAGES[selectedImageIndex + 1].id);
    } else {
      setSelectedImageId(GALLERY_IMAGES[0].id);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-white text-gray-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-20">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">EXPEDITION GALLERY</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Visual stories from our most extraordinary expeditions. Glimpses of the moments that transform travelers.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-12 space-y-6">
          {/* Destination Filter */}
          <div>
            <h3 className="text-sm font-bold tracking-tight text-teal-700 mb-4 flex items-center gap-2">
              <Filter size={16} /> DESTINATION
            </h3>
            <div className="flex flex-wrap gap-3">
              {destinations.map(dest => (
                <button
                  key={dest}
                  onClick={() => setSelectedDestination(dest)}
                  className={`px-4 py-2 text-xs font-bold tracking-tight rounded-full transition-all ${
                    selectedDestination === dest
                      ? "bg-teal-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {dest}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-bold tracking-tight text-orange-600 mb-4 flex items-center gap-2">
              <Filter size={16} /> CATEGORY
            </h3>
            <div className="flex flex-wrap gap-3">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs font-bold tracking-tight rounded-full transition-all ${
                    selectedCategory === cat
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Result count */}
          <p className="text-sm text-gray-600 font-medium">
            {filteredImages.length} images
            {selectedDestination !== "ALL" || selectedCategory !== "ALL"
              ? ` (filtered from ${GALLERY_IMAGES.length})`
              : ""}
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {filteredImages.map((image, idx) => (
            <div
              key={image.id}
              onClick={() => setSelectedImageId(image.id)}
              className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 hover:border-teal-500 hover:shadow-lg transition-all"
            >
              <div className="relative h-64 overflow-hidden bg-gray-900">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold text-lg mb-2">{image.title}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-300">{image.destination}</span>
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded">
                      {image.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-white">
                <p className="text-sm font-semibold text-gray-900 mb-1">{image.title}</p>
                <p className="text-xs text-gray-600">
                  {image.destination} • {image.category}
                </p>
                {image.location && (
                  <p className="text-xs text-gray-500 mt-2">📍 {image.location}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredImages.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg mb-4">No images found with current filters</p>
            <button
              onClick={() => {
                setSelectedDestination("ALL");
                setSelectedCategory("ALL");
              }}
              className="px-6 py-2 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 md:p-8">
          <div className="relative w-full max-w-5xl">
            {/* Close Button */}
            <button
              onClick={() => setSelectedImageId(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Image Container */}
            <div className="relative">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[80vh] object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />

              {/* Navigation Arrows */}
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all transform hover:scale-110"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all transform hover:scale-110"
              >
                <ChevronRight size={24} />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-4 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
                {selectedImageIndex + 1} / {GALLERY_IMAGES.length}
              </div>
            </div>

            {/* Image Info */}
            <div className="bg-white p-6 mt-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedImage.title}</h2>
                  <p className="text-gray-600 mb-4">
                    {selectedImage.destination} • {selectedImage.category}
                  </p>
                  {selectedImage.location && (
                    <p className="text-gray-700 mb-2">
                      <span className="font-semibold">Location:</span> {selectedImage.location}
                    </p>
                  )}
                </div>
                <div className="md:text-right">
                  {selectedImage.photographer && (
                    <p className="text-gray-700">
                      <span className="font-semibold">Photographer:</span> {selectedImage.photographer}
                    </p>
                  )}
                </div>
              </div>

              {/* Tag Display */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <span className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
                  {selectedImage.destination}
                </span>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                  {selectedImage.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
