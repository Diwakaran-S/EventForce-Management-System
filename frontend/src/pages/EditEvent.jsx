import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [clients, setClients] = useState([]);
  const [venues, setVenues] = useState([]);

  const [formData, setFormData] = useState({
    eventName: '',
    eventType: 'Wedding',
    eventDate: '',
    startTime: '09:00',
    endTime: '16:00',
    client: '',
    venue: '',
    budget: '',
    description: '',
    status: 'Planned',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventRes, clientsRes, venuesRes] = await Promise.all([
          api.get(`/events/${id}`),
          api.get('/clients'),
          api.get('/venues'),
        ]);

        const ev = eventRes.data.data;
        const formattedDate = ev.eventDate ? new Date(ev.eventDate).toISOString().split('T')[0] : '';

        setFormData({
          eventName: ev.eventName || '',
          eventType: ev.eventType || 'Wedding',
          eventDate: formattedDate,
          startTime: ev.startTime || '09:00',
          endTime: ev.endTime || '16:00',
          client: ev.client?._id || ev.client || '',
          venue: ev.venue?._id || ev.venue || '',
          budget: ev.budget || 0,
          description: ev.description || '',
          status: ev.status || 'Planned',
        });

        setClients(clientsRes.data.data);
        setVenues(venuesRes.data.data);
      } catch (err) {
        toast.error('Failed to load event details.');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.eventName.trim()) {
      setErrorMessage('Please enter an event name.');
      return;
    }
    if (formData.startTime >= formData.endTime) {
      setErrorMessage('End time must be after start time.');
      return;
    }
    if (Number(formData.budget) < 0) {
      setErrorMessage('Budget must be 0 or more.');
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/events/${id}`, {
        ...formData,
        budget: Number(formData.budget) || 0,
      });
      toast.success('Event updated successfully.');
      navigate(`/events/${id}`);
    } catch (err) {
      const msg = err.customMessage || 'Failed to update event.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading event..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to={`/events/${id}`}
          className="p-1.5 bg-white rounded-md border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit Event</h1>
          <p className="text-xs text-gray-500">Update event details or status.</p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Event Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="eventName"
                required
                value={formData.eventName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Event Type <span className="text-red-500">*</span>
              </label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
              >
                <option value="Wedding">Wedding</option>
                <option value="Corporate">Corporate</option>
                <option value="Birthday">Birthday</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Festival">Festival</option>
                <option value="Concert">Concert</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
              >
                <option value="Planned">Planned</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Pending Cancellation">Pending Cancellation</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Event Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="eventDate"
                required
                value={formData.eventDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Budget (INR ₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="budget"
                min="0"
                required
                value={formData.budget}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="startTime"
                required
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="endTime"
                required
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                name="client"
                required
                value={formData.client}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
              >
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Venue <span className="text-red-500">*</span>
              </label>
              <select
                name="venue"
                required
                value={formData.venue}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
              >
                {venues.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name} ({v.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Description / Notes
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
            <Link
              to={`/events/${id}`}
              className="px-3.5 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{submitting ? 'Updating...' : 'Update Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;
