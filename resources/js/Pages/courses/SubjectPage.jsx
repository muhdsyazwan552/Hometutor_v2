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
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const currentContent = content || { id: 0, sections: [] };
  const currentSections = currentContent?.sections || [];

  const openVideoModal = (video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

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

  // VideoModal Component
  const VideoModal = () => {
    if (!showVideoModal || !selectedVideo) return null;

    const [videoError, setVideoError] = useState(false);
    const [errorDetails, setErrorDetails] = useState('');

    const renderVideoPlayer = () => {
      switch (selectedVideo.platform) {
        case 'youtube':
        case 'vimeo':
          return (
            <iframe
              src={`${selectedVideo.embedUrl}?autoplay=1&rel=0`}
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={selectedVideo.title}
              onError={(e) => {
                console.error('Iframe error:', e);
                setVideoError(true);
                setErrorDetails('Embedded player failed to load. This could be due to: 1) Network issues, 2) Platform restrictions, 3) Browser security settings.');
              }}
            />
          );

        case 'direct':
        case 'aws':
        case 'unknown':
        default:
          return (
            <video
              controls
              autoPlay
              className="absolute top-0 left-0 w-full h-full"
              onError={(e) => {
                const video = e.target;
                console.error('Video error details:', {
                  error: video.error,
                  networkState: video.networkState,
                  readyState: video.readyState,
                  src: video.src
                });

                let errorMessage = 'Unknown error';

                // Decode MEDIA_ERR constants
                if (video.error) {
                  switch (video.error.code) {
                    case MediaError.MEDIA_ERR_ABORTED:
                      errorMessage = 'Video playback was aborted';
                      break;
                    case MediaError.MEDIA_ERR_NETWORK:
                      errorMessage = 'Network error - failed to load video';
                      break;
                    case MediaError.MEDIA_ERR_DECODE:
                      errorMessage = 'Video decoding error - file may be corrupted';
                      break;
                    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                      errorMessage = 'Video format not supported by browser';
                      break;
                    default:
                      errorMessage = `Error ${video.error.code}: ${video.error.message}`;
                  }
                }

                // Additional context based on network state
                if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
                  errorMessage += ' (No video source available)';
                }

                setVideoError(true);
                setErrorDetails(errorMessage);
              }}
              onLoadStart={() => {
                console.log('Video load started:', selectedVideo.url);
              }}
              onCanPlay={() => {
                console.log('Video can play:', selectedVideo.url);
              }}
              onStalled={() => {
                setVideoError(true);
                setErrorDetails('Video playback stalled - network issue');
              }}
              onWaiting={() => {
                console.log('Video waiting for data...');
              }}
            >
              <source src={selectedVideo.url} type="video/mp4" />
              <source src={selectedVideo.url} type="video/webm" />
              Your browser does not support the video tag.
              <p className="p-4 text-center">
                If the video doesn't play, try:
                <a href={selectedVideo.url} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 ml-2">
                  Download directly
                </a>
              </p>
            </video>
          );

      }


    };

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Close button */}
          <button
            onClick={() => {
              setShowVideoModal(false);
              setSelectedVideo(null);
              setVideoError(false);
              setErrorDetails('');
            }}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
          >
            ✕
          </button>

          {/* Video player or error message */}
          <div className="relative pt-[56.25%]"> {/* 16:9 aspect ratio */}
            {videoError ? (
              <div className="absolute top-0 left-0 w-full h-full bg-gray-900 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                  {/* Error icon */}
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>

                  {/* Error title */}
                  <h3 className="text-xl font-bold text-white mb-2">Video Playback Error</h3>

                  {/* Error details */}
                  <div className="bg-gray-800 rounded-lg p-4 mb-4 text-left">
                    <p className="text-red-300 font-medium mb-2">{errorDetails}</p>

                    <div className="text-sm text-gray-300 space-y-1">
                      <p><strong>Video URL:</strong></p>
                      <p className="text-xs break-all bg-gray-900 p-2 rounded">{selectedVideo.url}</p>

                      <p className="mt-2"><strong>Platform:</strong> {selectedVideo.platform}</p>
                      <p><strong>Format:</strong> {selectedVideo.url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i)?.[0] || 'Unknown'}</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      onClick={() => window.open(selectedVideo.url, '_blank')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Open in New Tab
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedVideo.url);
                        alert('URL copied to clipboard');
                      }}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Copy URL
                    </button>

                    <button
                      onClick={() => {
                        setVideoError(false);
                        setErrorDetails('');
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>

                  {/* Troubleshooting tips */}
                  <div className="mt-6 text-sm text-gray-400 text-left">
                    <p className="font-semibold mb-1">Troubleshooting tips:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Check your internet connection</li>
                      <li>Try refreshing the page</li>
                      <li>Use a different browser</li>
                      <li>Check if the video file exists</li>
                      <li>Verify S3 bucket permissions (if AWS)</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              renderVideoPlayer()
            )}
          </div>

          {/* Video info (only show when no error) */}
          {!videoError && (
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                {selectedVideo.title}
              </h3>
              <div className="flex items-center text-sm text-gray-600">
                <PlayIcon className="w-4 h-4 mr-2" />
                <span>Video Lesson</span>
                {selectedVideo.duration && (
                  <>
                    <span className="mx-2">•</span>
                    <ClockIcon className="w-4 h-4 mr-1" />
                    <span>{selectedVideo.duration}</span>
                  </>
                )}
                <span className="mx-2">•</span>
                <span className={`px-2 py-0.5 rounded text-xs ${selectedVideo.platform === 'youtube' ? 'bg-red-100 text-red-800' :
                  selectedVideo.platform === 'aws' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                  {selectedVideo.platform === 'youtube' ? 'YouTube' :
                    selectedVideo.platform === 'aws' ? 'AWS S3' :
                      selectedVideo.platform}
                </span>
              </div>

              {/* Debug info button (for development) */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => {
                    console.log('Video debug info:', {
                      video: selectedVideo,
                      url: selectedVideo.url,
                      platform: selectedVideo.platform,
                      timestamp: new Date().toISOString(),
                      userAgent: navigator.userAgent
                    });
                    alert('Check console for debug info');
                  }}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  🔧 Debug Info
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };


  return (
    <SubjectLayout
      subject={subject}
      activeTab="Practice"
      onStandardChange={handleStandardChange}
      selectedStandard={currentStandard}
      availableLevels={availableLevels}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
        {/* Contents Sidebar */}
        <div className="lg:sticky lg:grid-cols-5 lg:top-24 h-fit px-0 order-1 lg:order-1">
          <div className="bg-white shadow-lg sm:shadow-xl rounded-lg p-3 sm:p-4 border">
            <h3 className="text-base sm:text-lg font-bold text-gray-700 mb-3 sm:mb-4 tracking-wide flex items-center">
              <span className="mr-2">📚</span>
              <span className="hidden sm:inline">{t('topic', 'Topic')} {translateFormLevel(selectedStandard)}</span>
              <span className="sm:hidden">Contents</span>
            </h3>

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

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-6 lg:space-y-8 order-1 lg:order-2">
          {currentSections.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500 text-lg">No content available for this subject and level.</p>
            </div>
          ) : (
            currentSections.map((section, index) => (
              <div
                key={section.id}
                id={section.title}
                ref={(el) => (sectionRefs.current[section.title] = el)}
                className="scroll-mt-20 lg:scroll-mt-24"
              >
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  {/* Big Title Header */}
                  <div className="bg-gray-200 border-b border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-[#30918F] border-2 border-green-800 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group animate-pulse hover:animate-none hover:scale-105 transition-transform duration-300">
                        <div className="relative">
                          <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white transform group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
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

                          <header className="flex items-center gap-3 px-0 py-3 sm:py-4">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">
                              {subSection.title}
                            </h3>
                          </header>

                          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 pr-3 sm:pr-4 lg:pr-6 pb-4 sm:pb-6 lg:pb-8">
                            {/* LEFT SIDE - Practice Cards */}
                            <div className="flex-1 flex flex-col bg-white">
                              <p className="text-sm font-semibold text-gray-900 mb-3 sm:mb-4">Practice</p>
                              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                {/* Objective Card - Only show if objective questions exist */}
                                {subSection.questionCounts?.objective > 0 && (
                                  <div className="border border-gray-200 rounded-lg bg-white hover:shadow-md transition-all duration-200">
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
                                {subSection.videos?.map((video, idx) => {

                                  // Update the getVideoInfo function in your SubjectPage.jsx
                                  const getVideoInfo = (url) => {
                                    if (!url) return { platform: 'unknown', thumbnail: null, videoId: null };

                                    // YouTube URLs
                                    if (url.includes('youtube.com') || url.includes('youtu.be')) {
                                      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                                      const match = url.match(regExp);
                                      const videoId = (match && match[2].length === 11) ? match[2] : null;
                                      return {
                                        platform: 'youtube',
                                        videoId: videoId,
                                        thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null,
                                        embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : null
                                      };
                                    }

                                    // AWS S3 URLs - Generate thumbnail URL from video URL
                                    else if (url.includes('s3.amazonaws.com') || url.includes('s3-ap-southeast-1.amazonaws.com')) {
                                      // OPTION 1: Use a thumbnail service/API endpoint
                                      const generateThumbnailUrl = (videoUrl) => {
                                        // Extract filename and create thumbnail URL pattern
                                        const urlParts = videoUrl.split('/');
                                        const filename = urlParts[urlParts.length - 1];
                                        const filenameWithoutExt = filename.replace(/\.[^/.]+$/, "");

                                        // Create thumbnail URL based on your naming convention
                                        // Example: video.mp4 -> video-thumb.jpg
                                        return `/api/video-thumbnail?url=${encodeURIComponent(videoUrl)}`;
                                      };

                                      // OPTION 2: If you have thumbnails stored with same name
                                      const getS3ThumbnailUrl = (videoUrl) => {
                                        // Replace .mp4 with .jpg or -thumb.jpg
                                        const thumbnailUrl = videoUrl
                                          .replace('.mp4', '.jpg')
                                          .replace('/mp4/', '/thumbnails/');

                                        return thumbnailUrl;
                                      };

                                      // OPTION 3: If thumbnails are in a different bucket/folder
                                      const getAlternateThumbnailUrl = (videoUrl) => {
                                        const bucketName = 'ptrsmedia';
                                        const videoPath = videoUrl.split(`${bucketName}.s3-ap-southeast-1.amazonaws.com/`)[1];

                                        if (videoPath) {
                                          // Assuming thumbnails are in a thumbnails folder
                                          const thumbnailPath = videoPath
                                            .replace('/video/stream/mp4/', '/video/thumbnails/')
                                            .replace('.mp4', '.jpg');

                                          return `https://${bucketName}.s3-ap-southeast-1.amazonaws.com/${thumbnailPath}`;
                                        }

                                        return null;
                                      };

                                      // Try different thumbnail URL patterns
                                      const thumbnailUrl = getAlternateThumbnailUrl(url) || getS3ThumbnailUrl(url);

                                      return {
                                        platform: 'aws',
                                        videoId: null,
                                        thumbnail: thumbnailUrl, // This will be null if no thumbnail exists
                                        embedUrl: url,
                                        isPlaceholder: !thumbnailUrl // Flag to use placeholder if no thumbnail
                                      };
                                    }

                                    // Direct video files
                                    else if (url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i)) {
                                      return {
                                        platform: 'direct',
                                        videoId: null,
                                        thumbnail: null,
                                        embedUrl: url
                                      };
                                    }

                                    return {
                                      platform: 'unknown',
                                      videoId: null,
                                      thumbnail: null,
                                      embedUrl: url
                                    };
                                  };

                                  const videoInfo = getVideoInfo(video.url);
                                  const { platform, thumbnail, videoId, embedUrl } = videoInfo;

                                  // Function to open video modal with appropriate player
                                  const handleVideoClick = () => {
                                    if (embedUrl) {
                                      openVideoModal({
                                        id: video.id,
                                        title: video.title,
                                        videoId: videoId,
                                        url: video.url,
                                        embedUrl: embedUrl,
                                        platform: platform,
                                        duration: video.duration
                                      });
                                    } else {
                                      // Fallback: open in new tab
                                      window.open(video.url, '_blank');
                                    }
                                  };

                                  // Get platform badge text
                                  const getPlatformBadge = () => {
                                    switch (platform) {
                                      case 'youtube': return 'YouTube';
                                      case 'vimeo': return 'Vimeo';
                                      case 'direct': return 'Video';
                                      case 'aws': return 'S3 Video';
                                      default: return 'Video Lesson';
                                    }
                                  };

                                  return (
                                    <div
                                      key={idx}
                                      className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-white transition-colors cursor-pointer group border border-transparent hover:border-sky-100"
                                      onClick={handleVideoClick}
                                    >
                                      {/* Video Thumbnail Image */}
                                      <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden relative">
                                        {thumbnail ? (
                                          <>
                                            <img
                                              src={thumbnail}
                                              alt={video.title}
                                              className="w-full h-full object-cover"
                                              onError={(e) => {
                                                // Fallback if thumbnail fails to load
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = `
                      <div class="w-full h-full bg-gradient-to-r from-sky-400 to-indigo-400 rounded flex items-center justify-center relative">
                        <svg class="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                    `;
                                              }}
                                            />
                                            {/* Play button overlay */}
                                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                                                <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                              </div>
                                            </div>
                                            {/* Duration badge */}
                                            {video.duration && (
                                              <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                                                {video.duration}
                                              </div>
                                            )}
                                          </>
                                        ) : (
                                          // Default thumbnail for non-YouTube videos
                                          <div className="w-full h-full bg-gradient-to-r from-sky-400 to-indigo-400 rounded flex items-center justify-center relative">
                                            <PlayIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                            {/* Platform icon */}
                                            {platform === 'aws' && (
                                              <div className="absolute top-1 left-1 bg-white bg-opacity-20 rounded p-0.5">
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                  <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                                                </svg>
                                              </div>
                                            )}
                                            {video.duration && (
                                              <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                                                {video.duration}
                                              </div>
                                            )}
                                          </div>
                                        )}
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
                                            {getPlatformBadge()}
                                          </span>
                                        </div>
                                        {/* Optional: Show video age/date */}
                                        {video.created_at && (
                                          <div className="text-xs text-gray-400 mt-1">
                                            Added {new Date(video.created_at).toLocaleDateString()}
                                          </div>
                                        )}
                                        {/* Debug info (remove in production) */}
                                        {/* <div className="text-xs text-gray-400 mt-1">
              {platform} • {videoId ? `ID: ${videoId}` : 'Direct URL'}
            </div> */}
                                      </div>
                                    </div>
                                  );
                                })}

                                {/* Show "No videos" message if array is empty */}
                                {(!subSection.videos || subSection.videos.length === 0) && (
                                  <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg">
                                    <PlayIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">No videos available for this topic</p>
                                  </div>
                                )}
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

      {/* ADD THIS LINE - Render the VideoModal component */}
      <VideoModal />

    </SubjectLayout>
  );
}