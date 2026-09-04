// resources/js/Pages/courses/interactive/StandardModules.jsx
import React from 'react';

const StandardModules = ({ modules, onModuleClick, standard }) => {
    // Helper function to get module color based on type
    const getTypeColor = (type) => {
        switch (type) {
            case 'react_literasi':
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    text: 'text-blue-700',
                    gradient: 'from-blue-500 to-cyan-600'
                };
            case 'unity_webgl':
                return {
                    bg: 'bg-cyan-50',
                    border: 'border-cyan-200',
                    text: 'text-cyan-700',
                    gradient: 'from-cyan-500 to-blue-600'
                };
            case 'DRAG_4_ANSWERS_TOP':
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    text: 'text-blue-700',
                    gradient: 'from-blue-500 to-blue-600'
                };
            case 'DRAG_2_OPTIONS_PER_QUESTION':
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    text: 'text-green-700',
                    gradient: 'from-green-500 to-teal-600'
                };
            case 'DRAG_3_OPTIONS_PER_QUESTION':
                return {
                    bg: 'bg-purple-50',
                    border: 'border-purple-200',
                    text: 'text-purple-700',
                    gradient: 'from-purple-500 to-pink-600'
                };
            default:
                return {
                    bg: 'bg-gray-50',
                    border: 'border-gray-200',
                    text: 'text-gray-700',
                    gradient: 'from-gray-500 to-gray-600'
                };
        }
    };

    // Helper function to get icon
    const getModuleIcon = (icon) => {
        const iconMap = {
            'book-open': '📚',
            'check-circle': '✅',
            'droplet': '💧',
            'type': '🔤',
            'users': '👥',
            'calendar': '📅',
            'palette': '🎨',
            'puzzle': '🧩',
            'volume-2': '🔊',
            'move': '↔️',
            'hash': '#️⃣',
            'plus-circle': '➕',
            'hexagon': '⬢',
            'activity': '🏃‍♂️',
            'navigation': '🧭',
            'gamepad': '🎮',
            'default': '📝'
        };
        return iconMap[icon] || iconMap.default;
    };

    // Helper function to get type display name
    const getTypeDisplayName = (type) => {
        const typeMap = {
            'react_literasi': 'Drag & Drop',
            'DRAG_4_ANSWERS_TOP': '4 Answers Top',
            'DRAG_2_OPTIONS_PER_QUESTION': '2 Options Each',
            'DRAG_3_OPTIONS_PER_QUESTION': '3 Options',
        };
        return typeMap[type] || type;
    };

    return (
        <div className="relative">
            {/* Vertical stepper line */}
            <div className="absolute left-6 top-10 bottom-12 w-1 bg-gray-200 ml-[-1px]"></div>

            <div className="space-y-4">
                {modules.map((module, index) => {
                    const typeColor = getTypeColor(module.type);
                    const isLocked = module.status === 'locked';
                    const isLast = index === modules.length - 1;
                    const stepNumber = index + 1;

                    // Helper function to get status
                    const getStatus = (module) => {
                        if (module.status === 'completed') {
                            return {
                                badge: <span className="text-xs font-medium bg-green-100 text-green-800 px-3 py-1.5 rounded-full flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Completed
                                </span>,
                                iconBg: 'bg-gradient-to-r from-green-400 to-teal-500',
                                buttonText: 'Review Activity',
                                buttonClass: 'bg-green-600 hover:bg-green-700',
                                stepColor: 'bg-green-500',
                                stepIcon: '✓'
                            };
                        } else if (module.status === 'available') {
                            return {
                                badge: <span className="text-xs font-medium bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                    Available Now
                                </span>,
                                iconBg: 'bg-gradient-to-r from-blue-400 to-cyan-500',
                                buttonText: 'Start Activity',
                                buttonClass: 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700',
                                stepColor: 'bg-gray-200',
                                stepIcon: stepNumber
                            };
                        } else {
                            return {
                                badge: <span className="text-xs font-medium bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full flex items-center gap-2">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                    Locked
                                </span>,
                                iconBg: 'bg-gradient-to-r from-gray-300 to-gray-400',
                                buttonText: 'Locked',
                                buttonClass: 'bg-gray-300 cursor-not-allowed text-gray-600',
                                stepColor: 'bg-gray-300',
                                stepIcon: '🔒'
                            };
                        }
                    };

                    const status = getStatus(module);

                    return (
                        <div key={module.id} className="relative">
                            {/* Stepper circle */}
                            <div className={`absolute left-6 top-[40px] z-10 w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-white font-bold transform -translate-x-1/2 ${status.stepColor}`}>
                                
                            </div>

                            {/* Card - Made clickable */}
                            <div 
                                onClick={() => !isLocked && onModuleClick(module)}
                                className={`ml-8 border rounded-s-full shadow-sm cursor-pointer ${typeColor.bg} ${typeColor.border} ${isLocked ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-md hover:-translate-x-1 hover:bg-opacity-90'
                                    }`}
                            >
                                <div className="p-4">
                                    {/* Header with title and badge */}
                                    <div className="flex flex-col sm:flex-row justify-between gap-0 mb-0">
                                        <div className="flex-auto max-w-48">
                                            <div className="flex">
                                                <div className={`w-20 h-20 rounded-full ${status.iconBg} flex items-center justify-center shadow-sm`}>
                                                    <span className="text-white text-xl">{getModuleIcon(module.icon)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1 justify-start items-start text-left">
                                            <div className="flex flex-col">
                                                {/* Dynamic standard name */}
                                                <h3 className="font-bold text-gray-400 text-xs mb-3">
                                                    {standard || module.standard || 'STANDARD'}
                                                </h3>

                                                <h3 className="font-semibold text-black text-lg">
                                                     {module.title || `Interactive ${stepNumber}`}
                                                </h3>
                                                <p className="font-light text-gray-600 text-md">
                                                     {module.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Connector line (except for last item) */}
                            {!isLast && (
                                <div className="absolute left-8 top-full h-8 w-0.5 bg-gray-200 transform -translate-x-1/2"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StandardModules;
