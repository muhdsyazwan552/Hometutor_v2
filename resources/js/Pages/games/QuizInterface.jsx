import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { Head } from '@inertiajs/react';
import QuestionLayout from '@/Layouts/QuestionLayout';
import QuizFooter from '@/Components/QuizFooter';
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomQuestions } from '../../Data/QuizBank';

// Memoized Timer Display Component - COMPACT GAMING STYLE
const TimerDisplay = memo(({ timeElapsed }) => {
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow px-4 py-2 flex items-center border-2 border-yellow-400">
      <span className="text-lg mr-2">⏰</span>
      <span className="text-lg font-bold font-mono">{formatTime(timeElapsed)}</span>
    </div>
  );
});

// Memoized Question Options Component - COMPACT
const QuestionOptions = memo(({ 
  questions, 
  currentQuestion, 
  selectedOption, 
  showExplanation, 
  answeredQuestions, 
  handleOptionSelect,
  isCorrect 
}) => {
  return (
    <div className="space-y-3 mb-4">
      {questions[currentQuestion].options.map((option, index) => (
        <motion.button
          key={index}
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 + index * 0.05 }}
          onClick={() => handleOptionSelect(index)}
          disabled={showExplanation && answeredQuestions[currentQuestion] !== null}
          className={`w-full p-4 text-left transition-all duration-200 rounded-xl border-2 ${
            selectedOption === index
              ? "border-yellow-500 bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg transform scale-[1.02]"
              : "border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50"
          } ${
            showExplanation && index === questions[currentQuestion].correctAnswer
              ? "border-green-500 bg-gradient-to-r from-green-400 to-emerald-400 text-white"
              : ""
          } ${
            showExplanation && selectedOption === index && !isCorrect 
              ? "border-red-500 bg-gradient-to-r from-red-400 to-pink-400 text-white" 
              : ""
          }`}
        >
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 mr-3 font-bold ${
              selectedOption === index
                ? "bg-white text-orange-600 border-white"
                : "bg-gray-100 text-gray-700 border-gray-300"
            } ${
              showExplanation && index === questions[currentQuestion].correctAnswer
                ? "bg-white text-green-600 border-white"
                : ""
            } ${
              showExplanation && selectedOption === index && !isCorrect 
                ? "bg-white text-red-600 border-white" 
                : ""
            }`}>
              {String.fromCharCode(65 + index)}
            </div>
            <div className="text-base flex-1">{option}</div>
            {showExplanation && index === questions[currentQuestion].correctAnswer && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-2 text-xl"
              >
                ✅
              </motion.div>
            )}
            {showExplanation && selectedOption === index && !isCorrect && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-2 text-xl"
              >
                ❌
              </motion.div>
            )}
          </div>
        </motion.button>
      ))}
    </div>
  );
});

// Memoized Confetti Component
const Confetti = memo(() => (
  <div className="fixed inset-0 pointer-events-none z-50 flex justify-center">
    {[...Array(50)].map((_, i) => (
      <motion.div
        key={i}
        initial={{
          y: -50,
          x: Math.random() * window.innerWidth - window.innerWidth / 2,
          rotate: Math.random() * 360
        }}
        animate={{
          y: window.innerHeight + 50,
          x: (Math.random() - 0.5) * 100,
          rotate: Math.random() * 360,
          opacity: [1, 0.5, 0]
        }}
        transition={{
          duration: 1.5,
          ease: "linear",
          delay: Math.random() * 0.3
        }}
        style={{
          width: 8,
          height: 8,
          backgroundColor: ['#FF5252', '#4CAF50', '#2196F3', '#FFEB3B'][Math.floor(Math.random() * 4)],
          position: 'absolute',
          borderRadius: '50%'
        }}
      />
    ))}
  </div>
));

export default function QuizPage({ onQuizComplete }) {
  // [ALL STATE AND FUNCTION LOGIC REMAINS EXACTLY THE SAME]
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
  const intervalRef = useRef(null);

  // Load exactly 5 random questions
  const [questions, setQuestions] = useState([]);

  const [submittingResults, setSubmittingResults] = useState(false);

  // Initialize questions
  useEffect(() => {
    const randomQuestions = getRandomQuestions(5);
    setQuestions(randomQuestions);
    setAnsweredQuestions(Array(5).fill(null));
    setFirstAnswers(Array(5).fill(null));
  }, []);

  // Timer effect with useRef for better performance
  useEffect(() => {
    let intervalId;
    
    if (timerRunning && questions.length > 0) {
      intervalId = setInterval(() => {
        setTimeElapsed(seconds => seconds + 1);
      }, 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [timerRunning, questions.length]);

  // Start timer when questions are loaded
  useEffect(() => {
    if (questions.length > 0 && !timerRunning) {
      setTimerRunning(true);
    }
  }, [questions.length, timerRunning]);

  // Memoized calculations
  const correctAnswersCount = useMemo(() => 
    firstAnswers.filter(answer => answer === true).length, 
    [firstAnswers]
  );

  const resetQuiz = () => {
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
      setTimeout(() => setShowConfetti(false), 1500);
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
    
    const newAnsweredQuestions = [...answeredQuestions];
    newAnsweredQuestions[currentQuestion] = null;
    setAnsweredQuestions(newAnsweredQuestions);
  };

  const skipQuestion = () => {
    if (answeredQuestions[currentQuestion] === null) {
      const newAnsweredQuestions = [...answeredQuestions];
      newAnsweredQuestions[currentQuestion] = false;
      setAnsweredQuestions(newAnsweredQuestions);
      
      const newFirstAnswers = [...firstAnswers];
      newFirstAnswers[currentQuestion] = false;
      setFirstAnswers(newFirstAnswers);
    }
    
    nextQuestion();
  };

  const toggleExplanation = () => {
    setExplanationVisible(!explanationVisible);
  };

  const handleSubmit = () => {
    setTimerRunning(false);

    const results = {
      totalQuestions: questions.length,
      correctAnswers: firstAnswers.filter(answer => answer === true).length,
      wrongAnswers: firstAnswers.filter(answer => answer === false).length,
      skippedAnswers: firstAnswers.filter(answer => answer === null).length,
      timeElapsed,
      questions: questions.map((q, index) => ({
        question: q.question,
        correct: firstAnswers[index] === true,
        category: q.category,
        difficulty: q.difficulty
      }))
    };

    setQuizCompleted(true);
    setQuizResults(results);

    // Show loading state
    setSubmittingResults(true);

    // Call onQuizComplete after a brief delay to show loading
    setTimeout(() => {
      if (typeof onQuizComplete === "function") {
        onQuizComplete(results);
      }
      setSubmittingResults(false);
    }, 1500); // Show loading for 1.5 seconds
  };

  // Show loading state while questions are being loaded
  if (questions.length === 0) {
    return (
      <QuestionLayout title="Loading Quiz...">
        <Head title="Loading Quiz" />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">🎮 Loading Quest...</div>
        </div>
      </QuestionLayout>
    );
  }

 if (submittingQuiz) {
    return (
      <div className="min-h-screen bg-cover bg-center text-white flex items-center justify-center" style={{ backgroundImage: 'url(/images/background.jpg)' }}>
        <div className="text-center bg-gray-800 bg-opacity-90 p-8 rounded-2xl border-2 border-blue-500">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-4">Processing Your Results</h2>
          <p className="text-blue-300 mb-2">Calculating your score and rank...</p>
          <p className="text-gray-400 text-sm">Preparing to return to leaderboard</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
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

      <div className=" bg-cover bg-bottom bg-no-repeat min-h-screen" style={{ backgroundImage: 'url(/images/background_quiz.jpg)' }}>
        <div className="max-w-4xl mx-auto py-6 px-4">
          {/* Compact Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow px-4 py-2 border-2 border-yellow-400">
              <span className="font-bold">🎯 Quest </span>
              <span className="text-yellow-300 font-bold">5</span>
            </div>
            
            <TimerDisplay timeElapsed={timeElapsed} />
          </div>

          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-yellow-400"
          >
            {/* Compact Progress Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 border-b-2 border-yellow-400">
              <div className="flex justify-between items-center">
                <div className="text-white font-bold">
                  🗡️ {currentQuestion + 1}/5
                  <span className="ml-2 text-xs bg-yellow-400 text-gray-900 px-2 py-1 rounded-full">
                    {questions[currentQuestion]?.category}
                  </span>
                </div>
                <div className="text-yellow-300 text-xs font-bold">
                  ⚔️ Quest
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Question text - Compact */}
              <motion.h2
                className="text-xl font-bold text-gray-800 mb-6 text-center bg-blue-50 p-4 rounded-xl border border-blue-200"
                initial={{ y: -5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {questions[currentQuestion].question}
              </motion.h2>

              <div className="text-sm font-bold text-gray-600 mb-4 text-center">🎯 Choose Answer:</div>

              {/* Options */}
              <QuestionOptions
                questions={questions}
                currentQuestion={currentQuestion}
                selectedOption={selectedOption}
                showExplanation={showExplanation}
                answeredQuestions={answeredQuestions}
                handleOptionSelect={handleOptionSelect}
                isCorrect={isCorrect}
              />

              {/* Compact Explanation Toggle */}
              {showExplanation && (
                <div className="flex justify-center mb-4">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={toggleExplanation}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow hover:shadow-md transition duration-200 flex items-center gap-2"
                  >
                    <span>📖</span>
                    <span>{explanationVisible ? "Hide" : "Reveal"}</span>
                  </motion.button>
                </div>
              )}

              {/* Compact Explanation */}
              {showExplanation && explanationVisible && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="bg-green-50 p-4 rounded-xl border-2 border-green-400 mt-4"
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-lg mr-3 ${
                      isCorrect ? "bg-green-500" : "bg-red-500"
                    }`}>
                      {isCorrect ? "✓" : "!"}
                    </div>
                    <div>
                      <h3 className={`font-bold ${isCorrect ? "text-green-800" : "text-red-800"}`}>
                        {isCorrect ? "Correct! 🎉" : "Learn: "}
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