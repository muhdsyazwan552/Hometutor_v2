import React, { useEffect, useRef, useState } from 'react';
import SubjectLayout from '@/Layouts/SubjectLayout';
import { Link, usePage } from "@inertiajs/react";
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { SubjectContent } from '@/Data/SubjectContent'; // Import from separate file

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

  // Update section list based on current sections
  const sectionList = currentSections.map(section => section.title);

  return (
    <SubjectLayout
      subject={subjectKey}
      activeTab="Practice"
      onStandardChange={handleStandardChange}
      selectedStandard={currentStandard}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contents Sidebar */}
        <div className="lg:sticky lg:top-24 h-fit p-6">
          <div className="bg-white shadow-xl rounded-lg p-4 border border-sky-100">
            <h3 className="text-lg font-bold text-sky-700 mb-4 tracking-wide flex items-center">
              <span className="mr-2">📚</span> Contents for {currentStandard}
              <span className="ml-2 text-sm bg-sky-100 text-sky-700 px-2 py-1 rounded">
                ID: {currentContent.id}
              </span>
            </h3>

            <nav className="space-y-2">
              {currentSections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.title}`}
                  ref={(el) => (sectionRefs.current[section.title] = el)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 items-center ${
                    activeSection === section.title
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-sky-100 hover:text-sky-700 border border-transparent hover:border-sky-200'
                  }`}
                >
                  <span className="mr-2">
                    {activeSection === section.title ? '▶' : `${section.id}.`}
                  </span>
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <section className="py-6 border-l-4 border-sky-400 pl-6 space-y-12">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-sky-800 flex items-center">
                <span className="mr-2">📝</span> {subjectKey.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} - {currentStandard}
              </h2>
              <div className="flex items-center space-x-2">
                <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-sm font-medium">
                  {currentStandard}
                </span>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                  Content ID: {currentContent.id}
                </span>
              </div>
            </div>

            {/* Sections */}
            {currentSections.map((section, index) => (
              <div 
                key={section.id} 
                id={section.title} 
                ref={(el) => (sectionRefs.current[section.title] = el)} 
                className="scroll-mt-20 pb-8 border-b-2 border-gray-200"
              >
                {/* Title and icon */}
                <div className="relative pl-12 mb-6">
                  <div className="absolute left-0 top-0 w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                    <span className="text-sky-600 text-sm font-bold">{section.id}</span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">{section.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">Section ID: {section.id}</p>
                </div>

                {/* Section Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start border-b border-gray-200 pb-8 mb-8 last:border-b-0 last:pb-0 last:mb-0">
                  {/* Left: Practice Card */}
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Practice</p>
                    <div className="border border-sky-100 rounded-lg p-4 shadow-sm bg-gradient-to-b from-white to-sky-50 hover:shadow-md transition-shadow">
                      <h3 className="text-md font-semibold text-gray-700 mb-1">{section.title}</h3>
                      <p className="text-xs text-sky-600 font-medium mb-4 uppercase tracking-wide bg-sky-100 inline-block px-2 py-1 rounded">
                        {section.practiceType}
                      </p>
                      <div className="mt-4">
                        <Link
                          href={
                            section.practiceType === "Objective"
                              ? route("objective-page", { 
                                  subject: subjectKey,
                                  standard: currentStandard,
                                  sectionId: section.id,
                                  contentId: currentContent.id
                                })
                              : route("subjective-page", { 
                                  subject: subjectKey,
                                  standard: currentStandard,
                                  sectionId: section.id,
                                  contentId: currentContent.id
                                })
                          }
                          className="inline-flex items-center bg-gradient-to-r from-sky-600 to-indigo-600 text-white px-4 py-2 rounded-md hover:from-sky-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                        >
                          Start Practice
                          <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Right: Recommended Lessons */}
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Recommended Lessons</p>
                    <div className="space-y-3">
                      {section.videos.map((video, idx) => (
                        <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                          <div className="flex-shrink-0 w-16 h-12 bg-gradient-to-r from-sky-400 to-indigo-400 rounded-md flex items-center justify-center text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{video.title}</p>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <span>YouTube</span>
                              <span className="mx-2">•</span>
                              <span>{video.duration}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </SubjectLayout>
  );
}