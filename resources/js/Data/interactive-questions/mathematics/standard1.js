// resources/js/data/interactive-questions/mathematics/standard1.js
import { 
    createMethod1Template, 
    createMethod2Template, 
    createMethod3Template 
} from '../templates.js';

export const mathematicsStandard1Questions = [
    // Method 1: Number Matching
    {
        ...createMethod1Template(
            40,
            "Matematik",
            "Standard 1",
            "Number Matching",
            "Match numbers with words",
            "hash"
        ),
        data: {
            question: "Drag the correct number to each word.",
            answers: ["1", "2", "3", "4"],
            questions: [
                { text: "Satu", correctAnswer: "1" },
                { text: "Dua", correctAnswer: "2" },
                { text: "Tiga", correctAnswer: "3" },
                { text: "Empat", correctAnswer: "4" }
            ]
        }
    },

    // Method 2: Simple Addition
    {
        ...createMethod2Template(
            41,
            "Matematik",
            "Standard 1",
            "Simple Addition",
            "Choose correct addition answers",
            "plus-circle"
        ),
        data: {
            question: "Drag the correct answer.",
            questions: [
                { 
                    text: "2 + 2 =", 
                    options: ["4", "5"], 
                    correctAnswer: "4" 
                },
                { 
                    text: "3 + 1 =", 
                    options: ["4", "3"], 
                    correctAnswer: "4" 
                },
                { 
                    text: "1 + 4 =", 
                    options: ["5", "4"], 
                    correctAnswer: "5" 
                },
                { 
                    text: "2 + 3 =", 
                    options: ["5", "6"], 
                    correctAnswer: "5" 
                }
            ]
        }
    },

    // Method 3: Shape Identification
    {
        ...createMethod3Template(
            42,
            "Matematik",
            "Standard 1",
            "Shape Identification",
            "Identify the correct shape",
            "hexagon"
        ),
        data: {
            question: "Which shape has 3 sides?",
            questions: [
                {
                    text: "Which shape has 3 sides?",
                    options: ["Triangle", "Square", "Circle"],
                    correctAnswer: "Triangle"
                }
            ]
        }
    }
];