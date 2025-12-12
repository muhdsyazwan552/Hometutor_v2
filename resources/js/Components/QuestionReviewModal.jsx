import React, { useState, useEffect } from 'react';
import { usePage, Head } from '@inertiajs/react';


const ReviewQuestionDisplay = ({ question }) => {
  if (!question) return <p className="text-gray-500">No question available</p>;

  const processQuestionHtml = (html) => {
    if (!html) return html;

    // Add responsive image handling
    let processed = html.replace(
      /<img([^>]*)>/g,
      '<img$1 class="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain mx-auto my-4">'
    );

    // Add styling to tables if present
    processed = processed.replace(
      /<table([^>]*)>/g,
      '<table$1 class="min-w-full divide-y divide-gray-200 border border-gray-300">'
    );

    // Add styling to lists
    processed = processed.replace(
      /<ul([^>]*)>/g,
      '<ul$1 class="list-disc pl-5 space-y-1 my-3">'
    );

    processed = processed.replace(
      /<ol([^>]*)>/g,
      '<ol$1 class="list-decimal pl-5 space-y-1 my-3">'
    );

    return processed;
  };

  const renderQuestionContent = () => {
    // Priority: HTML question text
    if (question.question_text) {
      const processedHtml = processQuestionHtml(question.question_text);

      return (
        <div className="question-content min-h-32">
          <div
            className="text-gray-800 leading-relaxed prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: processedHtml }}
          />
        </div>
      );
    }

    // Fallback: Question file (image)
    if (question.question_file) {
      const imageUrl = question.question_file.trim();

      if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('/') || imageUrl.startsWith('data:'))) {
        return (
          <div className="flex justify-center">
            <img
              src={imageUrl}
              alt="Question"
              className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/placeholder-question.png';
              }}
            />
          </div>
        );
      }
    }

    // Fallback: No content
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-500">No question content available</p>
      </div>
    );
  };

  return (
    <div className="question-display bg-white rounded-lg p-4">
      {renderQuestionContent()}
    </div>
  );
};

