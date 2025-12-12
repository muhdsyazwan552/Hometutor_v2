import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function SubjectMenuDropdown({ isOpen, setIsOpen, title }) {
  const schoolSubjects = usePage().props.schoolSubjects || [];
  const { t } = useLanguage(); // Add this to use translations

  const getSubjectUrl = (subject) => {
    const subjectSlug = subject.abbr || subject.name.toLowerCase().replace(/\s+/g, '-');
    const subjectId = subject.id;
    const levelId = subject.level_id;
    const form = levelId === 10 ? 'Form 4' : 'Form 5';

    return `/subject/${subjectSlug}?subject_id=${subjectId}&level_id=${levelId}&form=${encodeURIComponent(form)}`;
  };

  return (
    <>
      {/* Dropdown Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center text-sm font-semibold 
              ${isOpen ? 'text-gray-800' : 'text-white'}
              focus:outline-none transition-colors duration-200 px-3 py-2 rounded-lg`}>
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
          <span className="text-sm font-semibold">
            {t('school_subject', 'School Subject')}
          </span>
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
          {t('school_subject', 'School Subject')} - {title}
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
                {t('school_subject', 'School Subjects')}
              </h4>
              <ul className="space-y-1 text-sm text-sky-600">
                {schoolSubjects.map((subject) => (
                  <li key={subject.id}>
                    <Link
                      href={getSubjectUrl(subject)}
                      className="hover:underline block py-1"
                      onClick={() => setIsOpen(false)}
                    >
                      {subject.name}
                    </Link>
                  </li>
                ))}
                {schoolSubjects.length === 0 && (
                  <li className="text-gray-500">
                    {t('no_subjects_available', 'No subjects available')}
                  </li>
                )}
              </ul>
            </div>

            {/* VideoTube */}
            <div>
              <h4 className="mb-2 border-b pb-1 text-sm font-semibold text-gray-700">
                {t('videotube', 'VideoTube')}
              </h4>
              <ul className="space-y-1 text-sm text-red-500">
                <li>
                  <Link 
                    href="#" 
                    className="hover:underline block py-1"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('general_learning', 'General Learning')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Games */}
            <div>
              <h4 className="mb-2 border-b pb-1 text-sm font-semibold text-gray-700">
                {t('games', 'Games')}
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>
                  <Link 
                    href="/tekakata-page" 
                    className="hover:underline block py-1"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('teka_kata', 'Teka Kata')}
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/quiz-page" 
                    className="hover:underline block py-1"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('quiz_arena', 'Quiz Arena')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}