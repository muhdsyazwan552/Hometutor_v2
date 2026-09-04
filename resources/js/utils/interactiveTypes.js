// utils/interactiveTypes.js
export const INTERACTIVE_TYPES = {
    // Method 1: 4 answers at top, 4 questions below
    DRAG_4_ANSWERS_TOP: 'drag_4_answers_top',
    
    // Method 2: 4 questions, each with 2 options
    DRAG_2_OPTIONS_PER_QUESTION: 'drag_2_options_per_question',
    
    // Method 3: 1 question with 3 options for answers
    DRAG_3_OPTIONS_PER_QUESTION: 'drag_3_options_per_question'
};

export const getInteractiveData = (module) => {
    if (!module || !module.data) {
        return getDefaultData(module?.type);
    }
    
    return {
        title: module.title || "Interactive Activity",
        type: module.type || INTERACTIVE_TYPES.DRAG_4_ANSWERS_TOP,
        question: module.data?.question || "Complete the activity below",
        ...module.data
    };
};

const getDefaultData = (type = INTERACTIVE_TYPES.DRAG_4_ANSWERS_TOP) => {
    switch(type) {
        case INTERACTIVE_TYPES.DRAG_4_ANSWERS_TOP:
            return {
                title: "Drag from Top to Bottom",
                question: "Drag the answers from the top to match the questions below.",
                answers: ["Answer A", "Answer B", "Answer C", "Answer D"],
                questions: [
                    { text: "Question 1", correctAnswer: "Answer A" },
                    { text: "Question 2", correctAnswer: "Answer B" },
                    { text: "Question 3", correctAnswer: "Answer C" },
                    { text: "Question 4", correctAnswer: "Answer D" }
                ]
            };
            
        case INTERACTIVE_TYPES.DRAG_2_OPTIONS_PER_QUESTION:
            return {
                title: "Two Options Per Question",
                question: "Select the correct answer for each question from two options.",
                questions: [
                    {
                        text: "Question 1",
                        options: ["Option A", "Option B"],
                        correctAnswer: "Option A"
                    },
                    {
                        text: "Question 2",
                        options: ["Option C", "Option D"],
                        correctAnswer: "Option D"
                    },
                    {
                        text: "Question 3",
                        options: ["Option E", "Option F"],
                        correctAnswer: "Option E"
                    },
                    {
                        text: "Question 4",
                        options: ["Option G", "Option H"],
                        correctAnswer: "Option H"
                    }
                ]
            };
            
        case INTERACTIVE_TYPES.DRAG_3_OPTIONS_PER_QUESTION:
            return {
                title: "Three Options Per Question",
                question: "Choose the best answer for the question from three options.",
                questions: [
                    {
                        text: "Main Question",
                        options: ["Option A", "Option B", "Option C"],
                        correctAnswer: "Option B"
                    }
                ],
                // For this type, we have one question with 3 possible answers to drag
                availableAnswers: ["Answer 1", "Answer 2", "Answer 3"]
            };
            
        default:
            return getDefaultData(INTERACTIVE_TYPES.DRAG_4_ANSWERS_TOP);
    }
};