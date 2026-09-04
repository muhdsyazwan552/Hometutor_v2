// components/DragDropModal.jsx
import React, { useState, useEffect } from 'react';
import { INTERACTIVE_TYPES, getInteractiveData } from '@/utils/interactiveTypes';

const DragDropModal = ({ activity, onClose, onComplete }) => {
    const [localActivity, setLocalActivity] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [draggingItem, setDraggingItem] = useState(null);

    useEffect(() => {
        if (activity) {
            setLocalActivity(activity);
            setUserAnswers({});
            setShowResults(false);
        }
    }, [activity]);

    if (!localActivity) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                            <span className="text-red-500 text-2xl">⚠️</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            Loading Activity...
                        </h3>
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium mt-4"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const activityData = getInteractiveData(localActivity);

    // Drag and Drop Handlers
    const handleDragStart = (e, answer, source, sourceIndex, questionIndex = null) => {
        e.dataTransfer.setData('text/plain', answer);
        e.dataTransfer.setData('source', source);
        e.dataTransfer.setData('sourceIndex', sourceIndex.toString());
        if (questionIndex !== null) {
            e.dataTransfer.setData('questionIndex', questionIndex.toString());
        }
        e.target.classList.add('dragging');
        setDraggingItem({ answer, source, sourceIndex, questionIndex });
    };

    const handleDragEnd = () => {
        setDraggingItem(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    };

    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('drag-over');
    };

    const handleDrop = (e, questionIndex, dropZoneType = 'question') => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        const answer = e.dataTransfer.getData('text/plain');
        const source = e.dataTransfer.getData('source');
        const sourceIndex = parseInt(e.dataTransfer.getData('sourceIndex'));
        const questionSourceIndex = e.dataTransfer.getData('questionIndex');
        
        setUserAnswers(prev => ({
            ...prev,
            [questionIndex]: { 
                answer, 
                source, 
                sourceIndex,
                questionSourceIndex: questionSourceIndex ? parseInt(questionSourceIndex) : null,
                timestamp: Date.now()
            }
        }));
    };

    const handleClearAnswer = (questionIndex) => {
        setUserAnswers(prev => {
            const newAnswers = { ...prev };
            delete newAnswers[questionIndex];
            return newAnswers;
        });
    };

    const handleClearAll = () => {
        setUserAnswers({});
    };

    const handleSubmit = () => {
        setShowResults(true);
    };

    const handleRetry = () => {
        setUserAnswers({});
        setShowResults(false);
    };

    const handleContinue = () => {
        if (onComplete) onComplete();
    };

    // Check if all questions are answered
    const isComplete = () => {
        if (!activityData.questions) return false;
        return Object.keys(userAnswers).length === activityData.questions.length;
    };

    // Method 1: 4 answers at top, 4 questions below
    const renderMethod1 = () => {
        // Get used answers to disable them
        const usedAnswerIndices = Object.values(userAnswers)
            .filter(a => a.source === 'answers')
            .map(a => a.sourceIndex);

        return (
            <div className="space-y-8">
                {/* Instruction */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-lg font-semibold text-blue-800 text-center">
                        {activityData.question}
                    </p>
                    <p className="text-blue-600 text-sm text-center mt-1">
                        Drag one answer from top to each question below. Each answer can be used only once.
                    </p>
                </div>

                {/* Answers Bank at Top - 4 answers */}
                <div>
                    <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">Drag Answers From Here:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {activityData.answers?.slice(0, 4).map((answer, index) => {
                            const isUsed = usedAnswerIndices.includes(index);
                            
                            return (
                                <div
                                    key={index}
                                    className={`p-4 rounded-lg border text-center transition-all duration-200 ${isUsed
                                            ? 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed'
                                            : 'bg-white border-gray-200 shadow-sm cursor-move hover:shadow-md hover:border-blue-300 active:scale-95'
                                        }`}
                                    draggable={!isUsed}
                                    onDragStart={(e) => !isUsed && handleDragStart(e, answer, 'answers', index)}
                                    onDragEnd={handleDragEnd}
                                >
                                    <p className="font-medium text-gray-800 text-lg">{answer}</p>
                                    {/* {!isUsed && (
                                        <p className="text-gray-500 text-xs mt-1">Drag me</p>
                                    )} */}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 4 Questions Below */}
                <div>
                    <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">Drop Answers Here:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activityData.questions?.slice(0, 4).map((question, index) => (
                            <div key={index} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="font-bold text-blue-700">{index + 1}</span>
                                    </div>
                                    <p className="text-gray-700 text-lg">{question.text}</p>
                                </div>
                                
                                {/* Drop Zone */}
                                <div 
                                    className={`min-h-16 border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${userAnswers[index] 
                                            ? 'bg-green-50 border-green-400' 
                                            : 'bg-gray-50 border-gray-300 hover:border-blue-300'
                                        }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, index)}
                                >
                                    {userAnswers[index] ? (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                    <span className="font-bold text-green-700">✓</span>
                                                </div>
                                                <p className="font-medium text-gray-800 text-lg">
                                                    {userAnswers[index].answer}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleClearAnswer(index)}
                                                className="text-red-500 hover:text-red-700 ml-2"
                                            >
                                                ✕ Clear
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-2">
                                            <div className="w-12 h-12 mx-auto mb-2 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                                                <span className="text-gray-400 text-xl">↓</span>
                                            </div>
                                            <p className="text-gray-400">Drag answer here</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Method 2: 4 questions, each with 2 options
    const renderMethod2 = () => {
        return (
            <div className="space-y-8">
                {/* Instruction */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <p className="text-lg font-semibold text-green-800 text-center">
                        {activityData.question}
                    </p>
                    <p className="text-green-600 text-sm text-center mt-1">
                        Each question has two options. Drag the correct answer to each question.
                    </p>
                </div>

                {/* Questions with their own options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {activityData.questions?.slice(0, 4).map((question, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            {/* Question Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="font-bold text-green-700 text-lg">{index + 1}</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">
                                    {question.text}
                                </h3>
                            </div>
                            
                            {/* Two Options for this question */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {question.options?.slice(0, 2).map((option, optionIndex) => {
                                    const isSelected = userAnswers[index]?.answer === option;
                                    
                                    return (
                                        <div
                                            key={optionIndex}
                                            className={`p-4 rounded-lg border text-center cursor-move transition-all duration-200 ${isSelected
                                                    ? 'bg-green-50 border-green-400'
                                                    : 'bg-gray-50 border-gray-200 hover:border-green-300 hover:shadow-sm'
                                                }`}
                                            draggable="true"
                                            onDragStart={(e) => handleDragStart(e, option, 'options', optionIndex, index)}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <p className="font-medium text-gray-800">{option}</p>
                                            {!isSelected && (
                                                <p className="text-gray-500 text-xs mt-1">Drag to answer box</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Drop Zone for this question */}
                            <div 
                                className={`min-h-20 border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${userAnswers[index]
                                        ? 'bg-green-50 border-green-400' 
                                        : 'bg-gray-50 border-gray-300 hover:border-green-300'
                                    }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                            >
                                {userAnswers[index] ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                <span className="font-bold text-green-700">✓</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-lg">
                                                    {userAnswers[index].answer}
                                                </p>
                                                <p className="text-gray-500 text-sm">
                                                    Selected answer
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleClearAnswer(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            ✕ Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <div className="w-12 h-12 mx-auto mb-2 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                                            <span className="text-gray-400 text-xl">↓</span>
                                        </div>
                                        <p className="text-gray-400 font-medium">Drop answer here</p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Drag one of the options above
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Method 3: 1 question with 3 options
    const renderMethod3 = () => {
        const mainQuestion = activityData.questions?.[0];
        
        return (
            <div className="space-y-8">
                {/* Instruction */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <p className="text-lg font-semibold text-purple-800 text-center">
                        {activityData.question}
                    </p>
                    <p className="text-purple-600 text-sm text-center mt-1">
                        Drag the correct answer to the question below from three options.
                    </p>
                </div>

                {/* Main Question */}
                <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="font-bold text-purple-700 text-xl">Q</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {mainQuestion?.text || "Main Question"}
                        </h2>
                    </div>
                    
                    {/* Three Answer Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {mainQuestion?.options?.slice(0, 3).map((option, index) => {
                            const isSelected = userAnswers[0]?.answer === option;
                            const optionLetters = ['A', 'B', 'C'];
                            
                            return (
                                <div
                                    key={index}
                                    className={`p-6 rounded-lg border cursor-move transition-all duration-200 ${isSelected
                                            ? 'bg-purple-50 border-purple-400'
                                            : 'bg-gray-50 border-gray-200 hover:border-purple-300 hover:shadow-sm'
                                        }`}
                                    draggable="true"
                                    onDragStart={(e) => handleDragStart(e, option, 'options', index)}
                                    onDragEnd={handleDragEnd}
                                >
                                    <div className="flex items-center justify-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                            <span className="font-bold text-purple-700">
                                                {optionLetters[index]}
                                            </span>
                                        </div>
                                        <p className="font-bold text-gray-800 text-lg">{option}</p>
                                    </div>
                                    {!isSelected && (
                                        <p className="text-gray-500 text-sm text-center">
                                            Drag to answer box
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Drop Zone for Answer */}
                    <div 
                        className={`min-h-32 border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${userAnswers[0]
                                ? 'bg-purple-50 border-purple-400' 
                                : 'bg-gray-50 border-gray-300 hover:border-purple-300'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 0)}
                    >
                        {userAnswers[0] ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                            <span className="text-green-700 text-2xl">✓</span>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm">Your answer:</p>
                                            <p className="font-bold text-gray-800 text-2xl">
                                                {userAnswers[0].answer}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleClearAnswer(0)}
                                        className="text-red-500 hover:text-red-700 px-4 py-2 border border-red-200 rounded-lg"
                                    >
                                        Change Answer
                                    </button>
                                </div>
                                <p className="text-gray-500 text-sm">
                                    Drag another option to change your answer
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 mx-auto mb-4 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                                    <span className="text-gray-400 text-3xl">↓</span>
                                </div>
                                <p className="text-gray-400 text-xl font-medium mb-2">Drop your answer here</p>
                                <p className="text-gray-400">
                                    Drag one of the options above to this box
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Render based on activity type
    const renderContent = () => {
        switch(activityData.type) {
            case INTERACTIVE_TYPES.DRAG_4_ANSWERS_TOP:
                return renderMethod1();
                
            case INTERACTIVE_TYPES.DRAG_2_OPTIONS_PER_QUESTION:
                return renderMethod2();
                
            case INTERACTIVE_TYPES.DRAG_3_OPTIONS_PER_QUESTION:
                return renderMethod3();
                
            default:
                return renderMethod1();
        }
    };

    // Get header color based on type
    const getHeaderColor = () => {
        switch(activityData.type) {
            case INTERACTIVE_TYPES.DRAG_4_ANSWERS_TOP:
                return 'bg-blue-500';
            case INTERACTIVE_TYPES.DRAG_2_OPTIONS_PER_QUESTION:
                return 'bg-green-500';
            case INTERACTIVE_TYPES.DRAG_3_OPTIONS_PER_QUESTION:
                return 'bg-purple-500';
            default:
                return 'bg-teal-500';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className={`px-6 py-4 ${getHeaderColor()}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white">{activityData.title}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                
                               
                            </div>
                        </div>
                        
                        <button
                            onClick={onClose}
                            className="text-white hover:text-white/80 text-xl"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {renderContent()}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            {Object.keys(userAnswers).length} of {activityData.questions?.length || 0} answered
                        </div>
                        
                        <div className="flex space-x-3">
                            {!showResults ? (
                                <>
                                    <button
                                        onClick={handleClearAll}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                    >
                                        Clear All Answers
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!isComplete()}
                                        className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Semak Jawapan
                                    </button>
                                </>
                            ) : (
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleRetry}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                    >
                                        Try Again
                                    </button>
                                    <button
                                        onClick={handleContinue}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                    >
                                        Continue
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results Overlay */}
                {showResults && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[60]">
                        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-green-400 to-teal-500 flex items-center justify-center mb-4">
                                    <span className="text-white text-3xl">✓</span>
                                </div>
                                
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                    Excellent!
                                </h3>
                                
                                <p className="text-gray-600 mb-2">
                                    You have completed this activity successfully.
                                </p>
                                
                                <div className="space-y-3 mt-6">
                                    <button
                                        onClick={handleRetry}
                                        className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                    >
                                        Practice Again
                                    </button>
                                    <button
                                        onClick={handleContinue}
                                        className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:opacity-90 font-medium"
                                    >
                                        Return to Activities
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DragDropModal;