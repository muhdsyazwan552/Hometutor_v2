import React, { useState, useMemo } from "react";
import QuestionLayout from "@/Layouts/QuestionLayout";
import { getFeedbackMessage, getAnswerType } from "@/utils/answerFeedback";
import { 
  calculateSimilarity, 
  isAnswerCorrect, 
  calculateScore 
} from "@/utils/answerCalculator";

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
  const [skippedQuestions, setSkippedQuestions] = useState([]);

  // per-question state
  const [checked, setChecked] = useState(Array(questions.length).fill(false));
  const [showSchema, setShowSchema] = useState(Array(questions.length).fill(false));
  const [isCorrect, setIsCorrect] = useState(Array(questions.length).fill(null));
  const [similarityPercent, setSimilarityPercent] = useState(Array(questions.length).fill(0));
  const [attempts, setAttempts] = useState(Array(questions.length).fill(0));

  // Calculate progress based on answered questions
  const progress = useMemo(() => {
    const answeredCount = answers.filter(answer => answer.trim() !== "").length + skippedQuestions.length;
    return (answeredCount / questions.length) * 100;
  }, [answers, skippedQuestions, questions.length]);

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
    
    // Use the imported functions
    const similarity = calculateSimilarity(answers[currentIndex], questions[currentIndex].schema);
    const similarityPercentage = Math.round(similarity * 100);
    const correct = isAnswerCorrect(answers[currentIndex], questions[currentIndex].schema);
    
    const newIsCorrect = [...isCorrect];
    newIsCorrect[currentIndex] = correct;
    setIsCorrect(newIsCorrect);
    
    const newSimilarityPercent = [...similarityPercent];
    newSimilarityPercent[currentIndex] = similarityPercentage;
    setSimilarityPercent(newSimilarityPercent);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setError("");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setError("");
    }
  };

  const handleSkip = () => {
    if (!skippedQuestions.includes(currentIndex)) {
      setSkippedQuestions([...skippedQuestions, currentIndex]);
    }
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmit();
    }
    
    setError("");
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
    // Use the imported calculateScore function
    const result = calculateScore(answers, questions, skippedQuestions);
    setScore(result.score);
    setIsCorrect(result.correctness);
    setSimilarityPercent(result.similarityPercentages);
    setShowScore(true);
    
    console.log("Submitted answers:", answers);
    console.log("Score:", result.score, "/", questions.length - skippedQuestions.length);
    console.log("Skipped questions:", skippedQuestions);
  };

  const resetQuiz = () => {
    setAnswers(Array(questions.length).fill(""));
    setError("");
    setScore(null);
    setShowScore(false);
    setSkippedQuestions([]);
    setChecked(Array(questions.length).fill(false));
    setShowSchema(Array(questions.length).fill(false));
    setIsCorrect(Array(questions.length).fill(null));
    setSimilarityPercent(Array(questions.length).fill(0));
    setAttempts(Array(questions.length).fill(0));
    setCurrentIndex(0);
  };

  return (
    <QuestionLayout title={title}>
      <div className="max-w-4xl mx-auto py-10">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Score Display */}
        {showScore && (
          <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center text-blue-800 mb-4">
              Quiz Results
            </h2>
            <div className="flex justify-center items-center mb-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {score}/{questions.length - skippedQuestions.length}
                </div>
                <div className="text-gray-600">
                  {skippedQuestions.length > 0 && (
                    <span>(Skipped: {skippedQuestions.length})</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-2 mb-4">
              {questions.map((_, index) => {
                if (skippedQuestions.includes(index)) {
                  return (
                    <div 
                      key={index} 
                      className="p-2 rounded text-center bg-gray-300 text-white"
                      title={`Question ${index + 1}: Skipped`}
                    >
                      {index + 1}
                    </div>
                  );
                }
                
                return (
                  <div 
                    key={index} 
                    className={`p-2 rounded text-center text-white ${
                      isCorrect[index] ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    title={`Question ${index + 1}: ${isCorrect[index] ? 'Correct' : 'Incorrect'} (${similarityPercent[index]}% similar)`}
                  >
                    {index + 1}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 text-center">
              <button 
                onClick={resetQuiz}
                className="px-6 py-3 rounded-lg shadow bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {!showScore && (
          <>
            {/* Question number and status */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Question {currentIndex + 1} of {questions.length}
              {skippedQuestions.includes(currentIndex) && (
                <span className="ml-2 text-orange-600">(Skipped)</span>
              )}
              {isCorrect[currentIndex] !== null && !skippedQuestions.includes(currentIndex) && (
                <span className={`ml-2 ${isCorrect[currentIndex] ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect[currentIndex] ? '✓ Correct' : '✗ Incorrect'} 
                  {checked[currentIndex] && (
                    <span className="text-sm text-gray-600 ml-2">
                      ({similarityPercent[currentIndex]}% similar)
                    </span>
                  )}
                </span>
              )}
            </h2>

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
            {!skippedQuestions.includes(currentIndex) && (
              <textarea
                value={answers[currentIndex]}
                onChange={(e) => handleAnswerChange(e.target.value)}
                rows={2}
                className="w-full resize-none border-none underline underline-offset-8 focus:ring-0 text-lg font-medium mb-6 p-2 bg-blue-50 rounded-lg"
                placeholder="Type your answer here..."
                disabled={checked[currentIndex] && isCorrect[currentIndex]}
              />
            )}

            {skippedQuestions.includes(currentIndex) && (
              <div className="p-4 bg-gray-100 rounded-lg mb-6">
                <p className="text-gray-600 italic">You skipped this question.</p>
              </div>
            )}

            {/* Error */}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            {/* Schema answer (only after check) */}
            {checked[currentIndex] && !skippedQuestions.includes(currentIndex) && (
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
                    <div className="mt-2 flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            isCorrect[currentIndex] ? 'bg-green-600' : 'bg-red-600'
                          }`} 
                          style={{ width: `${similarityPercent[currentIndex]}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {similarityPercent[currentIndex]}% match - {isCorrect[currentIndex] ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    {!isCorrect[currentIndex] && (
                      <p className="text-red-600 text-sm mt-2">
                        Your answer needs to be more accurate. Pay attention to names and specific details.
                      </p>
                    )}
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
                {!skippedQuestions.includes(currentIndex) ? (
                  <>
                    {!checked[currentIndex] ? (
                      <>
                        <button
                          onClick={handleSkip}
                          className="px-4 py-2 rounded-lg shadow bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium"
                        >
                          Skip
                        </button>
                        <button
                          onClick={handleCheckAnswer}
                          className="px-4 py-2 rounded-lg shadow bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium"
                        >
                          Check Answer
                        </button>
                      </>
                    ) : !isCorrect[currentIndex] ? (
                      <>
                        <button
                          onClick={handleTryAgain}
                          className="px-4 py-2 rounded-lg shadow bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium"
                        >
                          Try Again
                        </button>
                        <button
                          onClick={handleSkip}
                          className="px-4 py-2 rounded-lg shadow bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium"
                        >
                          Skip Anyway
                        </button>
                      </>
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
                  </>
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
          </>
        )}
      </div>
    </QuestionLayout>
  );
}