// resources/js/data/interactive-questions/mathematics/standard2.js
import { 
    createMethod1Template, 
    createMethod2Template, 
    createMethod3Template 
} from '../templates.js';

export const mathematicsStandard2Questions = [
    // Method 1: Multiplication
    {
        ...createMethod1Template(
            43,
            "Matematik",
            "Standard 2",
            "Multiplication",
            "Match multiplication problems",
            "x"
        ),
        data: {
            question: "Drag the correct answer.",
            answers: ["6", "8", "9", "12"],
            questions: [
                { text: "2 × 3 =", correctAnswer: "6" },
                { text: "4 × 2 =", correctAnswer: "8" },
                { text: "3 × 3 =", correctAnswer: "9" },
                { text: "4 × 3 =", correctAnswer: "12" }
            ]
        }
    },

    // Method 2: Subtraction
    {
        ...createMethod2Template(
            44,
            "Matematik",
            "Standard 2",
            "Subtraction",
            "Choose correct subtraction answers",
            "minus-circle"
        ),
        data: {
            question: "Drag the correct answer.",
            questions: [
                { 
                    text: "5 - 2 =", 
                    options: ["3", "2"], 
                    correctAnswer: "3" 
                },
                { 
                    text: "8 - 3 =", 
                    options: ["5", "4"], 
                    correctAnswer: "5" 
                },
                { 
                    text: "10 - 4 =", 
                    options: ["6", "5"], 
                    correctAnswer: "6" 
                },
                { 
                    text: "7 - 2 =", 
                    options: ["5", "6"], 
                    correctAnswer: "5" 
                }
            ]
        }
    }
];