import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Download,
  Calendar,
  Layers,
  Star,
  IndianRupee,
  Search,
  BarChart3,
} from 'lucide-react';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const tabs = [
    { id: 'upcoming', label: 'Upcoming Events', icon: Calendar },
    { id: 'by_status', label: 'Events by Status', icon: BarChart3 },
    { id: 'by_type', label: 'Events by Type', icon: BarChart3 },
    { id: 'vendor_assignments', label: 'Vendor Assignments', icon: Layers },
    { id: 'client_feedback', label: 'Client Feedback', icon: Star },
    { id: 'budget_summary', label: 'Budget Summary', icon: IndianRupee },
  ];

  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (['upcoming', 'by_status', 'by_type', 'budget_summary'].includes(activeTab)) {
        const res = await api.get('/events');
        setData(res.data.data);
      } else if (activeTab === 'vendor_assignments') {
        const res = await api.get('/event-vendors');
        setData(res.data.data);
      } else if (activeTab === 'client_feedback') {
        const res = await api.get('/feedback');
        setData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeTab]);

  const exportToCSV = () => {
    if (!data || data.length === 0) {
      toast.warning('No data to export.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    let headers = [];
    let rows = [];

    if (['upcoming', 'by_status', 'by_type', 'budget_summary'].includes(activeTab)) {
      headers = ['Event Name', 'Type', 'Date', 'Time', 'Client', 'Venue', 'Budget (INR)', 'Status'];
      rows = filteredData.map((ev) => [
        `"${ev.eventName}"`,
        `"${ev.eventType}"`,
        `"${new Date(ev.eventDate).toLocaleDateString()}"`,
        `"${ev.startTime} - ${ev.endTime}"`,
        `"${ev.client?.name || ''}"`,
        `"${ev.venue?.name || ''}"`,
        ev.budget,
        `"${ev.status}"`,
      ]);
    } else if (activeTab === 'vendor_assignments') {
      headers = ['Event Name', 'Vendor Name', 'Service Type', 'Assigned Date', 'Status'];
      rows = filteredData.map((asg) => [
        `"${asg.event?.eventName || ''}"`,
        `"${asg.vendor?.name || ''}"`,
        `"${asg.vendor?.serviceType || ''}"`,
        `"${new Date(asg.assignedDate).toLocaleDateString()}"`,
        `"${asg.status}"`,
      ]);
    } else if (activeTab === 'client_feedback') {
      headers = ['Event Name', 'Client Name', 'Rating', 'Comments', 'Date'];
      rows = filteredData.map((fb) => [
        `"${fb.event?.eventName || ''}"`,
        `"${fb.client?.name || ''}"`,
        fb.rating,
        `"${(fb.comments || '').replace(/"/g, '""')}"`,
        `"${new Date(fb.createdAt).toLocaleDateString()}"`,
      ]);
    }

    csvContent += headers.join(',') + '\r\n';
    rows.forEach((rowArray) => {
      csvContent += rowArray.join(',') + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EventForce_${activeTab}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported to CSV.');
  };

  const filteredData = data.filter((item) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();

    if (['upcoming', 'by_status', 'by_type', 'budget_summary'].includes(activeTab)) {
      return (
        item.eventName?.toLowerCase().includes(term) ||
        item.eventType?.toLowerCase().includes(term) ||
        item.client?.name?.toLowerCase().includes(term) ||
        item.venue?.name?.toLowerCase().includes(term) ||
        item.status?.toLowerCase().includes(term)
      );
    } else if (activeTab === 'vendor_assignments') {
      return (
        item.event?.eventName?.toLowerCase().includes(term) ||
        item.vendor?.name?.toLowerCase().includes(term) ||
        item.vendor?.serviceType?.toLowerCase().includes(term) ||
        item.status?.toLowerCase().includes(term)
      );
    } else if (activeTab === 'client_feedback') {
      return (
        item.event?.eventName?.toLowerCase().includes(term) ||
        item.client?.name?.toLowerCase().includes(term) ||
        item.comments?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reports</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Filter, examine, and export operational datasets in CSV format.
          </p>
        </div>
        <button
          type="button"
          onClick={exportToCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-gray-200 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search report records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
          />
        </div>
        <span className="text-xs text-gray-400">
          {filteredData.length} records found
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Generating report..." />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {['upcoming', 'by_status', 'by_type', 'budget_summary'].includes(activeTab) && (
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-[11px] uppercase font-semibold text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Event Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Venue</th>
                    <th className="px-4 py-3">Budget</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((ev) => (
                    <tr key={ev._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">{ev.eventName}</td>
                      <td className="px-4 py-3">{ev.eventType}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {new Date(ev.eventDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{ev.client?.name || '-'}</td>
                      <td className="px-4 py-3 text-gray-700">{ev.venue?.name || '-'}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        ₹{ev.budget.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={ev.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'vendor_assignments' && (
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-[11px] uppercase font-semibold text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Event Name</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Assigned Date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((asg) => (
                    <tr key={asg._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {asg.event?.eventName || '-'}
                      </td>
                      <td className="px-4 py-3">{asg.vendor?.name || '-'}</td>
                      <td className="px-4 py-3">{asg.vendor?.serviceType || '-'}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(asg.assignedDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={asg.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'client_feedback' && (
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-[11px] uppercase font-semibold text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Comments</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((fb) => (
                    <tr key={fb._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {fb.event?.eventName || '-'}
                      </td>
                      <td className="px-4 py-3">{fb.client?.name || '-'}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">
                        {fb.rating} / 5
                      </td>
                      <td className="px-4 py-3 text-gray-600 italic">
                        "{fb.comments || '-'}"
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
