// resources/js/data/interactive-questions/bahasa-inggeris/standard3.js
import { 
    createMethod1Template, 
    createMethod2Template, 
    createMethod3Template,
    INTERACTIVE_TYPES 
} from '../templates.js';

export const englishStandard3Questions = [
    // Method 1: Verb Tenses
    {
        ...createMethod1Template(
            11,
            "Bahasa Inggeris",
            "Standard 3",
            "Verb Tenses",
            "Match verbs with correct tenses",
            "clock"
        ),
        data: {
            question: "Drag the correct verb form.",
            answers: ["Played", "Playing", "Plays", "Will play"],
            questions: [
                { text: "Yesterday, I _______ football.", correctAnswer: "Played" },
                { text: "Now, I am _______ football.", correctAnswer: "Playing" },
                { text: "Every day, he _______ football.", correctAnswer: "Plays" },
                { text: "Tomorrow, I _______ football.", correctAnswer: "Will play" }
            ]
        }
    },

    // Method 2: Prepositions
    {
        ...createMethod2Template(
            12,
            "Bahasa Inggeris",
            "Standard 3",
            "Prepositions",
            "Choose correct prepositions",
            "map-pin"
        ),
        data: {
            question: "Drag the correct preposition.",
            questions: [
                { 
                    text: "The book is _______ the table.", 
                    options: ["on", "in"], 
                    correctAnswer: "on" 
                },
                { 
                    text: "The cat is _______ the box.", 
                    options: ["inside", "under"], 
                    correctAnswer: "inside" 
                },
                { 
                    text: "We go _______ school by bus.", 
                    options: ["to", "at"], 
                    correctAnswer: "to" 
                },
                { 
                    text: "She lives _______ Kuala Lumpur.", 
                    options: ["in", "on"], 
                    correctAnswer: "in" 
                }
            ]
        }
    },

    // Method 3: Story Comprehension
    {
        ...createMethod3Template(
            13,
            "Bahasa Inggeris",
            "Standard 3",
            "Story Comprehension",
            "Answer questions about a story",
            "book"
        ),
        data: {
            question: "What did Ali buy at the market?",
            questions: [
                {
                    text: "Ali went to the market. He bought apples, oranges, and bananas. What did he NOT buy?",
                    options: ["Grapes", "Apples", "Oranges"],
                    correctAnswer: "Grapes"
                }
            ]
        }
    },

    // Method 1: Synonyms
    {
        ...createMethod1Template(
            14,
            "Bahasa Inggeris",
            "Standard 3",
            "Synonyms",
            "Match words with similar meanings",
            "type"
        ),
        data: {
            question: "Drag the synonym for each word.",
            answers: ["Happy", "Big", "Smart", "Fast"],
            questions: [
                { text: "Joyful", correctAnswer: "Happy" },
                { text: "Large", correctAnswer: "Big" },
                { text: "Intelligent", correctAnswer: "Smart" },
                { text: "Quick", correctAnswer: "Fast" }
            ]
        }
    },

    // Method 2: Sentence Structure
    {
        ...createMethod2Template(
            15,
            "Bahasa Inggeris",
            "Standard 3",
            "Sentence Structure",
            "Choose correct sentence order",
            "edit"
        ),
        data: {
            question: "Drag the correct sentence order.",
            questions: [
                { 
                    text: "Correct order:", 
                    options: ["Ali eats an apple.", "Eats Ali an apple."], 
                    correctAnswer: "Ali eats an apple." 
                },
                { 
                    text: "Correct order:", 
                    options: ["She is reading a book.", "Is she reading a book?"], 
                    correctAnswer: "She is reading a book." 
                },
                { 
                    text: "Correct order:", 
                    options: ["They play football.", "Football they play."], 
                    correctAnswer: "They play football." 
                },
                { 
                    text: "Correct order:", 
                    options: ["We go to school.", "Go we to school."], 
                    correctAnswer: "We go to school." 
                }
            ]
        }
    }
];