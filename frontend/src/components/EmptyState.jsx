import React from 'react';
import { FolderOpen } from 'lucide-react';

const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No records found',
  description = 'There are no items to display right now.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-lg border border-gray-200 shadow-sm my-4">
      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 mb-3 border border-gray-200">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 max-w-sm mb-4">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md shadow-xs transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
