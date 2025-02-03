import React from 'react';
import { X } from 'lucide-react';

interface BookingMessageModalProps {
  message: string;
  onClose: () => void;
}

export function BookingMessageModal({ message, onClose }: BookingMessageModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Message</h2>
        <p className="text-gray-600 whitespace-pre-wrap">{message}</p>
      </div>
    </div>
  );
}