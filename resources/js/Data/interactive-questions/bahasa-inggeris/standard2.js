// resources/js/data/interactive-questions/bahasa-inggeris/standard2.js
import { 
    createMethod1Template, 
    createMethod2Template, 
    createMethod3Template,
    INTERACTIVE_TYPES 
} from '../templates.js';

export const englishStandard2Questions = [
    // Method 1: Daily Routines
    {
        ...createMethod1Template(
            6,
            "Bahasa Inggeris",
            "Standard 2",
            "Daily Routines",
            "Match daily activities with time",
            "calendar"
        ),
        data: {
            question: "Drag the correct time for each activity.",
            answers: ["Morning", "Afternoon", "Evening", "Night"],
            questions: [
                { text: "We eat breakfast in the _______.", correctAnswer: "Morning" },
                { text: "We have lunch in the _______.", correctAnswer: "Afternoon" },
                { text: "We do homework in the _______.", correctAnswer: "Evening" },
                { text: "We sleep at _______.", correctAnswer: "Night" }
            ]
        }
    },

    // Method 2: Opposites
    {
        ...createMethod2Template(
            7,
            "Bahasa Inggeris",
            "Standard 2",
            "Opposites",
            "Match opposite words",
            "refresh-cw"
        ),
        data: {
            question: "Drag the opposite word for each.",
            questions: [
                { 
                    text: "Hot", 
                    options: ["Cold", "Warm"], 
                    correctAnswer: "Cold" 
                },
                { 
                    text: "Big", 
                    options: ["Small", "Large"], 
                    correctAnswer: "Small" 
                },
                { 
                    text: "Fast", 
                    options: ["Slow", "Quick"], 
                    correctAnswer: "Slow" 
                },
                { 
                    text: "Happy", 
                    options: ["Sad", "Joyful"], 
                    correctAnswer: "Sad" 
                }
            ]
        }
    },

    // Method 3: Weather
    {
        ...createMethod3Template(
            8,
            "Bahasa Inggeris",
            "Standard 2",
            "Weather",
            "Choose the correct weather",
            "cloud"
        ),
        data: {
            question: "What do you wear on a sunny day?",
            questions: [
                {
                    text: "What do you wear on a sunny day?",
                    options: ["Sunglasses", "Raincoat", "Sweater"],
                    correctAnswer: "Sunglasses"
                }
            ]
        }
    },

    // Method 1: Family Relationships
    {
        ...createMethod1Template(
            9,
            "Bahasa Inggeris",
            "Standard 2",
            "Family Relationships",
            "Match family relationships",
            "users"
        ),
        data: {
            question: "Drag the correct family relationship.",
            answers: ["Grandfather", "Grandmother", "Uncle", "Aunt"],
            questions: [
                { text: "My father's father is my _______.", correctAnswer: "Grandfather" },
                { text: "My mother's mother is my _______.", correctAnswer: "Grandmother" },
                { text: "My father's brother is my _______.", correctAnswer: "Uncle" },
                { text: "My mother's sister is my _______.", correctAnswer: "Aunt" }
            ]
        }
    },

    // Method 2: Food Groups
    {
        ...createMethod2Template(
            10,
            "Bahasa Inggeris",
            "Standard 2",
            "Food Groups",
            "Choose correct food groups",
            "coffee"
        ),
        data: {
            question: "Drag the correct food group.",
            questions: [
                { 
                    text: "Apple belongs to _______ group.", 
                    options: ["Fruits", "Vegetables"], 
                    correctAnswer: "Fruits" 
                },
                { 
                    text: "Carrot belongs to _______ group.", 
                    options: ["Vegetables", "Grains"], 
                    correctAnswer: "Vegetables" 
                },
                { 
                    text: "Rice belongs to _______ group.", 
                    options: ["Grains", "Dairy"], 
                    correctAnswer: "Grains" 
                },
                { 
                    text: "Milk belongs to _______ group.", 
                    options: ["Dairy", "Protein"], 
                    correctAnswer: "Dairy" 
                }
            ]
        }
    }
];