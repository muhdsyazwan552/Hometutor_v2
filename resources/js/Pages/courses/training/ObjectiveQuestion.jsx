import React, { useState, useEffect, useRef } from 'react';
import { Head, usePage, Link, router } from '@inertiajs/react';
import ObjectiveQuestionLayout from '@/Layouts/ObjectiveQuestionLayout';
import ResultQuestion from '@/Pages/courses/training/ResultQuestion';
import Calculator from '@/components/ScientificCalculator';
import PageDrawingTool from '@/components/PageDrawingTool';
import AutoNotes from '@/components/AutoNotes';

/**
 * QuestionDisplay Component
 * Displays the question content (text, images, or fallback)
 * 
 * @param {Object} question - The question object containing text, images, etc.
 * @returns {JSX.Element} - Rendered question content
 */
const QuestionDisplay = ({ question }) => {
  if (!question) return null;

  /**
   * Renders the question content based on available data
   * 
   * @returns {JSX.Element} - Formatted question content
   */
  const renderQuestionContent = () => {
    // If question has text content
    if (question.question_text) {
      // Process HTML content for better styling
      const processedHtml = question.question_text
        .replace(
          /<img([^>]*)>/g,
          '<img$1 class="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain mx-auto my-4" onerror="this.style.display=\'none\'; this.nextElementSibling?.style.display=\'block\';">'
        )
        .replace(/<br\s*\/?>/g, '<br class="my-3">')
        .replace(/(<br\s*\/?>\s*){2,}/g, '</p><p class="mb-4">')
        .replace(/<p([^>]*)>/g, '<p$1 class="mb-4 leading-relaxed">');

      return (
        <div className="relative">
          <div
            className="text-gray-800 leading-relaxed prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: processedHtml }}
          />
        </div>
      );
    }

    // If question has an image file
    if (question.question_file) {
      const imageUrl = question.question_file.trim();

      // Check if image URL is valid
      if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('/') || imageUrl.startsWith('data:'))) {
        return (
          <div className="flex justify-center">
            <img
              src={imageUrl}
              alt="Question"
              className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
              onError={(e) => {
                console.error('Failed to load question image:', imageUrl);
                e.target.style.display = 'none';
                // Add fallback message if image fails to load
                if (!e.target.parentNode.querySelector('.image-fallback')) {
                  const fallback = document.createElement('div');
                  fallback.className = 'image-fallback text-red-500 text-center p-4 bg-red-50 rounded-lg';
                  fallback.textContent = 'Failed to load question image';
                  e.target.parentNode.appendChild(fallback);
                }
              }}
              onLoad={() => {
                console.log('Question image loaded successfully:', imageUrl);
              }}
            />
          </div>
        );
      } else {
        console.warn('Invalid question_file format:', imageUrl);
      }
    }

    // Fallback when no question content is available
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No question content available</p>
        {question.question_text && (
          <p className="mt-2 text-sm text-gray-600">Question text: {question.question_text}</p>
        )}
      </div>
    );
  };

  return (
    <div className="question-content">
      {renderQuestionContent()}
    </div>
  );
};

/**
 * OptionDisplay Component
 * Displays individual answer options with interactive styling
 * 
 * @param {Object} option - The option data (text, HTML, etc.)
 * @param {number} index - Index of the option (0-based)
 * @param {boolean} isSelected - Whether this option is currently selected
 * @param {boolean} isCorrect - Whether this is the correct answer (shown after checking)
 * @param {boolean} isIncorrect - Whether this is an incorrect selected answer
 * @param {boolean} isDisabled - Whether this option is disabled (after answering)
 * @param {function} onClick - Click handler for selecting the option
 * @returns {JSX.Element} - Rendered option button
 */
/**
 * OptionDisplay Component
 * Displays individual answer options with interactive styling
 * Format: A.(image) - letter inline with image
 */
