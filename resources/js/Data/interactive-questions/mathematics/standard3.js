// resources/js/data/interactive-questions/mathematics/standard3.js
import { 
    createMethod1Template, 
    createMethod2Template, 
    createMethod3Template 
} from '../templates.js';

export const mathematicsStandard3Questions = [
    // Method 1: Division
    {
        ...createMethod1Template(
            45,
            "Matematik",
            "Standard 3",
            "Division",
            "Match division problems",
            "divide-circle"
        ),
        data: {
            question: "Drag the correct answer.",
            answers: ["3", "4", "5", "6"],
            questions: [
                { text: "9 ÷ 3 =", correctAnswer: "3" },
                { text: "12 ÷ 3 =", correctAnswer: "4" },
                { text: "15 ÷ 3 =", correctAnswer: "5" },
                { text: "18 ÷ 3 =", correctAnswer: "6" }
            ]
        }
    },

    // Method 2: Fractions
    {
        ...createMethod2Template(
            46,
            "Matematik",
            "Standard 3",
            "Fractions",
            "Choose correct fractions",
            "pie-chart"
        ),
        data: {
            question: "Drag the correct fraction.",
            questions: [
                { 
                    text: "Half of 10 is:", 
                    options: ["5", "10"], 
                    correctAnswer: "5" 
                },
                { 
                    text: "One quarter of 8 is:", 
                    options: ["2", "4"], 
                    correctAnswer: "2" 
                }
            ]
        }
    }
];