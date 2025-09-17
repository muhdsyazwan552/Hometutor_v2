// Layouts/QuestionLayout.jsx
import React, { useState, useEffect, useRef } from 'react';
import QuestionNavbar from './QuestionNavbar';

const QuestionLayout = ({ 
  children, 
  title = "Quiz",
  firstAnswers = [],
  bgColor = "bg-white",
  footer = null 
}) => {
  const [navbarVisible, setNavbarVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide navbar when scrolling down
      if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
        setNavbarVisible(false);
      } 
      // Show navbar only when at the top of the page
      else if (currentScrollY === 0) {
        setNavbarVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const QuizBanner = () => (
    <div className="sticky top-0 max-w-8xl mx-auto px-6 sm:px-6 lg:px-8 py-4 border-b border-gray-200 bg-white z-40">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="bg-white p-2 rounded-full mr-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mathematics Quiz</h1>
            <p className="text-gray-400">Test your knowledge!</p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          {/* Question progress dots */}
          <div className="flex space-x-3 mb-3">
            {firstAnswers.map((isCorrect, index) => (
              <div
                key={index}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium border-2 border-gray-300 ${isCorrect === true
                    ? 'bg-green-500 text-white'
                    : isCorrect === false
                      ? 'bg-red-500 text-white'
                      : 'bg-transparent'
                  }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${bgColor}`}>
      {/* Pass navbarVisible prop to QuestionNavbar */}
      <QuestionNavbar title={title} visible={navbarVisible} />
      
      <QuizBanner />
      
      <main className=" mx-auto">
        {children}
      </main>
      
      {footer}
    </div>
  );
};

export default QuestionLayout;