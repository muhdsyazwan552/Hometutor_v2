import React, { useEffect, useRef, useState } from 'react';
import SubjectLayout from '@/Layouts/SubjectLayout';
import { Link, usePage, router } from "@inertiajs/react";
import { ArrowRightIcon, PlayIcon, DocumentTextIcon, ClockIcon } from '@heroicons/react/20/solid';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function SubjectPage({ selectedStandard }) {
  const { t, locale } = useLanguage();
  const { props } = usePage();
  const {
    subject,
    subject_abbr,
    content,
    form,
    subject_id,
    level_id,
    availableLevels,
    availableSubjects
  } = props;

  if (!content) {
    return (
      <SubjectLayout subject={subject} activeTab="Practice">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading content...</div>
        </div>
      </SubjectLayout>
    );
  }

  const sectionRefs = useRef({});
  const [activeSection, setActiveSection] = useState('');
  const [currentStandard, setCurrentStandard] = useState(selectedStandard || form || 'Form 4');
  const [isManualScroll, setIsManualScroll] = useState(false);
  

  const currentContent = content || { id: 0, sections: [] };
  const currentSections = currentContent?.sections || [];

  // Handle standard change using database levels and subjects
  const handleStandardChange = (standard) => {
    setCurrentStandard(standard);

    // Use the level mapping from database
    const newLevelId = availableLevels?.[standard] || level_id;

    // Use the subject mapping from database for the selected level
    const newSubjectId = availableSubjects?.[standard] || subject_id;

    console.log('Standard change:', {
      standard,
      newLevelId,
      newSubjectId,
      availableLevels,
      availableSubjects,
      currentLevelId: level_id,
      currentSubjectId: subject_id
    });

    router.get(route('subject-page', {
      subject: subject_abbr || subject,
      form: standard,
      level_id: newLevelId,
      subject_id: newSubjectId
    }));
  };

  // Set first section as active by default on initial load
  useEffect(() => {
    if (currentSections.length > 0 && !activeSection) {
      setActiveSection(currentSections[0].title);
    }
  }, [currentSections, activeSection]);

  // Improved Intersection Observer with manual scroll protection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isManualScroll) return;

        let visibleSections = [];

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.push({
              id: entry.target.id,
              intersectionRatio: entry.intersectionRatio
            });
          }
        });

        if (visibleSections.length > 0) {
          visibleSections.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          setActiveSection(visibleSections[0].id);
        }
      },
      {
        rootMargin: '-40% 0px -30% 0px',
        threshold: [0.1, 0.3, 0.0, 0.7]
      }
    );

    currentSections.forEach((section) => {
      if (sectionRefs.current[section.title]) {
        observer.observe(sectionRefs.current[section.title]);
      }
    });

    return () => observer.disconnect();
  }, [currentSections, isManualScroll]);

  // Handle browser extension errors
  useEffect(() => {
    const handleError = (event) => {
      if (event.error && event.error.message &&
        event.error.message.includes('asynchronous response') &&
        event.error.message.includes('message channel closed')) {
        event.preventDefault();
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

  const handleScrollTo = (targetId) => {
    setIsManualScroll(true);
    setActiveSection(targetId);

    const el = document.getElementById(targetId);
    if (el) {
      const offset = 100;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      setTimeout(() => {
        setIsManualScroll(false);
      }, 1000);
    }
  };

   const translateFormLevel = (form) => {
    const formMap = {
      'Form 4': t('form_4', 'Form 4'),
      'Form 5': t('form_5', 'Form 5'),
    };
    return formMap[form] || form;
  };

  // Debug information (optional - remove in production)
  // const debugInfo = () => {
  //   if (process.env.NODE_ENV === 'development') {
  //     return (
  //       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
  //         <h4 className="font-semibold text-yellow-800">Debug Info:</h4>
  //         <pre className="text-xs text-yellow-700 mt-2">
  //           {JSON.stringify({
  //             availableLevels,
  //             availableSubjects,
  //             currentStandard,
  //             level_id,
  //             subject_id,
  //             subject_abbr,
  //             subject,
  //             sectionsCount: currentSections.length
  //           }, null, 2)}
  //         </pre>
  //       </div>
  //     );
  //   }
  //   return null;
  // };

  return (
    <SubjectLayout
      subject={subject}
      activeTab="Practice"
      onStandardChange={handleStandardChange}
      selectedStandard={currentStandard}
      availableLevels={availableLevels}
    >
      {/* Debug info - remove in production */}
      {/* {debugInfo()} */}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
        {/* Contents Sidebar */}
        <div className="lg:sticky lg:grid-cols-5 lg:top-24 h-fit px-0 order-1 lg:order-1">
          <div className="bg-white shadow-lg sm:shadow-xl rounded-lg p-3 sm:p-4 border">
            <h3 className="text-base sm:text-lg font-bold text-gray-700 mb-3 sm:mb-4 tracking-wide flex items-center">
              <span className="mr-2">📚</span>
              <span className="hidden sm:inline">{t('topic', 'Topic')} {translateFormLevel(selectedStandard)}</span>
              <span className="sm:hidden">Contents</span>
            </h3>

            {/* Added max-height and overflow for scrolling */}
            <div className="max-h-64 sm:max-h-80 overflow-y-auto pr-1">
              <nav className="space-y-1 sm:space-y-2">
                {currentSections.map((section) => (
                  <div key={section.id} className="space-y-1">
                    <button
                      onClick={() => handleScrollTo(section.title)}
                      className={`block w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${activeSection === section.title
                        ? 'bg-[#42275a] text-white shadow-md'
                        : 'text-gray-600 hover:bg-[#E2A7C5] hover:text-white'
                        }`}
                    >
                      <span className="line-clamp-2 sm:line-clamp-3 font-bold leading-snug break-words">
                        {section.title}
                      </span>
                    </button>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content - Your existing content remains the same */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-6 lg:space-y-8 order-1 lg:order-2">
          {currentSections.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500 text-lg">No content available for this subject and level.</p>
              {/* {availableLevels && availableSubjects && (
                <div className="mt-4 text-sm text-gray-600">
                  <p>Available levels: {Object.keys(availableLevels).join(', ')}</p>
                  <p>Available subjects: {JSON.stringify(availableSubjects)}</p>
                </div>
              )} */}
            </div>
          ) : (
            currentSections.map((section, index) => (
              <div
                key={section.id}
                id={section.title}
                ref={(el) => (sectionRefs.current[section.title] = el)}
                className="scroll-mt-20 lg:scroll-mt-24"
              >
                {/* Your existing section content remains exactly the same */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  {/* Big Title Header */}
                  <div className="bg-gray-200 border-b border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-[#30918F] border-2 border-green-800 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group animate-pulse hover:animate-none hover:scale-105 transition-transform duration-300">
                        <div className="relative">
                          {/* Book Icon */}
                          <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white transform group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          {/* Chapter Number */}
                          <div className="absolute -top-2 -right-2 bg-yellow-400 text-gray-800 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center transform group-hover:scale-125 transition-transform duration-200 shadow-md">
                            {section.id}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 line-clamp-2">{section.title}</h2>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-6 lg:space-y-8 relative">
                    {section.subSections?.map((subSection, subIndex) => {
                      const hasScore = !!subSection.lastPractice?.objective;

                      return (
                      <section
                        key={subSection.id}
                        id={subSection.title}
                        className="relative pl-10 sm:pl-12 lg:pl-14"
                      >
                        {/* Vertical Line (Stepper) */}
                        {subIndex !== section.subSections.length - 1 && (
                          <div className="absolute left-[18px] sm:left-[22px] lg:left-[30px] top-6 bottom-[-40px] sm:bottom-[-50px] lg:bottom-[-55px] w-[2px] sm:w-[3px] bg-[#30918F]"></div>
                        )}

                        {/* Circle Icon */}
                        <div className="absolute left-[10px] sm:left-[14px] lg:left-[17px] top-3 sm:top-4 w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 rounded-full bg-[#30918F] border-2 border-green-900 flex items-center justify-center text-xs sm:text-sm font-bold text-sky-700 shadow-[0_0_6px_rgba(56,189,248,0.4)]">
                        </div>

                        {/* Header */}
                        <header className="flex items-center gap-3 px-0 py-3 sm:py-4">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">
                            {subSection.title}
                          </h3>
                        </header>

                        {/* Body - Your existing practice cards and videos */}
                        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 pr-3 sm:pr-4 lg:pr-6 pb-4 sm:pb-6 lg:pb-8">
                          {/* LEFT SIDE - Practice Cards */}
                          <div className="flex-1 flex flex-col bg-white">
                            <p className="text-sm font-semibold text-gray-900 mb-3 sm:mb-4">Practice</p>
                            <div className="grid grid-cols-1 gap-3 sm:gap-4">
                              {/* Objective Card - Only show if objective questions exist */}
                              {subSection.questionCounts?.objective > 0 && (

                                <div className="border border-gray-200 rounded-lg  bg-white hover:shadow-md transition-all duration-200">
                                  <div className="grid grid-cols-4 gap-3 sm:gap-4">

                                    

                                    <div className={`${hasScore ? 'col-span-3' : 'col-span-4'} p-3 sm:p-4 lg:p-3`}>
                                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 ">
                                        <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full border border-sky-400 flex items-center justify-center flex-shrink-0">
                                          <DocumentTextIcon className="w-3 h-3 sm:w-4 sm:h-4 text-sky-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1">
                                            {subSection.practiceTitle || 'Objective Practice'}
                                          </h4>
                                          <p className="text-xs text-gray-600 font-bold uppercase tracking-wide">Objective</p>
                                          <p className="text-xs text-gray-600 mt-1">
                                            {subSection.questionCounts.objective} questions available
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mx-0 sm:mx-4">
                                        <button
                                          onClick={() => {
                                            console.log('🚀 DEBUG - Clicking Practice Button:', {
                                              section: {
                                                id: section.id,
                                                title: section.title,
                                                fullSection: section
                                              },
                                              subSection: {
                                                id: subSection.id,
                                                title: subSection.title,
                                                fullSubSection: subSection
                                              },
                                              subject: subject,
                                              standard: currentStandard,
                                              currentContent: currentContent
                                            });

                                            router.get(route('objective-page'), {
                                              subject: subject,
                                              standard: currentStandard,
                                              sectionId: section.id,
                                              sectionTitle: section.title,
                                              contentId: currentContent.id,
                                              topic: subSection.title,
                                              topic_id: subSection.id,
                                              subject_id: subject_id,
                                              level_id: level_id
                                            });
                                          }}
                                          className="px-3 sm:px-4 py-1.5 bg-blue-600 text-white border border-blue-600 rounded-md text-xs sm:text-sm font-medium hover:bg-blue-700 transition-all duration-200 w-full sm:w-auto text-center"
                                        >
                                          Practice
                                        </button>

                                        {/* Last Practice Data for OBJECTIVE */}
                                        <div className="text-left">
                                          {subSection.lastPractice?.objective ? (
                                            <div className="space-y-1">
                                              <p className="text-xs text-gray-500">Last Practice</p>
                                              <div className="flex items-center gap-2">

                                                <p className="text-xs sm:text-sm font-medium text-gray-800">
                                                  {subSection.lastPractice.objective.last_practice_at}
                                                </p>
                                              </div>

                                            </div>
                                          ) : (
                                            <div className="text-left">
                                              <p className="text-xs text-gray-500">Last Practice</p>
                                              <p className="text-xs sm:text-sm font-medium text-gray-800">Not practiced yet</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    
                                      {subSection.lastPractice?.objective && (
                                        <div className='col-span-1 h-full flex justify-center items-center border-l-2 border-gray-200 text-center '>
                                        <div className="flex flex-col items-center justify-center">

                                          {/* Trophy Icon + Score */}
                                          <div className="flex flex-col items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                              strokeWidth="1.5" stroke="currentColor"
                                              className="w-12 h-12 text-yellow-400 rounded-full border-2 border-yellow-400 p-1 mb-1">
                                              <path strokeLinecap="round" strokeLinejoin="round"
                                                d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
                                            </svg>

                                            <span className={`text-xs font-bold ${subSection.lastPractice.objective.score >= 80 ? 'text-green-600' :
                                                subSection.lastPractice.objective.score >= 60 ? 'text-yellow-600' :
                                                  'text-red-600'
                                              }`}>
                                              {subSection.lastPractice.objective.score}
                                              <span className='text-gray-600'>/100 Point</span>
                                            </span>
                                          </div>

                                          {/* Performance */}
                                          <p className="text-xs text-gray-500 mt-1">
                                            {subSection.lastPractice.objective.score >= 80 ? 'Excellent' :
                                              subSection.lastPractice.objective.score >= 60 ? 'Good' :
                                                'Needs Practice'}
                                          </p>

                                        </div>
                                        </div>
                                      )}
                                    

                                  </div>
                                </div>
                              )}

                              {/* Subjective Card - Only show if subjective questions exist */}
                              {subSection.questionCounts?.subjective > 0 && (
                                <div className="border border-gray-200 rounded-lg p-3 sm:p-4 lg:p-5 bg-white hover:shadow-md transition-all duration-200">
                                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full border border-sky-400 flex items-center justify-center flex-shrink-0">
                                      <DocumentTextIcon className="w-3 h-3 sm:w-4 sm:h-4 text-sky-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1">
                                        {subSection.practiceTitle || 'Subjective Practice'}
                                      </h4>
                                      <p className="text-xs text-gray-600 uppercase font-bold tracking-wide">Subjective</p>
                                      <p className="text-xs text-gray-600 mt-1">
                                        {subSection.questionCounts.subjective} questions available
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mx-0 sm:mx-4">
                                    <button
                                      onClick={() =>
                                        router.get(route('subjective-page'), {
                                          subject: subject,
                                          standard: currentStandard,
                                          sectionId: section.id,
                                          sectionTitle: section.title,
                                          contentId: currentContent.id,
                                          topic: subSection.title,
                                          topic_id: subSection.id,
                                          subject_id: subject_id,
                                          level_id: level_id
                                        })
                                      }
                                      className="px-3 sm:px-4 py-1.5 text-blue-600 border border-blue-600 rounded-md text-xs sm:text-sm font-medium hover:bg-blue-50 transition-all duration-200 w-full sm:w-auto text-center"
                                    >
                                      Practice
                                    </button>

                                    {/* Last Practice Data for SUBJECTIVE */}
                                    <div className="text-left">
                                      {subSection.lastPractice?.subjective ? (
                                        <div className="space-y-1">
                                          <p className="text-xs text-gray-500">Last Practice</p>
                                          
                                          <p className="text-sm text-black font-medium">
                                            {subSection.lastPractice.subjective.last_practice_at}
                                            
                                          </p>
                                        </div>
                                      ) : (
                                        <div className="text-left">
                                          <p className="text-xs text-gray-500">Last Practice</p>
                                          <p className="text-xs sm:text-sm font-medium text-gray-800">Not practiced yet</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Show message if no practice available */}
                              {(!subSection.questionCounts?.objective || subSection.questionCounts.objective === 0) &&
                                (!subSection.questionCounts?.subjective || subSection.questionCounts.subjective === 0) && (
                                  <div className="border border-gray-200 rounded-lg p-4 text-center">
                                    <p className="text-gray-500 text-sm">No practice questions available for this topic yet.</p>
                                  </div>
                                )}
                            </div>
                          </div>

                          {/* RIGHT SIDE - Videos */}
                          <div className="flex-1 flex flex-col p-0">
                            <div className="flex items-center space-x-2 mb-3">
                              <PlayIcon className="w-4 h-4 text-sky-600" />
                              <h5 className="text-sm font-semibold text-gray-900">
                                Recommended Videos
                              </h5>
                            </div>
                            <div className="space-y-2 sm:space-y-3 flex-1">
                              {subSection.videos?.map((video, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-white transition-colors cursor-pointer group border border-transparent hover:border-sky-100"
                                >
                                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-sky-400 to-indigo-400 rounded flex items-center justify-center">
                                    <PlayIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-800 group-hover:text-sky-700 transition-colors line-clamp-2">
                                      {video.title}
                                    </p>
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                      <ClockIcon className="w-3 h-3 mr-1" />
                                      <span>{video.duration}</span>
                                      <span className="mx-1 sm:mx-2">•</span>
                                      <span className="bg-gray-100 text-gray-600 px-1 py-0.5 rounded text-xs">
                                        YouTube
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <button className="w-full mt-2 sm:mt-3 text-center text-xs sm:text-sm text-sky-600 hover:text-sky-700 font-medium py-2 rounded-lg hover:bg-sky-50 transition-colors">
                                View All Videos →
                              </button>
                            </div>
                          </div>
                        </div>
                      </section>
                      );
})}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </SubjectLayout>
  );
}