import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';
import Modal from '../components/Modal';
import {
  Calendar,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  FileText,
} from 'lucide-react';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortOption, setSortOption] = useState('date_asc');

  // Deletion modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Cancellation modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [eventToCancel, setEventToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const { isAdmin, isCoordinator } = useAuth();
  const toast = useToast();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.eventType = typeFilter;
      if (sortOption) params.sort = sortOption;

      const res = await api.get('/events', { params });
      setEvents(res.data.data);
    } catch (err) {
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [search, statusFilter, typeFilter, sortOption]);

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    setActionLoading(true);
    try {
      await api.delete(`/events/${eventToDelete._id}`);
      toast.success('Event deleted successfully.');
      setDeleteModalOpen(false);
      setEventToDelete(null);
      fetchEvents();
    } catch (err) {
      toast.error(err.customMessage || 'Failed to delete event.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequestSubmit = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      toast.warning('Please enter a cancellation reason.');
      return;
    }
    setActionLoading(true);
    try {
      await api.post('/cancellations', {
        event: eventToCancel._id,
        reason: cancelReason,
      });
      toast.success('Cancellation request submitted.');
      setCancelModalOpen(false);
      setEventToCancel(null);
      setCancelReason('');
      fetchEvents();
    } catch (err) {
      toast.error(err.customMessage || 'Failed to submit cancellation request.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Events</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage scheduled events, bookings, and operations.
          </p>
        </div>
        {isCoordinator && (
          <Link
            to="/events/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </Link>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-gray-300 rounded-md px-2.5 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="Planned">Planned</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Pending Cancellation">Pending Cancellation</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs bg-white border border-gray-300 rounded-md px-2.5 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="Wedding">Wedding</option>
              <option value="Corporate">Corporate</option>
              <option value="Birthday">Birthday</option>
              <option value="Anniversary">Anniversary</option>
              <option value="Festival">Festival</option>
              <option value="Concert">Concert</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="text-xs bg-white border border-gray-300 rounded-md px-2.5 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="date_asc">Date (Ascending)</option>
              <option value="date_desc">Date (Descending)</option>
              <option value="budget_desc">Budget (High to Low)</option>
              <option value="budget_asc">Budget (Low to High)</option>
              <option value="created_desc">Recently Created</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Table */}
      {loading ? (
        <LoadingSpinner text="Loading events..." />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events found"
          description="There are currently no events matching your criteria."
          actionText={isCoordinator ? "Add Event" : null}
          onAction={() => window.location.assign('/events/create')}
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-[11px] uppercase font-semibold text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Event Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Venue</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.map((ev) => (
                  <tr key={ev._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={`/events/${ev._id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {ev.eventName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-gray-100 text-gray-700">
                        {ev.eventType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div>{new Date(ev.eventDate).toLocaleDateString()}</div>
                      <span className="text-[11px] text-gray-400">
                        {ev.startTime} - {ev.endTime}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{ev.client?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{ev.venue?.name || '-'}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      ₹{ev.budget.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ev.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/events/${ev._id}`}
                          title="View"
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        {isCoordinator && (
                          <Link
                            to={`/events/${ev._id}/edit`}
                            title="Edit"
                            className="p-1 text-gray-500 hover:text-amber-600 hover:bg-gray-100 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        {!['Cancelled', 'Completed', 'Pending Cancellation'].includes(ev.status) && (
                          <button
                            type="button"
                            title="Request Cancellation"
                            onClick={() => {
                              setEventToCancel(ev);
                              setCancelModalOpen(true);
                            }}
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            type="button"
                            title="Delete"
                            onClick={() => {
                              setEventToDelete(ev);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded cursor-pointer"
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Event"
        message={`Are you sure you want to delete "${eventToDelete?.eventName}"?`}
        confirmText="Delete"
        loading={actionLoading}
      />

      {/* Cancellation Request Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Request Event Cancellation"
      >
        <form onSubmit={handleCancelRequestSubmit} className="space-y-4">
          <p className="text-xs text-gray-600">
            Submit cancellation for <strong className="text-gray-800">{eventToCancel?.eventName}</strong>:
          </p>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Reason for Cancellation <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason..."
              className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => setCancelModalOpen(false)}
              className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
            >
              {actionLoading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Events;
