// ProfileDropdown.jsx
import React from 'react';
import { Link } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';

export default function ProfileDropdown({ user }) {
  return (
    <Dropdown>
      <Dropdown.Trigger>
        <span className="inline-flex rounded-full">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white p-2 text-sm font-medium text-gray-700 transition duration-150 ease-in-out hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
          >
           <div className="flex items-center space-x-2">
  <div className="w-8 h-8 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full flex items-center justify-center border border-gray-400 shadow-md">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 14a4 4 0 10-8 0v4h8v-4zM12 12a4 4 0 100-8 4 4 0 000 8z"
      />
    </svg>
  </div>

  
</div>

          </button>
        </span>
      </Dropdown.Trigger>

    <Dropdown.Content className="w-72 rounded-xl shadow-lg border border-gray-200 bg-white">
  <div className="py-2">
    {/* Profile Link */}
    <Dropdown.Link
      href={route('profile.edit')}
      className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-150"
    >
      <div className="w-6 h-6 flex items-center justify-center mr-3">
        <svg
          className="w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
      <span className="font-medium text-gray-800">Profile</span>
    </Dropdown.Link>

    <div className="border-t border-gray-100 my-2"></div>

    {/* Logout Button */}
    <Dropdown.Link
      href={route('logout')}
      method="post"
      as="button"
      className="flex items-center w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 transition-colors duration-150"
    >
      <div className="w-6 h-6 flex items-center justify-center mr-3">
        <svg
          className="w-5 h-5 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </div>
      <span className="font-medium text-gray-800">Log Out</span>
    </Dropdown.Link>
  </div>
</Dropdown.Content>

    </Dropdown>
  );
}