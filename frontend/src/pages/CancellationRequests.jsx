import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { FileText, CheckCircle, XCircle } from 'lucide-react';

const CancellationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Review Modal State (Approve / Reject)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [requestToReview, setRequestToReview] = useState(null);
  const [decision, setDecision] = useState('approve');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { isCoordinator } = useAuth();
  const toast = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await api.get('/cancellations', { params });
      setRequests(res.data.data);
    } catch (err) {
      toast.error('Failed to load cancellation requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleOpenReview = (request, defaultDecision) => {
    setRequestToReview(request);
    setDecision(defaultDecision);
    setReviewComment('');
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!requestToReview) return;

    setSubmittingReview(true);
    try {
      if (decision === 'approve') {
        await api.put(`/cancellations/${requestToReview._id}/approve`, {
          reviewComment: reviewComment || 'Approved',
        });
        toast.success('Cancellation approved and venue released.');
      } else {
        await api.put(`/cancellations/${requestToReview._id}/reject`, {
          reviewComment: reviewComment || 'Rejected',
        });
        toast.success('Cancellation rejected. Event restored.');
      }
      setReviewModalOpen(false);
      fetchRequests();
    } catch (err) {
      toast.error(err.customMessage || 'Failed to review cancellation request.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cancellation Requests</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Review event cancellation submissions and manage venue releases.
          </p>
        </div>
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
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading cancellation requests..." />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No requests found"
          description="There are currently no cancellation requests in this filter."
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-[11px] uppercase font-semibold text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Requested By</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {req.event ? (
                        <Link
                          to={`/events/${req.event._id}`}
                          className="font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {req.event.eventName}
                        </Link>
                      ) : (
                        <span className="text-gray-400">Deleted</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {req.event?.client?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                      {req.reason}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {req.requestedBy?.name || 'Staff'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {req.status === 'Pending' && isCoordinator ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenReview(req, 'approve')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenReview(req, 'reject')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-[11px]">
                          {req.reviewedBy ? `Reviewed by ${req.reviewedBy.name}` : '-'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={decision === 'approve' ? 'Approve Cancellation' : 'Reject Cancellation'}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-3">
          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700">
            <p className="font-semibold mb-1">
              {decision === 'approve' ? 'Approving this request will:' : 'Rejecting this request will:'}
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-gray-600">
              {decision === 'approve' ? (
                <>
                  <li>Mark the event status as "Cancelled".</li>
                  <li>Release the venue back to "Available".</li>
                </>
              ) : (
                <>
                  <li>Restore event status to "Confirmed".</li>
                  <li>Keep venue reservation active.</li>
                </>
              )}
            </ul>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Decision
            </label>
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="decision"
                  value="approve"
                  checked={decision === 'approve'}
                  onChange={() => setDecision('approve')}
                />
                <span>Approve</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="decision"
                  value="reject"
                  checked={decision === 'reject'}
                  onChange={() => setDecision('reject')}
                />
                <span>Reject</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Reviewer Comment
            </label>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Enter review notes..."
              className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={submittingReview}
              onClick={() => setReviewModalOpen(false)}
              className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReview}
              className={`px-3.5 py-1.5 text-xs font-semibold text-white rounded-md disabled:opacity-50 ${
                decision === 'approve'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gray-800 hover:bg-gray-900'
              }`}
            >
              {submittingReview ? 'Submitting...' : 'Confirm'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CancellationRequests;
