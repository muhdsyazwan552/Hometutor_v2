import React, { useState, useEffect, useRef } from 'react';
import { Head, usePage, Link, router } from '@inertiajs/react';
import ObjectiveQuestionLayout from '@/Layouts/ObjectiveQuestionLayout';
import ResultQuestion from '@/Pages/courses/training/ResultQuestion';

// Question Display Component
const QuestionDisplay = ({ question }) => {
  if (!question) return null;

  const renderQuestionContent = () => {
    if (question.question_text) {
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
                console.error('Failed to load question image:', imageUrl);
                e.target.style.display = 'none';
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

// Option Display Component
const OptionDisplay = ({ option, index, isSelected, isCorrect, isIncorrect, isDisabled, onClick }) => {
  const getOptionStyles = () => {
    if (isCorrect) {
      return 'bg-green-100 border-green-500 text-green-800 cursor-default animate-pulse';
    }
    if (isIncorrect) {
      return 'bg-red-100 border-red-500 text-red-800 cursor-default animate-shake';
    }
    if (isSelected) {
      return 'bg-blue-100 border-blue-500 text-blue-800';
    }
    if (isDisabled) {
      return 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed';
    }
    return 'bg-white border-gray-300 text-gray-800 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all duration-200';
  };

  const renderOptionContent = () => {
    const optionText = typeof option === 'object' ? option.text : option;
    const optionType = option.type || 'text';
    const hasHtml = option.has_html;

    if (hasHtml || optionType === 'html') {
      return (
        <div className="flex items-start">
          <span className="font-medium mr-3 sm:mr-4 text-base sm:text-lg flex-shrink-0">
            {String.fromCharCode(65 + index)}.
          </span>
          <div
            className="text-sm md:text-base lg:text-base xl:text-lg prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: optionText }}
          />
        </div>
      );
    }

    return (
      <div className="flex items-center">
        <span className="font-medium mr-3 sm:mr-4 text-base sm:text-lg">
          {String.fromCharCode(65 + index)}.
        </span>
        <span className="text-sm md:text-base lg:text-base xl:text-lg">
          {optionText}
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

export default function ObjectiveQuestion() {
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

  // State declarations
  const [questions, setQuestions] = useState(initialQuestions || []);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState({
    index: null,
    id: null
  });
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [incorrectAnswers, setIncorrectAnswers] = useState(new Set());
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [firstTryResults, setFirstTryResults] = useState([]);
  const [hasCheckedFirstTry, setHasCheckedFirstTry] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [practiceStartTime, setPracticeStartTime] = useState(null);
  const [questionAttempts, setQuestionAttempts] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  // Get current question
  const currentQuestion = questions[currentQuestionIndex] || { options: [] };

  // Audio refs
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);
  const successSoundRef = useRef(null);

  // Debug logging for options data
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

  // Debug initial data structure
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

  // Initialize practice session
  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      const startTime = new Date().toISOString();
      setPracticeStartTime(startTime);
      setTimerRunning(true);
      console.log('📝 Practice session started at:', startTime);
    }
  }, [initialQuestions]);

  // Initialize questions from props
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

  // Timer effect
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

  // Start timer for each question
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const savePracticeSession = async () => {
    const endTime = new Date().toISOString();
    
    console.log('📤 Sending quiz attempts:', {
      attemptsCount: questionAttempts.length,
      attempts: questionAttempts,
      firstTryResults: firstTryResults
    });
    
    try {
      const response = await router.post('/practice-session/objective', {
        subject_id: subject_id,
        topic_id: topic_id,
        start_at: practiceStartTime,
        end_at: endTime,
        total_correct: score,
        total_skipped: questions.length - answeredQuestions.size,
        total_time_seconds: timeElapsed,
        score: Math.round((score / questions.length) * 100),
        question_attempts: questionAttempts,
        first_try_data: firstTryResults.map((result, index) => ({
          question_id: questions[index]?.id,
          first_try_result: result
        }))
      });
      
      console.log('✅ Practice session saved:', {
        session_id: response.props.session_id,
        attempts_sent: questionAttempts.length,
        first_try_correct: firstTryResults.filter(r => r?.isCorrect).length
      });
    } catch (error) {
      console.error('❌ Failed to save practice session:', error);
    }
  };

  // Save session when quiz completes
  useEffect(() => {
    if (quizCompleted) {
      savePracticeSession();
    }
  }, [quizCompleted]);

  // For now, use the topic from props
  const currentTopic = topic || 'General';

  const getSectionTitle = () => {
    return sectionTitle || topic || `Section ${sectionId}`;
  };

  const formatSubjectName = (subject) => {
    if (!subject) return "Subject";
    return subject.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Play sound function
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

  const handleAnswerSelect = (answerIndex) => {
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
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer.index === null) return;

    const isCorrect = selectedAnswer.index === currentQuestion.correctAnswer;
    const isFirstAttempt = firstTryResults[currentQuestionIndex] === null;

    const timeTaken = questionStartTime ? Math.floor((Date.now() - questionStartTime) / 1000) : 0;

    console.log('🎯 First Try Attempt Data:', {
      questionId: currentQuestion.id,
      questionIndex: currentQuestionIndex,
      selectedAnswerIndex: selectedAnswer.index,
      selectedAnswerId: selectedAnswer.id,
      isCorrect: isCorrect,
      correctAnswerIndex: currentQuestion.correctAnswer,
      chosenAnswerId: selectedAnswer.id
    });

    const attemptData = {
      question_id: currentQuestion.id,
      topic_id: topic_id,
      choosen_answer_id: selectedAnswer.id || 0,
      answer_status: isCorrect ? 1 : 0,
      question_type_id: 1,
      time_taken: timeTaken,
      attempted_at: new Date().toISOString(),
      selected_index: selectedAnswer.index
    };

    setQuestionAttempts(prev => {
      const filtered = prev.filter(attempt => attempt.question_id !== currentQuestion.id);
      return [...filtered, attemptData];
    });

    if (isFirstAttempt) {
      const newFirstTryResults = [...firstTryResults];
      newFirstTryResults[currentQuestionIndex] = {
        isCorrect: isCorrect,
        answerId: selectedAnswer.id || 0,
        selectedIndex: selectedAnswer.index
      };
      setFirstTryResults(newFirstTryResults);
      setHasCheckedFirstTry(true);
    }

    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      playSound('correct', 1.0);

      if (isFirstAttempt) {
        playSound('success', 0.1);
        triggerCelebration();
      }

      setAnsweredQuestions(prev => new Set(prev).add(currentQuestionIndex));

      if (isFirstAttempt) {
        setScore(score + 1);
      }

      setShowExplanation(true);
    } else {
      playSound('wrong', 0.1);

      setIncorrectAnswers(prev => new Set(prev).add(selectedAnswer.index));
      setIsAnswerCorrect(false);

      if (isFirstAttempt) {
        setSelectedAnswer({
          index: null,
          id: null
        });
      }
    }
  };

  // Celebration animation
  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  };

  const handleNextQuestion = () => {
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
      setQuestionStartTime(Date.now());
    } else {
      setTimerRunning(false);
      setQuizCompleted(true);
    }
  };

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

  // Format time function
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get time color based on elapsed time
  const getTimeColor = () => {
    if (timeElapsed < 300) return 'text-green-600';
    if (timeElapsed < 600) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Progress Circles Component
  const ProgressCircles = () => (
    <div className="flex justify-center space-x-2 md:space-x-2 mb-2 md:mb-6">
      {questions.map((_, index) => {
        let circleColor = 'bg-gray-300';

        const result = firstTryResults[index];
        
        if (result !== null && result !== undefined) {
          circleColor = result.isCorrect ? 'bg-green-500' : 'bg-red-500';
        } else if (index === currentQuestionIndex) {
          circleColor = 'bg-blue-500';
        }

        return (
          <div
            key={index}
            className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 ${circleColor} ${
              index === currentQuestionIndex ? 'ring-2 md:ring-4 ring-blue-200 scale-110' : ''
            }`}
          >
            {index + 1}
          </div>
        );
      })}
    </div>
  );

  // Confetti component for celebration
  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className={`absolute w-2 h-2 opacity-70 ${['bg-yellow-400', 'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][i % 5]}`}
          style={{
            left: `${Math.random() * 100}%`,
            animation: `confetti-fall ${Math.random() * 3 + 2}s linear forwards`,
            animationDelay: `${Math.random() * 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}
    </div>
  );

  // Footer Content Component
  const FooterContent = () => (
    <div className="max-w-full mx-auto flex flex-wrap justify-end items-center gap-3">
      <div className="flex items-center flex-wrap gap-3">
        {!hasCheckedFirstTry && firstTryResults[currentQuestionIndex] === null && (
          <button
            onClick={handleCheckAnswer}
            disabled={selectedAnswer.index === null}
            className={`px-6 py-3 sm:px-5 sm:py-2 md:px-6 md:py-3 rounded-lg font-medium shadow-md transition-all duration-300 text-base sm:text-sm md:text-base hover:scale-[1.03] hover:shadow-lg ${
              selectedAnswer.index === null
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            Check Answer
          </button>
        )}

        {hasCheckedFirstTry &&
          firstTryResults[currentQuestionIndex]?.isCorrect === false &&
          !answeredQuestions.has(currentQuestionIndex) && (
            <div className="flex items-center flex-wrap gap-3">
              <span className="text-red-600 font-medium text-sm md:text-base">
                Select another answer
              </span>
              <button
                onClick={handleCheckAnswer}
                disabled={selectedAnswer.index === null}
                className={`px-6 py-3 sm:px-5 sm:py-2 md:px-6 md:py-3 rounded-lg font-medium shadow-md transition-all duration-300 text-base sm:text-sm md:text-base hover:scale-[1.03] hover:shadow-lg ${
                  selectedAnswer.index === null
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-orange-600 text-white hover:bg-orange-700"
                }`}
              >
                Check Again
              </button>
            </div>
          )}
      </div>

      {(isAnswerCorrect === true || answeredQuestions.has(currentQuestionIndex)) && (
        <button
          onClick={handleNextQuestion}
          className="bg-blue-600 text-white px-6 py-3 sm:px-5 sm:py-2 md:px-6 md:py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium shadow-md text-base sm:text-sm md:text-base hover:scale-[1.03] hover:shadow-lg"
        >
          {currentQuestionIndex < questions.length - 1
            ? "Next Question"
            : "Finish Quiz"}
        </button>
      )}
    </div>
  );

  // Quiz Completed Screen
  if (quizCompleted) {
    const correctAnswers = firstTryResults.filter(result => 
      result !== null && result.isCorrect
    ).length;
    
    const skippedAnswers = questions.length - answeredQuestions.size;

    const objectiveResults = {
      totalQuestions: questions.length,
      correctAnswers: correctAnswers,
      skippedAnswers: skippedAnswers,
      timeElapsed: timeElapsed,
      score: score,
      questions: questions.map((q, index) => {
        const result = firstTryResults[index];
        return {
          question: q.question_text || 'Question',
          answered: answeredQuestions.has(index),
          correct: result?.isCorrect || false
        };
      })
    };

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
      />
    );
  }

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

  return (
    <div>
      <audio ref={correctSoundRef} src="/sounds/correct.mp3" preload="auto" />
      <audio ref={wrongSoundRef} src="/sounds/wrong.mp3" preload="auto" />
      <audio ref={successSoundRef} src="/sounds/success.mp3" preload="auto" />

      {showCelebration && <Confetti />}

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
      >
        <div className="relative p-0">
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

          <div className="py-2 sm:py-4 bg-cover bg-center bg-no-repeat h-auto" style={{ backgroundImage: 'url(/images/background_classroom.jpg)' }}>
            <div className="mx-auto relative px-4 sm:px-0 md:px-4 lg:px-10 max-w-full sm:max-w-2xl md:max-w-full lg:max-w-2xl xl:max-w-5xl 2xl:max-w-6xl">
              <div className="bg-white opacity-100 rounded-2xl shadow-xl p-6 mb-10 transition-all duration-300 hover:shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-sm md:text-lg lg:text-lg xl:text-xl font-semibold flex-1 leading-relaxed text-gray-800 lg:text-gray-900">
                    <QuestionDisplay question={currentQuestion} />
                  </h2>
                </div>

                <span className="text-gray-600 text-sm sm:text-sm mb-4 block">Pilih 1 jawapan : </span>

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

      <style jsx>{`
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