// Simplified ReviewOptionDisplay - Remove all duplicate letters
const ReviewOptionDisplay = ({ option, index, isChosen, isCorrect, wasCorrect, wasWrong }) => {
  const getOptionStyles = () => {
    if (wasCorrect) return 'bg-green-50 border-green-500';
    if (wasWrong) return 'bg-red-50 border-red-500';
    if (isCorrect) return 'bg-blue-50 border-blue-300';
    if (isChosen) return 'bg-yellow-50 border-yellow-300';
    return 'bg-gray-50 border-gray-300';
  };

  // Function to remove letter prefixes from text
  const removeLetterPrefix = (text, index) => {
    if (!text) return text;

    const letter = String.fromCharCode(65 + index);
    // Remove patterns like "A.", "A)", "A:", "A " at the beginning
    const regex = new RegExp(`^\\s*${letter}[\\.\\)\\:]?\\s*`, 'i');
    return text.replace(regex, '').trim();
  };

  const renderContent = () => {
    const cleanedText = removeLetterPrefix(option.text, index);

    if (option.has_html || option.type === 'html') {
      return (
        <div
          className="text-base prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: cleanedText }}
        />
      );
    }

    return <span className="text-base">{cleanedText}</span>;
  };

  const getStatusText = () => {
    if (wasCorrect) return 'Your Answer (Correct)';
    if (wasWrong) return 'Your Answer (Incorrect)';
    if (isCorrect) return 'Correct Answer';
    return '';
  };

  return (
    <div className={`w-full p-4 rounded-lg border-2 ${getOptionStyles()} transition-all duration-300`}>
      <div className="flex items-start">
        {/* Single letter indicator */}
        <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center mr-3 ${wasCorrect ? 'bg-green-500 text-white' :
            wasWrong ? 'bg-red-500 text-white' :
              isCorrect ? 'bg-blue-500 text-white' :
                isChosen ? 'bg-yellow-500 text-white' :
                  'bg-gray-200 text-gray-700'
          }`}>
          <span className="font-bold">
            {String.fromCharCode(65 + index)}
          </span>
        </div>

        {/* Content without duplicate letter */}
        <div className="flex-1">
          {renderContent()}

          {/* Status badge */}
          {getStatusText() && (
            <div className={`mt-2 px-3 py-1 rounded-full text-xs font-medium inline-block ${wasCorrect ? 'bg-green-100 text-green-800' :
                wasWrong ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
              }`}>
              {getStatusText()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ExplanationDisplay = ({ explanation }) => {
  if (!explanation || explanation === "Explanation not available.") {
    return null;
  }

  const processExplanationHtml = (html) => {
    if (!html) return html;

    // Add styling to explanation HTML
    let processed = html.replace(
      /<p([^>]*)>/g,
      '<p$1 class="mb-3 text-gray-700 leading-relaxed">'
    );

    // Add styling to key terms
    processed = processed.replace(
      /<strong>([^<]+)<\/strong>/g,
      '<strong class="font-semibold text-gray-900">$1</strong>'
    );

    // Add styling to lists in explanations
    processed = processed.replace(
      /<ul([^>]*)>/g,
      '<ul$1 class="list-disc pl-5 space-y-2 my-3">'
    );

    return processed;
  };

  return (
    <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <h4 className="font-semibold text-blue-800 text-lg">Explanation</h4>
      </div>

      <div className="ml-11">
        <div
          className="text-blue-900 text-base prose prose-blue max-w-none"
          dangerouslySetInnerHTML={{ __html: processExplanationHtml(explanation) }}
        />

        {/* Additional learning tips */}
        <div className="mt-4 pt-3 border-t border-blue-200">
          <p className="text-sm text-blue-700 font-medium">
            💡 <span className="font-semibold">Learning Tip:</span> Review this explanation carefully and try similar questions to reinforce your understanding.
          </p>
        </div>
      </div>
    </div>
  );
};

const SubjectiveAnswerDisplay = ({ attempt, questionType }) => {
  if (questionType !== 'subjective') return null;

  return (
    <div className="space-y-6">
      {/* User's Answer */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h4 className="font-semibold text-blue-800 text-lg">Your Answer</h4>
        </div>

        <div className="ml-13">
          {attempt.subjective_answer ? (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <pre className="whitespace-pre-wrap font-sans text-gray-800 text-base leading-relaxed">
                {attempt.subjective_answer}
              </pre>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No answer provided</p>
            </div>
          )}
        </div>
      </div>

      {/* Schema Answer */}
      <div className="bg-white border-2 border-green-200 rounded-lg p-5">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="font-semibold text-green-800 text-lg">Schema Answer</h4>
        </div>

        <div className="ml-13">
          {attempt.schema_answer ? (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              {typeof attempt.schema_answer === 'string' && attempt.schema_answer.includes('<') ? (
                <div
                  className="prose prose-green max-w-none"
                  dangerouslySetInnerHTML={{ __html: attempt.schema_answer }}
                />
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-green-900 text-base leading-relaxed">
                  {attempt.schema_answer}
                </pre>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No schema answer available</p>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

// Main component
export default function QuestionReviewModal({ isOpen, onClose, sessionId }) {
  const [session, setSession] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchQuestionAttempts();
    } else {
      resetState();
    }
  }, [isOpen, sessionId]);

  const fetchQuestionAttempts = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = route('session.review', { sessionId });
      console.log('Fetching question attempts from:', url);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSession(data.session);
        setAttempts(data.attempts);
      } else {
        throw new Error(data.error || 'Failed to load question attempts');
      }
    } catch (error) {
      console.error('Error fetching question attempts:', error);
      setError('Failed to load review data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setSession(null);
    setAttempts([]);
    setCurrentQuestionIndex(0);
    setError(null);
  };

  const currentAttempt = attempts[currentQuestionIndex] || {};
  const totalQuestions = attempts.length;

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return "0s";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 ">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Question Review
              </h2>
              {session && (
                <p className="text-gray-600 mt-1">
                  Session: {session.topic_name} • {session.created_at}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>



        </div>

        {/* Content */}
        <div className="p-6">
          {error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">{error}</div>
              <button
                onClick={fetchQuestionAttempts}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading review data...</p>
            </div>
          ) : attempts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-lg">No question attempts found for this session</p>
            </div>
          ) : (
            <>


              {/* Question List (Mini Navigation) */}
              <div className="mb-2">
                <h4 className="font-medium text-gray-700 mb-3">
                  All Questions ({totalQuestions})
                </h4>

                <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                  {attempts.map((attempt, index) => {
                    const isActive = currentQuestionIndex === index;

                    return (
                      <button
                        key={attempt.id}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`
            flex items-center justify-center
            h-10 w-full rounded-xl text-sm font-semibold transition-all
            border
            ${isActive
                            ? 'bg-blue-600 text-white shadow-lg  border-blue-600'
                            : attempt.is_correct
                              ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100'
                              : 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100'
                          }
          `}
                        title={`Question ${index + 1}: ${attempt.is_correct ? 'Correct' : 'Incorrect'}`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </div>


              {/* Question Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                {/* Question Number and Status */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-blue-700">Q{currentQuestionIndex + 1}</span>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentAttempt.question_type === 'objective'
                          ? (currentAttempt.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')
                          : 'bg-blue-100 text-blue-800'
                        }`}>
                        {currentAttempt.question_type === 'objective'
                          ? (currentAttempt.is_correct ? '✓ Correct' : '✗ Incorrect')
                          : '📝 Subjective'}
                      </span>
                      {currentAttempt.time_taken > 0 && (
                        <span className="ml-2 text-gray-500 text-sm">
                          ⏱️ Time: {formatTime(currentAttempt.time_taken || 0)}
                        </span>
                      )}
                    </div>
                  </div>

                  {currentAttempt.topic_name && (
                    <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                      📚 {currentAttempt.topic_name}
                    </div>
                  )}
                </div>

                {/* Question Display */}
                <div className="mb-8">
                  <ReviewQuestionDisplay question={currentAttempt} />
                </div>

                {/* Conditional Rendering based on Question Type */}
                {currentAttempt.question_type === 'objective' ? (
                  // Objective Question - Show Options
                  <div className="space-y-3 mb-8">
                    <h4 className="font-medium text-gray-700 mb-4">Answer Options:</h4>
                    {currentAttempt.answers && currentAttempt.answers.map((answer, index) => (
                      <ReviewOptionDisplay
                        key={answer.id || index}
                        option={answer}
                        index={index}
                        isChosen={answer.is_chosen}
                        isCorrect={answer.is_correct}
                        wasCorrect={answer.was_correct}
                        wasWrong={answer.was_wrong}
                      />
                    ))}
                  </div>
                ) : (
                  // Subjective Question - Show Answers and Schema
                  <SubjectiveAnswerDisplay
                    attempt={currentAttempt}
                    questionType={currentAttempt.question_type}
                  />
                )}

                {/* Explanation Display (for both types) */}
                {currentAttempt.question_type === 'objective' && (
                  <ExplanationDisplay explanation={currentAttempt.explanation} />
                )}
              </div>

              {/* Question Navigation */}
              <div className="flex justify-end items-center mb-8">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`px-4 py-2 rounded-md ${currentQuestionIndex === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    Previous
                  </button>

                  <div className="text-gray-700 font-medium">
                    Question <span className="text-blue-600">{currentQuestionIndex + 1}</span> of {totalQuestions}
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === totalQuestions - 1}
                    className={`px-4 py-2 rounded-md ${currentQuestionIndex === totalQuestions - 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    Next
                  </button>
                </div>


              </div>

            </>


          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div className="text-gray-600">
              {session && (
                <span className="text-sm">
                  Topic: <span className="font-medium">{session.topic_name}</span>
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}