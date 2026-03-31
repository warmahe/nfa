import React, { useState } from 'react';
import { Upload, Trash2, X, Plus, Image, Video } from 'lucide-react';
import { PackageMedia } from '../../types/database';

interface AdminMediaManagerProps {
  packageId: string;
  packageTitle: string;
  media: PackageMedia;
  onMediaUpdate: (media: PackageMedia) => Promise<void>;
}

export const AdminMediaManager: React.FC<AdminMediaManagerProps> = ({
  packageId,
  packageTitle,
  media,
  onMediaUpdate,
}) => {
  const [editMedia, setEditMedia] = useState<PackageMedia>(media);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'thumbnail' | 'gallery' | 'videos'>('thumbnail');

  // Handle image upload simulation (in production, upload to Firebase Storage)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'gallery') => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    setError('');

    try {
      // Simulate file reading - in production, upload to Firebase Storage
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          
          if (type === 'thumbnail') {
            setEditMedia(prev => ({
              ...prev,
              thumbnail: base64,
            }));
          } else {
            setEditMedia(prev => ({
              ...prev,
              gallery: [...(prev.gallery || []), base64],
            }));
          }
        };
        reader.readAsDataURL(file);
      });

      setSuccess('Images loaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to upload images: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddImageURL = (url: string, type: 'thumbnail' | 'gallery') => {
    if (!url.trim()) {
      setError('Please enter a valid image URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    if (type === 'thumbnail') {
      setEditMedia(prev => ({
        ...prev,
        thumbnail: url,
      }));
    } else {
      setEditMedia(prev => ({
        ...prev,
        gallery: [...(prev.gallery || []), url],
      }));
    }

    setSuccess('Image added successfully!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    setError('');

    try {
      // Simulate file reading - in production, upload to Firebase Storage
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          
          setEditMedia(prev => ({
            ...prev,
            videos: [...(prev.videos || []), base64],
          }));
        };
        reader.readAsDataURL(file);
      });

      setSuccess('Videos loaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to upload videos: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddVideoURL = (url: string) => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    // Extract YouTube video ID from URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\/|^(https?:\/\/)?www\.youtube\.com\/embed\//;
    if (!youtubeRegex.test(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setEditMedia(prev => ({
      ...prev,
      videos: [...(prev.videos || []), url],
    }));

    setSuccess('Video added successfully!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleRemoveThumbnail = () => {
    setEditMedia(prev => ({
      ...prev,
      thumbnail: '',
    }));
  };

  const handleRemoveGalleryImage = (index: number) => {
    setEditMedia(prev => ({
      ...prev,
      gallery: prev.gallery?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleRemoveVideo = (index: number) => {
    setEditMedia(prev => ({
      ...prev,
      videos: prev.videos?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      await onMediaUpdate(editMedia);
      setSuccess('Media updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save media: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          🎬 Media Manager
        </h3>
        <p className="text-gray-600">
          Manage photos and videos for {packageTitle}
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('thumbnail')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'thumbnail'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Image className="inline mr-2" size={18} />
          Thumbnail
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'gallery'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Image className="inline mr-2" size={18} />
          Gallery ({editMedia.gallery?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'videos'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Video className="inline mr-2" size={18} />
          Videos ({editMedia.videos?.length || 0})
        </button>
      </div>

      {/* Thumbnail Tab */}
      {activeTab === 'thumbnail' && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">
              📸 Package Thumbnail
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              This image will be displayed as the main cover for your package
            </p>

            {editMedia.thumbnail ? (
              <div className="space-y-4">
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={editMedia.thumbnail}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={handleRemoveThumbnail}
                  className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-4 rounded-lg"
                >
                  <Trash2 size={18} />
                  Remove Thumbnail
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="flex items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-gray-600 font-medium">
                      Click to upload thumbnail
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'thumbnail')}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-600">or paste URL</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    id="thumbnailUrl"
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('thumbnailUrl') as HTMLInputElement;
                      if (input && input.value) {
                        handleAddImageURL(input.value, 'thumbnail');
                        input.value = '';
                      }
                    }}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Add from URL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gallery Tab */}
      {activeTab === 'gallery' && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">
              🖼️ Photo Gallery
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Upload multiple photos to showcase your package
            </p>

            {editMedia.gallery && editMedia.gallery.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {editMedia.gallery.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={img}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Trash2 className="text-white" size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6 space-y-4">
              <label className="flex items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <Plus className="mx-auto text-gray-400 mb-2" size={24} />
                  <p className="text-gray-600 font-medium">
                    Click to add more photos
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'gallery')}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-600">or add by URL</span>
                </div>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  id="galleryUrl"
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('galleryUrl') as HTMLInputElement;
                    if (input && input.value) {
                      handleAddImageURL(input.value, 'gallery');
                      input.value = '';
                    }
                  }}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Add from URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Videos Tab */}
      {activeTab === 'videos' && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">
              🎥 Video Links
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Add YouTube links or upload video files to showcase your package in action
            </p>

            {editMedia.videos && editMedia.videos.length > 0 && (
              <div className="space-y-3 mb-6">
                {editMedia.videos.map((video, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Video className="text-red-600 flex-shrink-0" size={20} />
                      <p className="text-sm text-gray-900 truncate">{video}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveVideo(idx)}
                      className="ml-2 text-red-600 hover:text-red-800 flex-shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                  <p className="text-gray-600 font-medium">
                    Click to upload videos
                  </p>
                  <p className="text-sm text-gray-500">
                    MP4, WebM, OGG up to 100MB
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-600">or add by URL</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="videoUrl"
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('videoUrl') as HTMLInputElement;
                      if (input) {
                        handleAddVideoURL(input.value);
                        input.value = '';
                      }
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-400"
        >
          <Upload size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};
