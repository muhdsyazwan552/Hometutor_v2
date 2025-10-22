// resources/js/Pages/courses/training/ResultQuestion.jsx
import React from "react";
import { Link } from '@inertiajs/react';

export default function ResultQuestion({
  objectiveResults,
  subjectiveResults,
  onTryAgain,
  quizType = "objective" // "objective" or "subjective"
}) {
  const results = quizType === "objective" ? objectiveResults : subjectiveResults;

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-800">Loading Results...</h1>
        </div>
      </div>
    );
  }

  // Format time function - convert seconds to minutes and seconds
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} minutes ${seconds} seconds`;
  };

  // Calculate average time per question
  const averageTime = Math.round(results.timeElapsed / results.totalQuestions);
  const averageTimeFormatted = `${Math.floor(averageTime / 60)} minutes ${averageTime % 60} seconds`;

  // For subjective quizzes, all answered questions are considered correct
  const correctAnswers = quizType === "objective" ? results.correctAnswers : results.answered;
  const skippedAnswers = quizType === "objective" ? results.skippedAnswers : results.skipped;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Section */}
      <header className="bg-blue-950 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-50">
                  {quizType === "subjective" ? "Karangan Berpandukan Rangsangan" : "Korangan Berpandukan Rangsangan"}
                </h1>
                <p className="text-sm text-gray-50">Quiz Results</p>
              </div>
            </div>



            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-100">Completion Status</p>
                <p className="text-sm text-green-600 font-semibold">
                  {skippedAnswers === 0 ? "Completed" : "In Progress"}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-600">👤</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center my-16">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <p className="text-3xl text-gray-100 font-semibold">Nice work!</p>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <p className="text-gray-100 italic text-2xl">Learning never exhausts the mind.</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Success Message Section */}


          {/* Main Results Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">

            {/* Stats Grid - Matching the image layout */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
  {/* Total Question Card */}
  <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-100">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-700">Total Question</h3>
        <p className="text-3xl font-bold text-blue-600 mt-2">{results.totalQuestions}</p>
      </div>
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
        <span className="text-blue-600 text-xl">📝</span>
      </div>
    </div>
  </div>

  {/* Total Skipped Question Card */}
  <div className="bg-green-50 rounded-xl p-6 border-2 border-green-100">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-700">Total Skipped Question</h3>
        <p className="text-3xl font-bold text-green-600 mt-2">{skippedAnswers}</p>
      </div>
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
        <span className="text-green-600 text-xl">⏭️</span>
      </div>
    </div>
  </div>

  {/* Total Time Taken Card */}
  <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-100">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-700">Total Time Taken</h3>
        <p className="text-xl font-bold text-purple-600 mt-2">{formatTime(results.timeElapsed)}</p>
      </div>
      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
        <span className="text-purple-600 text-xl">⏱️</span>
      </div>
    </div>
  </div>

  {/* Average Time Taken Card */}
  <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-100">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-700">Average Time Taken</h3>
        <p className="text-xl font-bold text-orange-600 mt-2">{averageTimeFormatted}</p>
      </div>
      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
        <span className="text-orange-600 text-xl">📊</span>
      </div>
    </div>
  </div>
</div>

            {/* Analysis Section */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8 border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Analysis</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Questions Attempted</span>
                  <span className="font-semibold text-gray-800">{results.totalQuestions - skippedAnswers}/{results.totalQuestions}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Accuracy Rate</span>
                  <span className="font-semibold text-green-600">
                    {quizType === "objective"
                      ? `${Math.round((correctAnswers / results.totalQuestions) * 100)}%`
                      : "100%"
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Completion Status</span>
                  <span className="font-semibold text-blue-600">
                    {skippedAnswers === 0 ? "Fully Completed" : "Partially Completed"}
                  </span>
                </div>
              </div>
            </div>

            {/* All Done Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">All done!</h2>
              <p className="text-gray-600">You've completed this assessment successfully.</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onTryAgain}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:scale-105 text-lg flex items-center justify-center"
              >
                <span className="mr-2">🔄</span>
                Try more
              </button>

              <Link
                href="/dashboard"
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-medium shadow-lg hover:scale-105 text-lg flex items-center justify-center text-center"
              >
                <span className="mr-2">📚</span>
                Next sub-topic
              </Link>
            </div>
          </div>

          {/* Review Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Review</h3>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                View Detailed Report
              </button>
            </div>
            <p className="text-gray-600 mt-2">Review your answers and see detailed explanations.</p>
          </div>

        </div>
      </div>
    </div>
  );
}