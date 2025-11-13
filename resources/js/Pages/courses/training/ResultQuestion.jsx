// resources/js/Pages/courses/training/ResultQuestion.jsx
import React from "react";
import { Link } from '@inertiajs/react';

export default function ResultQuestion({
  objectiveResults,
  subjectiveResults,
  onTryAgain,
  quizType = "objective",
  subject,
  standard,
  sectionId,
  contentId,
  topic,
  sectionTitle,
  topic_id,
  form,
  level_id,
  subject_id
}) {
  const results = quizType === "objective" ? objectiveResults : subjectiveResults;

  const handleBackToSubject = () => {
    // Construct the URL with all required parameters
    const params = new URLSearchParams({
      form: form || '',
      level_id: level_id || '',
      subject_id: subject_id || ''
    }).toString();

    window.location.href = `/subject/${subject}?${params}`;
  };

  // 🖨️ Print the received props to verify
  console.log('=== RESULT PAGE PROPS ===');
  console.log('Subject:', subject);
  console.log('Standard:', standard);
  console.log('Topic:', topic);
  console.log('Topic ID:', topic_id);
  console.log('Section ID:', sectionId);
  console.log('Content ID:', contentId);
  console.log('Section Title:', sectionTitle);
  console.log('=== END RESULT PROPS ===');

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

  // For objective quizzes: use correctAnswers, for subjective: all answered are correct
  const correctAnswers = quizType === "objective" ? results.correctAnswers : results.answered;
  const skippedAnswers = quizType === "objective" ? results.skippedAnswers : results.skipped;
  const score = quizType === "objective" ? results.score : results.answered;

  // Calculate accuracy based on quiz type
  const accuracyRate = quizType === "objective"
    ? Math.round((correctAnswers / results.totalQuestions) * 100)
    : Math.round((results.answered / results.totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Section */}
      <header className="bg-blue-950 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile & Tablet Header Layout */}
          <div className="lg:hidden">
            <div className="flex flex-col items-center py-4 space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={handleBackToSubject}
                  className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="text-center">
                  <h1 className="text-lg font-bold text-gray-50">
                    {topic}
                  </h1>
                  <p className="text-xs text-gray-50">Quiz Results</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-100">Completion Status</p>
                  <p className="text-xs text-green-600 font-semibold">
                    {skippedAnswers === 0 ? "Completed" : "In Progress"}
                  </p>
                </div>
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm">👤</span>
                </div>
              </div>
            </div>
          </div>

          {/* Web Header Layout - Unchanged */}
          <div className="hidden lg:flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={handleBackToSubject}
                className="flex-shrink-0 w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-50">
                  {topic}
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

        {/* Success Message Section */}
        <div className="text-center py-8 lg:my-16">
          <div className="flex items-center justify-center space-x-2 lg:space-x-4 mb-4">
            <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full"></div>
            <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full"></div>
            <p className="text-xl lg:text-3xl text-gray-100 font-semibold">Nice work!</p>
            <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full"></div>
            <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full"></div>
          </div>
          <p className="text-gray-100 italic text-base lg:text-2xl px-4">Learning never exhausts the mind.</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-4 lg:py-8 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto">
          {/* Main Results Card */}
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-8 mb-6 lg:mb-8 border border-gray-200">
            {/* Stats Grid - Responsive for tablet and mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
              {/* Total Question Card */}
              <div className="bg-green-50 rounded-lg lg:rounded-xl p-4 lg:p-6 border-2 border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm lg:text-lg font-semibold text-gray-700">Total Correct</h3>
                    <p className="text-2xl lg:text-3xl font-bold text-green-600 mt-1 lg:mt-2">
                      {quizType === "objective" ? results.correctAnswers : results.answered}
                    </p>
                  </div>
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-base lg:text-xl">✅</span>
                  </div>
                </div>
              </div>
              {/* Total Skipped Question Card */}
              <div className="bg-red-50 rounded-lg lg:rounded-xl p-4 lg:p-6 border-2 border-red-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm lg:text-lg font-semibold text-gray-700">Total Skipped</h3>
                    <p className="text-2xl lg:text-3xl font-bold text-red-600 mt-1 lg:mt-2">{skippedAnswers}</p>
                  </div>
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-base lg:text-xl">⏭️</span>
                  </div>
                </div>
              </div>

              {/* Total Time Taken Card */}
              <div className="bg-purple-50 rounded-lg lg:rounded-xl p-4 lg:p-6 border-2 border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm lg:text-lg font-semibold text-gray-700">Total Time</h3>
                    <p className="text-base lg:text-xl font-bold text-purple-600 mt-1 lg:mt-2">{formatTime(results.timeElapsed)}</p>
                  </div>
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-base lg:text-xl">⏱️</span>
                  </div>
                </div>
              </div>

              {/* Average Time Taken Card */}
              <div className="bg-orange-50 rounded-lg lg:rounded-xl p-4 lg:p-6 border-2 border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm lg:text-lg font-semibold text-gray-700">Average Time</h3>
                    <p className="text-base lg:text-xl font-bold text-orange-600 mt-1 lg:mt-2">{averageTimeFormatted}</p>
                  </div>
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-base lg:text-xl">📊</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Section */}
            <div className="bg-gray-50 rounded-lg lg:rounded-xl p-4 lg:p-6 mb-6 lg:mb-8 border-2 border-gray-200">
              <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-3 lg:mb-4">Analysis</h3>
              <div className="space-y-3 lg:space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm lg:text-base text-gray-600">Questions Attempted</span>
                  <span className="text-sm lg:text-base font-semibold text-gray-800">{results.totalQuestions - skippedAnswers}/{results.totalQuestions}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm lg:text-base text-gray-600">Accuracy Rate</span>
                  <span className="text-sm lg:text-base font-semibold text-green-600">
                    {accuracyRate}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm lg:text-base text-gray-600">Completion Status</span>
                  <span className="text-sm lg:text-base font-semibold text-blue-600">
                    {skippedAnswers === 0 ? "Fully Completed" : "Partially Completed"}
                  </span>
                </div>
              </div>
            </div>

            {/* All Done Section */}
            <div className="text-center mb-6 lg:mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-green-100 rounded-full mb-3 lg:mb-4">
                <span className="text-2xl lg:text-3xl">🎉</span>
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">All done!</h2>
              <p className="text-sm lg:text-base text-gray-600 px-4">You've completed this assessment successfully.</p>
            </div>

            {/* Action Buttons */}
            {/* <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center">
              <button
                onClick={onTryAgain}
                className="px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg lg:rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:scale-105 text-base lg:text-lg flex items-center justify-center"
              >
                <span className="mr-2">🔄</span>
                Try more
              </button>

              <Link
                href="/dashboard"
                className="px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg lg:rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-medium shadow-lg hover:scale-105 text-base lg:text-lg flex items-center justify-center text-center"
              >
                <span className="mr-2">📚</span>
                Next sub-topic
              </Link>
            </div> */}
          </div>

          {/* Review Section */}
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h3 className="text-lg lg:text-xl font-bold text-gray-800">Review</h3>
              <button className="px-3 py-2 lg:px-4 lg:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium w-full sm:w-auto text-center">
                View Detailed Report
              </button>
            </div>
            <p className="text-sm lg:text-base text-gray-600 mt-2">Review your answers and see detailed explanations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}