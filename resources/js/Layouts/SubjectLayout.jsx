// resources/js/Layouts/SubjectLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, usePage } from "@inertiajs/react";
import SubjectNavbar from './SubjectNavbar';
import StandardFooter from '@/Components/StandardFooter';

const formatTitle = (slug) => {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Function to decode URL and normalize paths
const normalizeUrl = (url) => {
  try {
    // Decode URL encoded characters (%20, etc)
    const decodedUrl = decodeURIComponent(url);
    // Remove trailing slashes and normalize
    return decodedUrl.replace(/\/+$/, '');
  } catch (error) {
    return url;
  }
};

// Get clean path without query parameters
const getCleanPath = (url) => {
  try {
    const normalized = normalizeUrl(url);
    return normalized.split('?')[0]; // Remove query parameters
  } catch (error) {
    return url.split('?')[0];
  }
};

// Flexible tab configuration with better URL handling
const TAB_CONFIG = [
  {
    key: 'practice',
    label: 'Practice',
    href: (subject, form, level_id, subject_id) => 
      route('subject-page', { 
        subject: subject, 
        form: form, 
        level_id: level_id, 
        subject_id: subject_id 
      }),
    isActive: () => route().current('subject-page')
  },
    {
    key: 'mission',
    label: 'Mission', 
    href: (subject, form, level_id, subject_id) =>
      route('subject-mission-page', { 
        subject: subject, 
        form: form, 
        level_id: level_id, 
        subject_id: subject_id 
      }),
    isActive: () => route().current('subject-mission-page')
  },
  {
    key: 'report',
    label: 'Report', 
    href: (subject, form, level_id, subject_id) =>
      route('subject-report-page', { 
        subject: subject, 
        form: form, 
        level_id: level_id, 
        subject_id: subject_id 
      }),
    isActive: () => route().current('subject-report-page')
  },
];

export default function SubjectLayout({
  children,
  subject,
  bgColor = "bg-white",
  onStandardChange,
  selectedStandard: propSelectedStandard
}) {
  const { url, props } = usePage();
  const { form, level_id, subject_id } = props;

  const title = formatTitle(subject);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [internalSelectedStandard, setInternalSelectedStandard] = useState(propSelectedStandard || 'Form 4');
  const selectedStandard = propSelectedStandard !== undefined ? propSelectedStandard : internalSelectedStandard;

  // Handle browser extension errors
  useEffect(() => {
    const handleError = (event) => {
      if (event.error && event.error.message &&
        event.error.message.includes('asynchronous response') &&
        event.error.message.includes('message channel closed')) {
        event.preventDefault();
        console.warn('Browser extension error suppressed');
        return true;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  const handleStandardSelect = (standard) => {
    if (propSelectedStandard === undefined) {
      setInternalSelectedStandard(standard);
    }
    setIsDropdownOpen(false);
    if (onStandardChange) {
      onStandardChange(standard);
    }
  };

  // Debug current URL and tab states
  useEffect(() => {
    const cleanPath = getCleanPath(url);
    const normalizedSubject = normalizeUrl(subject);
    
    console.log('🎯 === CURRENT PAGE ANALYSIS ===');
    console.log('Full URL:', url);
    console.log('Clean Path:', cleanPath);
    console.log('Subject:', subject);
    console.log('Normalized Subject:', normalizedSubject);
    console.log('Expected Practice Path:', `/subject/${normalizedSubject}`);
    console.log('Expected Report Path:', `/subject/${normalizedSubject}/report`);
    
    TAB_CONFIG.forEach(tab => {
      const isActive = tab.isActive(url, subject);
      console.log(`Tab "${tab.label}" active:`, isActive);
    });
    console.log('================================');
  }, [url, subject]);

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <SubjectNavbar title={subject} />

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

      {/* Tabs - Fixed with better URL handling */}
      <div className="px-4 sm:px-6 lg:px-8 bg-white pt-3 shadow-b shadow-md border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex space-x-6 border-b border-gray-200">
            {TAB_CONFIG.map((tab) => {
              const isActive = tab.isActive(url, subject);
              return (
                <Link
                  key={tab.key}
                  href={tab.href(subject, form, level_id, subject_id)}
                  className={`pb-4 relative text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "text-sky-600 font-semibold border-b-2 border-sky-500"
                      : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
                  }`}
                  preserveScroll
                >
                  {tab.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-16 mt-0">
        {children}
      </div>
      
      <div className="mt-10">
        <StandardFooter />
      </div>
    </div>
  );
}