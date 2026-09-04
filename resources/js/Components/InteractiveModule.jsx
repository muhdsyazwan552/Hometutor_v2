// components/InteractiveModule.jsx
import React, { useState, useEffect } from 'react';
import { INTERACTIVE_TYPES } from '@/utils/interactiveTypes';

const InteractiveModule = ({ module, onComplete, onClose }) => {
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(module.timeLimit || 0);
    const [attempts, setAttempts] = useState(0);
    const [showResults, setShowResults] = useState(false);

    // Timer effect
    useEffect(() => {
        if (timeLeft > 0 && !showResults) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !showResults) {
            handleSubmit();
        }
    }, [timeLeft, showResults]);

    const renderModuleContent = () => {
        switch(module.type) {
            case INTERACTIVE_TYPES.DRAG_DROP_CLASSIFY:
                return renderDragDropClassify();
            case INTERACTIVE_TYPES.DRAG_DROP_MATCHING:
                return renderDragDropMatching();
            case INTERACTIVE_TYPES.DRAG_DROP_COMMUNICATION:
                return renderCommunicationMatching();
            case INTERACTIVE_TYPES.DRAG_DROP_SITUATIONAL:
                return renderSituationalResponses();
            default:
                return <div>Module type not supported</div>;
        }
    };

    // Drag and Drop Classification Component
    const renderDragDropClassify = () => {
        const handleDrop = (index, value) => {
            setAnswers(prev => ({
                ...prev,
                [index]: value
            }));
        };

        return (
            <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="text-lg font-semibold text-blue-800">{module.question}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Statements Column */}
                    <div className="space-y-4">
                        {module.statements.map((statement, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg shadow border">
                                <p className="text-gray-700 mb-2">{index + 1}) {statement}</p>
                                
                                {/* Drop Zone */}
                                <div 
                                    className={`h-12 border-2 border-dashed rounded-lg flex items-center justify-center ${
                                        answers[index] 
                                            ? 'bg-green-50 border-green-300' 
                                            : 'bg-gray-50 border-gray-300'
                                    }`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const value = e.dataTransfer.getData('text/plain');
                                        handleDrop(index, value);
                                    }}
                                >
                                    {answers[index] ? (
                                        <span className="font-bold text-lg">{answers[index]}</span>
                                    ) : (
                                        <span className="text-gray-400">Drop answer here</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Answer Choices Column */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-700">Jawapan:</h3>
                        {module.answerChoices.map((choice, index) => (
                            <div
                                key={index}
                                className="bg-white p-4 rounded-lg shadow border cursor-move hover:shadow-md transition-shadow"
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('text/plain', choice);
                                }}
                            >
                                <p className="text-center font-bold text-lg">{choice}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Number Matching Component
    const renderDragDropMatching = () => {
        const [matches, setMatches] = useState({});

        const handleDrop = (matchId, value) => {
            setMatches(prev => ({
                ...prev,
                [matchId]: value
            }));
        };

        return (
            <div className="space-y-6">
                <div className="bg-purple-50 p-4 rounded-lg mb-4">
                    <p className="text-lg font-semibold text-purple-800">{module.question}</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Number Items */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-700 mb-4">Nombor:</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {module.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-4 rounded-lg shadow border cursor-move hover:shadow-md transition-shadow"
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData('text/plain', item);
                                    }}
                                >
                                    <p className="text-center font-bold text-xl">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Matching Targets */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-700 mb-4">Padankan:</h3>
                        {module.matches.map((match, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg shadow border">
                                <p className="text-gray-700 mb-2">{index + 1}) {match.label}</p>
                                
                                {/* Drop Zone */}
                                <div 
                                    className={`h-12 border-2 border-dashed rounded-lg flex items-center justify-center ${
                                        matches[index] 
                                            ? 'bg-green-50 border-green-300' 
                                            : 'bg-gray-50 border-gray-300'
                                    }`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const value = e.dataTransfer.getData('text/plain');
                                        handleDrop(index, value);
                                    }}
                                >
                                    {matches[index] ? (
                                        <span className="font-bold text-xl">{matches[index]}</span>
                                    ) : (
                                        <span className="text-gray-400">= □</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Communication Matching Component
    const renderCommunicationMatching = () => {
        const [matchedItems, setMatchedItems] = useState({});

        const handleDrop = (imageIndex, communicationType) => {
            setMatchedItems(prev => ({
                ...prev,
                [imageIndex]: communicationType
            }));
        };

        return (
            <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                    <p className="text-lg font-semibold text-green-800">{module.question}</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Communication Types */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-700 mb-4">Bentuk Komunikasi:</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {module.communicationTypes.map((type, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-3 rounded-lg shadow border cursor-move hover:shadow-md transition-shadow"
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData('text/plain', type);
                                    }}
                                >
                                    <p className="text-center font-medium">{type}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Images */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-700 mb-4">Gambar:</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {module.images.map((image, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg shadow border">
                                    <img 
                                        src={image.src} 
                                        alt={image.type}
                                        className="w-full h-32 object-cover rounded mb-2"
                                    />
                                    
                                    {/* Drop Zone */}
                                    <div 
                                        className={`h-10 border-2 border-dashed rounded flex items-center justify-center text-sm ${
                                            matchedItems[index] 
                                                ? 'bg-green-50 border-green-300' 
                                                : 'bg-gray-50 border-gray-300'
                                        }`}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const value = e.dataTransfer.getData('text/plain');
                                            handleDrop(index, value);
                                        }}
                                    >
                                        {matchedItems[index] || "Seret jawapan"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Situational Responses Component
    const renderSituationalResponses = () => {
        const [selectedResponses, setSelectedResponses] = useState({});

        const handleDrop = (situationIndex, response) => {
            setSelectedResponses(prev => ({
                ...prev,
                [situationIndex]: response
            }));
        };

        return (
            <div className="space-y-6">
                <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                    <p className="text-lg font-semibold text-yellow-800">{module.question}</p>
                </div>
                
                <div className="space-y-6">
                    {module.situations.map((situation, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow border">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Situation */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="font-bold text-blue-600">{index + 1}</span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {situation.text}
                                        </h3>
                                    </div>
                                    
                                    <img 
                                        src={situation.image} 
                                        alt="Situation"
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                    
                                    {/* Drop Zone */}
                                    <div 
                                        className={`p-4 border-2 border-dashed rounded-lg ${
                                            selectedResponses[index] 
                                                ? 'bg-green-50 border-green-300' 
                                                : 'bg-gray-50 border-gray-300'
                                        }`}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const value = e.dataTransfer.getData('text/plain');
                                            handleDrop(index, value);
                                        }}
                                    >
                                        {selectedResponses[index] ? (
                                            <p className="text-center font-medium">{selectedResponses[index]}</p>
                                        ) : (
                                            <p className="text-center text-gray-400">Drop your answer here</p>
                                        )}
                                    </div>
                                </div>

                                {/* Response Options */}
                                <div className="space-y-3">
                                    <h4 className="font-bold text-gray-700">Response Options:</h4>
                                    {situation.options.map((option, optIndex) => (
                                        <div
                                            key={optIndex}
                                            className="bg-gray-50 p-3 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
                                            draggable
                                            onDragStart={(e) => {
                                                e.dataTransfer.setData('text/plain', option);
                                            }}
                                        >
                                            <p className="text-gray-700">{option}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const handleSubmit = () => {
        // Calculate score
        let calculatedScore = 0;
        
        switch(module.type) {
            case INTERACTIVE_TYPES.DRAG_DROP_CLASSIFY:
                const correctCount = Object.keys(answers).filter(
                    key => answers[key] === module.correctAnswers[key]
                ).length;
                calculatedScore = (correctCount / module.statements.length) * 100;
                break;
            // Add scoring logic for other types
        }
        
        setScore(calculatedScore);
        setShowResults(true);
        setAttempts(prev => prev + 1);
    };

    const handleRetry = () => {
        if (attempts < module.attempts) {
            setAnswers({});
            setScore(0);
            setShowResults(false);
            setTimeLeft(module.timeLimit);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">{module.title}</h2>
                        <p className="text-white/80 text-sm">
                            {module.subject} • {module.standard} • {module.level}
                        </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        {/* Timer */}
                        {module.timeLimit > 0 && (
                            <div className="bg-white/20 px-3 py-1 rounded-full">
                                <span className="font-bold text-white">
                                    ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                </span>
                            </div>
                        )}
                        
                        {/* Attempts */}
                        <div className="bg-white/20 px-3 py-1 rounded-full">
                            <span className="text-white">
                                Attempt: {attempts}/{module.attempts}
                            </span>
                        </div>
                        
                        <button
                            onClick={onClose}
                            className="text-white hover:text-white/80"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {renderModuleContent()}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t">
                <div className="flex items-center justify-between">
                    <div>
                        {showResults && (
                            <div className="text-lg font-bold">
                                Score: <span className="text-green-600">{score.toFixed(0)}%</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex space-x-3">
                        {!showResults ? (
                            <>
                                <button
                                    onClick={handleRetry}
                                    disabled={attempts >= module.attempts}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:opacity-90 font-medium"
                                >
                                    Semak Jawapan
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleRetry}
                                    disabled={attempts >= module.attempts}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={() => onComplete(score)}
                                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:opacity-90 font-medium"
                                >
                                    Continue
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Results Modal */}
            {showResults && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                                <span className="text-white text-2xl">✓</span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                {score >= 70 ? 'Excellent!' : score >= 50 ? 'Good Job!' : 'Keep Trying!'}
                            </h3>
                            
                            <div className="text-3xl font-bold text-teal-600 mb-4">
                                {score.toFixed(0)}%
                            </div>
                            
                            <p className="text-gray-600 mb-6">
                                {score >= 70 
                                    ? 'You have mastered this module!'
                                    : score >= 50
                                    ? 'Good understanding, but some room for improvement.'
                                    : 'Let\'s review the concepts and try again.'
                                }
                            </p>
                            
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleRetry}
                                    disabled={attempts >= module.attempts}
                                    className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Retry ({module.attempts - attempts} left)
                                </button>
                                <button
                                    onClick={() => onComplete(score)}
                                    className="flex-1 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:opacity-90"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InteractiveModule;