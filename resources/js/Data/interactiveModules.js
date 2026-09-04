// resources/js/data/interactiveModules.js
import { INTERACTIVE_TYPES } from '@/utils/interactiveTypes';

// Helper functions that work with modules array
export const getModulesByStandard = (modules, standard) => {
    if (!modules || !Array.isArray(modules)) return [];
    return modules.filter(module => 
        module.form === standard || module.standard === standard.toUpperCase()
    );
};

export const getModulesBySubject = (modules, subject, standard) => {
    if (!modules || !Array.isArray(modules)) return [];
    return modules.filter(m => 
        m.subject === subject && 
        (m.form === standard || m.standard === standard.toUpperCase())
    );
};

export const getModuleById = (modules, id) => {
    if (!modules || !Array.isArray(modules)) return null;
    return modules.find(m => m.id === id);
};

// Re-export types
export { INTERACTIVE_TYPES };