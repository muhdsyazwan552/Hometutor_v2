import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MasteryChallenge({ isOpen, onClose, subjectKey }) {
  const [questionData, setQuestionData] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  // Fetch question from API
  useEffect(() => {
    if (isOpen) {
      fetch(`/api/challenge-question/${subjectKey}`)
        .then((res) => res.json())
        .then((data) => setQuestionData(data))
        .catch((err) => console.error("Error fetching challenge:", err));
    }
  }, [isOpen, subjectKey]);

  const handleCheckAnswer = () => {
    if (!selectedAnswer) return;
    const correct = questionData.answer.find((a) => a.is_correct_answer === "1");
    setIsCorrect(selectedAnswer.id === correct.id);
    setChecked(true);
  };

  const handleNext = () => {
    // For now just close (since only 1 question demo)
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-8 relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            {/* Question */}
            {questionData ? (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Mastery Challenge
                </h2>

                <div
                  className="text-lg text-gray-700 mb-6"
                  dangerouslySetInnerHTML={{ __html: questionData.question.question }}
                />

                {/* Answer Options */}
                <div className="space-y-3 mb-6">
                  {questionData.answer.map((ans) => (
                    <button
                      key={ans.id}
                      onClick={() => !checked && setSelectedAnswer(ans)}
                      className={`w-full text-left p-4 rounded-lg border transition
                        ${
                          selectedAnswer?.id === ans.id
                            ? "border-sky-500 bg-sky-50"
                            : "border-gray-300 hover:border-sky-400"
                        }
                        ${
                          checked && ans.is_correct_answer === "1"
                            ? "border-green-500 bg-green-50"
                            : ""
                        }
                        ${
                          checked &&
                          selectedAnswer?.id === ans.id &&
                          ans.is_correct_answer !== "1"
                            ? "border-red-500 bg-red-50"
                            : ""
                        }
                      `}
                    >
                      {ans.answer_option}
                    </button>
                  ))}
                </div>

                {/* Feedback */}
                {checked && (
                  <div
                    className={`p-4 rounded-lg mb-6 font-semibold ${
                      isCorrect
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {isCorrect ? "✅ Correct! Well done." : "❌ Incorrect. Try again."}
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={checked ? handleNext : handleCheckAnswer}
                  disabled={!selectedAnswer}
                  className={`w-full py-3 rounded-lg text-white font-bold ${
                    !selectedAnswer
                      ? "bg-gray-400 cursor-not-allowed"
                      : checked
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-sky-600 hover:bg-sky-700"
                  }`}
                >
                  {checked ? "Next Question →" : "Check Answer"}
                </button>
              </>
            ) : (
              <p className="text-gray-500">Loading question...</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
