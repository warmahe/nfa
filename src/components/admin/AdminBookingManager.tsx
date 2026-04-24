import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit2, Trash2, X, Plus, Download, Mail, Check, Clock, AlertCircle, Eye as ViewIcon } from 'lucide-react';
import { getCollectionData, updateDocument, deleteDocument } from '../../services/firebaseService';

interface Traveler {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  nationality?: string;
}

interface Booking {
  id: string;
  packageTitle: string;
  packageId: string;
  travelerId: string;
  travelers: Traveler[];
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  totalPrice: number;
  currency: string;
  specialRequests?: string;
  createdAt: any;
  updatedAt: any;
}

interface BookingFilter {
  searchTerm: string;
  status: 'all' | 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'all' | 'paid' | 'pending' | 'refunded';
  dateRange: 'all' | 'upcoming' | 'past';
}

export const AdminBookingManager: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const [filters, setFilters] = useState<BookingFilter>({
    searchTerm: '',
    status: 'all',
    paymentStatus: 'all',
    dateRange: 'all',
  });

  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await getCollectionData('bookings');
      const bookingsData: Booking[] = (data as any[])?.map((item: any) => ({
        id: item.id || item._id || '',
        ...item
      })) || [];
      
      setBookings(bookingsData.sort((a, b) => {
        const dateA = new Date(a.createdAt?.toDate?.() || a.createdAt).getTime();
        const dateB = new Date(b.createdAt?.toDate?.() || b.createdAt).getTime();
        return dateB - dateA;
      }));

      // Calculate stats
      const confirmedCount = bookingsData.filter((b: Booking) => b.status === 'confirmed').length;
      const pendingCount = bookingsData.filter((b: Booking) => b.status === 'pending').length;
      const cancelledCount = bookingsData.filter((b: Booking) => b.status === 'cancelled').length;
      const totalRev = bookingsData.reduce((sum: number, b: Booking) => {
        return b.paymentStatus === 'paid' ? sum + (b.totalPrice || 0) : sum;
      }, 0);

      setStats({
        total: bookingsData.length,
        confirmed: confirmedCount,
        pending: pendingCount,
        cancelled: cancelledCount,
        totalRevenue: totalRev,
      });
    } catch (err) {
      setError('Failed to load bookings: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings].filter(b => b.id); // Ensure all bookings have an id

    // Search by traveler name, email, or booking ID
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        (b.id?.toLowerCase().includes(term)) ||
        (b.travelers && b.travelers.some(t =>
          t.firstName.toLowerCase().includes(term) ||
          t.lastName.toLowerCase().includes(term) ||
          t.email.toLowerCase().includes(term)
        ))
      );
    }

    // Filter by booking status
    if (filters.status !== 'all') {
      filtered = filtered.filter(b => b.status === filters.status);
    }

    // Filter by payment status
    if (filters.paymentStatus !== 'all') {
      filtered = filtered.filter(b => b.paymentStatus === filters.paymentStatus);
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const today = new Date();
      filtered = filtered.filter(b => {
        const startDate = new Date(b.startDate);
        if (filters.dateRange === 'upcoming') {
          return startDate >= today;
        } else {
          return startDate < today;
        }
      });
    }

    setFilteredBookings(filtered);
  };

  const handleStatusChange = async (booking: Booking, newStatus: string) => {
    try {
      await updateDocument('bookings', booking.id, { status: newStatus });
      setSuccess('Booking status updated!');
      loadBookings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update booking: ' + (err as Error).message);
    }
  };

  const handlePaymentStatusChange = async (booking: Booking, newStatus: string) => {
    try {
      await updateDocument('bookings', booking.id, { paymentStatus: newStatus });
      setSuccess('Payment status updated!');
      loadBookings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update payment: ' + (err as Error).message);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDocument('bookings', bookingId);
      setSuccess('Booking deleted successfully!');
      loadBookings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete booking: ' + (err as Error).message);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPaymentBadgeColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'pending':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'refunded':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Check size={16} className="inline mr-1" />;
      case 'pending':
        return <Clock size={16} className="inline mr-1" />;
      case 'cancelled':
        return <AlertCircle size={16} className="inline mr-1" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📅 Booking Management</h1>
        <p className="text-gray-600 mt-1">
          Track and manage all traveler bookings
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start gap-3">
          <Check size={20} className="flex-shrink-0 mt-0.5" />
          <div>{success}</div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm">Total Bookings</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm">✅ Confirmed</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.confirmed}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm">⏳ Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm">❌ Cancelled</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.cancelled}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm">💰 Total Revenue</p>
          <p className="text-3xl font-bold text-teal-600 mt-2">${stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Filter size={18} />
          Search & Filter
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or booking ID..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Booking Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">All Booking Status</option>
            <option value="confirmed">✅ Confirmed</option>
            <option value="pending">⏳ Pending</option>
            <option value="cancelled">❌ Cancelled</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={filters.paymentStatus}
            onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value as any })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">All Payment Status</option>
            <option value="paid">💳 Paid</option>
            <option value="pending">⏳ Payment Pending</option>
            <option value="refunded">↩️ Refunded</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as any })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">All Dates</option>
            <option value="upcoming">📅 Upcoming</option>
            <option value="past">📊 Past Trips</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Booking ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Traveler Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Package</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Travel Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Payment</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking, idx) => (
                  <tr
                    key={booking.id}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-teal-600">{booking.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        {booking.travelers[0]?.firstName} {booking.travelers[0]?.lastName}
                      </div>
                      <div className="text-xs text-gray-600">{booking.travelers[0]?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{booking.packageTitle}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(booking.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getPaymentBadgeColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {booking.totalPrice} {booking.currency}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <ViewIcon size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded"
                          title="Delete Booking"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <AlertCircle className="mx-auto mb-3 text-gray-400" size={32} />
            <p className="font-medium">No bookings found</p>
            <p className="text-sm">Try adjusting your filters or search criteria</p>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Booking Status Section */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Booking Status</h3>
                <div className="flex gap-2">
                  {(['pending', 'confirmed', 'cancelled'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedBooking, status)}
                      className={`px-4 py-2 rounded-lg font-semibold border transition-colors ${
                        selectedBooking.status === status
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {status === 'pending' && '⏳'}
                      {status === 'confirmed' && '✅'}
                      {status === 'cancelled' && '❌'}
                      {' '}
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Status Section */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Payment Status</h3>
                <div className="flex gap-2">
                  {(['paid', 'pending', 'refunded'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => handlePaymentStatusChange(selectedBooking, status)}
                      className={`px-4 py-2 rounded-lg font-semibold border transition-colors ${
                        selectedBooking.paymentStatus === status
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {status === 'paid' && '💳'}
                      {status === 'pending' && '⏳'}
                      {status === 'refunded' && '↩️'}
                      {' '}
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trip Information */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">Trip Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Package Name</p>
                    <p className="font-semibold text-gray-900">{selectedBooking.packageTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Starting Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedBooking.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ending Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedBooking.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Price</p>
                    <p className="font-semibold text-teal-600">
                      {selectedBooking.totalPrice} {selectedBooking.currency}
                    </p>
                  </div>
                </div>
              </div>

              {/* Travelers Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Travelers ({selectedBooking.travelers.length})</h3>
                <div className="space-y-3">
                  {selectedBooking.travelers.map((traveler, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Full Name</p>
                          <p className="font-semibold text-gray-900">
                            {traveler.firstName} {traveler.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-semibold text-gray-900">{traveler.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-semibold text-gray-900">{traveler.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Date of Birth</p>
                          <p className="font-semibold text-gray-900">{traveler.dateOfBirth || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.specialRequests && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Special Requests</h3>
                  <p className="text-blue-900">{selectedBooking.specialRequests}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
                  <Mail size={18} />
                  Send Email to Traveler
                </button>
                <button className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg">
                  <Download size={18} />
                  Download Itinerary
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="ml-auto bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
