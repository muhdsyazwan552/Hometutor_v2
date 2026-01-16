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
  footerContent,
  answeredQuestions,
  selectedAnswer,
  handleExitQuiz,
  handleBackNavigation,
  onExitWithResults
}) => {
  const [showNavbar, setShowNavbar] = useState(true);
  const [showColoredHeader, setShowColoredHeader] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const formatSubjectName = (subject) => {
    if (!subject) return "Subject";
    return subject.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

   // Handle back/exit logic
  const handleBackButtonClick = () => {
    if (answeredQuestions && answeredQuestions.size > 0) {
      if (onExitWithResults) {
        // Use custom exit handler that shows results
        onExitWithResults();
      } else if (window.confirm('Exit quiz? Answered questions will be saved. Unanswered questions will be marked as skipped.')) {
        handleExitQuiz && handleExitQuiz();
      }
    } else {
      handleBackNavigation ? handleBackNavigation() : window.history.back();
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY === 0) {
        // At the very top - show navbar and white header
        setShowNavbar(true);
        setShowColoredHeader(false);
      } else if (currentY > lastScrollY && currentY > 70) {
        // Scrolling down past 70px - hide everything
        setShowNavbar(false);
        setShowColoredHeader(true);
      } else if (currentY < lastScrollY && currentY > 100) {
        // Scrolling up past 100px - show only colored header
        setShowNavbar(false);
        setShowColoredHeader(true);
      }

      setLastScrollY(currentY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ✅ Navbar - hides on scroll down */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <SubjectNavbar title={formatSubjectName(subject)} />
      </div>

      {/* ✅ White Header Section - hides on scroll down */}
      <div
        className={`bg-white shadow-xl p-4 md:p-6 sticky top-0 z-40 mt-20 transition-transform duration-300 ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <button
                onClick={handleBackButtonClick}
                className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors group relative"
                title="Back / Exit Quiz"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 text-gray-600 group-hover:text-red-600"
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
                {/* Tooltip for desktop */}
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {answeredQuestions && answeredQuestions.size > 0 ? 'Exit & Save' : 'Back'}
                </span>
              </button>
              <span className="line-clamp-1">{sectionTitle}</span>
            </h1>
            <p className="text-gray-600 text-sm px-12 md:text-base">
              Topic: {currentTopic}
            </p>
          </div>
          <div className="relative w-full md:w-auto">
            {progressCircles}
          </div>
        </div>
      </div>

      {/* ✅ Colored compact header (appears when scrolling up after hiding) */}
      <div 
        className={`bg-[#8F3091] text-white p-3 shadow-lg fixed py-4 top-0 left-0 right-0 z-40 transition-transform duration-300 ${
          showColoredHeader ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex max-auto h-100 flex-col md:flex-row justify-between items-start md:items-center gap-3 mt-3">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-50 flex items-center gap-3">
             <button
                onClick={handleBackButtonClick}
                className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors group relative"
                title="Back / Exit Quiz"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 text-gray-600 group-hover:text-red-600"
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
                {/* Tooltip for desktop */}
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {answeredQuestions && answeredQuestions.size > 0 ? 'Exit & Save' : 'Back'}
                </span>
              </button>
              <span className="line-clamp-1">{sectionTitle}</span>
            </h1>
            <p className="text-gray-50 text-sm px-12 md:text-base">
              Topic: {currentTopic}
            </p>
          </div>
          <div>{progressCircles}</div>
        </div>
      </div>

      {/* ✅ Main content - add top padding to account for fixed headers */}
      <div className="relative pb-0 pt-0">
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

      {/* ✅ Footer */}
      <footer className="bg-white border-t border-gray-200 shadow-lg p-2 z-30">
        {footerContent}
      </footer>
    </div>
  );
};

export default ObjectiveQuestionLayout;