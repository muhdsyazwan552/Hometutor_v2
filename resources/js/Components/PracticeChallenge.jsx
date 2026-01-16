import React, { useState, useEffect } from "react";
import ResultChallenge from '@/Components/ResultChallenge';

export default function PracticeChallenge({ isOpen, onClose, subjectId, levelId, subjectKey, topicId, topicName }) {
    const [sessionId, setSessionId] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(10);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [answerHistory, setAnswerHistory] = useState([]);
    const [showExplanation, setShowExplanation] = useState(false);

    const [sessionStartTime, setSessionStartTime] = useState(null);
    const [sessionTimer, setSessionTimer] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showResultModal, setShowResultModal] = useState(false);
    const [practiceResults, setPracticeResults] = useState(null);

    // Helper function to get CSRF token
    const getCsrfToken = () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    };

    // Function to refresh CSRF token
    const refreshCsrfToken = async () => {
        try {
            const response = await fetch('/sanctum/csrf-cookie', {
                credentials: 'same-origin'
            });
            return response.ok;
        } catch (error) {
            console.error('Failed to refresh CSRF token:', error);
            return false;
        }
    };

    // Load existing session progress
    const loadSessionProgress = async (sid) => {
        try {
            console.log('Loading session progress for session:', sid);
            const response = await fetch(`/api/challenge/progress?session_id=${sid}`);
            const data = await response.json();

            console.log('Session progress data:', data);

            if (data.answers && data.answers.length > 0) {
                const history = data.answers.map((ans, idx) => ({
                    questionNumber: idx + 1,
                    isCorrect: ans.is_correct === 1
                }));
                setAnswerHistory(history);
                console.log('Loaded answer history:', history);
            }
        } catch (error) {
            console.error('Error loading session progress:', error);
        }
    };

    // Format time from seconds to MM:SS or HH:MM:SS
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Format time for display (more readable)
    const formatTimeDisplay = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${mins}m ${secs}s`;
        } else if (mins > 0) {
            return `${mins}m ${secs}s`;
        }
        return `${secs}s`;
    };

    // Start session timer
    const startSessionTimer = () => {
        // Clear any existing timer
        if (sessionTimer) {
            clearInterval(sessionTimer);
        }

        // Reset elapsed time
        setElapsedTime(0);
        setSessionStartTime(Date.now());

        // Start new timer
        const timer = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);

        setSessionTimer(timer);
        return timer;
    };

    // Stop session timer
    const stopSessionTimer = () => {
        if (sessionTimer) {
            clearInterval(sessionTimer);
            setSessionTimer(null);
        }
    };

    useEffect(() => {
        if (isOpen && !sessionId) {
            console.log('Modal opened, starting new practice session');
            console.log('Practice topic:', { topicId, topicName });
            startPractice();
        }

        // Cleanup timer on unmount
        return () => {
            if (sessionTimer) {
                clearInterval(sessionTimer);
            }
        };
    }, [isOpen]);

    const startPractice = async () => {
        setLoading(true);
        try {
            await refreshCsrfToken();

            const csrfToken = getCsrfToken();

            console.log('Starting practice with data:', {
                subject_id: subjectId,
                level_id: levelId,
                topic_id: topicId
            });

            const response = await fetch('/api/practice/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    subject_id: subjectId,
                    level_id: levelId,
                    topic_id: topicId
                })
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (response.status === 419) {
                console.log('CSRF token expired, refreshing and retrying...');
                await refreshCsrfToken();
                return startPractice();
            }

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage += ` - ${JSON.stringify(errorData)}`;
                } catch (e) {
                    const text = await response.text();
                    errorMessage += ` - ${text}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Practice started successfully:', data);
            setSessionId(data.session_id);
            setTotalQuestions(data.total_questions);

            // Start session timer
            startSessionTimer();

            // If continuing existing session, load progress
            if (data.message && data.message.includes('Continuing')) {
                console.log('Continuing existing session, loading progress...');
                await loadSessionProgress(data.session_id);
            } else {
                // New session, reset history
                setAnswerHistory([]);
            }

            loadNextQuestion(data.session_id);
        } catch (error) {
            console.error('Full error details:', error);
            alert(`Failed to start practice. Error: ${error.message}`);
            setLoading(false);
        }
    };

    const loadNextQuestion = async (sid) => {
    setLoading(true);
    setShowResult(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
    
    try {
        // Validate session ID
        if (!sid) {
            console.error('No session ID provided');
            setLoading(false);
            return;
        }
        
        console.log('Loading next question for session:', sid);
        const response = await fetch(`/api/challenge/question?session_id=${sid || sessionId}`);
        
        if (!response.ok) {
            console.error('Failed to load question:', response.status);
            if (response.status === 400) {
                // Session might be completed
                await loadSummary(sid);
            }
            setLoading(false);
            return;
        }
        
        const data = await response.json();
        console.log('Practice question data received:', data);
        
        // Check if the API says practice is completed
        if (data.completed) {
            console.log('Practice completed (API), loading summary...');
            stopSessionTimer();
            await loadSummary(sid);
        } else {
            // Always show the next question if available
            setCurrentQuestion({
                ...data.question,
                answers: data.answers
            });
            // Update question number from API response
            setQuestionNumber(data.current_question || questionNumber + 1);
            setTotalQuestions(data.total_questions || totalQuestions);
        }
    } catch (error) {
        console.error('Error loading question:', error);
    } finally {
        setLoading(false);
    }
};

    const handleAnswerSelect = (answerId) => {
        if (!showResult) {
            setSelectedAnswer(answerId);
        }
    };

    const handleSubmit = async () => {
    if (!selectedAnswer || isSubmitting) return;

    setIsSubmitting(true);
    
    // Calculate time taken
    const currentElapsed = elapsedTime;
    const previousElapsed = answerHistory.length > 0 
        ? answerHistory.reduce((sum, ans) => sum + (ans.timeTaken || 0), 0)
        : 0;
    const timeTaken = currentElapsed - previousElapsed;

    try {
        await refreshCsrfToken();
        
        const response = await fetch('/api/practice/answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
                'Accept': 'application/json',
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                session_id: sessionId,
                question_id: currentQuestion.id,
                answer_id: selectedAnswer,
                time_taken: Math.max(1, timeTaken)
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Answer submission error:', response.status, errorText);
            
            if (response.status === 419) {
                console.log('CSRF token expired, refreshing and retrying...');
                await refreshCsrfToken();
                setIsSubmitting(false);
                return handleSubmit();
            }
            
            throw new Error(`Failed to submit answer: ${response.status}`);
        }

        const data = await response.json();
        console.log('Answer submitted:', data);
        
        setIsCorrect(data.is_correct);
        setShowResult(true);

        // Add to history
        setAnswerHistory(prev => [...prev, {
            questionNumber: questionNumber,
            isCorrect: data.is_correct,
            timeTaken: Math.max(1, timeTaken)
        }]);

        // Check if this was the last question
        const isLastQuestion = questionNumber >= totalQuestions;
        
        if (isLastQuestion || data.practice_complete) {
            console.log('Last question answered, loading summary...');
            // Stop timer
            stopSessionTimer();
            // Load summary immediately - NO delay
            await loadSummary(sessionId);
        }
        // Don't auto-load next question - wait for user to click "Next"
    } catch (error) {
        console.error('Error submitting answer:', error);
        alert(`Failed to submit answer: ${error.message}`);
    } finally {
        setIsSubmitting(false);
    }
};

    const loadSummary = async (sid) => {
        try {
            console.log('Loading summary for session:', sid);
            const response = await fetch(`/api/practice/summary?session_id=${sid}`);
            const data = await response.json();
            console.log('Practice summary loaded:', data);

            // Prepare results for ResultChallenge
            setPracticeResults({
                correctAnswers: data.correct_answers || 0,
                totalQuestions: data.total_questions || 0,
                skippedAnswers: 0,
                timeElapsed: elapsedTime,
                score: data.correct_answers || 0,
                mastery: data.progress || []
            });

            console.log('Setting showResultModal to true');
            // Show result modal
            setShowResultModal(true);

            // Also hide current question
            setCurrentQuestion(null);
        } catch (error) {
            console.error('Error loading summary:', error);
        }
    };

    

    const handleTryAgain = () => {
        setShowResultModal(false);
        setPracticeResults(null);
        setSummary(null);
        setCurrentQuestion(null);
        setSelectedAnswer(null);
        setShowResult(false);
        setIsCorrect(false);
        setQuestionNumber(0);
        setAnswerHistory([]);
        setShowExplanation(false);
        setElapsedTime(0);

        // Restart practice
        startPractice();
    };

    // Handle close result modal
    const handleCloseResultModal = () => {
        setShowResultModal(false);
        setPracticeResults(null);
        handleClose(); // Close entire modal
    };

    const handleNext = () => {
    // Only proceed if not the last question
    if (questionNumber < totalQuestions) {
        loadNextQuestion(sessionId);
    } else {
        // If it's the last question, load summary
        console.log('Last question completed, loading summary...');
        stopSessionTimer();
        loadSummary(sessionId);
    }
};

    const handleClose = () => {
        // Clean up timer
        if (sessionTimer) {
            clearInterval(sessionTimer);
        }

        setSessionId(null);
        setCurrentQuestion(null);
        setSelectedAnswer(null);
        setShowResult(false);
        setSummary(null);
        setQuestionNumber(0);
        setAnswerHistory([]);
        setShowExplanation(false);
        setSessionStartTime(null);
        setElapsedTime(0);
        setSessionTimer(null);
        setShowResultModal(false);
        setPracticeResults(null);
        onClose();
    };

    const handleContinue = () => {
        handleClose();
    };

    // Render HTML content safely
    const renderContent = (content) => {
        if (!content) return null;
        return <div dangerouslySetInnerHTML={{ __html: content }} />;
    };

    // Get correct answer and its explanation
    const getCorrectAnswerInfo = () => {
        if (!currentQuestion?.answers) {
            console.log('getCorrectAnswerInfo: No answers array');
            return null;
        }

        console.log('getCorrectAnswerInfo - All answers:', currentQuestion.answers);
        console.log('getCorrectAnswerInfo - Looking for answer with is_correct_answer === 1');

        const correctAnswer = currentQuestion.answers.find(a => {
            console.log(`Checking answer ${a.id}: is_correct_answer = ${a.is_correct_answer}, type = ${typeof a.is_correct_answer}`);
            return a.is_correct_answer === 1;
        });

        console.log('getCorrectAnswerInfo - Found:', correctAnswer);
        return correctAnswer;
    };

    if (!isOpen) return null;

    const remainingProblems = totalQuestions - answerHistory.length;

    // console.log('Render state:', {
    //     answerHistory,
    //     remainingProblems,
    //     totalQuestions,
    //     questionNumber,
    //     topicName,
    //     elapsedTime,
    //     showResultModal,
    //     practiceResults: !!practiceResults
    // });

    // If result modal is shown, don't render the practice modal
    if (showResultModal) {
  return (
    <div className="fixed inset-0 bg-black/70 z-[60] overflow-y-auto">
      {/* Centering container - this is the key change */}
      <div className="min-h-full flex items-center justify-center p-4">
        {/* Modal container with max width */}
        <div className="w-full max-w-3xl">
          <ResultChallenge
            results={practiceResults}
            onTryAgain={handleTryAgain}
            subject={subjectKey}
            topic={topicName}
            topic_id={topicId}
            subject_id={subjectId}
            level_id={levelId}
            isModal={true}
            onCloseModal={handleCloseResultModal}
          />
        </div>
      </div>
    </div>
  );
}

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
                {loading && !currentQuestion ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading practice session...</p>
                    </div>
                ) : summary ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Preparing your results...</p>
                    </div>
                ) : currentQuestion ? (
                    <div>
                        {/* Header with Progress Circles */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 relative">
                            {/* Close button - positioned absolutely */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl"
                            >
                                ×
                            </button>

                            <div className="flex flex-col md:flex-row items-start justify-between pr-8 space-y-4 md:space-y-0">
                                <div>
                                    <h3 className="text-lg font-semibold">Practice Session: {topicName}</h3>
                                    <p className="text-sm text-green-100 mt-1">
                                        Question {questionNumber} of {totalQuestions}
                                    </p>
                                </div>

                                {/* Session Timer Display */}
                                <div className="flex flex-col items-end space-y-2">
                                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="font-mono font-bold text-lg">
                                                {formatTime(elapsedTime)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-green-100 mt-1">Session Time</p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-sm font-medium mb-2">
                                            Solve {remainingProblems} more problem{remainingProblems !== 1 ? 's' : ''}
                                        </p>
                                        <div className="flex items-center justify-end space-x-2">
                                            {Array.from({ length: totalQuestions }).map((_, index) => {
                                                const answered = answerHistory.find(h => h.questionNumber === index + 1);
                                                const isCurrent = index + 1 === questionNumber && !showResult;

                                                return (
                                                    <div
                                                        key={index}
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${answered?.isCorrect
                                                                ? 'bg-green-500'
                                                                : answered && !answered.isCorrect
                                                                    ? 'bg-gray-400'
                                                                    : isCurrent
                                                                        ? 'bg-white/30 border-2 border-white'
                                                                        : 'bg-white/20 border-2 border-white/40'
                                                            }`}
                                                    >
                                                        {answered?.isCorrect && (
                                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                        {answered && !answered.isCorrect && (
                                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar with Time Indicator */}
                        <div className="h-2 bg-gray-200 relative">
                            <div
                                className="h-full bg-green-500 transition-all duration-300"
                                style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                            ></div>
                            {/* Time Indicator */}
                            <div className="absolute top-3 right-4 text-xs text-gray-500">
                                Time: {formatTimeDisplay(elapsedTime)}
                            </div>
                        </div>

                        {/* Question Content */}
                        <div className="p-8">
                            <div className="mb-6">
                                {/* Question Text or Image */}
                                {currentQuestion.question_text ? (
                                    <div className="prose max-w-none">
                                        {renderContent(currentQuestion.question_text)}
                                    </div>
                                ) : currentQuestion.question_file ? (
                                    <div className="flex justify-center">
                                        <img
                                            src={currentQuestion.question_file}
                                            alt="Question"
                                            className="max-w-full h-auto rounded-lg shadow"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-lg text-gray-800 leading-relaxed">
                                        {currentQuestion.question}
                                    </p>
                                )}
                            </div>

                            {/* Answer Options */}
                            <div className="space-y-3">
                                {currentQuestion.answers && currentQuestion.answers.length > 0 ? (
                                    currentQuestion.answers.map((answer) => {
                                        const isSelected = selectedAnswer === answer.id;
                                        const showCorrect = showResult && answer.is_correct_answer === "1";
                                        const showWrong = showResult && isSelected && answer.is_correct_answer === "0";

                                        return (
                                            <button
                                                key={answer.id}
                                                onClick={() => handleAnswerSelect(answer.id)}
                                                disabled={showResult}
                                                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${showCorrect
                                                        ? 'border-green-500 bg-green-50'
                                                        : showWrong
                                                            ? 'border-red-500 bg-red-50'
                                                            : isSelected
                                                                ? 'border-green-500 bg-green-50'
                                                                : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                                                    } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        {answer.answer_text ? (
                                                            <div className="prose prose-sm max-w-none">
                                                                {renderContent(answer.answer_text)}
                                                            </div>
                                                        ) : answer.answer_option_file ? (
                                                            <img
                                                                src={answer.answer_option_file}
                                                                alt="Answer option"
                                                                className="max-w-xs h-auto rounded"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-800">{answer.answer_option}</span>
                                                        )}
                                                    </div>
                                                    <div className="ml-3 flex-shrink-0">
                                                        {showCorrect && (
                                                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                        {showWrong && (
                                                            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500">No answers available</p>
                                )}
                            </div>

                            {/* Result and Explanation */}
                            {showResult && (
                                <div className="mt-6 space-y-4">
                                    <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                                        <div className="flex items-center space-x-2">
                                            {isCorrect ? (
                                                <>
                                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-green-800">Good work!</p>
                                                        <p className="text-sm text-green-700">
                                                            That's the right answer. Session time: {formatTimeDisplay(elapsedTime)}
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-red-800">Incorrect</p>
                                                        <p className="text-sm text-red-700">
                                                            Review the correct answer above. Session time: {formatTimeDisplay(elapsedTime)}
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Show "Answer Description" button ONLY if correct */}
                                    {isCorrect && (() => {
                                        const correctAnswer = getCorrectAnswerInfo();
                                        const hasExplanation = correctAnswer && (correctAnswer.reason || correctAnswer.reason2 || correctAnswer.reason_file);

                                        if (hasExplanation) {
                                            return (
                                                <>
                                                    {!showExplanation && (
                                                        <button
                                                            onClick={() => setShowExplanation(true)}
                                                            className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                                                        >
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>Answer Description</span>
                                                        </button>
                                                    )}

                                                    {showExplanation && (
                                                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                                            <div className="flex items-start space-x-2">
                                                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="font-semibold text-blue-900 mb-2">Answer Description</p>
                                                                    {correctAnswer.reason && (
                                                                        <div className="prose prose-sm max-w-none text-blue-800 mb-2">
                                                                            {renderContent(correctAnswer.reason)}
                                                                        </div>
                                                                    )}
                                                                    {correctAnswer.reason2 && (
                                                                        <div className="prose prose-sm max-w-none text-blue-800 mb-2">
                                                                            {renderContent(correctAnswer.reason2)}
                                                                        </div>
                                                                    )}
                                                                    {correctAnswer.reason_file && (
                                                                        <div className="mt-2">
                                                                            <img
                                                                                src={correctAnswer.reason_file}
                                                                                alt="Answer explanation"
                                                                                className="max-w-full h-auto rounded shadow"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>
                            )}

                            {/* Action Buttons */}
                            {/* Action Buttons */}
<div className="mt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="text-sm text-gray-600">
            {questionNumber} of {totalQuestions}
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTimeDisplay(elapsedTime)} elapsed</span>
        </div>
    </div>
    <div className="flex space-x-3">
        {!showResult ? (
            <button
                onClick={handleSubmit}
                disabled={!selectedAnswer || isSubmitting}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
                {isSubmitting ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Submit Answer</span>
                    </>
                )}
            </button>
        ) : (
            // Show "Next" button if not the last question, "See Results" if last
            questionNumber < totalQuestions ? (
                <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <span>Next Question</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </button>
            ) : (
                <button
                    onClick={() => {
                        stopSessionTimer();
                        loadSummary(sessionId);
                    }}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                    <span>See Results</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )
        )}
    </div>
</div>
                        </div>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">No question data available</p>
                    </div>
                )}
            </div>
        </div>
    );
}