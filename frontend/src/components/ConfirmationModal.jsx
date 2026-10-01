import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import Modal from './Modal';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  confirmStyle = 'danger',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
            confirmStyle === 'danger'
              ? 'bg-red-100 text-red-600'
              : 'bg-amber-100 text-amber-600'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
        </div>
        <p className="text-sm text-gray-600 mb-5 leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`px-3.5 py-1.5 text-xs font-medium text-white rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
              confirmStyle === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
