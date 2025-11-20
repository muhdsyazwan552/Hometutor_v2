import React, { useState, useMemo, useEffect, useRef } from "react";
import SubjectiveQuestionLayout from "@/Layouts/SubjectiveQuestionLayout";
import ResultQuestion from "@/Pages/courses/training/ResultQuestion";
import { getFeedbackMessage, getAnswerType } from "@/utils/answerFeedback";
import { Head, usePage } from '@inertiajs/react';

export default function SubjectiveQuestion({ title = "Subjective Quiz" }) {
  const pageProps = usePage().props;

  const {
    subject,
    standard,
    sectionId,
    contentId,
    topic,
    sectionTitle,
    questions: initialQuestions,
    topic_id,
    subject_id,  
    level_id,
    question_count,
    total_available
  } = pageProps;

  const [open, setOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState("");

  // Default fallback question
  const defaultQuestion = {
    id: 1,
    question: "No questions available",
    schema: "No schema available",
    explanation: "",
    difficulty: "medium",
    type: 'subjective',
    question_type: 'html'
  };

  const getSectionTitle = () => {
    return sectionTitle || topic || `Section ${sectionId}`;
  };

  // Get questions from subjective question bank with better error handling
  const questions = useMemo(() => {
    try {
      const controllerQuestions = initialQuestions || []; // ✅ Use initialQuestions

      if (!controllerQuestions || controllerQuestions.length === 0) {
        console.log('No questions from controller, using fallback');
        return [defaultQuestion];
      }

      // Transform controller questions to match component format
      const transformedQuestions = controllerQuestions.map((q, index) => ({
        id: q.id || index,
        question: q.question_text || 'No question available',
        schema: q.schema || 'No schema answer available',
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'medium',
        type: 'subjective',
        question_type: q.question_type || 'html'
      }));

      return transformedQuestions;
    } catch (error) {
      console.error('Error processing questions:', error);
      return [defaultQuestion];
    }
  }, [initialQuestions]); // ✅ Use initialQuestions

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [error, setError] = useState("");
  const [showScore, setShowScore] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  // Timer state
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // per-question state
  const [checked, setChecked] = useState(Array(questions.length).fill(false));
  const [showSchema, setShowSchema] = useState(Array(questions.length).fill(false));
  const [isCorrect, setIsCorrect] = useState(Array(questions.length).fill(null));
  const [firstTryResults, setFirstTryResults] = useState(Array(questions.length).fill(null));

  // Audio refs
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);
  const successSoundRef = useRef(null);

  // Play sound function
  const playSound = (type, volume = 1.0) => {
    let audio;

    if (type === "correct") {
      audio = new Audio("/sounds/correct.mp3");
    } else if (type === "wrong") {
      audio = new Audio("/sounds/wrong.mp3");
    } else if (type === "success") {
      audio = new Audio("/sounds/success.mp3");
    }

    if (audio) {
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play();
    }
  };

  // Timer effect
  useEffect(() => {
    let interval = null;

    if (timerRunning) {
      interval = setInterval(() => {
        setTimeElapsed(seconds => seconds + 1);
      }, 1000);
    } else if (!timerRunning && timeElapsed !== 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timerRunning]);

  // Start timer when component mounts
  useEffect(() => {
    setTimerRunning(true);

    return () => {
      setTimerRunning(false);
    };
  }, []);

  // Handle image clicks in HTML content
  useEffect(() => {
    const handleImageClick = (e) => {
      if (e.target.tagName === 'IMG') {
        setZoomedImage(e.target.src);
        setOpen(true);
      }
    };

    const questionContent = document.querySelector('.question-content');
    if (questionContent) {
      questionContent.addEventListener('click', handleImageClick);
    }

    return () => {
      if (questionContent) {
        questionContent.removeEventListener('click', handleImageClick);
      }
    };
  }, [currentIndex, questions]);

  // Format time function
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get time color based on elapsed time
  const getTimeColor = () => {
    if (timeElapsed < 300) return 'text-green-600';
    if (timeElapsed < 600) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleAnswerChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = value;
    setAnswers(newAnswers);
    setError("");
  };

  const handleCheckAnswer = () => {
    if (!answers[currentIndex].trim()) {
      setError("⚠️ Please enter your answer first.");
      return;
    }

    const newChecked = [...checked];
    newChecked[currentIndex] = true;
    setChecked(newChecked);

    const newShowSchema = [...showSchema];
    newShowSchema[currentIndex] = true;
    setShowSchema(newShowSchema);

    // For subjective questions, we'll consider it correct if they attempt
    const newIsCorrect = [...isCorrect];
    newIsCorrect[currentIndex] = true;
    setIsCorrect(newIsCorrect);

    // Record first attempt result
    const newFirstTryResults = [...firstTryResults];
    if (newFirstTryResults[currentIndex] === null) {
      newFirstTryResults[currentIndex] = true;
      setFirstTryResults(newFirstTryResults);
    }

    // Play success sound
    playSound('correct', 1.0);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setError("");
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setError("");
    }
  };

  const toggleSchema = () => {
    const newShowSchema = [...showSchema];
    newShowSchema[currentIndex] = !newShowSchema[currentIndex];
    setShowSchema(newShowSchema);
  };

  const handleSubmit = () => {
    // Stop the timer
    setTimerRunning(false);

    // Calculate results
    const answered = answers.filter(answer => answer.trim() !== "").length;
    const skipped = questions.length - answered;

    const results = {
      totalQuestions: questions.length,
      score: answered,
      answered: answered,
      skipped: skipped,
      timeElapsed: timeElapsed,
      questions: questions.map((q, index) => ({
        question: q.question,
        answered: answers[index].trim() !== "",
        correct: true
      }))
    };

    // Set completed state and pass results
    setShowScore(true);
    setQuizResults(results);
  };

  const resetQuiz = () => {
    setAnswers(Array(questions.length).fill(""));
    setError("");
    setShowScore(false);
    setQuizResults(null);
    setChecked(Array(questions.length).fill(false));
    setShowSchema(Array(questions.length).fill(false));
    setIsCorrect(Array(questions.length).fill(null));
    setFirstTryResults(Array(questions.length).fill(null));
    setCurrentIndex(0);
    // Reset timer
    setTimeElapsed(0);
    setTimerRunning(true);
  };

  // Responsive Progress Circles Component
  const ProgressCircles = () => (
    <div className="flex justify-center space-x-2 md:space-x-3 overflow-x-auto py-2 px-2">
      {questions.map((_, index) => {
        let circleColor = 'bg-gray-300';

        if (firstTryResults[index] !== null) {
          circleColor = firstTryResults[index] ? 'bg-green-500' : 'bg-red-500';
        } else if (index === currentIndex) {
          circleColor = 'bg-blue-500';
        }

        return (
          <div
            key={index}
            className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 ${circleColor} ${
              index === currentIndex ? 'ring-2 md:ring-4 ring-blue-200 scale-110' : ''
            } flex-shrink-0`}
          >
            {index + 1}
          </div>
        );
      })}
    </div>
  );

  // Responsive Footer Content
  const footerContent = (
    <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 px-4 md:px-10 py-3">
      {/* Tools Button - Hidden on mobile, visible on tablet and up */}
      <button className="hidden sm:flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
        <span>🔧</span>
        <span className="hidden md:inline">Tools</span>
      </button>

      {/* Mobile Tools Button */}
      <button className="sm:hidden flex items-center gap-2 px-3 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
        <span>🔧</span>
      </button>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        {/* Check Answer button */}
        {!checked[currentIndex] && (
          <button
            onClick={handleCheckAnswer}
            disabled={!answers[currentIndex].trim()}
            className={`w-full sm:w-auto px-4 py-3 md:px-6 md:py-3 rounded-lg font-medium shadow-md transition-all duration-300 text-sm md:text-base hover:scale-105 ${
              !answers[currentIndex].trim()
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 animate-pulse'
            }`}
          >
            Check Answer
          </button>
        )}

        {/* Next/Finish button */}
        {checked[currentIndex] && (
          <button
            onClick={handleNext}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium shadow-md text-sm md:text-lg hover:scale-105"
          >
            {currentIndex < questions.length - 1 ? (
              <>
                <span className="hidden sm:inline">Next Question</span>
                <span className="sm:hidden">Next</span>
                <span className="hidden md:inline"> →</span>
              </>
            ) : (
              'Finish Quiz 🎉'
            )}
          </button>
        )}
      </div>
    </div>
  );

  // Main content for children prop
  const mainContent = (
    <div className="py-4 md:py-6 bg-cover bg-center bg-no-repeat min-h-screen" style={{ backgroundImage: 'url(/images/background_classroom.jpg)' }}>
      <div className="max-w-4xl mx-auto relative px-4 md:px-0">
        {/* Floating Feedback Messages - Hidden on mobile */}
        {isCorrect[currentIndex] === true && (
          <div className="hidden lg:block absolute -right-44 top-1/2 transform -translate-y-1/2 z-10 w-40">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 shadow-lg min-w-[200px] animate-bounce">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-800 font-medium text-sm">
                  Answer submitted! ✓
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Feedback Banner */}
        {isCorrect[currentIndex] === true && (
          <div className="lg:hidden bg-green-50 border-2 border-green-200 rounded-xl p-3 mb-4 animate-fade-in">
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-800 font-medium text-sm">
                Answer submitted! ✓
              </span>
            </div>
          </div>
        )}

        {/* Question Card */}
        <div className="bg-white opacity-100 rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6 mb-6 md:mb-10 transition-all duration-300 hover:shadow-xl md:hover:shadow-2xl">
          {/* Mobile Question Counter */}
          <div className="lg:hidden mb-4 pb-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 text-center">
              Question {currentIndex + 1} of {questions.length}
            </h2>
          </div>

          {/* Question content with HTML rendering */}
          <div className="text-gray-700 mb-4 md:mb-6 text-base md:text-lg question-content">
            {questions[currentIndex]?.question ? (
              <div
                className="prose max-w-none prose-sm md:prose-base"
                dangerouslySetInnerHTML={{ __html: questions[currentIndex].question }}
              />
            ) : (
              <p className="text-red-500">No question content available</p>
            )}
          </div>

          <span className="text-gray-600 text-sm md:text-md mb-3 md:mb-4 block">Type your answer below:</span>

          {/* Answer input */}
          <textarea
            value={answers[currentIndex]}
            onChange={(e) => handleAnswerChange(e.target.value)}
            rows={4}
            className="w-full resize-none border-2 border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base md:text-lg font-medium mb-4 md:mb-6 p-3 md:p-4 bg-white transition-all duration-200"
            placeholder="Type your detailed answer with explanations and working here..."
            disabled={checked[currentIndex]}
          />

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg md:rounded-xl p-3 md:p-4 mb-3 md:mb-4 animate-shake">
              <p className="text-red-600 font-medium text-sm md:text-base">{error}</p>
            </div>
          )}

          {/* Schema answer (only after check) */}
          {checked[currentIndex] && (
            <div className="mb-4">
              <button
                onClick={toggleSchema}
                className="w-full sm:w-auto mb-2 px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl shadow bg-yellow-500 hover:bg-yellow-600 text-white font-medium transition-all duration-300 hover:scale-105 text-sm md:text-base"
              >
                {showSchema[currentIndex] ? "Hide Schema Answer" : "Show Schema Answer"}
              </button>

              {showSchema[currentIndex] && (
                <div className="p-3 md:p-4 bg-green-50 border-2 border-green-200 rounded-lg md:rounded-xl shadow-sm animate-fade-in">
                  <h3 className="text-green-800 font-semibold mb-2 flex items-center text-sm md:text-base">
                    <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Schema Answer:
                  </h3>
                  {questions[currentIndex]?.schema ? (
                    <div
                      className="text-green-700 text-base md:text-lg prose max-w-none prose-sm md:prose-base"
                      dangerouslySetInnerHTML={{ __html: questions[currentIndex].schema }}
                    />
                  ) : (
                    <p className="text-green-700">No schema answer available</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Zoom Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <img
            src={zoomedImage}
            alt="Zoomed question image"
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg cursor-zoom-out"
          />
        </div>
      )}
    </div>
  );

  // If quiz is completed, show the results page
  if (showScore && quizResults) {
    return (
      <ResultQuestion
        subjectiveResults={quizResults}
        onTryAgain={resetQuiz}
        quizType="subjective"
        subject={subject}
        standard={standard}
        sectionId={sectionId}
        contentId={contentId}
        topic={topic}
        sectionTitle={sectionTitle}
        topic_id={topic_id}
        form={standard}
        level_id={level_id}
        subject_id={subject_id}
      />
    );
  }

  return (
    <>
      {/* Hidden Audio Elements */}
      <audio ref={correctSoundRef} src="/sounds/correct.mp3" preload="auto" />
      <audio ref={wrongSoundRef} src="/sounds/wrong.mp3" preload="auto" />
      <audio ref={successSoundRef} src="/sounds/success.mp3" preload="auto" />

      <Head title={`${subject} - Subjective Quiz`} />

      <SubjectiveQuestionLayout
        subject={subject}
        standard={standard}
        currentTopic={topic || "Subjective Questions"}
        progressCircles={<ProgressCircles />}
        timeElapsed={timeElapsed}
        getTimeColor={getTimeColor}
        sectionTitle={sectionTitle || getSectionTitle()}
        formatTime={formatTime}
        footerContent={footerContent}
      >
        {mainContent}
      </SubjectiveQuestionLayout>

      {/* Custom CSS for animations and responsive design */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        
        /* Style for HTML content */
        .prose ol {
          list-style-type: lower-roman;
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .prose li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }
        .prose img {
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          margin: 1rem auto;
          display: block;
          cursor: zoom-in;
          max-width: 100%;
          height: auto;
        }
        .prose p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        /* Mobile-specific styles */
        @media (max-width: 640px) {
          .prose ol {
            margin-left: 1rem;
          }
          .prose img {
            margin: 0.5rem auto;
          }
        }

        /* Tablet-specific styles */
        @media (min-width: 641px) and (max-width: 1024px) {
          .prose ol {
            margin-left: 1.25rem;
          }
        }
      `}</style>
    </>
  );
}