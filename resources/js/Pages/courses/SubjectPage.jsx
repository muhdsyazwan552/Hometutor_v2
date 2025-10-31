// resources/js/Pages/SubjectPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import SubjectLayout from '@/Layouts/SubjectLayout';
import { Link, usePage, router } from "@inertiajs/react";
import { ArrowRightIcon, PlayIcon, DocumentTextIcon, ClockIcon } from '@heroicons/react/20/solid';
import { SubjectContent } from '@/Data/SubjectContent';

export default function SubjectPage({ selectedStandard }) {
  const { props } = usePage();
  const subjectKey = props.subject;

  const sectionRefs = useRef({});
  const [activeSection, setActiveSection] = useState('');
  const [currentStandard, setCurrentStandard] = useState(selectedStandard || 'Form 4');

  // Get current content based on subject and standard
  const currentContent = SubjectContent[subjectKey]?.[currentStandard] || {
    id: 0,
    sections: []
  };
  const currentSections = currentContent.sections;

  // Handle standard change
  const handleStandardChange = (standard) => {
    setCurrentStandard(standard);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0.1 }
    );

    currentSections.forEach((section) => {
      if (sectionRefs.current[section.title]) {
        observer.observe(sectionRefs.current[section.title]);
      }
    });

    return () => observer.disconnect();
  }, [currentSections]);

  const handleScrollTo = (targetId) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <SubjectLayout
      subject={subjectKey}
      activeTab="Practice"
      onStandardChange={handleStandardChange}
      selectedStandard={currentStandard}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
        {/* Contents Sidebar */}
        <div className="lg:sticky lg:top-24 h-fit px-0 order-1 lg:order-1">
          <div className="bg-white shadow-lg sm:shadow-xl rounded-lg p-3 sm:p-4 border">
            <h3 className="text-base sm:text-lg font-bold text-sky-700 mb-3 sm:mb-4 tracking-wide flex items-center">
              <span className="mr-2">📚</span> 
              <span className="hidden sm:inline">Contents for {currentStandard}</span>
              <span className="sm:hidden">Contents</span>
            </h3>

            <nav className="space-y-1 sm:space-y-2">
              {currentSections.map((section) => (
                <div key={section.id} className="space-y-1">
                  {/* Main Section Link */}
                  <button
                    onClick={() => handleScrollTo(section.title)}
                    className={`block w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${activeSection === section.title
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-sky-100 hover:text-sky-700'
                      }`}
                  >
                    <span className="mr-2 font-bold">
                      {activeSection === section.title ? '▶' : `BAB ${section.id}`}
                    </span>
                    <span className="line-clamp-1">{section.title}</span>
                  </button>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-6 lg:space-y-8 order-1 lg:order-2">
          {/* Sections with List-style Sub Topics */}
          {currentSections.map((section, index) => (
            <div
              key={section.id}
              id={section.title}
              ref={(el) => (sectionRefs.current[section.title] = el)}
              className="scroll-mt-20 lg:scroll-mt-24"
            >
              {/* Main Section Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Big Title Header */}
                <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border-b border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm sm:text-base lg:text-lg font-bold">BAB {section.id}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 line-clamp-2">{section.title}</h2>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6 lg:space-y-8 relative">
                  {section.subSections?.map((subSection, subIndex) => (
                    <section
                      key={subSection.id}
                      id={subSection.title}
                      className="relative pl-10 sm:pl-12 lg:pl-14"
                    >
                      {/* === Vertical Line (Stepper) === */}
                      {subIndex !== section.subSections.length - 1 && (
                        <div className="absolute left-[18px] sm:left-[22px] lg:left-[30px] top-6 bottom-[-40px] sm:bottom-[-50px] lg:bottom-[-55px] w-[2px] sm:w-[3px] bg-sky-300"></div>
                      )}

                      {/* === Circle Icon === */}
                      <div className="absolute left-[10px] sm:left-[14px] lg:left-[17px] top-3 sm:top-4 w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 border-2 border-sky-500 flex items-center justify-center text-xs sm:text-sm font-bold text-sky-700 shadow-[0_0_6px_rgba(56,189,248,0.4)]">
                      </div>

                      {/* === Header === */}
                      <header className="flex items-center gap-3 px-0 py-3 sm:py-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">
                          {subSection.title}
                        </h3>
                      </header>

                      {/* === Body === */}
                      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 pr-3 sm:pr-4 lg:pr-6 pb-4 sm:pb-6 lg:pb-8">
                        {/* LEFT SIDE - Practice Cards */}
                        <div className="flex-1 flex flex-col bg-white">
                          <p className="text-sm font-semibold text-gray-900 mb-3 sm:mb-4">Practice</p>

                          <div className="grid grid-cols-1 gap-3 sm:gap-4">
                            {/* Objective Card */}
                            <div className="border border-gray-200 rounded-lg p-3 sm:p-4 lg:p-5 bg-white hover:shadow-md transition-all duration-200">
                              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full border border-sky-400 flex items-center justify-center flex-shrink-0">
                                  <DocumentTextIcon className="w-3 h-3 sm:w-4 sm:h-4 text-sky-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1">
                                    {subSection.practiceTitle || 'Objective Practice'}
                                  </h4>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide">Objective</p>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mx-0 sm:mx-4">
                                <button
                                  onClick={() =>
                                    router.get(route('objective-page'), {
                                      subject: subjectKey,
                                      standard: currentStandard,
                                      sectionId: section.id,
                                      contentId: currentContent.id,
                                      topic: subSection.title,
                                    })
                                  }
                                  className="px-3 sm:px-4 py-1.5 bg-blue-600 text-white border border-blue-600 rounded-md text-xs sm:text-sm font-medium hover:bg-blue-700 transition-all duration-200 w-full sm:w-auto text-center"
                                >
                                  Practice
                                </button>

                                <div className="text-left">
                                  <p className="text-xs text-gray-500">Last Practice</p>
                                  <p className="text-xs sm:text-sm font-medium text-gray-800">Dec 26th, 12:27 PM</p>
                                </div>
                              </div>
                            </div>

                            {/* Subjective Card */}
                            <div className="border border-gray-200 rounded-lg p-3 sm:p-4 lg:p-5 bg-white hover:shadow-md transition-all duration-200">
                              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full border border-sky-400 flex items-center justify-center flex-shrink-0">
                                  <DocumentTextIcon className="w-3 h-3 sm:w-4 sm:h-4 text-sky-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1">
                                    {subSection.practiceTitle || 'Subjective Practice'}
                                  </h4>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide">Subjective</p>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mx-0 sm:mx-4">
                                <button
                                  onClick={() =>
                                    router.get(route('subjective-page'), {
                                      subject: subjectKey,
                                      standard: currentStandard,
                                      sectionId: section.id,
                                      contentId: currentContent.id,
                                      topic: subSection.title,
                                    })
                                  }
                                  className="px-3 sm:px-4 py-1.5 text-blue-600 border border-blue-600 rounded-md text-xs sm:text-sm font-medium hover:bg-blue-50 transition-all duration-200 w-full sm:w-auto text-center"
                                >
                                  Practice
                                </button>

                                <div className="text-left">
                                  <p className="text-xs text-gray-500">Last Practice</p>
                                  <p className="text-xs sm:text-sm font-medium text-gray-800">Dec 26th, 12:27 PM</p>
                                </div>
                              </div>
                            </div>
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
                            {subSection.videos.map((video, idx) => (
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
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SubjectLayout>
  );
}