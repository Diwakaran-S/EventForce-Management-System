import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  Briefcase,
  Search,
  Plus,
  Mail,
  Phone,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
} from 'lucide-react';

const SERVICE_TYPES = [
  'Catering',
  'Decoration',
  'Photography',
  'Videography',
  'Lighting',
  'Stage Setup',
  'Makeup',
  'DJ/Music',
  'Transportation',
  'Other',
];

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add / Edit Modal State
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: 'Catering',
    status: 'Available',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { isAdmin, isCoordinator } = useAuth();
  const toast = useToast();

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (serviceFilter !== 'all') params.serviceType = serviceFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.get('/vendors', { params });
      setVendors(res.data.data);
    } catch (err) {
      toast.error('Failed to load vendors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [search, serviceFilter, statusFilter]);

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      serviceType: 'Catering',
      status: 'Available',
    });
    setFormError('');
    setVendorModalOpen(true);
  };

  const handleOpenEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      serviceType: vendor.serviceType || 'Catering',
      status: vendor.status || 'Available',
    });
    setFormError('');
    setVendorModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setFormError('Name, email, and phone number are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingVendor) {
        await api.put(`/vendors/${editingVendor._id}`, formData);
        toast.success('Vendor updated.');
      } else {
        await api.post('/vendors', formData);
        toast.success('Vendor registered.');
      }
      setVendorModalOpen(false);
      fetchVendors();
    } catch (err) {
      const msg = err.customMessage || 'Failed to save vendor.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!vendorToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/vendors/${vendorToDelete._id}`);
      toast.success('Vendor deleted.');
      setDeleteModalOpen(false);
      setVendorToDelete(null);
      fetchVendors();
    } catch (err) {
      toast.error(err.customMessage || 'Failed to delete vendor.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Vendors</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage catering, photography, decoration, and entertainment partners.
          </p>
        </div>
        {isCoordinator && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vendor</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Service Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium">Service:</span>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="text-xs bg-white border border-gray-300 rounded-md px-2.5 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All</option>
              {SERVICE_TYPES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-gray-300 rounded-md px-2.5 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading vendors..." />
      ) : vendors.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No vendors found"
          description="There are currently no vendors registered."
          actionText={isCoordinator ? "Add Vendor" : null}
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-[11px] uppercase font-semibold text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Vendor Name</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vendors.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      <Link to={`/vendors/${v._id}`} className="hover:text-blue-600">
                        {v.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{v.serviceType}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {v.phone}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {v.email}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/vendors/${v._id}`}
                          title="View"
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        {isCoordinator && (
                          <button
                            type="button"
                            title="Edit"
                            onClick={() => handleOpenEdit(v)}
                            className="p-1 text-gray-500 hover:text-amber-600 hover:bg-gray-100 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            title="Delete"
                            onClick={() => {
                              setVendorToDelete(v);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Vendor Modal */}
      <Modal
        isOpen={vendorModalOpen}
        onClose={() => setVendorModalOpen(false)}
        title={editingVendor ? 'Edit Vendor' : 'Add Vendor'}
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
              Vendor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Royal Catering"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Service Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.serviceType}
              onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
            >
              {SERVICE_TYPES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="vendor@example.com"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9840112233"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
            >
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setVendorModalOpen(false)}
              className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingVendor ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Vendor"
        message={`Are you sure you want to delete ${vendorToDelete?.name}?`}
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  );
};

export default Vendors;
