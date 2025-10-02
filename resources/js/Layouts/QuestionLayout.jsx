// Layouts/QuestionLayout.jsx
import React, { useState, useEffect, useRef } from 'react';
import QuestionNavbar from './QuestionNavbar';
import Calculator from '../components/Calculator'; // Import kalkulator

const QuestionLayout = ({ 
  children, 
  title = "Quiz",
  firstAnswers = [],
  bgColor = "bg-white",
  footer = null 
}) => {
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [calculatorVisible, setCalculatorVisible] = useState(false);
  const [calculatorPosition, setCalculatorPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const calculatorRef = useRef(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
        setNavbarVisible(false);
      } else if (currentScrollY === 0) {
        setNavbarVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle calculator drag events
  const handleMouseDown = (e) => {
    if (!calculatorVisible) return;
    
    setIsDragging(true);
    const rect = calculatorRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !calculatorVisible) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Ensure calculator stays within viewport bounds
    const maxX = window.innerWidth - 400; // Calculator width
    const maxY = window.innerHeight - 500; // Calculator height
    
    setCalculatorPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, calculatorVisible]);

  const toggleCalculator = () => {
    setCalculatorVisible(!calculatorVisible);
  };

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
            <h1 className="text-2xl font-bold">Quiz</h1>
            <p className="text-gray-400">Test your knowledge!</p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          {/* Question progress dots */}
          <div className="flex space-x-3 mb-3">
            {firstAnswers.map((isCorrect, index) => (
              <div
                key={index}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium border-2 border-gray-300 ${
                  isCorrect === true
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
      {/* <QuestionNavbar title={title} visible={navbarVisible} /> */}
      
      {/* Floating Calculator Icon */}
      <div 
        className={`fixed z-50 transition-all duration-300 ${
          calculatorVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={{ 
          top: '80px', 
          right: '20px',
          cursor: 'pointer'
        }}
      >
        <button
          onClick={toggleCalculator}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
          title="Open Calculator"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Draggable Calculator */}
      {calculatorVisible && (
        <div
          ref={calculatorRef}
          className="fixed z-50 shadow-2xl rounded-lg overflow-hidden cursor-move transition-transform duration-200"
          style={{
            left: `${calculatorPosition.x}px`,
            top: `${calculatorPosition.y}px`,
            transform: isDragging ? 'scale(1.02)' : 'scale(1)',
            minWidth: '380px'
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Calculator Header */}
          <div className="bg-gray-800 px-4 py-2 flex justify-between items-center border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-white font-medium">Scientific Calculator</span>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setCalculatorVisible(false)}
                className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs transition-colors"
                title="Close"
              >
                ×
              </button>
            </div>
          </div>
          
          {/* Calculator Content */}
          <div className="max-h-[600px] overflow-y-auto">
            <Calculator />
          </div>
        </div>
      )}

      {/* Overlay when calculator is open */}
      {calculatorVisible && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-20"
          onClick={() => setCalculatorVisible(false)}
        />
      )}
      
      <QuizBanner />
      
      <main className="mx-auto">
        {children}
      </main>
      
      {footer}
    </div>
  );
};

export default QuestionLayout;