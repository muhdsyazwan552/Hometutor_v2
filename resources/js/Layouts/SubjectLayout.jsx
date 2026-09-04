<<<<<<< HEAD
import { useEffect, useMemo, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
=======
// resources/js/Layouts/SubjectLayout.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, usePage } from "@inertiajs/react";
>>>>>>> 917d4bb (Initial project commit)
import SubjectNavbar from './SubjectNavbar';
import StandardFooter from '@/Components/StandardFooter';
import { useLanguage } from '@/Contexts/LanguageContext';
import {
  AcademicCapIcon,
  ChartBarIcon,
  CheckIcon,
  ChevronDownIcon,
  FireIcon,
  SparklesIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

<<<<<<< HEAD
const formatTitle = (value = '') => value.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
=======
const formatTitle = (slug) => {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
>>>>>>> 917d4bb (Initial project commit)

export default function SubjectLayout({
  children,
  subject,
  onStandardChange,
  selectedStandard: propSelectedStandard,
  isLoading = false,
<<<<<<< HEAD
  studentData = null,
}) {
  const { props } = usePage();
  const { form, level_id, subject_id } = props;
  const { t, locale } = useLanguage();
  const [internalLoading, setInternalLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [internalStandard, setInternalStandard] = useState(propSelectedStandard || form || 'Form 4');
  const selectedStandard = propSelectedStandard ?? internalStandard;

  const stats = {
    level: studentData?.level || 5,
    xp: studentData?.xp || 1840,
    xpToNextLevel: studentData?.xpToNextLevel || 2000,
    streak: studentData?.streak || 12,
    badges: studentData?.badges || 4,
=======
  studentLevelId = null
}) {
  const { url, props } = usePage();
  const { form, level_id, subject_id, subject_abbr: subjectAbbr, availableForms = [] } = props;
  const routeSubject = subjectAbbr || subject;
  const supportsInteractive = ['Standard 1', 'Standard 2', 'Standard 3'].includes(form) || [1, 2, 3].includes(Number(level_id));
  
  // Use the language hook
  const { t, locale } = useLanguage();

  // TAB_CONFIG
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
      key: 'interactive',
      label: t('interactive', 'Interactive'),
      href: (subject, form, level_id, subject_id) =>
        route('subject-interactive-page', {
          subject: subject,
          form: form,
          level_id: level_id,
          subject_id: subject_id
        }),
      isActive: () => route().current('subject-interactive-page')
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
  ].filter((tab) => tab.key !== 'interactive' || supportsInteractive), [t, locale, supportsInteractive]);

  const title = formatTitle(subject);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Determine initial selected standard
  const getInitialStandard = () => {
    return propSelectedStandard || form || availableForms[0];
>>>>>>> 917d4bb (Initial project commit)
  };
  const xpPercentage = Math.min(100, Math.round((stats.xp / stats.xpToNextLevel) * 100));

  const tabs = useMemo(() => [
    { key: 'practice', label: t('practice', 'Learn'), icon: AcademicCapIcon, routeName: 'subject-page' },
    { key: 'mission', label: t('mission', 'Practice'), icon: SparklesIcon, routeName: 'subject-mission-page' },
    { key: 'report', label: t('report', 'Progress'), icon: ChartBarIcon, routeName: 'subject-report-page' },
  ], [t, locale]);

<<<<<<< HEAD
  useEffect(() => {
    const stopStart = router.on('start', () => setInternalLoading(true));
    const stopFinish = router.on('finish', () => setInternalLoading(false));
    return () => { stopStart(); stopFinish(); };
  }, []);
=======
  const [internalSelectedStandard, setInternalSelectedStandard] = useState(getInitialStandard());
  const selectedStandard = propSelectedStandard !== undefined ? propSelectedStandard : internalSelectedStandard;

  // Create form options with translation
  const getFormOptions = useMemo(() => {
    const formTranslations = {
      'Form 1': t('form_1', 'Form 1'),
      'Form 2': t('form_2', 'Form 2'),
      'Form 3': t('form_3', 'Form 3'),
      'Form 4': t('form_4', 'Form 4'),
      'Form 5': t('form_5', 'Form 5'),
      'Standard 1': t('standard_1', 'Standard 1'),
      'Standard 2': t('standard_2', 'Standard 2'),
      'Standard 3': t('standard_3', 'Standard 3'),
      'Standard 4': t('standard_4', 'Standard 4'),
      'Standard 5': t('standard_5', 'Standard 5'),
      'Standard 6': t('standard_6', 'Standard 6'),
    };
    
    return availableForms.map(formValue => ({
      value: formValue,
      label: formTranslations[formValue] || formValue
    }));
  }, [availableForms, t]);


// Translate current form/standard
const translateFormLevel = (form) => {
  const formTranslations = {
    'Form 1': t('form_1', 'Form 1'),
    'Form 2': t('form_2', 'Form 2'),
    'Form 3': t('form_3', 'Form 3'),
    'Form 4': t('form_4', 'Form 4'),
    'Form 5': t('form_5', 'Form 5'),
    'Standard 1': t('standard_1', 'Standard 1'),
    'Standard 2': t('standard_2', 'Standard 2'),
    'Standard 3': t('standard_3', 'Standard 3'),
    'Standard 4': t('standard_4', 'Standard 4'),
    'Standard 5': t('standard_5', 'Standard 5'),
    'Standard 6': t('standard_6', 'Standard 6'),
  };
  return formTranslations[form] || form;
};
>>>>>>> 917d4bb (Initial project commit)

  const selectStandard = (standard) => {
    setInternalStandard(standard);
    setIsDropdownOpen(false);
    if (onStandardChange) onStandardChange(standard);
  };

  const title = formatTitle(subject);
  const showLoading = isLoading || internalLoading;

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      {showLoading && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-2xl">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
            <p className="text-sm font-semibold text-slate-700">Loading your course…</p>
          </div>
        </div>
      )}

      <SubjectNavbar title={title} />

      <header className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute bottom-[-7rem] left-1/3 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="relative mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
                <AcademicCapIcon className="h-4 w-4" /> Course workspace
              </div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Learn each topic at your pace, practise your skills, and track every milestone.</p>
            </div>
            <div className="relative">
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex min-w-[150px] items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/15">
                <span>{selectedStandard}</span><ChevronDownIcon className={`h-4 w-4 transition ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-slate-700 shadow-2xl">
                  {['Form 4', 'Form 5'].map((standard) => (
                    <button key={standard} onClick={() => selectStandard(standard)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${selectedStandard === standard ? 'bg-indigo-50 font-semibold text-indigo-700' : 'hover:bg-slate-50'}`}>
                      {standard}{selectedStandard === standard && <CheckIcon className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-slate-300"><span>Level {stats.level}</span><TrophyIcon className="h-4 w-4 text-amber-300" /></div>
              <p className="mt-2 text-xl font-semibold">Silver Scholar</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-slate-300"><span>XP progress</span><span>{stats.xp}/{stats.xpToNextLevel}</span></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400" style={{ width: `${xpPercentage}%` }} /></div>
              <p className="mt-2 text-xs font-medium text-indigo-200">{xpPercentage}% to the next level</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-slate-300"><span>Study streak</span><FireIcon className="h-4 w-4 text-orange-300" /></div>
              <p className="mt-2 text-xl font-semibold">{stats.streak} days</p>
            </div>
          </div>
=======
    <div className={`relative min-h-screen bg-slate-50 ${bgColor}`}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#082c58]/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-8 shadow-2xl">
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <div className="h-20 w-20 rounded-full border-4 border-sky-100"></div>
                <div className="absolute left-0 top-0 h-20 w-20 animate-spin rounded-full border-4 border-[#087bb8] border-t-transparent"></div>
              </div>
              
              <div className="mt-6 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {t('loading', 'Loading')}...
                </h3>
                <p className="text-gray-600">
                  {t('loading_data', 'Loading report data, please wait')}
                </p>
              </div>
              
              <div className="mt-6 h-2 w-full rounded-full bg-sky-100">
                <div className="h-2 w-3/4 animate-pulse rounded-full bg-[#087bb8]"></div>
              </div>
              
              <div className="mt-4 text-sm text-gray-500 text-center">
                <p>{t('loading_tip', 'This may take a few moments')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <SubjectNavbar title={subject} />

      {/* Header Section */}
      <div className="relative z-[1] isolate overflow-visible border-b border-sky-400/30 bg-gradient-to-r from-[#087fbd] via-[#129dd6] to-[#78d5eb] px-4 py-5 shadow-[0_10px_28px_rgba(8,123,184,.18)] sm:px-6 sm:py-7 lg:px-8">
        <div aria-hidden="true" className="absolute -right-0 -top-20 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
        <div aria-hidden="true" className="absolute bottom-0 left-1/3 h-24 w-64 rounded-full bg-[#082c58]/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <h1 className="mb-3 text-2xl font-extrabold tracking-tight text-white sm:mb-4 sm:text-3xl lg:text-4xl">{title}</h1>

          {/* Form Dropdown */}
          {getFormOptions.length > 1 ? (
            <div className="relative inline-block text-start">
              <div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-x-1.5 rounded-xl border border-white/35 bg-white/15 px-3 py-2 text-sm font-bold text-white shadow-sm backdrop-blur transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-50"
                  id="form-filter-button"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={isLoading}>
                  {translateFormLevel(selectedStandard)}
                  <svg className="-mr-1 h-5 w-5 text-white/80" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {isDropdownOpen && !isLoading && (
                <div
                  className="absolute left-0 top-full z-[100] mt-2 w-56 origin-top-left overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-900/20 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="form-filter-button"
                  tabIndex="-1"
                >
                  <div className="space-y-1" role="none">
                    {getFormOptions.map((formOption) => (
                      <button
                        key={formOption.value}
                        type="button"
                        className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${selectedStandard === formOption.value ? 'bg-sky-100 text-[#087bb8]' : 'text-slate-700 hover:bg-slate-50'} disabled:cursor-not-allowed disabled:opacity-50`}
                        role="menuitem"
                        tabIndex="-1"
                        onClick={() => handleStandardSelect(formOption.value)}
                        disabled={isLoading}
                      >
                        {formOption.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Display current form without dropdown if only one option */
            <div className="inline-flex items-center rounded-xl border border-white/35 bg-white/15 px-3 py-2 text-sm font-bold text-white backdrop-blur">
              {translateFormLevel(getFormOptions[0]?.value || 'Form 1')}
            </div>
          )}
>>>>>>> 917d4bb (Initial project commit)
        </div>
      </header>

      <div className="sticky top-[72px] z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8" aria-label="Course sections">
          {tabs.map((tab) => {
            const active = route().current(tab.routeName);
            const TabIcon = tab.icon;
            return (
              <Link key={tab.key} href={route(tab.routeName, { subject, form, level_id, subject_id })} preserveScroll className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-semibold transition ${active ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>
                <TabIcon className="h-4 w-4" />{tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

<<<<<<< HEAD
      <main className="py-7 sm:py-9">{children}</main>
      <StandardFooter />
=======
      {/* Tabs */}
      <div className="relative z-0 border-b border-slate-200 bg-white/90 px-4 pt-3 shadow-sm backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex gap-2 overflow-x-auto border-b border-slate-100 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TAB_CONFIG.map((tab) => {
              const isActive = tab.isActive(url, subject);
              return (
                <Link
                  key={tab.key}
                  href={tab.href(routeSubject, form, level_id, subject_id)}
                  className={`relative mb-1 rounded-xl px-3 py-2.5 text-sm font-bold whitespace-nowrap transition-all duration-200 ${isActive
                    ? "bg-sky-50 text-[#087bb8]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                  preserveScroll
                >
                  {tab.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-3 right-3 h-0.5 animate-pulse rounded-full bg-[#087bb8]"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className={`mx-auto max-w-[1440px] px-4 py-6 transition-all duration-300 sm:px-6 sm:py-8 lg:px-10 lg:py-10 ${isLoading ? 'opacity-50 blur-sm' : ''}`}>
        {children}
      </div>

      <div className={`mt-10 transition-all duration-300 ${isLoading ? 'opacity-50 blur-sm' : ''}`}>
        <StandardFooter />
      </div>
>>>>>>> 917d4bb (Initial project commit)
    </div>
  );
}
