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
    <div className="bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white  shadow-lg p-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        {/* Question info */}
        <div className="text-md font-medium text-gray-50">
          Question <span className="text-white">{currentQuestion + 1}</span> / {questions.length}
        </div>
        
        {/* Action buttons - SIMPLIFIED VERSION */}
        <div className="flex space-x-2">
          {!showExplanation ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCheckAnswer}
              disabled={selectedOption === null}
              className={`rounded-lg p-3 text-white ${selectedOption === null ? 'bg-gray-600' : 'bg-blue-600'}`}
            >
              Check Answer
            </motion.button>
          ) : (
            // TAMPILKAN LANGSUNG NEXT BUTTON TANPA TRY AGAIN
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNextQuestion}
              className="p-3 rounded-lg bg-white text-blue-600 font-semibold"
            >
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}