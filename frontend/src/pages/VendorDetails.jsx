import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { Briefcase, Mail, Phone, ArrowLeft } from 'lucide-react';

const VendorDetails = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await api.get(`/vendors/${id}`);
        setVendor(res.data.data);
      } catch (err) {
        toast.error('Failed to load vendor details.');
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [id]);

  if (loading || !vendor) {
    return <LoadingSpinner text="Loading vendor details..." />;
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          to="/vendors"
          className="p-1.5 bg-white rounded-md border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">{vendor.name}</h1>
            <StatusBadge status={vendor.status} />
          </div>
          <p className="text-xs text-gray-500">{vendor.serviceType} Partner</p>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase">Service</span>
            <p className="text-xs font-semibold text-gray-900">{vendor.serviceType}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-green-50 text-green-600 flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase">Phone</span>
            <p className="text-xs font-semibold text-gray-900">{vendor.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase">Email</span>
            <p className="text-xs font-semibold text-gray-900 truncate max-w-xs">{vendor.email}</p>
          </div>
        </div>
      </div>

      {/* Assigned Events Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800">Event Assignments</h2>
          <span className="text-xs text-gray-500">
            {vendor.assignments?.length || 0} assignments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-[11px] uppercase font-semibold text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Event Name</th>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Event Status</th>
                <th className="px-4 py-3">Assignment Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vendor.assignments && vendor.assignments.length > 0 ? (
                vendor.assignments.map((asg) => (
                  <tr key={asg._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {asg.event?.eventName || 'Event'}
                    </td>
                    <td className="px-4 py-3">{asg.event?.venue?.name || '-'}</td>
                    <td className="px-4 py-3">
                      {asg.event?.eventDate ? new Date(asg.event.eventDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {asg.event && <StatusBadge status={asg.event.status} />}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={asg.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {asg.event && (
                        <Link
                          to={`/events/${asg.event._id}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          View &rarr;
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                    No active assignments for this vendor.
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

export default VendorDetails;
