// Components/QuizFooter.jsx - VERSI SIMPLIFIED
import React from 'react';
import { motion } from 'framer-motion';

export default function QuizFooter({
  showExplanation,
  answeredQuestions,
  currentQuestion,
  selectedOption,
  isCorrect,
  firstAnswers,
  onCheckAnswer,
  onNextQuestion,
  onTryAgain,
  onSkipQuestion,
  showRetryOption,
  questions,
  onQuestionSelect
}) {
  return (
    <div className="bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        {/* Question info */}
        <div className="text-sm font-medium text-gray-600">
          Question <span className="text-blue-600">{currentQuestion + 1}</span> / {questions.length}
        </div>
        
        {/* Action buttons - SIMPLIFIED VERSION */}
        <div className="flex space-x-2">
          {!showExplanation ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCheckAnswer}
              disabled={selectedOption === null}
              className={`px-4 py-2 rounded-lg text-white ${selectedOption === null ? 'bg-gray-400' : 'bg-blue-600'}`}
            >
              Check Answer
            </motion.button>
          ) : (
            // TAMPILKAN LANGSUNG NEXT BUTTON TANPA TRY AGAIN
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNextQuestion}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white"
            >
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}