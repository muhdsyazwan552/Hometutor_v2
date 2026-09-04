// resources/js/data/interactive-questions/index.js
import { scienceStandard1Questions } from '../science/standard1.js';
import { scienceStandard2Questions } from '../science/standard2.js';
import { scienceStandard3Questions } from '../science/standard3.js';

import { mathematicsStandard1Questions } from './mathematics/standard1.js';
import { mathematicsStandard2Questions } from './mathematics/standard2.js';
import { mathematicsStandard3Questions } from './mathematics/standard3.js';

import { englishStandard1Questions } from './bahasa-inggeris/standard1.js';
import { englishStandard2Questions } from './bahasa-inggeris/standard2.js';
import { englishStandard3Questions } from './bahasa-inggeris/standard3.js';

import { bahasaMalaysiaStandard1Questions } from './bahasa-malaysia/standard1.js';
import { bahasaMalaysiaStandard2Questions } from './bahasa-malaysia/standard2.js';
import { bahasaMalaysiaStandard3Questions } from './bahasa-malaysia/standard3.js';

// Fix: Ensure proper naming
export const ALL_QUESTIONS = [
    ...scienceStandard1Questions,
    ...scienceStandard2Questions,
    ...scienceStandard3Questions,
    
    ...mathematicsStandard1Questions,
    ...mathematicsStandard2Questions,
    ...mathematicsStandard3Questions,
    
    ...englishStandard1Questions,
    ...englishStandard2Questions,
    ...englishStandard3Questions,
    
    ...bahasaMalaysiaStandard1Questions,
    ...bahasaMalaysiaStandard2Questions,
    ...bahasaMalaysiaStandard3Questions,
];

// Helper function to get questions by subject and form
export const getQuestionsBySubjectAndForm = (subject, form) => {
    console.log('Searching for:', subject, form);
    
    const results = ALL_QUESTIONS.filter(question => {
        const subjectMatch = question.subject === subject;
        const formMatch = question.form === form;
        
        return subjectMatch && formMatch;
    });
    
    console.log('Found results:', results.length);
    return results;
};

// Helper function to get all subjects
export const getAvailableSubjects = () => {
    const subjects = new Set();
    ALL_QUESTIONS.forEach(question => {
        subjects.add(question.subject);
    });
    return Array.from(subjects);
};

// Helper function to get all forms for a subject
export const getAvailableFormsForSubject = (subject) => {
    const forms = new Set();
    ALL_QUESTIONS.forEach(question => {
        if (question.subject === subject) {
            forms.add(question.form);
        }
    });
    return Array.from(forms);
};

// Helper function to get question by ID
export const getQuestionById = (id) => {
    return ALL_QUESTIONS.find(question => question.id === id);
};

// Export individual subject collections
export {
    // Science
    scienceStandard1Questions,
    scienceStandard2Questions,
    scienceStandard3Questions,
    
    // Mathematics
    mathematicsStandard1Questions,
    mathematicsStandard2Questions,
    mathematicsStandard3Questions,
    
    // English
    englishStandard1Questions,
    englishStandard2Questions,
    englishStandard3Questions,
    
    // Bahasa Malaysia
    bahasaMalaysiaStandard1Questions,
    bahasaMalaysiaStandard2Questions,
    bahasaMalaysiaStandard3Questions,
};