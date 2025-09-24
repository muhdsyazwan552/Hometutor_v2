import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import QuestionLayout from '@/Layouts/QuestionLayout';
import QuizFooter from '@/Components/QuizFooter';
import ResultQuizPage from '@/Pages/courses/training/ResultQuizPage';
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomQuestions } from './QuestionBankPage';

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [firstAnswers, setFirstAnswers] = useState([]);
  const [explanationVisible, setExplanationVisible] = useState(false);
  const [showRetryOption, setShowRetryOption] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  
  // Timer state
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Load exactly 5 random questions
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    // Get 5 random questions
    const randomQuestions = getRandomQuestions(5);
    setQuestions(randomQuestions);
    setAnsweredQuestions(Array(5).fill(null));
    setFirstAnswers(Array(5).fill(null));
  }, []);

  // Timer effect
  useEffect(() => {
    let interval = null;
    
    if (timerRunning && questions.length > 0) {
      interval = setInterval(() => {
        setTimeElapsed(seconds => seconds + 1);
      }, 1000);
    } else if (!timerRunning && timeElapsed !== 0) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [timerRunning, questions.length]);

  // Start timer when questions are loaded
  useEffect(() => {
    if (questions.length > 0) {
      setTimerRunning(true);
    }
    
    return () => {
      setTimerRunning(false);
    };
  }, [questions.length]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const resetQuiz = () => {
    // Get new random questions when resetting
    const newRandomQuestions = getRandomQuestions(5);
    setQuestions(newRandomQuestions);
    
    setCurrentQuestion(0);
    setShowScore(false);
    setSelectedOption(null);
    setShowExplanation(false);
    setExplanationVisible(false);
    setAnsweredQuestions(Array(5).fill(null));
    setFirstAnswers(Array(5).fill(null));
    setShowRetryOption(false);
    setQuizCompleted(false);
    setQuizResults(null);
    // Reset timer
    setTimeElapsed(0);
    setTimerRunning(true);
  };

  const handleOptionSelect = (optionIndex) => {
    if (!showExplanation && answeredQuestions[currentQuestion] === null) {
      setSelectedOption(optionIndex);
      setIsCorrect(optionIndex === questions[currentQuestion].correctAnswer);
    }
  };

  const checkAnswer = () => {
    if (selectedOption === null || questions.length === 0) return;

    setShowExplanation(true);
    setExplanationVisible(true);

    // Record the answer (only if not already answered)
    if (answeredQuestions[currentQuestion] === null) {
      const newAnsweredQuestions = [...answeredQuestions];
      newAnsweredQuestions[currentQuestion] = isCorrect;
      setAnsweredQuestions(newAnsweredQuestions);

      // Record first answer only
      const newFirstAnswers = [...firstAnswers];
      newFirstAnswers[currentQuestion] = isCorrect;
      setFirstAnswers(newFirstAnswers);
      
      // Show retry option if answer is wrong
      if (!isCorrect) {
        setShowRetryOption(true);
      }
    }

    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  const nextQuestion = () => {
    setShowExplanation(false);
    setExplanationVisible(false);
    setSelectedOption(null);
    setShowRetryOption(false);
    setCurrentQuestion(prev => {
      if (prev < questions.length - 1) {
        return prev + 1;
      } else {
        handleSubmit();
        return prev;
      }
    });
  };

  const goToQuestion = (index) => {
    setShowExplanation(false);
    setExplanationVisible(false);
    setSelectedOption(null);
    setShowRetryOption(false);
    setCurrentQuestion(index);
  };

  const tryAgain = () => {
    setShowExplanation(false);
    setExplanationVisible(false);
    setSelectedOption(null);
    setShowRetryOption(false);
    // Reset the current question's answered status but keep the first answer record
    const newAnsweredQuestions = [...answeredQuestions];
    newAnsweredQuestions[currentQuestion] = null;
    setAnsweredQuestions(newAnsweredQuestions);
  };

  const skipQuestion = () => {
    // Mark as answered but incorrect
    if (answeredQuestions[currentQuestion] === null) {
      const newAnsweredQuestions = [...answeredQuestions];
      newAnsweredQuestions[currentQuestion] = false;
      setAnsweredQuestions(newAnsweredQuestions);
      
      const newFirstAnswers = [...firstAnswers];
      newFirstAnswers[currentQuestion] = false;
      setFirstAnswers(newFirstAnswers);
    }
    
    // Move to next question
    nextQuestion();
  };

  const toggleExplanation = () => {
    setExplanationVisible(!explanationVisible);
  };

  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50 flex justify-center">
      {[...Array(100)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            y: -100,
            x: Math.random() * window.innerWidth - window.innerWidth / 2,
            rotate: Math.random() * 360
          }}
          animate={{
            y: window.innerHeight + 100,
            x: (Math.random() - 0.5) * 200,
            rotate: Math.random() * 360,
            opacity: [1, 0.5, 0]
          }}
          transition={{
            duration: 2,
            ease: "linear",
            delay: Math.random() * 0.5
          }}
          style={{
            width: 10,
            height: 10,
            backgroundColor: ['#FF5252', '#4CAF50', '#2196F3', '#FFEB3B'][Math.floor(Math.random() * 4)],
            position: 'absolute',
            borderRadius: '50%'
          }}
        />
      ))}
    </div>
  );

  // Calculate correct answers count
  const correctAnswersCount = firstAnswers.filter(answer => answer === true).length;

  // Modify the submit function to stop timer
  const handleSubmit = () => {
    // Stop the timer
    setTimerRunning(false);
    
    // Calculate results
    const results = {
      totalQuestions: questions.length,
      correctAnswers: firstAnswers.filter(answer => answer === true).length,
      wrongAnswers: firstAnswers.filter(answer => answer === false).length,
      skippedAnswers: firstAnswers.filter(answer => answer === null).length,
      timeElapsed: timeElapsed,
      questions: questions.map((q, index) => ({
        question: q.question,
        correct: firstAnswers[index] === true,
        category: q.category,
        difficulty: q.difficulty
      }))
    };
    
    // Set completed state and pass results
    setQuizCompleted(true);
    setQuizResults(results);
  };

  // Show loading state while questions are being loaded
  if (questions.length === 0) {
    return (
      <QuestionLayout title="Loading Quiz...">
        <Head title="Loading Quiz" />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading random questions...</div>
        </div>
      </QuestionLayout>
    );
  }

  // If quiz is completed, show the results page
  if (quizCompleted && quizResults) {
    return (
      <ResultQuizPage 
        quizType="objective" 
        objectiveResults={quizResults} 
        onTryAgain={resetQuiz} 
      />
    );
  }

  return (
    <QuestionLayout 
      title="Random Quiz (5 Questions)" 
      firstAnswers={firstAnswers}
      footer={
        !showScore && (
          <QuizFooter
            showExplanation={showExplanation}
            answeredQuestions={answeredQuestions}
            currentQuestion={currentQuestion}
            selectedOption={selectedOption}
            isCorrect={isCorrect}
            firstAnswers={firstAnswers}
            onCheckAnswer={checkAnswer}
            onNextQuestion={nextQuestion}
            onTryAgain={tryAgain}
            onSkipQuestion={skipQuestion}
            showRetryOption={showRetryOption}
            questions={questions}
            onQuestionSelect={goToQuestion}
          />
        )
      }
    >
      <Head title="Random Quiz" />

      <AnimatePresence>
        {showConfetti && <Confetti />}
      </AnimatePresence>

      <div className="bg-[url('https://cdn.vectorstock.com/i/500p/65/08/cartoon-college-classroom-vector-38246508.jpg')] bg-cover bg-top bg-no-repeat">
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* Header with quiz info */}
          <div className="flex justify-between items-center mb-4">
            <div className="bg-white rounded-lg shadow-md px-4 py-2">
              <span className="text-sm font-medium text-gray-600">Random Quiz • </span>
              <span className="text-sm text-blue-600">5 Questions</span>
            </div>
            
            {/* Timer display */}
            <div className="bg-white rounded-lg shadow-md px-4 py-2 flex items-center">
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg font-medium text-gray-800">{formatTime(timeElapsed)}</span>
            </div>
          </div>

          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
          >
            {/* Progress and navigation header */}
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium text-gray-600">
                  Question {currentQuestion + 1} of 5
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {questions[currentQuestion]?.category} • {questions[currentQuestion]?.difficulty}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Random selection
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Question text */}
              <motion.h2
                className="text-lg font-medium text-gray-800 mb-6"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {questions[currentQuestion].question}
              </motion.h2>

              <div className="text-sm text-gray-500 mb-4">Choose 1 answer:</div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {questions[currentQuestion].options.map((option, index) => (
                  <motion.button
                    key={index}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    onClick={() => handleOptionSelect(index)}
                    disabled={showExplanation && answeredQuestions[currentQuestion] !== null}
                    className={`w-full p-4 border-b text-left transition-all ${selectedOption === index
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                      } ${showExplanation && index === questions[currentQuestion].correctAnswer
                        ? "border-green-500 bg-green-50"
                        : ""
                      } ${showExplanation && selectedOption === index && !isCorrect ? "border-red-300 bg-red-50" : ""}`}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 mr-3 ${selectedOption === index
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-400"
                        } ${showExplanation && index === questions[currentQuestion].correctAnswer
                          ? "bg-green-500 text-white border-green-500"
                          : ""
                        } ${showExplanation && selectedOption === index && !isCorrect ? "bg-red-500 text-white border-red-500" : ""}`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className="text-gray-800">{option}</div>
                      {showExplanation && index === questions[currentQuestion].correctAnswer && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto text-green-500"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                          </svg>
                        </motion.div>
                      )}
                      {showExplanation && selectedOption === index && !isCorrect && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto text-red-500"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Explanation Toggle Button */}
              {showExplanation && (
                <div className="flex justify-center mb-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleExplanation}
                    className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <span>{explanationVisible ? "Hide Explanation" : "Show Explanation"}</span>
                    <motion.svg
                      animate={{ rotate: explanationVisible ? 180 : 0 }}
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </motion.button>
                </div>
              )}

              {/* Explanation */}
              {showExplanation && explanationVisible && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4"
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white mr-3 ${isCorrect ? "bg-green-500" : "bg-red-500"
                      }`}>
                      {isCorrect ?
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                        </svg> :
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                        </svg>
                      }
                    </div>
                    <div>
                      <h3 className={`font-medium ${isCorrect ? "text-green-800" : "text-red-800"}`}>
                        {isCorrect ? "Correct!" : "Incorrect!"}
                        {firstAnswers[currentQuestion] !== null && !isCorrect && (
                          <span className="text-xs text-gray-500 ml-2">(First attempt was wrong)</span>
                        )}
                      </h3>
                      <p className="text-gray-700 mt-1 text-sm">
                        {questions[currentQuestion].explanation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </QuestionLayout>
  );
}