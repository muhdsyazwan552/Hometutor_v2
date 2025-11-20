import React, { useState, useEffect } from 'react';
import SubjectNavbar from '@/Layouts/SubjectNavbar';
import StandardFooter from '@/components/StandardFooter';

const ObjectiveQuestionLayout = ({
  children,
  subject,
  standard,
  currentTopic,
  progressCircles,
  timeElapsed,
  getTimeColor,
  sectionTitle,
  formatTime,
  footerContent
}) => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

    // Debug: Log all props
  console.log('🔍 ObjectiveQuestionLayout Props:', {
    subject,
    standard,
    currentTopic,
    progressCircles: progressCircles ? '✅ Provided' : '❌ Missing',
   
    getTimeColor: getTimeColor ? '✅ Function provided' : '❌ Missing',
    sectionTitle,
   
    footerContent: footerContent ? '✅ Provided' : '❌ Missing',
    children: children ? '✅ Provided' : '❌ Missing'
  });

  const formatSubjectName = (subject) => {
    if (!subject) return "Subject";
    return subject.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY === 0) {
        // At the very top - SHOW NAVBAR
        setIsNavbarVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 0) {
        // Scrolling down and past 100px - HIDE NAVBAR ONLY
        setIsNavbarVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - SHOW NAVBAR
        setIsNavbarVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <div className="flex flex-col min-h-screen"> {/* Changed from h-screen to min-h-screen */}
      {/* NAVBAR ONLY - Hide on scroll down */}
      <div className={`fixed top-0 left-0 right-0 z-50  ${isNavbarVisible ? 'translate-y-0' : '-translate-y-full'
        }`}>
        <SubjectNavbar title={formatSubjectName(subject)} />
      </div>

      {/* HEADER - ALWAYS VISIBLE, never hides */}
      <div className="bg-white shadow-xl p-4 md:p-6 sticky top-0 z-40 mt-16"> {/* mt-16 for navbar space */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
          <div className="flex-1 w-full md:w-auto">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 md:mb-2 break-words flex items-center gap-3">
  {/* Arrow Quit Icon */}
  <button 
    onClick={() => window.history.back()}
    className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
    title="Back"
  >
    <svg 
      className="w-4 h-4 md:w-5 md:h-5 text-gray-600" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
    <path 
  strokeLinecap="round" 
  strokeLinejoin="round" 
  strokeWidth={2} 
  d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" 
/>
    </svg>
  </button>
  
  {/* Title */}
  <span className="line-clamp-1">{sectionTitle}</span>
</h1>
            <p className="text-gray-600 text-sm px-12 md:text-base">
              Topic: {currentTopic}
            </p>
          </div>

          {/* Progress Circles */}
          <div className="relative w-full md:w-auto">
            {progressCircles}

            {/* Floating Timer - Mobile */}
            {/* <div className="absolute top-10 right-10 z-10 block lg:hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-800 rounded-lg shadow-md px-3 py-2 min-w-[130px] flex flex-col items-center border border-blue-100">
                <div className="flex items-center mb-1">
                  <svg
                    className="w-4 h-4 text-blue-600 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className={`text-md font-semibold ${getTimeColor()}`}>
                    {formatTime(timeElapsed)}
                  </span>
                </div>
                <div className="text-[9px] flex gap-1 text-blue-600 font-medium tracking-wide">
                  <span>TIME ELAPSED</span>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Main Content - Adjusted to reduce gap with footer */}
      <div className="relative pb-0"> {/* Removed bottom padding */}
        {children}

        {/* Floating Timer - Desktop */}
        <div className="hidden lg:block absolute top-4 right-8 z-10">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-800 rounded-lg shadow-lg px-3 py-2 min-w-[130px] flex flex-col items-center border border-blue-100 backdrop-blur-sm">
            <div className="flex items-center mb-1">
              <svg
                className="w-4 h-4 text-blue-600 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className={`text-lg font-semibold ${getTimeColor()}`}>
                {formatTime(timeElapsed)}
              </span>
            </div>
            <div className="text-[10px] flex gap-1 text-blue-600 font-medium tracking-wide">
              <span>TIME ELAPSED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Adjusted to be closer to content */}
      <footer className=" bg-white border-t border-gray-200 shadow-lg p-2 mt-0 z-30"> {/* Added mt-0 */}
        {footerContent}
        {/* <StandardFooter /> */}
      </footer>
    </div>
  );
};

export default ObjectiveQuestionLayout;