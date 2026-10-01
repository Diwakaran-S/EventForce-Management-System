import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

const CreateEvent = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [clients, setClients] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
    const fetchLookups = async () => {
      try {
        const [clientsRes, venuesRes] = await Promise.all([
          api.get('/clients'),
          api.get('/venues'),
        ]);
        setClients(clientsRes.data.data);
        setVenues(venuesRes.data.data);
      } catch (err) {
        toast.error('Failed to load clients or venues.');
      } finally {
        setLoadingLookups(false);
      }
    };
    fetchLookups();
  }, []);

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
    if (!formData.eventDate) {
      setErrorMessage('Please choose an event date.');
      return;
    }
    if (formData.startTime >= formData.endTime) {
      setErrorMessage('End time must be after start time.');
      return;
    }
    if (!formData.client) {
      setErrorMessage('Please select a client.');
      return;
    }
    if (!formData.venue) {
      setErrorMessage('Please select a venue.');
      return;
    }
    if (Number(formData.budget) < 0) {
      setErrorMessage('Budget must be 0 or more.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        budget: Number(formData.budget) || 0,
      };

      const res = await api.post('/events', payload);
      toast.success('Event created successfully.');
      navigate(`/events/${res.data.data._id}`);
    } catch (err) {
      const msg = err.customMessage || 'Failed to create event.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/events"
          className="p-1.5 bg-white rounded-md border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Create Event</h1>
          <p className="text-xs text-gray-500">Fill out details to schedule a new event.</p>
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
                placeholder="e.g. Wedding Reception"
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
                Initial Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
              >
                <option value="Planned">Planned</option>
                <option value="Confirmed">Confirmed</option>
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
                placeholder="e.g. 50000"
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
                disabled={loadingLookups}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
              >
                <option value="">-- Select Client --</option>
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
                disabled={loadingLookups}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
              >
                <option value="">-- Select Venue --</option>
                {venues.map((v) => (
                  <option
                    key={v._id}
                    value={v._id}
                    disabled={v.availabilityStatus === 'Unavailable'}
                  >
                    {v.name} ({v.location}) {v.availabilityStatus === 'Unavailable' ? '(Unavailable)' : ''}
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
                placeholder="Optional notes or requirements..."
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
            <Link
              to="/events"
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
              <span>{submitting ? 'Saving...' : 'Save Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
