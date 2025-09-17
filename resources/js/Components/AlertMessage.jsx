import React, { useState } from 'react';

const AlertMessage = ({ message, type }) => {
  const [isVisible, setIsVisible] = useState(true); // State to control visibility

  // Define styles for different alert types
  const typeStyles = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
  };

  if (!isVisible) return null; // Do not render the alert if it's not visible

  return (
    <div className={`rounded-md p-4 ${typeStyles[type] || 'bg-gray-100 text-gray-800'}`}>
      <div className="flex items-center justify-between">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className={`h-5 w-5 ${type === 'success' ? 'text-green-500' : type === 'error' ? 'text-red-500' : type === 'info' ? 'text-blue-500' : 'text-yellow-500'}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{message}</p>
          </div>
        </div>
        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)} // Close the alert
          className="ml-4 text-sm font-semibold text-gray-500 hover:text-gray-700"
        >
          <span className="sr-only">Close</span>
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M6.293 4.293a1 1 0 011.414 0L10 6.586l2.293-2.293a1 1 0 111.414 1.414L11.414 8l2.293 2.293a1 1 0 01-1.414 1.414L10 9.414l-2.293 2.293a1 1 0 11-1.414-1.414L8.586 8 6.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AlertMessage;
