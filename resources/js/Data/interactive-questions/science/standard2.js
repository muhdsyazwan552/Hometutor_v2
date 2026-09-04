// resources/js/data/interactive-questions/science/standard2.js
import { 
    createMethod1Template, 
    createMethod2Template, 
    createMethod3Template 
} from '../interactive-questions/templates.js';

export const scienceStandard2Questions = [
    // Method 2: Plant Parts
    {
        ...createMethod2Template(
            51,
            "Sains",
            "Standard 2",
            "Plant Parts",
            "Identify plant parts",
            "leaf"
        ),
        data: {
            question: "Drag the correct plant part.",
            questions: [
                { 
                    text: "Makes food for the plant:", 
                    options: ["Daun", "Akar"], 
                    correctAnswer: "Daun" 
                },
                { 
                    text: "Absorbs water from soil:", 
                    options: ["Akar", "Batang"], 
                    correctAnswer: "Akar" 
                }
            ]
        }
    }
];