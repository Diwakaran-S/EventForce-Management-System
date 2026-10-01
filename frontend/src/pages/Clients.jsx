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
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
} from 'lucide-react';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  // Add / Edit Modal State
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { isAdmin, isCoordinator } = useAuth();
  const toast = useToast();

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (cityFilter) params.city = cityFilter;

      const res = await api.get('/clients', { params });
      setClients(res.data.data);
    } catch (err) {
      toast.error('Failed to load clients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search, cityFilter]);

  const handleOpenAdd = () => {
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '', address: '', city: '' });
    setFormError('');
    setClientModalOpen(true);
  };

  const handleOpenEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      city: client.city || '',
    });
    setFormError('');
    setClientModalOpen(true);
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
      if (editingClient) {
        await api.put(`/clients/${editingClient._id}`, formData);
        toast.success('Client updated successfully.');
      } else {
        await api.post('/clients', formData);
        toast.success('Client registered successfully.');
      }
      setClientModalOpen(false);
      fetchClients();
    } catch (err) {
      const msg = err.customMessage || 'Failed to save client.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/clients/${clientToDelete._id}`);
      toast.success('Client deleted.');
      setDeleteModalOpen(false);
      setClientToDelete(null);
      fetchClients();
    } catch (err) {
      toast.error(err.customMessage || 'Failed to delete client.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Clients</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Registered clients directory and contact details.
          </p>
        </div>
        {isCoordinator && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Client</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-500 font-medium">City:</span>
          <input
            type="text"
            placeholder="Filter city..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="text-xs bg-white border border-gray-300 rounded-md px-2.5 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading clients..." />
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients found"
          description="There are currently no clients registered in the system."
          actionText={isCoordinator ? "Add Client" : null}
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-[11px] uppercase font-semibold text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Client Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clients.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      <Link to={`/clients/${c._id}`} className="hover:text-blue-600">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {c.email}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {c.phone}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {c.city || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-xs">
                      {c.address || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/clients/${c._id}`}
                          title="View"
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        {isCoordinator && (
                          <button
                            type="button"
                            title="Edit"
                            onClick={() => handleOpenEdit(c)}
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
                              setClientToDelete(c);
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

      {/* Add / Edit Client Modal */}
      <Modal
        isOpen={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        title={editingClient ? 'Edit Client' : 'Add Client'}
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
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="ramesh@example.com"
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
              placeholder="9876543210"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. Chennai"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Address details..."
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setClientModalOpen(false)}
              className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingClient ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Client"
        message={`Are you sure you want to delete ${clientToDelete?.name}?`}
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  );
};

export default Clients;
