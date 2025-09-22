// Pages/ResultQuizPage.jsx
import React from 'react';
import { Head } from '@inertiajs/react';
import QuestionLayout from '@/Layouts/QuestionLayout';
import { motion } from 'framer-motion';

export default function ResultQuizPage({ 
  quizType = "combined", // "objective", "subjective", or "combined"
  objectiveResults = null, 
  subjectiveResults = null,
  onTryAgain = null
}) {
  // Calculate overall scores
  const objectiveScore = objectiveResults 
    ? `${objectiveResults.correctAnswers}/${objectiveResults.totalQuestions}`
    : null;
    
  const subjectiveScore = subjectiveResults 
    ? `${subjectiveResults.score}/${subjectiveResults.totalQuestions}`
    : null;

  // Calculate time metrics for objective quiz
  const objectiveTotalTimeTaken = objectiveResults?.timeElapsed || 0;
  const objectiveAverageTimePerQuestion = objectiveResults 
    ? (objectiveTotalTimeTaken / objectiveResults.totalQuestions).toFixed(1)
    : 0;

  // Calculate time metrics for subjective quiz
  const subjectiveTotalTimeTaken = subjectiveResults?.timeElapsed || 0;
  const subjectiveAverageTimePerQuestion = subjectiveResults 
    ? (subjectiveTotalTimeTaken / subjectiveResults.totalQuestions).toFixed(1)
    : 0;

  // Format time function
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <QuestionLayout title="Quiz Results">
      <Head title="Quiz Results" />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h1>
            <p className="text-gray-600">Congratulations on finishing the quiz</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Objective Quiz Results Card */}
            {objectiveResults && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Objective Quiz</h2>
                </div>

                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-blue-600">{objectiveScore}</div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{objectiveResults.correctAnswers}</div>
                    <div className="text-sm text-green-800">Correct</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{objectiveResults.wrongAnswers}</div>
                    <div className="text-sm text-red-800">Wrong</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{objectiveResults.skippedAnswers || 0}</div>
                    <div className="text-sm text-yellow-800">Skipped</div>
                  </div>
                </div>

                {/* Time Metrics for Objective Quiz */}
                {objectiveResults.timeElapsed && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-3 text-center">Time Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-indigo-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <svg className="w-5 h-5 text-indigo-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xl font-bold text-indigo-600">{formatTime(objectiveTotalTimeTaken)}</span>
                        </div>
                        <div className="text-sm text-indigo-800">Total Time</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <svg className="w-5 h-5 text-purple-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xl font-bold text-purple-600">{objectiveAverageTimePerQuestion}s</span>
                        </div>
                        <div className="text-sm text-purple-800">Avg Per Question</div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Subjective Quiz Results Card */}
            {subjectiveResults && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Subjective Quiz</h2>
                </div>

                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-purple-600">{subjectiveScore}</div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{subjectiveResults.answered}</div>
                    <div className="text-sm text-blue-800">Answered</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">{subjectiveResults.skipped}</div>
                    <div className="text-sm text-gray-800">Skipped</div>
                  </div>
                </div>

                {/* Time Metrics for Subjective Quiz */}
                {subjectiveResults.timeElapsed && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-3 text-center">Time Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-indigo-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <svg className="w-5 h-5 text-indigo-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xl font-bold text-indigo-600">
                            {formatTime(subjectiveTotalTimeTaken)}
                          </span>
                        </div>
                        <div className="text-sm text-indigo-800">Total Time</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <svg className="w-5 h-5 text-purple-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xl font-bold text-purple-600">
                            {subjectiveAverageTimePerQuestion}s
                          </span>
                        </div>
                        <div className="text-sm text-purple-800">Avg Per Question</div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Performance Insights for Objective Quiz */}
          {objectiveResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-6"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Performance Insights - Objective Quiz</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {((objectiveResults.correctAnswers / objectiveResults.totalQuestions) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-800">Accuracy Rate</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {objectiveResults.correctAnswers}
                  </div>
                  <div className="text-sm text-green-800">Correct Answers</div>
                </div>
                
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <div className="text-3xl font-bold text-amber-600">
                    {objectiveResults.wrongAnswers + (objectiveResults.skippedAnswers || 0)}
                  </div>
                  <div className="text-sm text-amber-800">Incorrect + Skipped</div>
                </div>
              </div>

              {/* Time Analysis for Objective Quiz */}
              {objectiveResults.timeElapsed && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Time Analysis:</h4>
                  <p className="text-sm text-gray-600">
                    {objectiveAverageTimePerQuestion < 15 
                      ? "You answered questions quickly while maintaining good accuracy. Great job!" 
                      : objectiveAverageTimePerQuestion < 30 
                      ? "You took a reasonable amount of time to consider each question carefully."
                      : "You took your time with each question, which shows thorough consideration."
                    }
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Performance Insights for Subjective Quiz */}
          {subjectiveResults && subjectiveResults.timeElapsed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-6"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Performance Insights - Subjective Quiz</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {((subjectiveResults.answered / subjectiveResults.totalQuestions) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-800">Completion Rate</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {formatTime(subjectiveTotalTimeTaken)}
                  </div>
                  <div className="text-sm text-green-800">Total Time Spent</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {subjectiveAverageTimePerQuestion}s
                  </div>
                  <div className="text-sm text-purple-800">Average Time Per Question</div>
                </div>
              </div>
              
              {/* Time Analysis for Subjective Quiz */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Time Analysis:</h4>
                <p className="text-sm text-gray-600">
                  {subjectiveAverageTimePerQuestion < 30 
                    ? "You completed the questions efficiently while providing thoughtful answers." 
                    : subjectiveAverageTimePerQuestion < 60 
                    ? "You took a reasonable amount of time to craft your responses carefully."
                    : "You invested significant time in each response, demonstrating thorough consideration."
                  }
                </p>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 text-center"
          >
            <div className="flex justify-center space-x-4">
              {onTryAgain && (
                <button
                  onClick={onTryAgain}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-colors"
                >
                  Try Again
                </button>
              )}
              
              <button
                onClick={() => window.print()}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-colors"
              >
                Print Results
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </QuestionLayout>
  );
}