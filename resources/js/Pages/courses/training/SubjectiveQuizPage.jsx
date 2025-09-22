import React, { useState, useMemo, useEffect } from "react";
import QuestionLayout from "@/Layouts/QuestionLayout";
import ResultQuizPage from "@/Pages/courses/training/ResultQuizPage"; // Import the results page
import { getFeedbackMessage, getAnswerType } from "@/utils/answerFeedback";
// Commented out for now but keeping for future use
// import { 
//   calculateSimilarity, 
//   isAnswerCorrect, 
//   calculateScore 
// } from "@/utils/answerCalculator";

export default function SubjectiveQuizPage({ title = "Subjective Quiz" }) {
  const [open, setOpen] = useState(false);

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
  const [score, setScore] = useState(null);
  const [showScore, setShowScore] = useState(false);
  const [quizResults, setQuizResults] = useState(null); // Add state for quiz results
  
  // Timer state
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  
  // Commented out skip functionality for now
  // const [skippedQuestions, setSkippedQuestions] = useState([]);

  // per-question state
  const [checked, setChecked] = useState(Array(questions.length).fill(false));
  const [showSchema, setShowSchema] = useState(Array(questions.length).fill(false));
  const [isCorrect, setIsCorrect] = useState(Array(questions.length).fill(null));
  // Commented out similarity percentage for now
  // const [similarityPercent, setSimilarityPercent] = useState(Array(questions.length).fill(0));
  const [attempts, setAttempts] = useState(Array(questions.length).fill(0));

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

  // Calculate progress based on answered questions
  const progress = useMemo(() => {
    // Commented out skip functionality for now
    // const answeredCount = answers.filter(answer => answer.trim() !== "").length + skippedQuestions.length;
    const answeredCount = answers.filter(answer => answer.trim() !== "").length;
    return (answeredCount / questions.length) * 100;
  }, [answers, questions.length]); // Removed skippedQuestions from dependencies

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
    
    // Update attempts count
    const newAttempts = [...attempts];
    newAttempts[currentIndex] += 1;
    setAttempts(newAttempts);
    
    // Temporary implementation - always mark as correct for now
    const newIsCorrect = [...isCorrect];
    newIsCorrect[currentIndex] = true;
    setIsCorrect(newIsCorrect);
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

  const handleTryAgain = () => {
    const newChecked = [...checked];
    newChecked[currentIndex] = false;
    setChecked(newChecked);
    
    const newShowSchema = [...showSchema];
    newShowSchema[currentIndex] = false;
    setShowSchema(newShowSchema);
    
    const newIsCorrect = [...isCorrect];
    newIsCorrect[currentIndex] = null;
    setIsCorrect(newIsCorrect);
    
    setError("");
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
      score: answered, // Or calculate actual score if you implement scoring
      answered: answered,
      skipped: skipped,
      timeElapsed: timeElapsed, // Add time elapsed to results
      questions: questions.map((q, index) => ({
        question: q.text,
        answered: answers[index].trim() !== ""
      }))
    };
    
    // Set completed state and pass results
    setShowScore(true);
    setQuizResults(results);
  };

  const resetQuiz = () => {
    setAnswers(Array(questions.length).fill(""));
    setError("");
    setScore(null);
    setShowScore(false);
    setQuizResults(null);
    // Commented out skip functionality for now
    // setSkippedQuestions([]);
    setChecked(Array(questions.length).fill(false));
    setShowSchema(Array(questions.length).fill(false));
    setIsCorrect(Array(questions.length).fill(null));
    // Commented out similarity percentage reset for now
    // setSimilarityPercent(Array(questions.length).fill(0));
    setAttempts(Array(questions.length).fill(0));
    setCurrentIndex(0);
    // Reset timer
    setTimeElapsed(0);
    setTimerRunning(true);
  };

  // If quiz is completed, show the results page
  if (showScore && quizResults) {
    return (
      <ResultQuizPage 
        quizType="subjective" 
        subjectiveResults={quizResults} 
        onTryAgain={resetQuiz} 
      />
    );
  }

  // Original quiz UI remains unchanged below
  return (
    <QuestionLayout title={title}>
      <div className="max-w-4xl mx-auto py-10">
        {/* Timer display */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Question {currentIndex + 1} of {questions.length}
          </h2>
          
          <div className="bg-white rounded-lg shadow-md px-4 py-2 flex items-center">
            <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-lg font-medium text-gray-800">{formatTime(timeElapsed)}</span>
          </div>
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
        <p className="text-gray-700 mb-6">{questions[currentIndex].text}</p>

        {/* Answer input */}
        <textarea
          value={answers[currentIndex]}
          onChange={(e) => handleAnswerChange(e.target.value)}
          rows={2}
          className="w-full resize-none border-none underline underline-offset-8 focus:ring-0 text-lg font-medium mb-6 p-2 bg-blue-50 rounded-lg"
          placeholder="Type your answer here..."
          disabled={checked[currentIndex] && isCorrect[currentIndex]}
        />

        {/* Error */}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {/* Schema answer (only after check) */}
        {checked[currentIndex] && (
          <div className="mb-4">
            <button
              onClick={toggleSchema}
              className="mb-2 px-4 py-1 rounded-lg shadow bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium"
            >
              {showSchema[currentIndex] ? "Hide Schema" : "Show Schema"}
            </button>

            {showSchema[currentIndex] && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                <p className="text-green-800 font-semibold">Schema Answer:</p>
                <p className="text-green-700">{questions[currentIndex].schema}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex justify-between items-center">
          <button
            disabled={currentIndex === 0}
            onClick={handlePrev}
            className={`px-4 py-2 rounded-lg shadow text-sm font-medium ${
              currentIndex === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            Previous
          </button>

          <div className="flex gap-3">
            {!checked[currentIndex] ? (
              <button
                onClick={handleCheckAnswer}
                className="px-4 py-2 rounded-lg shadow bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium"
              >
                Check Answer
              </button>
            ) : !isCorrect[currentIndex] ? (
              <button
                onClick={handleTryAgain}
                className="px-4 py-2 rounded-lg shadow bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium"
              >
                Try Again
              </button>
            ) : currentIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-lg shadow bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg shadow bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </QuestionLayout>
  );
}