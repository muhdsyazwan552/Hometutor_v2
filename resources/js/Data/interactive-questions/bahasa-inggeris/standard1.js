// resources/js/data/interactive-questions/bahasa-inggeris/standard1.js
import { 
    createMethod1Template, 
    createMethod2Template, 
    createMethod3Template,
    INTERACTIVE_TYPES 
} from '../templates.js';

// Change from: export const bahasaInggerisStandard1 = [
// To: export const englishStandard1Questions = [
export const englishStandard1Questions = [
    // Method 1: Animal Classification
    {
        ...createMethod1Template(
            1,
            "Bahasa Inggeris",
            "Standard 1",
            "Animal Classification",
            "Drag answers from top to classify animals",
            "droplet"
        ),
        data: {
            question: "Drag YA or TIDAK to answer each statement.",
            answers: ["YA", "TIDAK", "YA", "TIDAK"],
            questions: [
                { text: "Penyu melahirkan anak", correctAnswer: "TIDAK" },
                { text: "Mengkarung bertelur", correctAnswer: "YA" },
                { text: "Itik melahirkan anak", correctAnswer: "TIDAK" },
                { text: "Ikan paus melahirkan anak", correctAnswer: "YA" }
            ]
        }
    },

    // Method 2: True or False
    {
        ...createMethod2Template(
            2,
            "Bahasa Inggeris",
            "Standard 1",
            "True or False",
            "Drag TRUE or FALSE to answer",
            "check-circle"
        ),
        data: {
            question: "Drag TRUE or FALSE to answer each question.",
            questions: [
                { 
                    text: "The sun rises in the east.", 
                    options: ["TRUE", "FALSE"], 
                    correctAnswer: "TRUE" 
                },
                { 
                    text: "Plants need darkness to grow.", 
                    options: ["TRUE", "FALSE"], 
                    correctAnswer: "FALSE" 
                },
                { 
                    text: "Water boils at 100°C.", 
                    options: ["TRUE", "FALSE"], 
                    correctAnswer: "TRUE" 
                },
                { 
                    text: "Fish can breathe underwater.", 
                    options: ["TRUE", "FALSE"], 
                    correctAnswer: "TRUE" 
                }
            ]
        }
    },

    // Method 3: Color Matching
    {
        ...createMethod3Template(
            3,
            "Bahasa Inggeris",
            "Standard 1",
            "Color Matching",
            "Match colors with objects",
            "palette"
        ),
        data: {
            question: "What color is the sky?",
            questions: [
                {
                    text: "What color is the sky?",
                    options: ["Red", "Blue", "Green"],
                    correctAnswer: "Blue"
                }
            ]
        }
    },

    // Method 1: Family Members
    {
        ...createMethod1Template(
            4,
            "Bahasa Inggeris",
            "Standard 1",
            "Family Members",
            "Match family members with names",
            "users"
        ),
        data: {
            question: "Drag the family member names to match the descriptions.",
            answers: ["Father", "Mother", "Brother", "Sister"],
            questions: [
                { text: "Male parent", correctAnswer: "Father" },
                { text: "Female parent", correctAnswer: "Mother" },
                { text: "Male sibling", correctAnswer: "Brother" },
                { text: "Female sibling", correctAnswer: "Sister" }
            ]
        }
    },

    // Method 2: Daily Activities
    {
        ...createMethod2Template(
            5,
            "Bahasa Inggeris",
            "Standard 1",
            "Daily Activities",
            "Choose correct daily activities",
            "calendar"
        ),
        data: {
            question: "Drag the correct activity for each time of day.",
            questions: [
                { 
                    text: "We do this in the morning.", 
                    options: ["Brush teeth", "Watch TV"], 
                    correctAnswer: "Brush teeth" 
                },
                { 
                    text: "We do this in the afternoon.", 
                    options: ["Eat lunch", "Sleep"], 
                    correctAnswer: "Eat lunch" 
                },
                { 
                    text: "We do this in the evening.", 
                    options: ["Do homework", "Eat breakfast"], 
                    correctAnswer: "Do homework" 
                },
                { 
                    text: "We do this at night.", 
                    options: ["Go to school", "Sleep"], 
                    correctAnswer: "Sleep" 
                }
            ]
        }
    }
];