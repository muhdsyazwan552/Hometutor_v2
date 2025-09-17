// resources/js/Pages/SubjectiveQuizPage.jsx
import React, { useState } from "react";
import QuestionLayout from "@/Layouts/QuestionLayout";

export default function SubjectiveQuizPage({ title = "Subjective Quiz" }) {
  const [open, setOpen] = useState(false);
  

  // Questions with related images & schema answers
  const questions = [
    {
      id: 1,
      text: "Based on the poster, what is the date of the trip?",
      image: "/images/subjective_question.png",
      schema: "12 August 2025",
    },
    {
      id: 2,
      text: "Who should students register with for the trip?",
      image: "/images/subjective_question.png",
      schema: "Pn. Aminah",
    },
    {
      id: 3,
      text: "How much is the payment per person?",
      image: "/images/subjective_question.png",
      schema: "RM50",
    },
    {
      id: 4,
      text: "What must all pupils wear during the trip?",
      image: "/images/subjective_question.png",
      schema: "School uniform",
    },
    {
      id: 5,
      text: "Name the teachers in charge of the trip.",
      image: "/images/subjective_question.png",
      schema: "Pn. Aminah and En. Rahman",
    },
  ];

   const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [error, setError] = useState("");
  const [showSchema, setShowSchema] = useState(false);
const [checked, setChecked] = useState(false); // track if answer was checked

  const handleAnswerChange = (value) => {
  const newAnswers = [...answers];
  newAnswers[currentIndex] = value;
  setAnswers(newAnswers);
  setError("");
};

const handleCheckAnswer = () => {
  if (!answers[currentIndex].trim()) {
    setError("⚠️ Please enter your answer before checking.");
    return;
  }
  setChecked(true);
  setShowSchema(true); // show by default on first check
};

const handleNext = () => {
  if (!answers[currentIndex].trim()) {
    setError("⚠️ Please enter your answer before proceeding.");
    return;
  }
  if (currentIndex < questions.length - 1) {
    setCurrentIndex(currentIndex + 1);
    setShowSchema(false);   // reset schema toggle
    setChecked(false);      // reset check state
  }
};

const handlePrev = () => {
  if (currentIndex > 0) {
    setCurrentIndex(currentIndex - 1);
    setShowSchema(false);   // reset schema toggle
    setChecked(false);      // reset check state
  }
};



  const handleSubmit = () => {
    console.log("Submitted answers:", answers);
    alert("Your answers have been submitted ✅");
    // TODO: send to backend (Inertia post)
  };

  return (
    <QuestionLayout title={title}>
      <div className="max-w-4xl mx-auto py-10">
        {/* Question number */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Question {currentIndex + 1} of {questions.length}
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
        <textarea
          value={answers[currentIndex]}
          onChange={(e) => handleAnswerChange(e.target.value)}
          rows={2}
          className="w-full resize-none border-none underline underline-offset-8 focus:ring-0 text-lg font-medium mb-6"
          placeholder="Type your answer here..."
        />

        {/* Error message */}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

  {/* Schema answer (toggleable, only after check) */}
{checked && (
  <div className="mb-4">
    <button
      onClick={() => setShowSchema((prev) => !prev)}
      className="mb-2 px-4 py-1 rounded-lg shadow bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium"
    >
      {showSchema ? "Hide Schema" : "Show Schema"}
    </button>

    {showSchema && (
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
            {!showSchema ? (
              <button
                onClick={handleCheckAnswer}
                className="px-4 py-2 rounded-lg shadow bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium"
              >
                Check Answer
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
