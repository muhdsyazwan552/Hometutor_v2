// resources/js/Layouts/SubjectLayout.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, usePage } from "@inertiajs/react";
import SubjectNavbar from './SubjectNavbar';
import StandardFooter from '@/Components/StandardFooter';
import { useLanguage } from '@/Contexts/LanguageContext';

const formatTitle = (slug) => {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const normalizeUrl = (url) => {
  try {
    const decodedUrl = decodeURIComponent(url);
    return decodedUrl.replace(/\/+$/, '');
  } catch (error) {
    return url;
  }
};

const getCleanPath = (url) => {
  try {
    const normalized = normalizeUrl(url);
    return normalized.split('?')[0];
  } catch (error) {
    return url.split('?')[0];
  }
};

export default function SubjectLayout({
  children,
  subject,
  bgColor = "bg-white",
  onStandardChange,
  selectedStandard: propSelectedStandard,
  isLoading = false // Add this prop for loading state
}) {
  const { url, props } = usePage();
  const { form, level_id, subject_id } = props;
  
  // Use the language hook
  const { t, locale } = useLanguage();

  // ✅ FIX: Wrap TAB_CONFIG in useMemo to prevent recreation every render
  const TAB_CONFIG = useMemo(() => [
    {
      key: 'practice',
      label: t('practice', 'Practice'),
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
      label: t('mission', 'Mission'),
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
      label: t('report', 'Report'),
      href: (subject, form, level_id, subject_id) =>
        route('subject-report-page', {
          subject: subject,
          form: form,
          level_id: level_id,
          subject_id: subject_id
        }),
      isActive: () => route().current('subject-report-page')
    },
  ], [t, locale]); // ✅ Only recreate when locale changes

  const title = formatTitle(subject);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [internalSelectedStandard, setInternalSelectedStandard] = useState(propSelectedStandard || 'Form 4');
  const selectedStandard = propSelectedStandard !== undefined ? propSelectedStandard : internalSelectedStandard;

  // ✅ FIX: Wrap translateFormLevel in useCallback
  const translateFormLevel = useMemo(() => {
    const formMap = {
      'Form 4': t('form_4', 'Form 4'),
      'Form 5': t('form_5', 'Form 5'),
    };
    return (form) => formMap[form] || form;
  }, [t, locale]); // ✅ Only recreate when locale changes

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

  return (
    <div className={`min-h-screen ${bgColor} relative`}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-2xl max-w-md w-full mx-4">
            <div className="flex flex-col items-center justify-center">
              {/* Spinner */}
              <div className="relative">
                <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-[#8F3091] rounded-full border-t-transparent animate-spin"></div>
              </div>
              
              {/* Loading Text */}
              <div className="mt-6 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {t('loading', 'Loading')}...
                </h3>
                <p className="text-gray-600">
                  {t('loading_data', 'Loading report data, please wait')}
                </p>
              </div>
              
              {/* Progress Indicator (Optional) */}
              <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#8F3091] h-2 rounded-full animate-pulse w-3/4"></div>
              </div>
              
              {/* Loading Tips (Optional) */}
              <div className="mt-4 text-sm text-gray-500 text-center">
                <p>{t('loading_tip', 'This may take a few moments')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <SubjectNavbar title={subject} />

      {/* Header Section */}
      <div className="px-4 sm:px-6 lg:px-8 bg-[#8F3091] py-4 sm:py-6 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-1">{title}</h1>

          {/* Standard Dropdown */}
          <div className="relative inline-block text-start">
            <div>
              <button
                type="button"
                className="inline-flex justify-center gap-x-1.5 bg-none py-2 text-sm font-semibold text-white shadow-none ring-none hover:bg-white/10 rounded-md px-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                id="standard-filter-button"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={isLoading}
              >
                {translateFormLevel(selectedStandard)}
                <svg className="-mr-1 h-5 w-5 text-white/80" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {isDropdownOpen && !isLoading && (
              <div
                className="absolute left-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="standard-filter-button"
                tabIndex="-1"
              >
                <div className="py-1" role="none">
                  {[
                    { value: 'Form 4', label: t('form_4', 'Form 4') },
                    { value: 'Form 5', label: t('form_5', 'Form 5') }
                  ].map((standard) => (
                    <button
                      key={standard.value}
                      type="button"
                      className={`block w-full px-4 py-2 text-left text-sm ${selectedStandard === standard.value ? 'bg-sky-100 text-sky-700' : 'text-gray-700 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
                      role="menuitem"
                      tabIndex="-1"
                      onClick={() => handleStandardSelect(standard.value)}
                      disabled={isLoading}
                    >
                      {standard.label}
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
                  className={`pb-4 relative text-sm font-medium whitespace-nowrap transition-all duration-200 ${isActive
                    ? "text-[#8F3091] font-semibold border-b-2 border-[#8F3091]"
                    : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
                    } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                  preserveScroll
                >
                  {tab.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8F3091] animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Page Content with Loading Blur Effect */}
      <div className={`py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-16 mt-0 transition-all duration-300 ${isLoading ? 'opacity-50 blur-sm' : ''}`}>
        {children}
      </div>

      <div className={`mt-10 transition-all duration-300 ${isLoading ? 'opacity-50 blur-sm' : ''}`}>
        <StandardFooter />
      </div>
    </div>
  );
}