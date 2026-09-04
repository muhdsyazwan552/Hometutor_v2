// resources/js/data/interactive-questions/templates.js
import { INTERACTIVE_TYPES } from '../../utils/interactiveTypes.js';

// Template for Method 1: 4 answers at top, 4 questions below
export const createMethod1Template = (id, subject, form, title, description, icon = 'book-open') => ({
    id,
    type: INTERACTIVE_TYPES.DRAG_4_ANSWERS_TOP,
    title,
    description,
    subject,
    form,
    standard: `STANDARD ${form.split(' ')[1]}`,
    status: "available",
    icon,
    data: {
        question: "",
        answers: ["", "", "", ""],
        questions: [
            { text: "", correctAnswer: "" },
            { text: "", correctAnswer: "" },
            { text: "", correctAnswer: "" },
            { text: "", correctAnswer: "" }
        ]
    }
});

// Template for Method 2: 4 questions with 2 options each
export const createMethod2Template = (id, subject, form, title, description, icon = 'check-circle') => ({
    id,
    type: INTERACTIVE_TYPES.DRAG_2_OPTIONS_PER_QUESTION,
    title,
    description,
    subject,
    form,
    standard: `STANDARD ${form.split(' ')[1]}`,
    status: "available",
    icon,
    data: {
        question: "",
        questions: [
            { text: "", options: ["", ""], correctAnswer: "" },
            { text: "", options: ["", ""], correctAnswer: "" },
            { text: "", options: ["", ""], correctAnswer: "" },
            { text: "", options: ["", ""], correctAnswer: "" }
        ]
    }
});

// Template for Method 3: 1 question with 3 options
export const createMethod3Template = (id, subject, form, title, description, icon = 'help-circle') => ({
    id,
    type: INTERACTIVE_TYPES.DRAG_3_OPTIONS_PER_QUESTION,
    title,
    description,
    subject,
    form,
    standard: `STANDARD ${form.split(' ')[1]}`,
    status: "available",
    icon,
    data: {
        question: "",
        questions: [
            { text: "", options: ["", "", ""], correctAnswer: "" }
        ]
    }
});

// ✅ Re-export INTERACTIVE_TYPES so other files can import it
export { INTERACTIVE_TYPES };