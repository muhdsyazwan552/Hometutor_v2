// Components/QuizFooter.jsx
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
    <div className=" bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        {/* Question navigation dots */}
        {/* Question navigation pagination */}
<div className="flex space-x-2">
  {/* {questions.map((_, index) => (
    <button
      key={index}
      onClick={() => onQuestionSelect(index)}
      className={`px-3 py-1 rounded-lg text-sm font-medium border 
        ${currentQuestion === index ? 'bg-blue-600 text-white border-blue-600' : 
          answeredQuestions[index] === true ? 'bg-green-500 text-white border-green-500' : 
          answeredQuestions[index] === false ? 'bg-red-500 text-white border-red-500' : 
          'bg-gray-200 text-gray-700 border-gray-300'}
      `}
    >
      {index + 1}
    </button>
  ))} */}
  <div className="text-sm font-medium text-gray-600">
  Question <span className="text-blue-600">{currentQuestion + 1}</span> / {questions.length}
</div>

</div>

        
        {/* Action buttons */}
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
            <>
              {showRetryOption ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onTryAgain}
                    className="px-4 py-2 rounded-lg bg-yellow-500 text-white"
                  >
                    Try Again
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onSkipQuestion}
                    className="px-4 py-2 rounded-lg bg-gray-500 text-white"
                  >
                    Skip
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onNextQuestion}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white"
                >
                  {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </motion.button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}