import React, { useState } from "react";
import { Plus, Edit2, Trash2, X, Save } from "lucide-react";

interface AdminPackage {
  id: string;
  name: string;
  destination: string;
  duration: string;
  price: string;
  difficulty: string;
  maxTravelers: number;
  status: "active" | "draft" | "archived";
}

interface AdminPackageCrudProps {
  packages: AdminPackage[];
  onSave?: (pkg: AdminPackage) => void;
  onDelete?: (pkgId: string) => void;
}

/**
 * AdminPackageCRUD Component
 * Allows admins to create, read, update, and delete packages
 */
export const AdminPackageCRUD: React.FC<AdminPackageCrudProps> = ({
  packages,
  onSave,
  onDelete,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AdminPackage>>({
    name: "",
    destination: "",
    duration: "",
    price: "",
    difficulty: "Moderate",
    maxTravelers: 10,
    status: "draft",
  });

  const handleNew = () => {
    setEditingId(null);
    setFormData({
      name: "",
      destination: "",
      duration: "",
      price: "",
      difficulty: "Moderate",
      maxTravelers: 10,
      status: "draft",
    });
    setShowForm(true);
  };

  const handleEdit = (pkg: AdminPackage) => {
    setEditingId(pkg.id);
    setFormData(pkg);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.destination) {
      alert("Please fill in all required fields");
      return;
    }

    const pkg: AdminPackage = {
      id: editingId || `pkg_${Date.now()}`,
      name: formData.name!,
      destination: formData.destination!,
      duration: formData.duration!,
      price: formData.price!,
      difficulty: formData.difficulty || "Moderate",
      maxTravelers: formData.maxTravelers || 10,
      status: formData.status as any || "draft",
    };

    onSave?.(pkg);
    setShowForm(false);
  };

  const handleDelete = (pkgId: string) => {
    if (confirm("Are you sure you want to delete this package?")) {
      onDelete?.(pkgId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manage Packages</h2>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          <Plus size={18} />
          New Package
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? "Edit Package" : "Create New Package"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Package Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Icelandic Drift"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Destination *
                  </label>
                  <input
                    type="text"
                    value={formData.destination || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, destination: e.target.value })
                    }
                    placeholder="e.g., Iceland"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="e.g., 7 days"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Price
                  </label>
                  <input
                    type="text"
                    value={formData.price || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="e.g., $4,999"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty || "Moderate"}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  >
                    <option>Easy</option>
                    <option>Moderate</option>
                    <option>Challenging</option>
                    <option>Expert</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Max Travelers
                  </label>
                  <input
                    type="number"
                    value={formData.maxTravelers || 10}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxTravelers: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status || "draft"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-4 p-6 border-t border-gray-200 justify-end sticky bottom-0 bg-white">
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                <Save size={18} />
                Save Package
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Packages Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900">
                NAME
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900">
                DESTINATION
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900">
                DURATION
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900">
                PRICE
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900">
                DIFFICULTY
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900">
                STATUS
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr
                key={pkg.id}
                className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  {pkg.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {pkg.destination}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {pkg.duration}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                  {pkg.price}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {pkg.difficulty}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      pkg.status === "active"
                        ? "bg-green-100 text-green-700"
                        : pkg.status === "draft"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {pkg.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="text-teal-700 hover:text-teal-800 transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {packages.length === 0 && (
          <div className="p-8 text-center text-gray-600">
            <p className="mb-4">No packages yet. Create your first one!</p>
            <button
              onClick={handleNew}
              className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <Plus size={18} />
              New Package
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
