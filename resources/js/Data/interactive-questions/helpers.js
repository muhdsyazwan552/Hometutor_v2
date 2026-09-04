// resources/js/data/interactive-questions/helpers.js
import { INTERACTIVE_TYPES } from './templates.js';

// Get subject folder name from subject display name
export const getSubjectFolderName = (subjectName) => {
    const mapping = {
        'Bahasa Inggeris': 'bahasa-inggeris',
        'Matematik': 'matematik',
        'Sains': 'sains',
        'Bahasa Melayu': 'bahasa-melayu',
        'Pendidikan Islam': 'pendidikan-islam',
        'Pendidikan Moral': 'pendidikan-moral',
    };
    return mapping[subjectName] || subjectName.toLowerCase().replace(/ /g, '-');
};

// Get form file name from form display name
export const getFormFileName = (formName) => {
    return formName.toLowerCase().replace(/ /g, '');
};

// Generate module ID to ensure uniqueness
let currentId = 1;
export const generateModuleId = () => {
    return currentId++;
};