import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-gray-500">
      <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
      <span className="text-xs font-medium text-gray-600">{text}</span>
    </div>
  );
};

export default LoadingSpinner;
