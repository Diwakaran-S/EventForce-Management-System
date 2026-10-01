import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Calendar,
  Users,
  Briefcase,
  MapPin,
  CheckCircle,
  AlertCircle,
  IndianRupee,
  Star,
  RefreshCw,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const CHART_COLORS = ['#2563eb', '#16a34a', '#9333ea', '#d97706', '#dc2626', '#4b5563'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/stats');
      setData(res.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !data) {
    return <LoadingSpinner text="Loading dashboard data..." />;
  }

  const { summary, charts, upcomingEventsTable } = data;

  const statCards = [
    {
      label: 'Total Events',
      value: summary.totalEvents,
      icon: Calendar,
      iconColor: 'bg-blue-50 text-blue-600',
      note: `${summary.upcomingEvents} upcoming`,
    },
    {
      label: 'Total Clients',
      value: summary.totalClients,
      icon: Users,
      iconColor: 'bg-green-50 text-green-600',
      note: 'Registered clients',
    },
    {
      label: 'Total Vendors',
      value: summary.totalVendors,
      icon: Briefcase,
      iconColor: 'bg-amber-50 text-amber-600',
      note: 'Service partners',
    },
    {
      label: 'Total Venues',
      value: summary.totalVenues,
      icon: MapPin,
      iconColor: 'bg-purple-50 text-purple-600',
      note: 'Managed venues',
    },
    {
      label: 'Total Event Budget',
      value: `₹${(summary.totalEventBudget || 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      iconColor: 'bg-gray-100 text-gray-800',
      note: 'All active events',
    },
    {
      label: 'Completed Events',
      value: summary.completedEvents,
      icon: CheckCircle,
      iconColor: 'bg-green-50 text-green-600',
      note: 'Finished events',
    },
    {
      label: 'Pending Cancellations',
      value: summary.pendingCancellations,
      icon: AlertCircle,
      iconColor: 'bg-red-50 text-red-600',
      note: 'Requires action',
    },
    {
      label: 'Average Client Rating',
      value: summary.averageRating ? `${summary.averageRating} / 5` : 'N/A',
      icon: Star,
      iconColor: 'bg-yellow-50 text-yellow-600',
      note: `${summary.totalReviews || 0} reviews`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Overview of events, bookings, venue capacity and vendor operations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
            <span>Refresh</span>
          </button>
          <Link
            to="/events/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-start justify-between"
            >
              <div>
                <span className="text-xs font-medium text-gray-500 block">
                  {card.label}
                </span>
                <p className="text-xl font-bold text-gray-900 mt-1">{card.value}</p>
                <span className="text-[11px] text-gray-400 mt-1 block">{card.note}</span>
              </div>
              <div className={`w-9 h-9 rounded-md flex items-center justify-center ${card.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Events Chart */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-gray-800">Monthly Events Schedule</h2>
            <p className="text-xs text-gray-500">Number of events scheduled across the current year</p>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyEvents}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={11} />
                <YAxis allowDecimals={false} stroke="#6b7280" fontSize={11} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="events"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="#93c5fd"
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Events by Type */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-gray-800">Events by Category</h2>
            <p className="text-xs text-gray-500">Breakdown of celebrations by event type</p>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.eventsByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} interval={0} angle={-15} textAnchor="end" height={35} />
                <YAxis allowDecimals={false} stroke="#6b7280" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Breakdown */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-1">Status Breakdown</h2>
          <p className="text-xs text-gray-500 mb-3">Current lifecycle state of all events</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.eventsByStatus.filter((s) => s.count > 0)}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={35}
                >
                  {charts.eventsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-1">
            {charts.eventsByStatus.map((item, idx) => (
              <span key={idx} className="text-[11px] text-gray-600 flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                />
                {item.name}: {item.count}
              </span>
            ))}
          </div>
        </div>

        {/* Vendor Status */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-1">Vendor Availability</h2>
          <p className="text-xs text-gray-500 mb-3">Registered vendor status</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.vendorStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" allowDecimals={false} stroke="#6b7280" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#6b7280" fontSize={11} width={70} />
                <Tooltip />
                <Bar dataKey="count" fill="#16a34a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback Rating Distribution */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-1">Feedback Ratings</h2>
          <p className="text-xs text-gray-500 mb-3">Star ratings from completed events</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.feedbackDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="rating" stroke="#6b7280" fontSize={11} />
                <YAxis allowDecimals={false} stroke="#6b7280" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Upcoming Events Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-800">Upcoming Events</h2>
            <p className="text-xs text-gray-500">Next scheduled events in the system</p>
          </div>
          <Link
            to="/events"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
          >
            View all events &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-[11px] uppercase font-semibold text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Event Name</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {upcomingEventsTable && upcomingEventsTable.length > 0 ? (
                upcomingEventsTable.map((ev) => (
                  <tr key={ev._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {ev.eventName}
                      <span className="block text-[11px] font-normal text-gray-400">{ev.eventType}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{ev.client?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-700">{ev.venue?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-700">
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
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                    No upcoming events found.
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

export default Dashboard;
