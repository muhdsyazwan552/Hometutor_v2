// SubjectMenuDropdown.jsx
import React from 'react';
import { Link } from '@inertiajs/react';

export default function SubjectMenuDropdown({ isOpen, setIsOpen, title }) {
  return (
    <>
      {/* Dropdown Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm font-semibold text-gray-700 hover:text-gray-900 focus:outline-none transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50"
      >
        {/* Hamburger icon for mobile */}
        <svg 
          className="h-5 w-5 sm:hidden mr-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        
        {/* Text for tablet */}
        <span className="hidden sm:flex lg:hidden flex-col items-start">
          <span className="text-sm font-semibold">School Subject</span>
          <span className="flex items-center text-sm text-gray-600 mt-1">
            {title}
            <svg
              className={`ml-1 h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </span>
        
        {/* Text for desktop */}
        <span className="hidden lg:flex items-center">
          School Subject - {title}
          <svg
            className={`ml-2 h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      {/* Enhanced Dropdown Menu */}
       <div
                                className={`fixed left-0 top-16 sm:top-20 w-screen h-auto bg-white px-4 sm:px-6 py-2 shadow-lg transition-all duration-300 ease-in-out z-50 ${isOpen
                                        ? "opacity-100 translate-y-0"
                                        : "opacity-0 -translate-y-2 pointer-events-none"
                                    }`}
                            >
                                <div className="px-2 sm:px-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                        {/* School Subjects */}
                                        <div>
                                            <h4 className="mb-2 border-b pb-1 text-sm font-semibold text-gray-700">
                                                School Subjects
                                            </h4>
                                            <ul className="space-y-1 text-sm text-sky-600">
                                                <li><Link href="/subject/bahasa-melayu" className="hover:underline block py-1">Bahasa Melayu</Link></li>
                                                <li><Link href="/subject/bahasa-inggeris" className="hover:underline block py-1">Bahasa Inggeris</Link></li>
                                                <li><Link href="/subject/matematik" className="hover:underline block py-1">Matematik</Link></li>
                                                <li><Link href="/subject/sains" className="hover:underline block py-1">Sains</Link></li>
                                                <li><Link href="/subject/matematik-tambahan" className="hover:underline block py-1">Matematik Tambahan</Link></li>
                                            </ul>
                                        </div>

                                        {/* VideoTube */}
                                        <div>
                                            <h4 className="mb-2 border-b pb-1 text-sm font-semibold text-gray-700">
                                                VideoTube
                                            </h4>
                                            <ul className="space-y-1 text-sm text-red-500">
                                                <li><Link href="#" className="hover:underline block py-1">General Learning</Link></li>
                                            </ul>
                                        </div>

                                        {/* Test Prep */}
                                        <div>
                                            <h4 className="mb-2 border-b pb-1 text-sm font-semibold text-gray-700">
                                                Games
                                            </h4>
                                            <ul className="space-y-1 text-sm text-gray-600">
                                                <li><Link href="/tekakata-page" className="hover:underline block py-1">Teka Kata</Link></li>
                                                <li><Link href="/quiz-page" className="hover:underline block py-1">Quiz Arena</Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
    </>
  );
}