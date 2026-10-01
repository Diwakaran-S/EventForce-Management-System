import React from 'react';

const statusConfig = {
  // Event & Common Statuses
  Planned: 'bg-blue-50 text-blue-700 border-blue-200',
  Confirmed: 'bg-green-50 text-green-700 border-green-200',
  Completed: 'bg-purple-50 text-purple-700 border-purple-200',
  'Pending Cancellation': 'bg-amber-50 text-amber-700 border-amber-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
  Rejected: 'bg-gray-100 text-gray-700 border-gray-300',

  // Venue / Vendor Availability Statuses
  Available: 'bg-green-50 text-green-700 border-green-200',
  Reserved: 'bg-blue-50 text-blue-700 border-blue-200',
  Unavailable: 'bg-gray-100 text-gray-600 border-gray-300',
  Booked: 'bg-amber-50 text-amber-700 border-amber-200',

  // Assignment / Cancellation
  Assigned: 'bg-blue-50 text-blue-700 border-blue-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Approved: 'bg-green-50 text-green-700 border-green-200',
};

const StatusBadge = ({ status }) => {
  const styles = statusConfig[status] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium border ${styles}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
