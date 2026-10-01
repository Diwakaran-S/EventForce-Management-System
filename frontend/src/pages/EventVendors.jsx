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
  Layers,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';

const EventVendors = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Assign Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [eventsList, setEventsList] = useState([]);
  const [vendorsList, setVendorsList] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [assignStatus, setAssignStatus] = useState('Assigned');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { isCoordinator } = useAuth();
  const toast = useToast();

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await api.get('/event-vendors', { params });
      setAssignments(res.data.data);
    } catch (err) {
      toast.error('Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [statusFilter]);

  const handleOpenAssignModal = async () => {
    setFormError('');
    setSelectedEventId('');
    setSelectedVendorId('');
    setAssignStatus('Assigned');

    try {
      const [eventsRes, vendorsRes] = await Promise.all([
        api.get('/events'),
        api.get('/vendors'),
      ]);
      setEventsList(eventsRes.data.data);
      setVendorsList(vendorsRes.data.data);
      setAssignModalOpen(true);
    } catch (err) {
      toast.error('Failed to load events or vendors.');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedEventId || !selectedVendorId) {
      setFormError('Please select an event and a vendor.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/event-vendors', {
        event: selectedEventId,
        vendor: selectedVendorId,
        status: assignStatus,
      });
      toast.success('Vendor assigned successfully.');
      setAssignModalOpen(false);
      fetchAssignments();
    } catch (err) {
      const msg = err.customMessage || 'Failed to assign vendor.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (assignmentId, newStatus) => {
    try {
      await api.put(`/event-vendors/${assignmentId}`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}.`);
      fetchAssignments();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!assignmentToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/event-vendors/${assignmentToDelete._id}`);
      toast.success('Assignment deleted.');
      setDeleteModalOpen(false);
      setAssignmentToDelete(null);
      fetchAssignments();
    } catch (err) {
      toast.error(err.customMessage || 'Failed to delete assignment.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Event Vendor Assignments</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Overview of service contracts and vendor coordination across events.
          </p>
        </div>
        {isCoordinator && (
          <button
            type="button"
            onClick={handleOpenAssignModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Assign Vendor</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-gray-300 rounded-md px-2.5 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="Assigned">Assigned</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading assignments..." />
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No assignments found"
          description="There are no vendor assignments matching this filter."
          actionText={isCoordinator ? "Assign Vendor" : null}
          onAction={handleOpenAssignModal}
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-[11px] uppercase font-semibold text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Assigned Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assignments.map((asg) => (
                  <tr key={asg._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {asg.event ? (
                        <Link
                          to={`/events/${asg.event._id}`}
                          className="font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {asg.event.eventName}
                        </Link>
                      ) : (
                        <span className="text-gray-400">Deleted</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {asg.vendor?.name || 'Deleted'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-gray-100 text-gray-700">
                        {asg.vendor?.serviceType || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(asg.assignedDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={asg.status}
                        onChange={(e) => handleStatusChange(asg._id, e.target.value)}
                        className="text-xs bg-white border border-gray-300 rounded px-2 py-0.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Assigned">Assigned</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isCoordinator && (
                        <button
                          type="button"
                          onClick={() => {
                            setAssignmentToDelete(asg);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Vendor to Event"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-3">
          {formError && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Select Event <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
            >
              <option value="">-- Select Event --</option>
              {eventsList.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.eventName} ({new Date(ev.eventDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Select Vendor <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
            >
              <option value="">-- Select Vendor --</option>
              {vendorsList.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name} ({v.serviceType}) &bull; {v.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={assignStatus}
              onChange={(e) => setAssignStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
            >
              <option value="Assigned">Assigned</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setAssignModalOpen(false)}
              className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {submitting ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Assignment"
        message={`Are you sure you want to remove ${assignmentToDelete?.vendor?.name} from ${assignmentToDelete?.event?.eventName}?`}
        confirmText="Remove"
        loading={deleting}
      />
    </div>
  );
};

export default EventVendors;
