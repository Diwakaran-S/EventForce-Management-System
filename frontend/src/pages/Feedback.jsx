import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  MessageSquare,
  Star,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';

const Feedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { isAdmin } = useAuth();
  const toast = useToast();

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await api.get('/feedback');
      setFeedbackList(res.data.data);
    } catch (err) {
      toast.error('Failed to load feedback.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleOpenAdd = async () => {
    setFormError('');
    setSelectedEventId('');
    setRating(5);
    setComments('');

    try {
      const res = await api.get('/events', { params: { status: 'Completed' } });
      setCompletedEvents(res.data.data);
      setModalOpen(true);
    } catch (err) {
      toast.error('Failed to load completed events.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedEventId) {
      setFormError('Please select a completed event.');
      return;
    }

    const eventObj = completedEvents.find((e) => e._id === selectedEventId);
    if (!eventObj || !eventObj.client) {
      setFormError('The selected event has no associated client.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/feedback', {
        event: selectedEventId,
        client: eventObj.client._id,
        rating: Number(rating),
        comments,
      });
      toast.success('Feedback recorded.');
      setModalOpen(false);
      fetchFeedback();
    } catch (err) {
      const msg = err.customMessage || 'Failed to submit feedback.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!feedbackToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/feedback/${feedbackToDelete._id}`);
      toast.success('Feedback removed.');
      setDeleteModalOpen(false);
      setFeedbackToDelete(null);
      fetchFeedback();
    } catch (err) {
      toast.error(err.customMessage || 'Failed to delete feedback.');
    } finally {
      setDeleting(false);
    }
  };

  const totalReviews = feedbackList.length;
  const avgScore =
    totalReviews > 0
      ? (feedbackList.reduce((acc, f) => acc + f.rating, 0) / totalReviews).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Client Feedback</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Client ratings and testimonials collected from completed events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md text-xs font-semibold">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span>Average: {avgScore} / 5</span>
            <span className="text-yellow-600 font-normal">({totalReviews} reviews)</span>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Feedback</span>
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <LoadingSpinner text="Loading feedback..." />
      ) : feedbackList.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No feedback records"
          description="There are currently no feedback entries recorded."
          actionText="+ Add Feedback"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbackList.map((fb) => (
            <div
              key={fb._id}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {fb.event?.eventName || 'Event'}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Client: <strong>{fb.client?.name || '-'}</strong> &bull;{' '}
                      {new Date(fb.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-0.5 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= fb.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-[11px] font-bold text-gray-700 ml-1">{fb.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 italic bg-gray-50 p-2.5 rounded border border-gray-100">
                  "{fb.comments || 'No comment provided.'}"
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                {fb.event ? (
                  <Link
                    to={`/events/${fb.event._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View Event &rarr;
                  </Link>
                ) : (
                  <span />
                )}

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setFeedbackToDelete(fb);
                      setDeleteModalOpen(true);
                    }}
                    className="text-gray-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Client Feedback"
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
              Select Completed Event <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
            >
              <option value="">-- Choose Completed Event --</option>
              {completedEvents.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.eventName} (Client: {ev.client?.name || 'N/A'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer focus:outline-none"
                >
                  <Star
                    className={`w-5 h-5 ${
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
              Comments
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Client feedback notes..."
              className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setModalOpen(false)}
              className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || completedEvents.length === 0}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Feedback'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Feedback"
        message="Are you sure you want to delete this feedback record?"
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  );
};

export default Feedback;
