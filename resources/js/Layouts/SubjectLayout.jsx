// resources/js/Layouts/SubjectLayout.jsx
import React, { useState } from 'react';
import { Link, usePage } from "@inertiajs/react";
import SubjectNavbar from './SubjectNavbar';
import StandardFooter from '@/Components/StandardFooter';

const subjectMap = {
  'bahasa-melayu': 'Bahasa Melayu',
  'bahasa-inggeris': 'Bahasa Inggeris',
  'matematik': 'Matematik',
  'sains': 'Sains',
};

const formatTitle = (slug) => {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function SubjectLayout({ 
  children, 
  subject, 
  activeTab = 'Practice',
  bgColor = "bg-white",
  onStandardChange,
  selectedStandard: propSelectedStandard // Accept as prop from parent
}) {
  const { url } = usePage();
  const subjectTitle = subjectMap[subject] || 'Subject';
  const title = formatTitle(subject);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Use prop if provided, otherwise default to 'Form 4'
  const [internalSelectedStandard, setInternalSelectedStandard] = useState(propSelectedStandard || 'Form 4');
  
  // Use prop value if available, otherwise use internal state
  const selectedStandard = propSelectedStandard !== undefined ? propSelectedStandard : internalSelectedStandard;

  const handleStandardSelect = (standard) => {
    if (propSelectedStandard === undefined) {
      // Only update internal state if no prop is provided
      setInternalSelectedStandard(standard);
    }
    setIsDropdownOpen(false);
    if (onStandardChange) {
      onStandardChange(standard);
    }
  };

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <SubjectNavbar title={subject}  />
      
      {/* Header Section */}
      <div className="px-4 sm:px-6 lg:px-8 bg-gradient-to-t from-sky-500 to-indigo-500 py-4 sm:py-6 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-1">{title}</h1>

          {/* Standard Dropdown */}
          <div className="relative inline-block text-start">
            <div>
              <button
                type="button"
                className="inline-flex justify-center gap-x-1.5 bg-none py-2 text-sm font-semibold text-white shadow-none ring-none hover:bg-white/10 rounded-md px-2 transition-colors"
                id="standard-filter-button"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {selectedStandard}
                <svg className="-mr-1 h-5 w-5 text-white/80" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {isDropdownOpen && (
              <div
                className="absolute left-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="standard-filter-button"
                tabIndex="-1"
              >
                <div className="py-1" role="none">
                  {['Form 4', 'Form 5'].map((standard) => (
                    <button
                      key={standard}
                      type="button"
                      className={`block w-full px-4 py-2 text-left text-sm ${selectedStandard === standard ? 'bg-sky-100 text-sky-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      role="menuitem"
                      tabIndex="-1"
                      onClick={() => handleStandardSelect(standard)}
                    >
                      {standard}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 sm:px-6 lg:px-8 bg-white pt-3 shadow-b shadow-md border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex space-x-4 sm:space-x-6 border-b overflow-x-auto">
            <Link
              href={`/subject/${subject}`}
              className={`pb-2 text-sm sm:text-md font-medium whitespace-nowrap ${
                url === `/subject/${subject}`
                  ? "border-b-2 border-sky-500 text-sky-600"
                  : "text-gray-500 hover:text-sky-500"
              }`}
            >
              Practice
            </Link>

            <Link
              href={`/subject/${subject}/report`}
              className={`pb-2 text-sm sm:text-md font-medium whitespace-nowrap ${
                url === `/subject/${subject}/report`
                  ? "border-b-2 border-sky-500 text-sky-600"
                  : "text-gray-500 hover:text-sky-500"
              }`}
            >
              Report
            </Link>
          </div>
        </div>
      </div>

      {/* Page Content - Remove React.cloneElement */}
      <div className="py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-16 mt-0">
        {children}
      </div>
      <div className="  mt-10">
<StandardFooter title={subjectTitle}  />
      </div>
      
    </div>
  );
}