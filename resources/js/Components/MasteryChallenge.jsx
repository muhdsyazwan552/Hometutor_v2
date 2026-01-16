import React, { useState, useEffect } from "react";

export default function MasteryChallenge({ isOpen, onClose, subjectId, levelId, subjectKey }) {
    const [sessionId, setSessionId] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(10);
    const [startTime, setStartTime] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [answerHistory, setAnswerHistory] = useState([]);
    const [showExplanation, setShowExplanation] = useState(false);

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

    useEffect(() => {
        if (isOpen && !sessionId) {
            console.log('Modal opened, starting new challenge');
            startChallenge();
        }
    }, [isOpen]);

    const startChallenge = async () => {
        setLoading(true);
        try {
            await refreshCsrfToken();
            
            const csrfToken = getCsrfToken();
            
            const response = await fetch('/api/challenge/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    subject_id: subjectId,
                    level_id: levelId
                })
            });

            if (response.status === 419) {
                console.log('CSRF token expired, refreshing and retrying...');
                await refreshCsrfToken();
                return startChallenge();
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Challenge started:', data);
            setSessionId(data.session_id);
            setTotalQuestions(data.total_questions);
            
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
            console.error('Error starting challenge:', error);
            alert('Failed to start challenge. Please try again.');
            setLoading(false);
        }
    };

    const loadNextQuestion = async (sid) => {
        setLoading(true);
        setShowResult(false);
        setSelectedAnswer(null);
        setShowExplanation(false); // Reset explanation visibility
        
        try {
            const response = await fetch(`/api/challenge/question?session_id=${sid || sessionId}`);
            const data = await response.json();
            
            console.log('Question data received:', data);

            if (data.completed) {
                await loadSummary(sid || sessionId);
            } else {
                setCurrentQuestion({
                    ...data.question,
                    answers: data.answers
                });
                setQuestionNumber(data.current_question);
                setTotalQuestions(data.total_questions);
                setStartTime(Date.now());
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
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);

        try {
            await refreshCsrfToken();
            
            const response = await fetch('/api/challenge/answer', {
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
                    time_taken: timeTaken
                })
            });

            if (response.status === 419) {
                console.log('CSRF token expired, refreshing and retrying...');
                await refreshCsrfToken();
                setIsSubmitting(false);
                return handleSubmit();
            }

            const data = await response.json();
            console.log('Answer submitted:', data);
            
            setIsCorrect(data.is_correct);
            setShowResult(true);

            // Add to history
            setAnswerHistory(prev => [...prev, {
                questionNumber: questionNumber,
                isCorrect: data.is_correct
            }]);

            if (data.challenge_complete) {
                setTimeout(() => loadSummary(sessionId), 2000);
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
            alert('Failed to submit answer. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const loadSummary = async (sid) => {
        try {
            const response = await fetch(`/api/challenge/summary?session_id=${sid}`);
            const data = await response.json();
            console.log('Summary loaded:', data);
            setSummary(data);
        } catch (error) {
            console.error('Error loading summary:', error);
        }
    };

    const handleNext = () => {
        loadNextQuestion(sessionId);
    };

    const handleClose = () => {
        setSessionId(null);
        setCurrentQuestion(null);
        setSelectedAnswer(null);
        setShowResult(false);
        setSummary(null);
        setQuestionNumber(0);
        setAnswerHistory([]);
        setShowExplanation(false);
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

    console.log('Render state:', {
        answerHistory,
        remainingProblems,
        totalQuestions,
        questionNumber
    });

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
                {loading && !currentQuestion ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading challenge...</p>
                    </div>
                ) : summary ? (
                    // Summary View
                    <div className="relative">
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-8 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                <div className="absolute top-20 right-20 w-1 h-1 bg-white rounded-full animate-pulse delay-100"></div>
                                <div className="absolute bottom-10 left-1/3 w-1 h-1 bg-white rounded-full animate-pulse delay-200"></div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl"
                            >
                                ×
                            </button>
                            <div className="text-center relative z-10">
                                <h2 className="text-3xl font-bold mb-2">You've completed the mastery challenge</h2>
                                <p className="text-xl text-blue-100">GREAT JOB!</p>
                            </div>
                        </div>

                        <div className="p-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">PROGRESS MADE</h3>
                            <div className="space-y-4">
                                {summary.progress && summary.progress.length > 0 ? (
                                    summary.progress.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 bg-blue-50 rounded-lg"
                                        >
                                            <span className="text-sky-600 font-medium">{item.topic}</span>
                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center space-x-2">
                                                    <div className="px-3 py-1 bg-gray-200 rounded text-sm capitalize">
                                                        {item.previous_mastery?.replace('_', ' ') || 'Not started'}
                                                    </div>
                                                    <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                    <div className={`px-3 py-1 rounded text-sm capitalize ${
                                                        item.mastery_changed ? 'bg-sky-500 text-white' : 'bg-gray-200'
                                                    }`}>
                                                        {item.new_mastery?.replace('_', ' ')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No progress data available</p>
                                )}
                            </div>

                            <div className="mt-8 p-6 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Your Score</p>
                                        <p className="text-3xl font-bold text-teal-600">
                                            {summary.correct_answers}/{summary.total_questions}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Accuracy</p>
                                        <p className="text-3xl font-bold text-cyan-600">
                                            {summary.score_percentage}%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleContinue}
                                className="mt-6 w-full py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center space-x-2"
                            >
                                <span>Continue to next challenge</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ) : currentQuestion ? (
                    // Question View
                    <div>
                        {/* Header with Progress Circles */}
                        <div className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white p-6 relative">
                            {/* Close button - positioned absolutely */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl"
                            >
                                ×
                            </button>
                            
                            <div className="flex items-start justify-between pr-8">
                                <div>
                                    <h3 className="text-lg font-semibold">Mastery Challenge</h3>
                                    <p className="text-sm text-sky-100 mt-1">
                                        Question {questionNumber} of {totalQuestions}
                                    </p>
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
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                                        answered?.isCorrect
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

                        {/* Progress Bar */}
                        <div className="h-2 bg-gray-200">
                            <div
                                className="h-full bg-sky-500 transition-all duration-300"
                                style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                            ></div>
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
                                                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                                                    showCorrect
                                                        ? 'border-green-500 bg-green-50'
                                                        : showWrong
                                                        ? 'border-red-500 bg-red-50'
                                                        : isSelected
                                                        ? 'border-sky-500 bg-sky-50'
                                                        : 'border-gray-200 hover:border-sky-300 hover:bg-gray-50'
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
                                                        <p className="text-sm text-green-700">That's the right answer. Keep doing it!</p>
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
                                                        <p className="text-sm text-red-700">Review the correct answer above</p>
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
                            <div className="mt-8 flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                    {questionNumber} of {totalQuestions}
                                </div>
                                <div className="flex space-x-3">
                                    {!showResult ? (
                                        <button
                                            onClick={handleSubmit}
                                            disabled={!selectedAnswer || isSubmitting}
                                            className="px-6 py-3 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleNext}
                                            className="px-6 py-3 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition-colors flex items-center space-x-2"
                                        >
                                            <span>Next question</span>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </button>
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