import React, { useState, useEffect, useRef } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import { getQuestionsBySubjectFormTopic, getTopicsBySubjectForm } from '@/Data/QuestionBankObjective';
import ObjectiveQuestionLayout from '@/Layouts/ObjectiveQuestionLayout';

export default function ObjectiveQuestion() {
  const { props } = usePage();
  const { subject, standard, sectionId, contentId, topic } = props;

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [incorrectAnswers, setIncorrectAnswers] = useState(new Set());
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [firstTryResults, setFirstTryResults] = useState([]);
  const [hasCheckedFirstTry, setHasCheckedFirstTry] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Timer state
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Audio refs
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);
  const successSoundRef = useRef(null);

  // Get topics for the current subject and form
  const topics = getTopicsBySubjectForm(subject, standard);

  // For now, use the first topic or a default
  const currentTopic = topic || (topics.length > 0 ? topics[0] : 'General');

  console.log('Received parameters:', {
    subject,
    standard,
    sectionId,
    contentId,
    topic
  });

  const formatSubjectName = (subject) => {
    if (!subject) return "Subject";
    return subject.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

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

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const isFirstAttempt = firstTryResults[currentQuestionIndex] === null;

    // Record first attempt result
    if (isFirstAttempt) {
      const newFirstTryResults = [...firstTryResults];
      newFirstTryResults[currentQuestionIndex] = isCorrect;
      setFirstTryResults(newFirstTryResults);
      setHasCheckedFirstTry(true);
    }

    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      // Play correct sound
      playSound('correct', 1.0);

      // Trigger celebration for first try correct
      if (isFirstAttempt) {
        playSound('success', 0.1);
        triggerCelebration();
      }

      setAnsweredQuestions(prev => new Set(prev).add(currentQuestionIndex));

      if (isFirstAttempt) {
        setScore(score + 1);
      }

      setShowExplanation(true);
    } else {
      // Play wrong sound
      playSound('wrong', 0.1);

      setIncorrectAnswers(prev => new Set(prev).add(selectedAnswer));
      setIsAnswerCorrect(false);

      if (isFirstAttempt) {
        setSelectedAnswer(null);
      }
    }
  };

  // Celebration animation
  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  };

  useEffect(() => {
    // Load questions when component mounts
    const quizQuestions = getQuestionsBySubjectFormTopic(subject, standard, currentTopic, 5);
    setQuestions(quizQuestions);
    // Initialize firstTryResults array with null values
    setFirstTryResults(Array(quizQuestions.length).fill(null));

    // Start timer when questions are loaded
    setTimerRunning(true);
  }, [subject, standard, currentTopic]);

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

  const currentQuestion = questions[currentQuestionIndex];

  // Format time function
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get time color based on elapsed time
  const getTimeColor = () => {
    if (timeElapsed < 300) return 'text-green-600';
    if (timeElapsed < 600) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleAnswerSelect = (answerIndex) => {
    if (answeredQuestions.has(currentQuestionIndex)) {
      return;
    }
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setIsAnswerCorrect(null);
      setIncorrectAnswers(new Set());
      setHasCheckedFirstTry(false);
    } else {
      setTimerRunning(false);
      setQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizCompleted(false);
    setAnsweredQuestions(new Set());
    setIncorrectAnswers(new Set());
    setIsAnswerCorrect(null);
    setFirstTryResults([]);
    setHasCheckedFirstTry(false);
    setShowCelebration(false);

    setTimeElapsed(0);
    setTimerRunning(true);

    const quizQuestions = getQuestionsBySubjectFormTopic(subject, standard, currentTopic, 5);
    setQuestions(quizQuestions);
    setFirstTryResults(Array(quizQuestions.length).fill(null));
  };

  const getOptionStyles = (optionIndex) => {
    const isCurrentSelected = selectedAnswer === optionIndex;
    const isDisabled = incorrectAnswers.has(optionIndex) || answeredQuestions.has(currentQuestionIndex);
    const isCorrectAnswer = optionIndex === currentQuestion?.correctAnswer;

    if (showExplanation && isCorrectAnswer) {
      return 'bg-green-100 border-green-500 text-green-800 cursor-default animate-pulse';
    }

    if (isDisabled && !isCorrectAnswer) {
      return 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed';
    }

    if (isCurrentSelected) {
      if (isAnswerCorrect === false) {
        return 'bg-red-100 border-red-500 text-red-800 cursor-default animate-shake';
      }
      return 'bg-blue-100 border-blue-500 text-blue-800';
    }

    if (isDisabled) {
      return 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed';
    }

    return 'bg-white border-gray-300 text-gray-800 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all duration-200';
  };

  // Progress Circles Component
  const ProgressCircles = () => (
    <div className="flex justify-center space-x-2 md:space-x-2 mb-2 md:mb-6">
      {questions.map((_, index) => {
        let circleColor = 'bg-gray-300';

        if (firstTryResults[index] !== null) {
          circleColor = firstTryResults[index] ? 'bg-green-500' : 'bg-red-500';
        } else if (index === currentQuestionIndex) {
          circleColor = 'bg-blue-500';
        }

        return (
          <div
            key={index}
            className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 ${circleColor} ${index === currentQuestionIndex ? 'ring-2 md:ring-4 ring-blue-200 scale-110' : ''
              }`}
          >
            {index + 1}
          </div>
        );
      })}
    </div>
  );

  // Confetti component for celebration
  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className={`absolute w-2 h-2 opacity-70 ${['bg-yellow-400', 'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][i % 5]
            }`}
          style={{
            left: `${Math.random() * 100}%`,
            animation: `confetti-fall ${Math.random() * 3 + 2}s linear forwards`,
            animationDelay: `${Math.random() * 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}
    </div>
  );

  // Footer Content Component
  const FooterContent = () => (
    <div className=" max-w-full mx-auto flex flex-wrap justify-end items-center gap-3">
      {/* Left side - Check Answer / Check Again buttons */}
      <div className="flex items-center flex-wrap gap-3">
        {/* Check Answer Button */}
        {!hasCheckedFirstTry && firstTryResults[currentQuestionIndex] === null && (
          <button
            onClick={handleCheckAnswer}
            disabled={selectedAnswer === null}
            className={`px-6 py-3 sm:px-5 sm:py-2 md:px-6 md:py-3 rounded-lg font-medium shadow-md transition-all duration-300 text-base sm:text-sm md:text-base hover:scale-[1.03] hover:shadow-lg ${
              selectedAnswer === null
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            Check Answer
          </button>
        )}

        {/* Check Again Button */}
        {hasCheckedFirstTry &&
          firstTryResults[currentQuestionIndex] === false &&
          !answeredQuestions.has(currentQuestionIndex) && (
            <div className="flex items-center flex-wrap gap-3">
              <span className="text-red-600 font-medium text-sm md:text-base">
                Select another answer
              </span>
              <button
                onClick={handleCheckAnswer}
                disabled={selectedAnswer === null}
                className={`px-6 py-3 sm:px-5 sm:py-2 md:px-6 md:py-3 rounded-lg font-medium shadow-md transition-all duration-300 text-base sm:text-sm md:text-base hover:scale-[1.03] hover:shadow-lg ${
                  selectedAnswer === null
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-orange-600 text-white hover:bg-orange-700"
                }`}
              >
                Check Again
              </button>
            </div>
          )}
      </div>

      {/* Right side - Next Question / Finish Quiz */}
      {(isAnswerCorrect === true || answeredQuestions.has(currentQuestionIndex)) && (
        <button
          onClick={handleNextQuestion}
          className="bg-blue-600 text-white px-6 py-3 sm:px-5 sm:py-2 md:px-6 md:py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium shadow-md text-base sm:text-sm md:text-base hover:scale-[1.03] hover:shadow-lg"
        >
          {currentQuestionIndex < questions.length - 1
            ? "Next Question"
            : "Finish Quiz"}
        </button>
      )}
    </div>
  );

  // Quiz Completed Screen
  if (quizCompleted) {
    const firstTryScore = firstTryResults.filter(result => result === true).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h1 className="text-4xl font-bold text-gray-800 mb-4 animate-fade-in">Quiz Completed!</h1>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 max-w-md mx-auto border border-blue-100 animate-pulse">
              <div className="flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-3xl font-bold text-blue-600">{formatTime(timeElapsed)}</span>
              </div>
              <p className="text-blue-600 font-medium">Total Time</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6 max-w-md mx-auto">
              <div className="bg-green-50 rounded-xl p-4 animate-slide-in-left">
                <div className="text-3xl font-bold text-green-600">{firstTryScore}</div>
                <div className="text-sm text-green-600 font-medium">First Try Score</div>
                <div className="text-xs text-green-500 mt-1">Out of {questions.length}</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 animate-slide-in-right">
                <div className="text-3xl font-bold text-blue-600">{score}</div>
                <div className="text-sm text-blue-600 font-medium">Final Score</div>
                <div className="text-xs text-blue-500 mt-1">After retries</div>
              </div>
            </div>

            <div className="flex justify-center space-x-3 mb-6">
              {firstTryResults.map((result, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold transition-all duration-500 ${result === true ? 'bg-green-500 animate-bounce' : 'bg-red-500'
                    }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {index + 1}
                </div>
              ))}
            </div>

            <div className="mb-6">
              <p className="text-gray-600 text-lg mb-2">
                {firstTryScore === questions.length
                  ? 'Perfect! You got all questions correct on the first try! 🎉'
                  : firstTryScore >= questions.length * 0.7
                    ? `Great job! You got ${firstTryScore} out of ${questions.length} correct on the first try! 👍`
                    : `You got ${firstTryScore} out of ${questions.length} correct on the first try. Keep practicing! 💪`}
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRestartQuiz}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:scale-105 transform duration-200"
              >
                Restart Quiz
              </button>
              <Link
                href={`/subject/${subject}`}
                className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-md hover:scale-105 transform duration-200"
              >
                Back to Subject
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading Quiz...</h1>
            <p className="text-gray-600">Preparing your questions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hidden Audio Elements */}
      <audio ref={correctSoundRef} src="/sounds/correct.mp3" preload="auto" />
      <audio ref={wrongSoundRef} src="/sounds/wrong.mp3" preload="auto" />
      <audio ref={successSoundRef} src="/sounds/success.mp3" preload="auto" />

      {/* Celebration Confetti */}
      {showCelebration && <Confetti />}
      
      {/* Use the Layout Component (Navbar is now inside layout) */}
      <ObjectiveQuestionLayout
        subject={subject}
        standard={standard}
        currentTopic={currentTopic}
        progressCircles={<ProgressCircles />}
        timeElapsed={timeElapsed}
        getTimeColor={getTimeColor}
        formatTime={formatTime}
        footerContent={<FooterContent />}
      >
        {/* Main Question Content */}
        <div className="relative p-0">
          {/* Feedback Messages */}
          {isAnswerCorrect === true && (
            <>
              {/* Web View */}
              <div className="hidden lg:block absolute lg:right-4 lg:top-3/4 lg:transform lg:-translate-y-1/2 z-10">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-xl p-3 shadow-sm w-[260px] mx-auto flex items-center gap-3 hover:shadow-md transition-all duration-300">
                  {/* Icon */}
                  <div className="flex items-center justify-center bg-white rounded-lg p-2 shadow-sm">
                    <svg
                      className="w-6 h-6 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.383 2.46a1 1 0 00-.364 1.118l1.286 3.974c.3.921-.755 1.688-1.54 1.118l-3.383-2.46a1 1 0 00-1.176 0l-3.383 2.46c-.785.57-1.84-.197-1.54-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.045 9.4c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.288-3.973z" />
                    </svg>
                  </div>

                  {/* Text */}
                  <div className="flex flex-col items-start">
                    <span className="text-gray-800 font-semibold text-sm tracking-wide">
                      Correct!
                    </span>
                    <span className="text-gray-600 text-[11px]">
                      {firstTryResults[currentQuestionIndex]
                        ? "Perfect on first try! 🎉"
                        : "Next question..."}
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:hidden absolute bottom-4 right-4 z-10">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-xl p-3 shadow-sm w-[260px] mx-auto flex items-center gap-3 hover:shadow-md transition-all duration-300">
                  {/* Icon */}
                  <div className="flex items-center justify-center bg-white rounded-lg p-2 shadow-sm">
                    <svg
                      className="w-6 h-6 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.383 2.46a1 1 0 00-.364 1.118l1.286 3.974c.3.921-.755 1.688-1.54 1.118l-3.383-2.46a1 1 0 00-1.176 0l-3.383 2.46c-.785.57-1.84-.197-1.54-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.045 9.4c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.288-3.973z" />
                    </svg>
                  </div>

                  {/* Text */}
                  <div className="flex flex-col items-start">
                    <span className="text-gray-800 font-semibold text-sm tracking-wide">
                      Correct!
                    </span>
                    <span className="text-gray-600 text-[11px]">
                      {firstTryResults[currentQuestionIndex]
                        ? "Perfect on first try! 🎉"
                        : "Next question..."}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {isAnswerCorrect === false && (
            <>
              {/* Web View */}
              <div className="hidden lg:block absolute lg:right-4 lg:top-3/4 lg:transform lg:-translate-y-1/2 z-10">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-lg w-[320px] animate-shake">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-red-800 font-medium text-sm">
                        {firstTryResults[currentQuestionIndex] === false && !answeredQuestions.has(currentQuestionIndex)
                          ? "Incorrect. Try another answer!"
                          : "First attempt incorrect. Try again!"}
                      </span>
                    </div>
                    <div className="text-center">
                      <button
                        onClick={handleNextQuestion}
                        className="text-gray-600 hover:text-gray-800 underline text-sm font-medium transition-colors hover:scale-105 transform duration-200"
                      >
                        Skip this question
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tablet & Mobile View */}
              <div className="lg:hidden absolute bottom-4 right-4 z-10">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-1.5 shadow-lg w-[250px] animate-shake">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-start">
                      <svg className="w-3 h-3 text-red-600 mr-1.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-red-800 font-medium text-xs leading-tight">
                        {firstTryResults[currentQuestionIndex] === false && !answeredQuestions.has(currentQuestionIndex)
                          ? "Incorrect. Try another answer!"
                          : "First attempt incorrect. Try again!"}
                      </span>
                    </div>
                    <div className="text-center pt-0.5">
                      <button
                        onClick={handleNextQuestion}
                        className="text-gray-600 hover:text-gray-800 underline text-xs font-medium transition-colors hover:scale-105 transform duration-200"
                      >
                        Skip this question
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="py-2 sm:py-4 bg-cover bg-center bg-no-repeat h-auto" style={{ backgroundImage: 'url(/images/background_classroom.jpg)' }}>
            <div className="mx-auto relative px-4 sm:px-0 md:px-4 lg:px-10 max-w-full sm:max-w-2xl md:max-w-full lg:max-w-2xl xl:max-w-5xl 2xl:max-w-6xl">
              {/* Question Card */}
              <div className="bg-white opacity-100 rounded-2xl shadow-xl p-6 mb-10 transition-all duration-300 hover:shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-sm md:text-lg lg:text-lg xl:text-xl font-semibold flex-1 leading-relaxed text-gray-800 lg:text-gray-900">
                    {currentQuestion.question}
                  </h2>
                </div>

                <span className="text-gray-600 text-sm sm:text-sm mb-4 block">Pilih 1 jawapan : </span>

                {/* Options */}
                <div className="space-y-3 mb-6">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={incorrectAnswers.has(index) || answeredQuestions.has(currentQuestionIndex)}
                      className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 ${getOptionStyles(index)}`}
                    >
                      <div className="flex items-center">
                        <span className="font-medium mr-3 sm:mr-4 text-base sm:text-lg">{String.fromCharCode(65 + index)}.</span>
                        <span className="text-sm md:text-lg lg:text-lg xl:text-xl">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Explanation */}
                {showExplanation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4 animate-fade-in">
                    <h3 className="font-semibold text-blue-800 mb-2 flex items-center text-sm sm:text-base">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Explanation:
                    </h3>
                    <p className="text-blue-700 text-sm sm:text-base">{currentQuestion.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ObjectiveQuestionLayout>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-left {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-slide-in-left { animation: slide-in-left 0.5s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 0.5s ease-out; }
      `}</style>
    </div>
  );
}