import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  MapPin,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
} from 'lucide-react';

const Venues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add / Edit Modal State
  const [venueModalOpen, setVenueModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    capacity: '',
    availabilityStatus: 'Available',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { isAdmin, isCoordinator } = useAuth();
  const toast = useToast();

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.availabilityStatus = statusFilter;

      const res = await api.get('/venues', { params });
      setVenues(res.data.data);
    } catch (err) {
      toast.error('Failed to load venues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, [search, statusFilter]);

  const handleOpenAdd = () => {
    setEditingVenue(null);
    setFormData({
      name: '',
      location: '',
      address: '',
      capacity: '',
      availabilityStatus: 'Available',
    });
    setFormError('');
    setVenueModalOpen(true);
  };

  const handleOpenEdit = (venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name || '',
      location: venue.location || '',
      address: venue.address || '',
      capacity: venue.capacity || '',
      availabilityStatus: venue.availabilityStatus || 'Available',
    });
    setFormError('');
    setVenueModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.location.trim()) {
      setFormError('Venue name and location are required.');
      return;
    }

    if (!formData.capacity || Number(formData.capacity) <= 0) {
      setFormError('Capacity must be a number greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
      };

      if (editingVenue) {
        await api.put(`/venues/${editingVenue._id}`, payload);
        toast.success('Venue updated.');
      } else {
        await api.post('/venues', payload);
        toast.success('Venue registered.');
      }
      setVenueModalOpen(false);
      fetchVenues();
    } catch (err) {
      const msg = err.customMessage || 'Failed to save venue.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!venueToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/venues/${venueToDelete._id}`);
      toast.success('Venue deleted.');
      setDeleteModalOpen(false);
      setVenueToDelete(null);
      fetchVenues();
    } catch (err) {
      toast.error(err.customMessage || 'Failed to delete venue.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Venues</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage halls, locations, seating capacities, and booking status.
          </p>
        </div>
        {isCoordinator && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Venue</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search venues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-500 font-medium">Availability:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-gray-300 rounded-md px-2.5 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading venues..." />
      ) : venues.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No venues found"
          description="There are currently no venues registered."
          actionText={isCoordinator ? "Add Venue" : null}
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-[11px] uppercase font-semibold text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Venue Name</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {venues.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      <Link to={`/venues/${v._id}`} className="hover:text-blue-600">
                        {v.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{v.location}</td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-xs">
                      {v.address || '-'}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {v.capacity.toLocaleString()} guests
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={v.availabilityStatus} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/venues/${v._id}`}
                          title="View"
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        {isCoordinator && (
                          <button
                            type="button"
                            title="Edit"
                            onClick={() => handleOpenEdit(v)}
                            className="p-1 text-gray-500 hover:text-amber-600 hover:bg-gray-100 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            title="Delete"
                            onClick={() => {
                              setVenueToDelete(v);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={venueModalOpen}
        onClose={() => setVenueModalOpen(false)}
        title={editingVenue ? 'Edit Venue' : 'Add Venue'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          {formError && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Venue Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Grand Palace Hall"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                City / Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Chennai"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="500"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street or location details..."
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Availability Status
            </label>
            <select
              value={formData.availabilityStatus}
              onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
            >
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setVenueModalOpen(false)}
              className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingVenue ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Venue"
        message={`Are you sure you want to delete ${venueToDelete?.name}?`}
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  );
};

export default Venues;
