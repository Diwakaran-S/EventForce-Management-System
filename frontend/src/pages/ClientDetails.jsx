import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';

const ClientDetails = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await api.get(`/clients/${id}`);
        setClient(res.data.data);
      } catch (err) {
        toast.error('Failed to load client details.');
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  if (loading || !client) {
    return <LoadingSpinner text="Loading client profile..." />;
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          to="/clients"
          className="p-1.5 bg-white rounded-md border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
          <p className="text-xs text-gray-500">Client profile and event history</p>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase">Email</span>
            <p className="text-xs font-semibold text-gray-900">{client.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-green-50 text-green-600 flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase">Phone</span>
            <p className="text-xs font-semibold text-gray-900">{client.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase">City</span>
            <p className="text-xs font-semibold text-gray-900">
              {client.city || '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800">Booked Events</h2>
          <span className="text-xs text-gray-500">
            {client.events?.length || 0} events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-[11px] uppercase font-semibold text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Event Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {client.events && client.events.length > 0 ? (
                client.events.map((ev) => (
                  <tr key={ev._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{ev.eventName}</td>
                    <td className="px-4 py-3">{ev.eventType}</td>
                    <td className="px-4 py-3">{ev.venue?.name || '-'}</td>
                    <td className="px-4 py-3">
                      {new Date(ev.eventDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      ₹{ev.budget.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ev.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/events/${ev._id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        View &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                    No events booked for this client.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
