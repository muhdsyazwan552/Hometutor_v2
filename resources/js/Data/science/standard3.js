// resources/js/data/interactive-questions/science/standard3.js
import { 
    createMethod1Template, 
    createMethod2Template, 
    createMethod3Template 
} from '../interactive-questions/templates.js';

export const scienceStandard3Questions = [
    // Method 3: States of Matter
    {
        ...createMethod3Template(
            52,
            "Sains",
            "Standard 3",
            "States of Matter",
            "Identify states of matter",
            "thermometer"
        ),
        data: {
            question: "What state of matter is ice?",
            questions: [
                {
                    text: "What state of matter is ice?",
                    options: ["Solid", "Liquid", "Gas"],
                    correctAnswer: "Solid"
                }
            ]
        }
    }
];