const OptionDisplay = ({ option, index, isSelected, isCorrect, isIncorrect, isDisabled, onClick }) => {
  /**
   * Determines the CSS classes based on option state
   */
  const getOptionStyles = () => {
    // Correct answer styling (green)
    if (isCorrect) {
      return 'bg-green-100 border-green-500 text-green-800 cursor-default animate-pulse';
    }
    // Incorrect answer styling (red with shake animation)
    if (isIncorrect) {
      return 'bg-red-100 border-red-500 text-red-800 cursor-default animate-shake';
    }
    // Selected but not yet checked (blue)
    if (isSelected) {
      return 'bg-blue-100 border-blue-500 text-blue-800';
    }
    // Disabled state (gray)
    if (isDisabled) {
      return 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed';
    }
    // Default/unselected state
    return 'bg-white border-gray-300 text-gray-800 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all duration-200';
  };

  /**
   * Renders the content inside the option button
   * Supports text, HTML, and image content
   * Format: A.(image) - inline layout
   */
  const renderOptionContent = () => {
    const optionText = option.text;
    const optionType = option.type || 'text';
    const hasHtml = option.has_html;
    const hasFile = option.file && option.type === 'image';
    const optionLetter = String.fromCharCode(65 + index);

    // Image option - INLINE layout
    if (hasFile) {
      return (
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Option letter */}
          <span className="font-bold text-base sm:text-lg md:text-xl text-gray-700 flex-shrink-0 min-w-[24px]">
            {optionLetter}.
          </span>

          {/* Image with optional text */}
          <div className="flex-1 flex items-center space-x-3">
            <div className="relative">
              <img
                src={option.file}
                alt={`Option ${optionLetter}`}
                className="max-w-full h-auto rounded-lg shadow-sm max-h-32 object-contain"
                onError={(e) => {
                  console.error('Failed to load option image:', option.file);
                  e.target.style.display = 'none';
                  if (!e.target.parentNode.querySelector('.image-fallback')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'image-fallback text-red-500 text-center p-2 bg-red-50 rounded-lg text-xs';
                    fallback.textContent = 'Image failed to load';
                    e.target.parentNode.appendChild(fallback);
                  }
                }}
              />
            </div>

            {/* Optional text next to image */}
            {optionText && (
              <span className="text-gray-600 text-sm md:text-base flex-1">
                {optionText}
              </span>
            )}
          </div>
        </div>
      );
    }

    // HTML content option
    if (hasHtml || optionType === 'html') {
      return (
        <div className="flex items-start">
          <span className="font-bold mr-3 sm:mr-4 text-base sm:text-lg flex-shrink-0">
            {optionLetter}.
          </span>
          <div
            className="text-sm md:text-base lg:text-base xl:text-lg prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: optionText }}
          />
        </div>
      );
    }

    // Plain text option - standard layout
    return (
      <div className="flex items-center">
        <span className="font-bold mr-3 sm:mr-4 text-base sm:text-lg">
          {optionLetter}.
        </span>
        <span className="text-sm md:text-base lg:text-base xl:text-lg">
          {optionText || `Option ${optionLetter}`}
        </span>
      </div>
    );
  };

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 ${getOptionStyles()}`}
    >
      {renderOptionContent()}
    </button>
  );
};

/**
 * Main ObjectiveQuestion Component
 * Handles the complete objective question quiz flow
 * 
 * @returns {JSX.Element} - The complete quiz interface
 */
export default function ObjectiveQuestion() {
  // Extract props from Inertia page
  const {
    subject,
    standard,
    sectionId,
    contentId,
    topic,
    sectionTitle,
    questions: initialQuestions,
    topic_id,
    subject_id,
    level_id,
    question_count,
    total_available
  } = usePage().props;

  // Quiz Data State
  const [questions, setQuestions] = useState(initialQuestions || []);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState({
    index: null,
    id: null
  });
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [questionAttemptCounts, setQuestionAttemptCounts] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [incorrectAnswers, setIncorrectAnswers] = useState(new Set());
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [firstTryResults, setFirstTryResults] = useState([]);
  const [hasCheckedFirstTry, setHasCheckedFirstTry] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCheckAgainDisabled, setIsCheckAgainDisabled] = useState(false);

  // Timer State
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [practiceStartTime, setPracticeStartTime] = useState(null);
  const [questionAttempts, setQuestionAttempts] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  // Tools State
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorMinimized, setCalculatorMinimized] = useState(false);
  const [calculatorPosition, setCalculatorPosition] = useState({ x: window.innerWidth - 350, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Drawing and Notes State
  const [showPageDrawing, setShowPageDrawing] = useState(false);
  const [noteClickCount, setNoteClickCount] = useState(0);
  const [showAutoNotes, setShowAutoNotes] = useState(false);

  // Get current question based on index
  const currentQuestion = questions[currentQuestionIndex] || { options: [] };

  const [showEarlyExitResults, setShowEarlyExitResults] = useState(false);
  const [earlyExitResults, setEarlyExitResults] = useState(null);

  // Audio references for sound effects
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);
  const successSoundRef = useRef(null);

  /**
   * Handle early exit and show results
   */
  const handleExitWithResults = async () => {
    // Calculate results for answered questions
    const correctAnswers = firstTryResults.filter(result =>
      result !== null && result.isCorrect
    ).length;

    const skippedAnswers = questions.length - answeredQuestions.size;
    const totalQuestions = questions.length;

    // Prepare results data
    const exitResults = {
      totalQuestions: totalQuestions,
      answered: answeredQuestions.size,
      correctAnswers: correctAnswers,
      skippedAnswers: skippedAnswers,
      timeElapsed: timeElapsed,
      score: Math.round((correctAnswers / totalQuestions) * 100),
      isComplete: false,
      completionType: 'early_exit',
      isEarlyExit: true,
      questions: questions.map((q, index) => {
        const result = firstTryResults[index];
        return {
          question: q.question_text || 'Question',
          answered: answeredQuestions.has(index),
          correct: result?.isCorrect || false,
          skipped: !answeredQuestions.has(index)
        };
      })
    };

    // Save the practice session first
    try {
      const endTime = new Date().toISOString();

      // Create question attempts array including UNFINISHED questions
      const allQuestionAttempts = [];

      // 1. Add already attempted questions
      questionAttempts.forEach(attempt => {
        allQuestionAttempts.push(attempt);
      });

      // 2. Add attempts for UNFINISHED questions (choosen_answer_id = 0, answer_status = 0)
      questions.forEach((question, index) => {
        // Skip questions that already have an attempt
        const hasExistingAttempt = questionAttempts.some(attempt =>
          attempt.question_id === question.id
        );

        if (!hasExistingAttempt) {
          // Create attempt for unfinished question
          const timeTaken = questionStartTime ? Math.floor((Date.now() - questionStartTime) / 1000) : 0;

          allQuestionAttempts.push({
            question_id: question.id,
            topic_id: topic_id,
            choosen_answer_id: 0, // Set to 0 for unfinished questions
            answer_status: 0, // Set to 0 (wrong) for unfinished questions
            question_type_id: 1,
            time_taken: 0,
            attempted_at: new Date().toISOString(),
            selected_index: null, // No selection
            is_first_attempt: false // Not a first attempt (wasn't attempted)
          });
        }
      });

      console.log('📤 Sending early exit data with unfinished questions:', {
        totalQuestions: totalQuestions,
        answeredQuestions: answeredQuestions.size,
        totalAttempts: allQuestionAttempts.length,
        attemptedQuestions: questionAttempts.length,
        unfinishedQuestions: allQuestionAttempts.length - questionAttempts.length
      });

      await router.post('/practice-session/objective', {
        subject_id: subject_id,
        topic_id: topic_id,
        start_at: practiceStartTime,
        end_at: endTime,
        total_correct: correctAnswers,
        total_skipped: skippedAnswers,
        total_time_seconds: timeElapsed,
        score: Math.round((correctAnswers / totalQuestions) * 100),
        question_attempts: allQuestionAttempts, // Send ALL attempts including unfinished
        first_try_data: firstTryResults.map((result, index) => ({
          question_id: questions[index]?.id,
          first_try_result: result ? result.isCorrect : null,
          chosen_answer_id: result ? result.answerId : 0 // 0 for unfinished
        }))
      });

      console.log('✅ Early exit session saved with unfinished questions');

      // AFTER saving, show results
      setEarlyExitResults(exitResults);
      setShowEarlyExitResults(true);
      setTimerRunning(false); // STOP THE TIMER HERE TOO

    } catch (error) {
      console.error('❌ Failed to save early exit session:', error);
      // Still show results even if save fails
      setEarlyExitResults(exitResults);
      setShowEarlyExitResults(true);
      setTimerRunning(false); // STOP THE TIMER EVEN ON ERROR
    }
  };


  /**
   * Go back to quiz from results
   */
  const handleBackToQuiz = () => {
    setShowEarlyExitResults(false);
    setTimerRunning(false);
  };

  /**
   * Handle exit confirmation from layout
   */
  const handleExitConfirmation = () => {
    // Show custom confirmation
    const shouldShowResults = window.confirm(
      `You have answered ${answeredQuestions.size} out of ${questions.length} questions.\n\n` +
      'Do you want to:\n' +
      '• "OK" - See your results and exit\n' +
      '• "Cancel" - Return to quiz'
    );

    if (shouldShowResults) {
      handleExitWithResults();
    }
  };

  /**
   * Handle regular exit (without showing results)
   */
  const handleExitQuiz = async () => {
    // Stop the timer
    setTimerRunning(false);

    const correctAnswers = firstTryResults.filter(result =>
      result !== null && result.isCorrect
    ).length;
    const skippedAnswers = questions.length - answeredQuestions.size;
    const endTime = new Date().toISOString();

    try {
      // Create question attempts array including UNFINISHED questions
      const allQuestionAttempts = [];

      // 1. Add already attempted questions
      questionAttempts.forEach(attempt => {
        allQuestionAttempts.push(attempt);
      });

      // 2. Add attempts for UNFINISHED questions (choosen_answer_id = 0, answer_status = 0)
      questions.forEach((question, index) => {
        // Skip questions that already have an attempt
        const hasExistingAttempt = questionAttempts.some(attempt =>
          attempt.question_id === question.id
        );

        if (!hasExistingAttempt) {
          // Create attempt for unfinished question
          const timeTaken = questionStartTime ? Math.floor((Date.now() - questionStartTime) / 1000) : 0;

          allQuestionAttempts.push({
            question_id: question.id,
            topic_id: topic_id,
            choosen_answer_id: 0, // Set to 0 for unfinished questions
            answer_status: 0, // Set to 0 (wrong) for unfinished questions
            question_type_id: 1,
            time_taken: 0,
            attempted_at: new Date().toISOString(),
            selected_index: null, // No selection
            is_first_attempt: false // Not a first attempt (wasn't attempted)
          });
        }
      });

      await router.post('/practice-session/objective', {
        subject_id: subject_id,
        topic_id: topic_id,
        start_at: practiceStartTime,
        end_at: endTime,
        total_correct: correctAnswers,
        total_skipped: skippedAnswers,
        total_time_seconds: timeElapsed,
        score: Math.round((correctAnswers / questions.length) * 100),
        question_attempts: allQuestionAttempts, // Send ALL attempts including unfinished
        first_try_data: firstTryResults.map((result, index) => ({
          question_id: questions[index]?.id,
          first_try_result: result ? result.isCorrect : null,
          chosen_answer_id: result ? result.answerId : 0 // 0 for unfinished
        }))
      });

      console.log('✅ Session saved for early exit with all questions');
      window.history.back();

    } catch (error) {
      console.error('❌ Failed to save session:', error);
      alert('Failed to save your progress. Please try again.');
    }
  };

  /**
 * Handle back navigation logic
 */
  const handleBackNavigation = () => {
    // If there's progress, show custom confirmation
    if (answeredQuestions.size > 0 || questionAttempts.length > 0) {
      // Use the exit confirmation handler that shows results
      handleExitConfirmation();
    } else {
      // No progress, just go back
      window.history.back();
    }
  };


  // ============================
  // USE EFFECTS
  // ============================

  /**
   * Debug logging for question and option data
   * Runs when currentQuestion or selectedAnswer changes
   */
  useEffect(() => {
    console.log('=== QUESTION DATABASE INFO ===');
    console.log('Subject:', subject);
    console.log('Standard:', standard);
    console.log('Topic:', topic);
    console.log('Topic ID:', topic_id);
    console.log('Questions loaded:', initialQuestions?.length || 0);
    console.log('Total available in database:', total_available || 'N/A');

    if (currentQuestion && currentQuestion.options) {
      console.log('=== DEBUG: Option Data Structure ===');
      console.log('Selected Answer:', selectedAnswer);
      console.log('Current Question Options:', currentQuestion.options);
      console.log('Options have IDs:', currentQuestion.options.map(opt => ({
        text: opt.text?.substring(0, 30) + '...',
        id: opt.id,
        hasId: !!opt.id
      })));
      console.log('=== END DEBUG ===');
    }
  }, [currentQuestion, selectedAnswer, subject, standard, topic, topic_id, initialQuestions, total_available]);

  useEffect(() => {
    console.log('=== DEBUG: Initial Questions Data ===');
    console.log('Questions array:', initialQuestions);
    console.log('Questions count:', initialQuestions?.length);

    if (initialQuestions && initialQuestions.length > 0) {
      initialQuestions.forEach((q, i) => {
        console.log(`Question ${i + 1}:`, {
          id: q.id,
          question_text: q.question_text ? 'Has text' : 'No text',
          question_file: q.question_file ? 'Has file: ' + q.question_file : 'No file',
          question_type: q.question_type,
          options_count: q.options?.length,
          options_preview: q.options?.map(opt => ({
            id: opt.id,
            text_preview: opt.text?.substring(0, 30) + '...',
            type: opt.type
          }))
        });
      });
    }
  }, [initialQuestions]);

  /**
   * Debug initial question data structure
   * Runs once when component mounts with initial questions
   */
  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      console.log('🔍 Initial questions data structure:');
      initialQuestions.forEach((q, i) => {
        console.log(`Question ${i + 1}:`, {
          id: q.id,
          optionsCount: q.options?.length,
          optionsWithIds: q.options?.map(opt => ({
            hasId: !!opt.id,
            id: opt.id,
            textPreview: opt.text?.substring(0, 30) + '...'
          }))
        });
      });
    }
  }, [initialQuestions]);

  /**
   * Initialize practice session timer
   * Starts when questions are loaded
   */
  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      const startTime = new Date().toISOString();
      setPracticeStartTime(startTime);
      setTimerRunning(true);
      console.log('📝 Practice session started at:', startTime);
    }
  }, [initialQuestions]);

  /**
   * Initialize questions and first-try tracking
   * Sets up the quiz state from initial props
   */
  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      setQuestions(initialQuestions);
      setFirstTryResults(Array(initialQuestions.length).fill(null));
      setTimerRunning(true);

      console.log('📚 Questions initialized:', {
        count: initialQuestions.length,
        questions: initialQuestions.map(q => ({
          id: q.id,
          type: q.question_type,
          hasText: !!q.question_text,
          hasImage: !!q.question_file,
          options: q.options?.length || 0
        }))
      });
    }
  }, [initialQuestions]);

  /**
   * Timer effect - increments time every second
   * Runs when timerRunning state changes
   */
  useEffect(() => {
    let interval = null;

    if (timerRunning) {
      interval = setInterval(() => {
        setTimeElapsed(seconds => seconds + 1);
      }, 1000);
    } else if (!timerRunning && timeElapsed !== 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timerRunning]);

  /**
   * Reset timer for each new question
   * Runs when currentQuestionIndex changes
   */
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  /**
   * Save practice session to server when quiz completes
   */
  // useEffect(() => {
  //   if (quizCompleted) {
  //     savePracticeSession();
  //   }
  // }, [quizCompleted]);

  /**
   * Handle browser back/refresh with unsaved progress
   */
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (answeredQuestions.size > 0 || questionAttempts.length > 0) {
        e.preventDefault();
        e.returnValue = 'You have unsaved quiz progress. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [answeredQuestions.size, questionAttempts.length]);

  // ============================
  // HELPER FUNCTIONS
  // ============================

  /**
   * Saves the complete practice session data to the server
   * Includes attempts, timing, and first-try results
   */
  const savePracticeSession = async () => {
    const endTime = new Date().toISOString();

    console.log('📤 Sending practice session data:', {
      score: score,
      answeredCount: answeredQuestions.size,
      totalQuestions: questions.length,
      attemptsCount: questionAttempts.length
    });

    try {
      // Create question attempts array including UNFINISHED questions
      const allQuestionAttempts = [];

      // 1. Add already attempted questions
      questionAttempts.forEach(attempt => {
        allQuestionAttempts.push(attempt);
      });

      // 2. Add attempts for UNFINISHED questions (choosen_answer_id = 0, answer_status = 0)
      questions.forEach((question, index) => {
        // Skip questions that already have an attempt
        const hasExistingAttempt = questionAttempts.some(attempt =>
          attempt.question_id === question.id
        );

        if (!hasExistingAttempt) {
          // Create attempt for unfinished question
          const timeTaken = questionStartTime ? Math.floor((Date.now() - questionStartTime) / 1000) : 0;

          allQuestionAttempts.push({
            question_id: question.id,
            topic_id: topic_id,
            choosen_answer_id: 0, // Set to 0 for unfinished questions
            answer_status: 0, // Set to 0 (wrong) for unfinished questions
            question_type_id: 1,
            time_taken: 0,
            attempted_at: new Date().toISOString(),
            selected_index: null, // No selection
            is_first_attempt: false // Not a first attempt (wasn't attempted)
          });
        }
      });

      console.log('📤 All question attempts (including unfinished):', {
        totalAttempts: allQuestionAttempts.length,
        attempted: questionAttempts.length,
        unfinished: allQuestionAttempts.length - questionAttempts.length
      });

      // Use await to ensure the save completes before continuing
      await router.post('/practice-session/objective', {
        subject_id: subject_id,
        topic_id: topic_id,
        start_at: practiceStartTime,
        end_at: endTime,
        total_correct: score,
        total_skipped: questions.length - answeredQuestions.size,
        total_time_seconds: timeElapsed,
        score: Math.round((score / questions.length) * 100),
        question_attempts: allQuestionAttempts, // Send ALL attempts including unfinished
        first_try_data: firstTryResults.map((result, index) => ({
          question_id: questions[index]?.id,
          first_try_result: result ? result.isCorrect : null,
          chosen_answer_id: result ? result.answerId : 0 // 0 for unfinished
        }))
      }, {
        preserveState: true, // This is important - preserves component state
        preserveScroll: true
      });

      console.log('✅ Practice session saved successfully with all questions');

    } catch (error) {
      console.error('❌ Failed to save practice session:', error);
      throw error; // Re-throw to handle in calling function
    }
  };

  // Get current topic name (fallback to 'General')
  const currentTopic = topic || 'General';

  /**
   * Gets the section title for display
   * Falls back to topic name or section ID
   */
  const getSectionTitle = () => {
    return sectionTitle || topic || `Section ${sectionId}`;
  };

  /**
   * Formats subject name from kebab-case to Title Case
   * 
   * @param {string} subject - The subject name in kebab-case
   * @returns {string} - Formatted subject name
   */
  const formatSubjectName = (subject) => {
    if (!subject) return "Subject";
    return subject.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  /**
   * Plays sound effects based on answer result
   * 
   * @param {string} type - Type of sound ('correct', 'wrong', 'success')
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  const playSound = (type, volume = 1.0) => {
    let audio;

    if (type === "correct") {
      audio = new Audio("/sounds/correct.mp3");
    } else if (type === "wrong") {
      audio = new Audio("/sounds/wrong.mp3");
    } else if (type === "success") {
      audio = new Audio("/sounds/success.mp3");
    }

    if (audio) {
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play();
    }
  };

  // ============================
  // EVENT HANDLERS
  // ============================

  /**
   * Handles selection of an answer option
   * 
   * @param {number} answerIndex - Index of the selected option (0-based)
   */
  const handleAnswerSelect = (answerIndex) => {
    // Prevent selection if question already answered
    if (answeredQuestions.has(currentQuestionIndex)) {
      return;
    }

    const selectedOption = currentQuestion.options[answerIndex];

    console.log('🎯 Selected option:', {
      index: answerIndex,
      option: selectedOption,
      hasId: !!selectedOption?.id,
      id: selectedOption?.id
    });

    setSelectedAnswer({
      index: answerIndex,
      id: selectedOption?.id || null,
      option: selectedOption
    });

    // RE-ENABLE THE CHECK AGAIN BUTTON when user selects a new answer
    setIsCheckAgainDisabled(false);
  };

  /**
   * Checks the selected answer and updates quiz state
   * Handles correct/incorrect logic, scoring, and first-try tracking
   */
  const handleCheckAnswer = () => {
    // Prevent checking if no answer selected
    if (selectedAnswer.index === null) return;

    const isCorrect = selectedAnswer.index === currentQuestion.correctAnswer;
    const isFirstAttempt = firstTryResults[currentQuestionIndex] === null;

    // HANYA SIMPAN JIKA FIRST ATTEMPT
    if (isFirstAttempt) {
      // Calculate time taken for this question
      const timeTaken = questionStartTime ? Math.floor((Date.now() - questionStartTime) / 1000) : 0;

      console.log('🎯 FIRST ATTEMPT DATA (Will be saved):', {
        questionId: currentQuestion.id,
        questionIndex: currentQuestionIndex,
        selectedAnswerIndex: selectedAnswer.index,
        selectedAnswerId: selectedAnswer.id,
        isCorrect: isCorrect,
        correctAnswerIndex: currentQuestion.correctAnswer,
        chosenAnswerId: selectedAnswer.id
      });

      // Create attempt data for server - ONLY FOR FIRST ATTEMPT
      const attemptData = {
        question_id: currentQuestion.id,
        topic_id: topic_id,
        choosen_answer_id: selectedAnswer.id || 0,
        answer_status: isCorrect ? 1 : 0,
        question_type_id: 1,
        time_taken: timeTaken,
        attempted_at: new Date().toISOString(),
        selected_index: selectedAnswer.index,
        is_first_attempt: true  // Tandakan sebagai cubaan pertama
      };

      // Update question attempts list
      setQuestionAttempts(prev => {
        // Check if we already have an attempt for this question
        const hasExistingAttempt = prev.some(attempt =>
          attempt.question_id === currentQuestion.id
        );

        // Only add if no existing attempt (first attempt only)
        if (!hasExistingAttempt) {
          return [...prev, attemptData];
        }
        return prev;
      });

      // Track first-try results
      const newFirstTryResults = [...firstTryResults];
      newFirstTryResults[currentQuestionIndex] = {
        isCorrect: isCorrect,
        answerId: selectedAnswer.id || 0,
        selectedIndex: selectedAnswer.index
      };
      setFirstTryResults(newFirstTryResults);
      setHasCheckedFirstTry(true);
    }

    // Update answer correctness state
    setIsAnswerCorrect(isCorrect);

    // Handle correct answer
    if (isCorrect) {
      playSound('correct', 1.0);

      // Celebrate first-time correct answer
      if (isFirstAttempt) {
        playSound('success', 0.1);
        triggerCelebration();
      }

      // Mark question as answered
      setAnsweredQuestions(prev => new Set(prev).add(currentQuestionIndex));

      // Update score if first attempt
      if (isFirstAttempt) {
        setScore(score + 1);
      }

      // Show explanation
      setShowExplanation(true);

      // Re-enable check again button if it was disabled
      setIsCheckAgainDisabled(false);
    } else {
      // Handle incorrect answer
      playSound('wrong', 0.1);

      // Mark this option as incorrect
      setIncorrectAnswers(prev => new Set(prev).add(selectedAnswer.index));
      setIsAnswerCorrect(false);

      // DISABLE THE CHECK AGAIN BUTTON when answer is wrong
      setIsCheckAgainDisabled(true);

      // Reset selection for first-try incorrect (allow retry)
      if (isFirstAttempt) {
        setSelectedAnswer({
          index: null,
          id: null
        });
      }
    }
  };
  /**
   * Triggers celebration animation for first-time correct answer
   * Shows confetti and auto-hides after 2 seconds
   */
  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  };


  /**
 * Advances to the next question or finishes quiz
 */
  const handleNextQuestion = async () => {
    // If more questions exist, go to next
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer({
        index: null,
        id: null
      });
      setShowExplanation(false);
      setIsAnswerCorrect(null);
      setIncorrectAnswers(new Set());
      setHasCheckedFirstTry(false);
      setIsCheckAgainDisabled(false);
      setQuestionStartTime(Date.now());
    } else {
      // If last question, complete quiz
      setTimerRunning(false); // STOP THE TIMER FIRST

      try {
        // Call savePracticeSession directly before setting quizCompleted
        await savePracticeSession();

        // After successful save, show the results
        setQuizCompleted(true);

      } catch (error) {
        console.error('❌ Failed to save session:', error);
        // Even if save fails, still show results
        setQuizCompleted(true);
      }
    }
  };

  /**
   * Restarts the quiz with new questions
   * Resets all state and fetches new questions
   */
  const handleRestartQuiz = () => {
    setLoading(true);

    router.post('/objective-page/restart', {
      topic_id: topic_id,
      topic: topic,
      subject: subject,
    }, {
      onSuccess: (page) => {
        const newQuestions = page.props.questions || [];
        setQuestions(newQuestions);
        setCurrentQuestionIndex(0);
        setSelectedAnswer({
          index: null,
          id: null
        });
        setShowExplanation(false);
        setScore(0);
        setQuizCompleted(false);
        setAnsweredQuestions(new Set());
        setIncorrectAnswers(new Set());
        setIsAnswerCorrect(null);
        setFirstTryResults(Array(newQuestions.length).fill(null));
        setHasCheckedFirstTry(false);
        setShowCelebration(false);
        setTimeElapsed(0);
        setTimerRunning(true);
        setQuestionAttempts([]);
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
        setCurrentQuestionIndex(0);
        setSelectedAnswer({
          index: null,
          id: null
        });
        setShowExplanation(false);
        setScore(0);
        setQuizCompleted(false);
        setAnsweredQuestions(new Set());
        setIncorrectAnswers(new Set());
        setIsAnswerCorrect(null);
        setFirstTryResults(Array(questions.length).fill(null));
        setHasCheckedFirstTry(false);
        setShowCelebration(false);
        setTimeElapsed(0);
        setTimerRunning(true);
        setQuestionAttempts([]);
      }
    });
  };

  // ============================
  // UTILITY FUNCTIONS
  // ============================

  /**
   * Formats seconds into HH:MM:SS or MM:SS time string
   * 
   * @param {number} totalSeconds - Total seconds to format
   * @returns {string} - Formatted time string
   */
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  /**
   * Determines timer color based on elapsed time
   * Green (<5 min), Yellow (5-10 min), Red (>10 min)
   * 
   * @returns {string} - Tailwind CSS color class
   */
  const getTimeColor = () => {
    if (timeElapsed < 300) return 'text-green-600';
    if (timeElapsed < 600) return 'text-yellow-600';
    return 'text-red-600';
  };

  // ============================
  // SUB-COMPONENTS
  // ============================

  /**
   * ProgressCircles Component
   * Shows circular indicators for each question with color coding:
   * - Gray: Not attempted
   * - Green: Correct on first try
   * - Red: Incorrect on first try
   * - Blue: Current question
   * 
   * @returns {JSX.Element} - Progress circles row
   */
  const ProgressCircles = () => (
    <div className="flex justify-center space-x-2 md:space-x-2 mb-2 md:mb-6">
      {questions.map((_, index) => {
        let circleColor = 'bg-gray-300';

        const result = firstTryResults[index];

        // Color based on first-try result
        if (result !== null && result !== undefined) {
          circleColor = result.isCorrect ? 'bg-green-500' : 'bg-red-500';
        } else if (index === currentQuestionIndex) {
          circleColor = 'bg-blue-500';
        }

        return (
          <div
            key={index}
            className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 ${circleColor} ${index === currentQuestionIndex ? 'ring-2 md:ring-4 ring-blue-200 scale-110' : ''
              }`}
          >
            {index + 1}
          </div>
        );
      })}
    </div>
  );

  /**
   * Confetti Component
   * Celebration animation shown for first-time correct answers
   * Simple falling colored dots with CSS animation
   * 
   * @returns {JSX.Element} - Confetti animation overlay
   */
  const Confetti = () => {
    return (
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        {/* Simple falling dots */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 ${['bg-yellow-400', 'bg-red-400', 'bg-blue-400', 'bg-green-400'][i % 4]} rounded-full`}
            style={{
              left: `${Math.random() * 100}%`,
              top: '-20px',
              animation: `fall ${Math.random() * 2 + 1}s linear forwards`,
              animationDelay: `${Math.random() * 0.5}s`,
              zIndex: 9999
            }}
          />
        ))}

        <style jsx>{`
          @keyframes fall {
            to {
              transform: translateY(100vh) rotate(360deg);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  };

  /**
   * Calculator drag handler effect
   * Allows dragging the calculator modal around the screen
   */
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      setCalculatorPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  /**
   * FooterContent Component
   * Contains the quiz control buttons (Tools, Check Answer, Next)
   * 
   * @returns {JSX.Element} - Footer toolbar
   */
  const FooterContent = () => (
    <div className="max-w-full mx-auto flex flex-wrap justify-between items-center gap-3">
      {/* Left side: Tools button with dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowToolsDropdown(!showToolsDropdown)}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 hover:bg-gray-700 hover:scale-[1.03] hover:shadow-lg flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Tools
        </button>

        {/* Tools Dropdown Menu */}
        {showToolsDropdown && (
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="py-1">
              <button
                onClick={() => {
                  setShowCalculator(true);
                  setShowToolsDropdown(false);
                }}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors duration-150"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <span>Calculator</span>
              </button>

              <button
                onClick={() => {
                  setShowPageDrawing(true);
                  setShowToolsDropdown(false);
                }}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors duration-150"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                <span>Draw on Page</span>
              </button>
              <button
                onClick={() => {
                  setShowAutoNotes(true);
                  setNoteClickCount(prev => prev + 1);
                  setShowToolsDropdown(false);
                }}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors duration-150"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Add Note </span>
              </button>

              {/* Add more tools here in the future */}
              <div className="border-t border-gray-200 my-1"></div>

              <button
                onClick={() => setShowToolsDropdown(false)}
                className="w-full text-left px-4 py-2 text-gray-500 hover:bg-gray-100 text-sm flex items-center gap-3"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Close Menu
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Middle: Answer check buttons */}
      <div className="flex items-center flex-wrap gap-3">
        {/* Check Answer button (first attempt) */}
        {!hasCheckedFirstTry && firstTryResults[currentQuestionIndex] === null && (
          <button
            onClick={handleCheckAnswer}
            disabled={selectedAnswer.index === null}
            className={`px-6 py-3 sm:px-5 sm:py-2 md:px-6 md:py-3 rounded-lg font-medium shadow-md  text-base sm:text-sm md:text-base  hover:shadow-lg ${selectedAnswer.index === null
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
              }`}
          >
            Check Answer
          </button>
        )}

        {/* Check Again button (after incorrect first attempt) */}
        {/* Check Again button (after incorrect first attempt) */}
        {hasCheckedFirstTry &&
          firstTryResults[currentQuestionIndex]?.isCorrect === false &&
          !answeredQuestions.has(currentQuestionIndex) && (
            <div className="flex items-center flex-wrap gap-3">
              <span className="text-red-600 font-medium text-sm md:text-base">
                Select another answer
              </span>
              <button
                onClick={handleCheckAnswer}
                disabled={selectedAnswer.index === null || isCheckAgainDisabled}
                className={`px-6 py-3 sm:px-5 sm:py-2 md:px-6 md:py-3 rounded-lg font-medium shadow-md  text-base sm:text-sm md:text-base hover:shadow-lg ${selectedAnswer.index === null || isCheckAgainDisabled
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-orange-600 text-white hover:bg-orange-700"
                  }`}
              >
                {isCheckAgainDisabled ? "Checking..." : "Check Again"}
              </button>
            </div>
          )}
      </div>

      {/* Right side: Next/Finish button */}
      {(isAnswerCorrect === true || answeredQuestions.has(currentQuestionIndex)) && (
        <button
          onClick={handleNextQuestion}
          className="bg-blue-600 text-white px-6 py-3 sm:px-5 sm:py-2 md:px-6 md:py-3 rounded-lg  font-medium shadow-md text-base sm:text-sm md:text-base hover:scale-[1.03] hover:shadow-lg"
        >
          {currentQuestionIndex < questions.length - 1
            ? "Next Question"
            : "Finish Quiz"}
        </button>
      )}
    </div>
  );

  /**
   * Effect to handle click outside for closing dropdowns
   * Also handles Escape key to close calculator
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close tools dropdown if clicked outside
      if (showToolsDropdown && !event.target.closest('.relative')) {
        setShowToolsDropdown(false);
      }

      // Close calculator with Escape key
      if (showCalculator && event.key === 'Escape') {
        setShowCalculator(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleClickOutside);
    };
  }, [showToolsDropdown, showCalculator]);

  // ============================
  // RENDER LOGIC
  // ============================

  // Early Exit Results Screen - Uses existing ResultQuestion component
  if (showEarlyExitResults && earlyExitResults) {
    return (
      <ResultQuestion
        objectiveResults={earlyExitResults}
        onTryAgain={handleRestartQuiz}
        quizType="objective"
        subject={subject}
        standard={standard}
        sectionId={sectionId}
        contentId={contentId}
        topic={topic}
        sectionTitle={sectionTitle}
        topic_id={topic_id}
        form={standard}
        level_id={level_id}
        subject_id={subject_id}
        customBackAction={handleBackToQuiz}
        isEarlyExit={true}
      />
    );
  }


  // Quiz Completed Screen
  if (quizCompleted) {
    // FIXED: Use score directly for correct answers
    const correctAnswers = score; // Use the score state which tracks correct answers

    const skippedAnswers = questions.length - answeredQuestions.size;

    console.log('📊 Final results calculation:', {
      score: score,
      correctAnswers: correctAnswers,
      firstTryResults: firstTryResults,
      answeredQuestions: Array.from(answeredQuestions)
    });

    // Prepare results for COMPLETE quiz
    const objectiveResults = {
      totalQuestions: questions.length,
      answered: answeredQuestions.size,
      correctAnswers: correctAnswers, // Use score which tracks correct answers
      skippedAnswers: skippedAnswers,
      timeElapsed: timeElapsed,
      score: Math.round((correctAnswers / questions.length) * 100),
      isComplete: true,
      isEarlyExit: false,
      completionType: 'all_questions',
      questions: questions.map((q, index) => {
        const result = firstTryResults[index];
        return {
          question: q.question_text || 'Question',
          answered: answeredQuestions.has(index),
          correct: result?.isCorrect || false,
          skipped: !answeredQuestions.has(index)
        };
      })
    };

    console.log('🚀 Passing COMPLETE results to ResultQuestion:', objectiveResults);

    return (
      <ResultQuestion
        objectiveResults={objectiveResults}
        onTryAgain={handleRestartQuiz}
        quizType="objective"
        subject={subject}
        standard={standard}
        sectionId={sectionId}
        contentId={contentId}
        topic={topic}
        sectionTitle={sectionTitle}
        topic_id={topic_id}
        form={standard}
        level_id={level_id}
        subject_id={subject_id}
        isEarlyExit={false}
      />
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading New Questions...</h1>
            <p className="text-gray-600">Preparing your quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  // No Questions Available State
  if (!currentQuestion || !currentQuestion.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">No Questions Available</h1>
            <p className="text-gray-600 mb-6">No questions found for this topic.</p>
            <button
              onClick={handleRestartQuiz}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================
  // MAIN RENDER
  // ============================
  return (
    <div>
      {/* Audio elements for sound effects */}
      <audio ref={correctSoundRef} src="/sounds/correct.mp3" preload="auto" />
      <audio ref={wrongSoundRef} src="/sounds/wrong.mp3" preload="auto" />
      <audio ref={successSoundRef} src="/sounds/success.mp3" preload="auto" />

      {/* Celebration animation for first-time correct answers */}
      {showCelebration && <Confetti />}

      {/* Drawing Tool Modal */}
      {showPageDrawing && (
        <PageDrawingTool
          isActive={showPageDrawing}
          onClose={() => setShowPageDrawing(false)}
        />
      )}

      {/* Auto Notes Modal */}
      {showAutoNotes && <AutoNotes isActive={showAutoNotes} addNoteTrigger={noteClickCount} />}

      {/* Calculator Modal - Draggable */}
      {showCalculator && (
        <div
          className="fixed z-50"
          style={{
            left: `${calculatorPosition.x}px`,
            top: `${calculatorPosition.y}px`
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-300 w-90">
            {/* Calculator Header - Draggable area */}
            <div
              className="flex justify-between items-center p-3 bg-gray-800 text-white rounded-t-xl cursor-move"
              onMouseDown={(e) => {
                // Only start dragging if not clicking a button
                if (e.target.closest('button')) return;

                setIsDragging(true);
                const rect = e.currentTarget.getBoundingClientRect();
                setDragOffset({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top
                });
              }}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
                <h3 className="text-sm font-semibold">Scientific Calculator</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCalculator(false)}
                  className="text-gray-300 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
                  title="Close Calculator"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calculator Body */}
            <div className="p-2 max-h-72 overflow-y-auto">
              <Calculator />
            </div>

            {/* Mini Controls */}
            <div className="border-t border-gray-200 p-2 flex justify-between items-center">
              <button
                onClick={() => {
                  // Copy calculator result to clipboard
                  const display = document.querySelector('.text-3xl.font-mono');
                  if (display) {
                    navigator.clipboard.writeText(display.textContent || '0');
                  }
                }}
                className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 hover:bg-gray-100 rounded"
                title="Copy Result"
              >
                Copy
              </button>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Quiz Layout */}
      <ObjectiveQuestionLayout
        subject={subject}
        standard={standard}
        currentTopic={currentTopic}
        sectionTitle={sectionTitle || getSectionTitle()}
        progressCircles={<ProgressCircles />}
        timeElapsed={timeElapsed}
        getTimeColor={getTimeColor}
        formatTime={formatTime}
        footerContent={<FooterContent />}
        answeredQuestions={answeredQuestions}
        selectedAnswer={selectedAnswer}
        handleExitQuiz={handleExitQuiz}
        handleBackNavigation={handleBackNavigation}
        onExitWithResults={handleExitConfirmation}
      >
        <div className="relative p-0">
          {/* Desktop Feedback Messages (Correct Answer) */}
          {isAnswerCorrect === true && (
            <>
              <div className="hidden lg:block absolute lg:right-4 lg:top-3/4 lg:transform lg:-translate-y-1/2 z-10">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-xl p-3 shadow-sm w-[260px] mx-auto flex items-center gap-3 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-center bg-white rounded-lg p-2 shadow-sm">
                    <svg
                      className="w-6 h-6 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.383 2.46a1 1 0 00-.364 1.118l1.286 3.974c.3.921-.755 1.688-1.54 1.118l-3.383-2.46a1 1 0 00-1.176 0l-3.383 2.46c-.785.57-1.84-.197-1.54-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.045 9.4c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.288-3.973z" />
                    </svg>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-gray-800 font-semibold text-sm tracking-wide">
                      Correct!
                    </span>
                    <span className="text-gray-600 text-[11px]">
                      {firstTryResults[currentQuestionIndex]?.isCorrect
                        ? "Perfect on first try! 🎉"
                        : "Next question..."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Feedback Messages (Correct Answer) */}
              <div className="lg:hidden absolute bottom-4 right-4 z-10">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-xl p-3 shadow-sm w-[260px] mx-auto flex items-center gap-3 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-center bg-white rounded-lg p-2 shadow-sm">
                    <svg
                      className="w-6 h-6 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.383 2.46a1 1 0 00-.364 1.118l1.286 3.974c.3.921-.755 1.688-1.54 1.118l-3.383-2.46a1 1 0 00-1.176 0l-3.383 2.46c-.785.57-1.84-.197-1.54-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.045 9.4c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.288-3.973z" />
                    </svg>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-gray-800 font-semibold text-sm tracking-wide">
                      Correct!
                    </span>
                    <span className="text-gray-600 text-[11px]">
                      {firstTryResults[currentQuestionIndex]?.isCorrect
                        ? "Perfect on first try! 🎉"
                        : "Next question..."}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Desktop Feedback Messages (Incorrect Answer) */}
          {isAnswerCorrect === false && (
            <>
              <div className="hidden lg:block absolute lg:right-4 lg:top-3/4 lg:transform lg:-translate-y-1/2 z-10">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-lg w-[320px] animate-shake">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-red-800 font-medium text-sm">
                        {firstTryResults[currentQuestionIndex]?.isCorrect === false && !answeredQuestions.has(currentQuestionIndex)
                          ? "Incorrect. Try another answer!"
                          : "First attempt incorrect. Try again!"}
                      </span>
                    </div>
                    <div className="text-center">
                      <button
                        onClick={handleNextQuestion}
                        className="text-gray-600 hover:text-gray-800 underline text-sm font-medium transition-colors hover:scale-105 transform duration-200"
                      >
                        Skip this question
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Feedback Messages (Incorrect Answer) */}
              <div className="lg:hidden absolute bottom-4 right-4 z-10">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-1.5 shadow-lg w-[250px] animate-shake">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-start">
                      <svg className="w-3 h-3 text-red-600 mr-1.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-red-800 font-medium text-xs leading-tight">
                        {firstTryResults[currentQuestionIndex]?.isCorrect === false && !answeredQuestions.has(currentQuestionIndex)
                          ? "Incorrect. Try another answer!"
                          : "First attempt incorrect. Try again!"}
                      </span>
                    </div>
                    <div className="text-center pt-0.5">
                      <button
                        onClick={handleNextQuestion}
                        className="text-gray-600 hover:text-gray-800 underline text-xs font-medium transition-colors hover:scale-105 transform duration-200"
                      >
                        Skip this question
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Main Quiz Content Area */}
          <div className="py-2 sm:py-4 bg-cover bg-center bg-no-repeat h-auto" style={{ backgroundImage: 'url(/images/background_classroom.jpg)' }}>
            <div className="mx-auto relative px-4 sm:px-0 md:px-4 lg:px-10 max-w-full sm:max-w-2xl md:max-w-full lg:max-w-2xl xl:max-w-5xl 2xl:max-w-6xl">
              {/* Question Card */}
              <div className="bg-white opacity-100 rounded-2xl shadow-xl p-6 mb-10 transition-all duration-300 hover:shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-sm md:text-lg lg:text-lg xl:text-xl font-semibold flex-1 leading-relaxed text-gray-800 lg:text-gray-900">
                    <QuestionDisplay question={currentQuestion} />
                  </h2>
                  {/* Display KBAT only if difficulty_type_id === 4 */}
                  {currentQuestion.difficulty_type_id === 4 && (
                    <div className="bg-gray-200 rounded-md text-gray-500 font-bold p-2">KBAT</div>
                  )}

                  {/* Optional: Display other difficulty levels if needed */}
                  {currentQuestion.difficulty_type_id && currentQuestion.difficulty_type_id !== 4 && (
                    <div className={`rounded-md text-white font-bold p-2 text-xs ${currentQuestion.difficulty_type_id === 1 ? 'bg-green-500' :
                        currentQuestion.difficulty_type_id === 2 ? 'bg-yellow-500' :
                          currentQuestion.difficulty_type_id === 3 ? 'bg-red-500' :
                            'bg-gray-500'
                      }`}>
                      {currentQuestion.difficulty_type_id === 1 ? 'Easy' :
                        currentQuestion.difficulty_type_id === 2 ? 'Medium' :
                          currentQuestion.difficulty_type_id === 3 ? 'Hard' :
                            'Unknown'}
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <span className="text-gray-600 text-sm sm:text-sm mb-4 block">Pilih 1 jawapan : </span>

                {/* Answer Options */}
                <div className="space-y-3 mb-6">
                  {currentQuestion.options && currentQuestion.options.map((option, index) => {
                    const isCurrentSelected = selectedAnswer.index === index;
                    const isDisabled = incorrectAnswers.has(index) || answeredQuestions.has(currentQuestionIndex);
                    const isCorrectAnswer = index === currentQuestion.correctAnswer;
                    const showAsCorrect = showExplanation && isCorrectAnswer;

                    return (
                      <OptionDisplay
                        key={option.id || index}
                        option={option}
                        index={index}
                        isSelected={isCurrentSelected}
                        isCorrect={showAsCorrect}
                        isIncorrect={isCurrentSelected && isAnswerCorrect === false}
                        isDisabled={isDisabled}
                        onClick={() => handleAnswerSelect(index)}
                      />
                    );
                  })}
                </div>

                {/* Explanation Section (shown after correct answer) */}
                {showExplanation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4 animate-fade-in">
                    <h3 className="font-semibold text-blue-800 mb-3 flex items-center text-sm sm:text-base">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Explanation:
                    </h3>
                    <div
                      className="text-blue-700 text-sm sm:text-base prose prose-blue max-w-none"
                      dangerouslySetInnerHTML={{ __html: currentQuestion.explanation }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ObjectiveQuestionLayout>

      {/* Custom CSS Animations */}
      <style>{`
  @keyframes confetti-fall {
    0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-shake { animation: shake 0.5s ease-in-out; }
  .animate-fade-in { animation: fade-in 0.5s ease-out; }
`}</style>
    </div>
  );
}