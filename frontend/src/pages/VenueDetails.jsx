import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { Building, MapPin, Users, ArrowLeft } from 'lucide-react';

const VenueDetails = () => {
  const { id } = useParams();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const res = await api.get(`/venues/${id}`);
        setVenue(res.data.data);
      } catch (err) {
        toast.error('Failed to load venue details.');
      } finally {
        setLoading(false);
      }
    };
    fetchVenue();
  }, [id]);

  if (loading || !venue) {
    return <LoadingSpinner text="Loading venue details..." />;
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          to="/venues"
          className="p-1.5 bg-white rounded-md border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">{venue.name}</h1>
            <StatusBadge status={venue.availabilityStatus} />
          </div>
          <p className="text-xs text-gray-500">{venue.location} &bull; Capacity: {venue.capacity} guests</p>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase">Location</span>
            <p className="text-xs font-semibold text-gray-900">{venue.location}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-green-50 text-green-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase">Capacity</span>
            <p className="text-xs font-semibold text-gray-900">{venue.capacity} attendees</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase">Address</span>
            <p className="text-xs font-semibold text-gray-900 truncate max-w-xs">{venue.address || '-'}</p>
          </div>
        </div>
      </div>

      {/* Booked Events Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800">Bookings Schedule</h2>
          <span className="text-xs text-gray-500">
            {venue.events?.length || 0} events booked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-[11px] uppercase font-semibold text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Event Name</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {venue.events && venue.events.length > 0 ? (
                venue.events.map((ev) => (
                  <tr key={ev._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{ev.eventName}</td>
                    <td className="px-4 py-3">{ev.client?.name || '-'}</td>
                    <td className="px-4 py-3">
                      {new Date(ev.eventDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {ev.startTime} - {ev.endTime}
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
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                    No bookings scheduled for this venue.
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

export default VenueDetails;
