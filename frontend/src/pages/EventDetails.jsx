import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  IndianRupee,
  Briefcase,
  Star,
  FileText,
  Edit2,
  Trash2,
  ArrowLeft,
  Plus,
  Phone,
  Mail,
  Building,
  CheckCircle,
} from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isCoordinator } = useAuth();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vendor Assignment Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [availableVendors, setAvailableVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [assigningVendor, setAssigningVendor] = useState(false);

  // Cancellation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [requestingCancel, setRequestingCancel] = useState(false);

  // Feedback Modal State
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Status Change State
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Unassign vendor confirmation
  const [unassignModalOpen, setUnassignModalOpen] = useState(false);
  const [assignmentToUnassign, setAssignmentToUnassign] = useState(null);
  const [unassigning, setUnassigning] = useState(false);

  const fetchEventDetails = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data.data);
    } catch (err) {
      toast.error('Failed to load event details.');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const handleOpenAssignVendor = async () => {
    try {
      const res = await api.get('/vendors');
      setAvailableVendors(res.data.data);
      setAssignModalOpen(true);
    } catch (err) {
      toast.error('Failed to load vendors list.');
    }
  };

  const handleAssignVendorSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVendorId) {
      toast.warning('Please select a vendor.');
      return;
    }

    setAssigningVendor(true);
    try {
      await api.post('/event-vendors', {
        event: id,
        vendor: selectedVendorId,
        status: 'Assigned',
      });
      toast.success('Vendor assigned successfully.');
      setAssignModalOpen(false);
      setSelectedVendorId('');
      fetchEventDetails();
    } catch (err) {
      toast.error(err.customMessage || 'Failed to assign vendor.');
    } finally {
      setAssigningVendor(false);
    }
  };

  const handleUnassignVendor = async () => {
    if (!assignmentToUnassign) return;
    setUnassigning(true);
    try {
      await api.delete(`/event-vendors/${assignmentToUnassign._id}`);
      toast.success('Vendor unassigned.');
      setUnassignModalOpen(false);
      setAssignmentToUnassign(null);
      fetchEventDetails();
    } catch (err) {
      toast.error(err.customMessage || 'Failed to remove vendor.');
    } finally {
      setUnassigning(false);
    }
  };

  const handleCancelRequestSubmit = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      toast.warning('Please enter a cancellation reason.');
      return;
    }

    setRequestingCancel(true);
    try {
      await api.post('/cancellations', {
        event: id,
        reason: cancelReason,
      });
      toast.success('Cancellation request submitted.');
      setCancelModalOpen(false);
      setCancelReason('');
      fetchEventDetails();
    } catch (err) {
      toast.error(err.customMessage || 'Failed to submit cancellation request.');
    } finally {
      setRequestingCancel(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await api.post('/feedback', {
        event: id,
        client: event.client._id,
        rating: Number(rating),
        comments,
      });
      toast.success('Feedback recorded.');
      setFeedbackModalOpen(false);
      setComments('');
      fetchEventDetails();
    } catch (err) {
      toast.error(err.customMessage || 'Failed to record feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleQuickStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await api.put(`/events/${id}`, { status: newStatus });
      toast.success(`Event status updated to ${newStatus}.`);
      fetchEventDetails();
    } catch (err) {
      toast.error(err.customMessage || 'Failed to update event status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading || !event) {
    return <LoadingSpinner text="Loading event details..." />;
  }

  const latestCancellation =
    event.cancellationRequests && event.cancellationRequests.length > 0
      ? event.cancellationRequests[0]
      : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/events"
            className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 text-gray-500"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-gray-900">{event.eventName}</h1>
              <StatusBadge status={event.status} />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {event.eventType} Event &bull; Created by {event.createdBy?.name || 'Staff'} on{' '}
              {new Date(event.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {event.status === 'Planned' && isCoordinator && (
            <button
              onClick={() => handleQuickStatusChange('Confirmed')}
              disabled={updatingStatus}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Confirm Event</span>
            </button>
          )}

          {event.status === 'Confirmed' && (
            <button
              onClick={() => handleQuickStatusChange('Completed')}
              disabled={updatingStatus}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark Completed</span>
            </button>
          )}

          {isCoordinator && (
            <Link
              to={`/events/${event._id}/edit`}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-200"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Link>
          )}

          {!['Cancelled', 'Completed', 'Pending Cancellation'].includes(event.status) && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Request Cancellation</span>
            </button>
          )}

          {event.status === 'Completed' && (
            <button
              onClick={() => setFeedbackModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Add Feedback</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: 2 Columns Left, 1 Column Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-gray-500 uppercase">Event Date</span>
                <p className="text-xs font-bold text-gray-900">
                  {new Date(event.eventDate).toLocaleDateString()}
                </p>
                <span className="text-[11px] text-gray-500">
                  {event.startTime} - {event.endTime}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-green-50 text-green-600 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-gray-500 uppercase">Budget</span>
                <p className="text-xs font-bold text-gray-900">
                  ₹{event.budget.toLocaleString('en-IN')}
                </p>
                <span className="text-[11px] text-gray-500">Allocated</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-gray-500 uppercase">Vendors</span>
                <p className="text-xs font-bold text-gray-900">
                  {event.assignedVendors?.length || 0} Assigned
                </p>
                <span className="text-[11px] text-gray-500">Services</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-1.5">Description</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {event.description || 'No description provided.'}
            </p>
          </div>

          {/* Assigned Vendors */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Assigned Vendors</h3>
                <p className="text-xs text-gray-500">Service providers coordinating for this event</p>
              </div>
              {isCoordinator && (
                <button
                  type="button"
                  onClick={handleOpenAssignVendor}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign Vendor</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-[11px] uppercase font-semibold text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2.5">Vendor</th>
                    <th className="px-4 py-2.5">Service</th>
                    <th className="px-4 py-2.5">Contact</th>
                    <th className="px-4 py-2.5">Status</th>
                    {isCoordinator && <th className="px-4 py-2.5 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {event.assignedVendors && event.assignedVendors.length > 0 ? (
                    event.assignedVendors.map((av) => (
                      <tr key={av._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 font-medium text-gray-900">
                          {av.vendor?.name || '-'}
                        </td>
                        <td className="px-4 py-2.5 text-gray-700">
                          {av.vendor?.serviceType}
                        </td>
                        <td className="px-4 py-2.5 text-gray-500">
                          {av.vendor?.phone}
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge status={av.status} />
                        </td>
                        {isCoordinator && (
                          <td className="px-4 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setAssignmentToUnassign(av);
                                setUnassignModalOpen(true);
                              }}
                              className="text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-5 text-center text-gray-400">
                        No vendors assigned yet. Click "Assign Vendor" to add one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Client Feedback</h3>
                <p className="text-xs text-gray-500">Ratings and comments received for this event</p>
              </div>
              {event.status === 'Completed' && (
                <button
                  onClick={() => setFeedbackModalOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  + Add Feedback
                </button>
              )}
            </div>

            {event.feedback && event.feedback.length > 0 ? (
              <div className="space-y-3">
                {event.feedback.map((fb) => (
                  <div key={fb._id} className="p-3 bg-gray-50 rounded border border-gray-200 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= fb.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="font-semibold text-gray-700 ml-1.5">{fb.rating} / 5</span>
                      </div>
                      <span className="text-gray-400">{new Date(fb.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-700 italic">"{fb.comments}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">
                {event.status === 'Completed'
                  ? 'No feedback recorded yet.'
                  : 'Feedback can be recorded once the event is Completed.'}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Client & Venue & Timeline */}
        <div className="space-y-5">
          {/* Client Card */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              Client Details
            </h3>
            {event.client ? (
              <div className="space-y-2 text-xs">
                <p className="text-sm font-bold text-gray-900">{event.client.name}</p>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{event.client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{event.client.phone}</span>
                </div>
                {event.client.city && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{event.client.city}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-100">
                  <Link
                    to={`/clients/${event.client._id}`}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    View Client Profile &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No client assigned.</p>
            )}
          </div>

          {/* Venue Card */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              Venue Details
            </h3>
            {event.venue ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-900">{event.venue.name}</p>
                  <StatusBadge status={event.venue.availabilityStatus} />
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Building className="w-3.5 h-3.5 text-gray-400" />
                  <span>Location: {event.venue.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span>Capacity: {event.venue.capacity} guests</span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <Link
                    to={`/venues/${event.venue._id}`}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    View Venue Bookings &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No venue reserved.</p>
            )}
          </div>

          {/* Cancellation Info */}
          {latestCancellation && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900">
                  Cancellation: {latestCancellation.status}
                </span>
                <span className="text-amber-700">
                  {new Date(latestCancellation.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-amber-800">
                <strong>Reason:</strong> {latestCancellation.reason}
              </p>
              {latestCancellation.reviewedBy && (
                <p className="text-amber-800 pt-1 border-t border-amber-200">
                  <strong>Reviewed by {latestCancellation.reviewedBy.name}:</strong>{' '}
                  {latestCancellation.reviewComment || '-'}
                </p>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-xs">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              Event Timeline
            </h3>
            <div className="space-y-3 pl-3 border-l-2 border-gray-200">
              <div>
                <p className="font-semibold text-gray-800">Event Created</p>
                <span className="text-[11px] text-gray-400">
                  {new Date(event.createdAt).toLocaleDateString()}
                </span>
              </div>
              {['Confirmed', 'Completed', 'Pending Cancellation', 'Cancelled'].includes(event.status) && (
                <div>
                  <p className="font-semibold text-gray-800">Event Confirmed</p>
                  <span className="text-[11px] text-gray-400">Venue reserved</span>
                </div>
              )}
              {event.assignedVendors?.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-800">Vendors Assigned</p>
                  <span className="text-[11px] text-gray-400">
                    {event.assignedVendors.length} service providers
                  </span>
                </div>
              )}
              {event.status === 'Completed' && (
                <div>
                  <p className="font-semibold text-green-700">Completed</p>
                  <span className="text-[11px] text-gray-400">Event concluded</span>
                </div>
              )}
              {event.status === 'Cancelled' && (
                <div>
                  <p className="font-semibold text-red-700">Cancelled</p>
                  <span className="text-[11px] text-gray-400">Venue released</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assign Vendor Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Vendor"
      >
        <form onSubmit={handleAssignVendorSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Select Vendor
            </label>
            <select
              required
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">-- Choose Vendor --</option>
              {availableVendors.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name} ({v.serviceType}) &bull; {v.status}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={assigningVendor}
              onClick={() => setAssignModalOpen(false)}
              className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assigningVendor}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {assigningVendor ? 'Assigning...' : 'Assign Vendor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Unassign Confirmation Modal */}
      <ConfirmationModal
        isOpen={unassignModalOpen}
        onClose={() => setUnassignModalOpen(false)}
        onConfirm={handleUnassignVendor}
        title="Unassign Vendor"
        message={`Are you sure you want to unassign ${assignmentToUnassign?.vendor?.name}?`}
        confirmText="Remove"
        loading={unassigning}
      />

      {/* Cancellation Request Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Request Cancellation"
      >
        <form onSubmit={handleCancelRequestSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Reason for Cancellation
            </label>
            <textarea
              required
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="State reason..."
              className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={requestingCancel}
              onClick={() => setCancelModalOpen(false)}
              className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={requestingCancel}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
            >
              {requestingCancel ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title="Add Client Feedback"
      >
        <form onSubmit={handleFeedbackSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-gray-700 ml-2">{rating} Stars</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Client Comments
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Client remarks..."
              className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={submittingFeedback}
              onClick={() => setFeedbackModalOpen(false)}
              className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingFeedback}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-yellow-600 hover:bg-yellow-700 rounded-md disabled:opacity-50"
            >
              {submittingFeedback ? 'Saving...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EventDetails;
