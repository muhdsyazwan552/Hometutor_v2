// resources/js/Pages/courses/training/ResultQuestion.jsx
import React from "react";

export default function ResultQuestion({ objectiveResults, onTryAgain, onSubmitLeaderboard }) {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quiz Results</h1>

      <div className="space-y-3 mb-6">
        <p><strong>Total Questions:</strong> {objectiveResults.totalQuestions}</p>
        <p><strong>Correct:</strong> {objectiveResults.correctAnswers}</p>
        <p><strong>Wrong:</strong> {objectiveResults.wrongAnswers}</p>
        <p><strong>Skipped:</strong> {objectiveResults.skippedAnswers}</p>
        <p><strong>Time:</strong> {objectiveResults.timeElapsed}s</p>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onTryAgain}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
        >
          Try Again
        </button>
        {onSubmitLeaderboard && (
          <button
            onClick={() => onSubmitLeaderboard(objectiveResults)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Submit to Leaderboard
          </button>
        )}
      </div>
    </div>
  );
}
