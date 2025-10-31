import React, { useState, useMemo, useEffect, useRef } from "react";
import QuestionLayout from "@/Layouts/ObjectiveQuestionLayout";
import ResultQuestion from "@/Pages/courses/training/ResultQuestion";
import { getFeedbackMessage, getAnswerType } from "@/utils/answerFeedback";
import { Head, usePage } from '@inertiajs/react'; // Added usePage
import SubjectNavbar from '@/Layouts/SubjectNavbar';

export default function SubjectiveQuestion({ title = "Subjective Quiz" }) {
  const { props } = usePage(); // Added usePage hook
  const { subject, standard } = props; // Extract subject and standard from props
  
  const [open, setOpen] = useState(false);
  
  const formatSubjectName = (subject) => {
    if (!subject) return "Subject";
    return subject.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Questions with related images & schema answers
  const questions = [
    { id: 1, text: "Based on the poster, what is the date of the trip?", image: "/images/subjective_question.png", schema: "12 August 2025" },
    { id: 2, text: "Who should students register with for the trip?", image: "/images/subjective_question.png", schema: "Pn. Aminah" },
    { id: 3, text: "How much is the payment per person?", image: "/images/subjective_question.png", schema: "RM50" },
    { id: 4, text: "What must all pupils wear during the trip?", image: "/images/subjective_question.png", schema: "School uniform" },
    { id: 5, text: "Name the teachers in charge of the trip.", image: "/images/subjective_question.png", schema: "Pn. Aminah and En. Rahman" },
  ];

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
        question: q.text,
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

  // Progress Circles Component
  const ProgressCircles = () => (
    <div className="flex justify-center space-x-3 mb-6">
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
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 ${circleColor} ${
              index === currentIndex ? 'ring-4 ring-blue-200 scale-110' : ''
            }`}
          >
            {index + 1}
          </div>
        );
      })}
    </div>
  );

  // If quiz is completed, show the results page
  if (showScore && quizResults) {
    return (
      <ResultQuestion 
        subjectiveResults={quizResults}
        onTryAgain={resetQuiz}
        quizType="subjective"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hidden Audio Elements */}
      <audio ref={correctSoundRef} src="/sounds/correct.mp3" preload="auto" />
      <audio ref={wrongSoundRef} src="/sounds/wrong.mp3" preload="auto" />
      <audio ref={successSoundRef} src="/sounds/success.mp3" preload="auto" />
      
      {/* Updated SubjectNavbar with subject and standard like ObjectiveQuestion */}
      <SubjectNavbar title={formatSubjectName(subject)} />
      <Head title={`${subject} - Subjective Quiz`} /> {/* Updated title */}

      <div className="max-w-8xl mx-auto px-0">
        {/* Header - Updated to match ObjectiveQuestion style */}
        <div className="bg-white shadow-xl p-6 mb-0">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {subject} - {standard} {/* Added standard like ObjectiveQuestion */}
              </h1>
              <p className="text-gray-600">
                Subjective Questions - Answer based on the poster
              </p>
            </div>
            {/* Progress Circles */}
            <ProgressCircles />
          </div>
        </div>

        {/* Question Card */}
        <div className="py-6 bg-cover bg-center bg-no-repeat h-max" style={{ backgroundImage: 'url(/images/background_classroom.jpg)' }}>
          <div className="max-w-4xl mx-auto relative">
            {/* Floating Timer */}
            <div className="absolute -right-44 -top-0 z-10">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-4 border-2 border-blue-100 min-w-[160px] hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={`text-2xl font-bold ${getTimeColor()}`}>
                      {formatTime(timeElapsed)}
                    </span>
                  </div>
                  <div className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full">
                    TIME ELAPSED
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Feedback Messages */}
            {isCorrect[currentIndex] === true && (
              <div className="absolute -right-44 top-1/2 transform -translate-y-1/2 z-10 w-40">
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

            {/* Question Card */}
            <div className="bg-white opacity-100 rounded-2xl shadow-xl p-6 mb-10 transition-all duration-300 hover:shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex-1 leading-relaxed">
                  Question {currentIndex + 1} of {questions.length}
                </h2>
              </div>

              {/* Image */}
              {questions[currentIndex].image && (
                <div className="mb-6 flex justify-center cursor-zoom-in">
                  <img
                    src={questions[currentIndex].image}
                    alt={`Question ${currentIndex + 1}`}
                    className="max-h-80 rounded-lg border shadow"
                    onClick={() => setOpen(true)}
                  />
                </div>
              )}

              {/* Zoom Modal */}
              {open && (
                <div
                  className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                  onClick={() => setOpen(false)}
                >
                  <img
                    src={questions[currentIndex].image}
                    alt={`Question ${currentIndex + 1}`}
                    className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg cursor-zoom-out"
                  />
                </div>
              )}

              {/* Question text */}
              <p className="text-gray-700 mb-6 text-lg">{questions[currentIndex].text}</p>

              <span className="text-gray-600 text-md mb-4 block">Type your answer below:</span>

              {/* Answer input */}
              <textarea
                value={answers[currentIndex]}
                onChange={(e) => handleAnswerChange(e.target.value)}
                rows={4}
                className="w-full resize-none border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium mb-6 p-4 bg-white transition-all duration-200"
                placeholder="Type your answer here..."
                disabled={checked[currentIndex]}
              />

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 animate-shake">
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              )}

              {/* Schema answer (only after check) */}
              {checked[currentIndex] && (
                <div className="mb-4">
                  <button
                    onClick={toggleSchema}
                    className="mb-2 px-6 py-3 rounded-xl shadow bg-yellow-500 hover:bg-yellow-600 text-white font-medium transition-all duration-300 hover:scale-105"
                  >
                    {showSchema[currentIndex] ? "Hide Schema Answer" : "Show Schema Answer"}
                  </button>

                  {showSchema[currentIndex] && (
                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl shadow-sm animate-fade-in">
                      <h3 className="text-green-800 font-semibold mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Schema Answer:
                      </h3>
                      <p className="text-green-700 text-lg">{questions[currentIndex].schema}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <footer className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            {/* Left side - Previous button */}
            <div className="flex-1">
              <button
                disabled={currentIndex === 0}
                onClick={handlePrev}
                className={`px-6 py-3 rounded-lg shadow text-sm font-medium transition-all duration-300 ${
                  currentIndex === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:scale-105"
                }`}
              >
                ← Previous
              </button>
            </div>

            {/* Center - Check Answer button */}
            <div className="flex-1 flex justify-center">
              {!checked[currentIndex] && (
                <button
                  onClick={handleCheckAnswer}
                  disabled={!answers[currentIndex].trim()}
                  className={`px-8 py-4 rounded-lg font-medium shadow-md transition-all duration-300 text-lg hover:scale-105 ${
                    !answers[currentIndex].trim()
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 animate-pulse'
                  }`}
                >
                  Check Answer
                </button>
              )}
            </div>

            {/* Right side - Next/Finish button */}
            <div className="flex-1 flex justify-end">
              {checked[currentIndex] && (
                <button
                  onClick={handleNext}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium shadow-md text-lg hover:scale-105"
                >
                  {currentIndex < questions.length - 1 ? 'Next Question →' : 'Finish Quiz 🎉'}
                </button>
              )}
            </div>
          </div>
        </footer>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
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
      `}</style>
    </div>
  );
}