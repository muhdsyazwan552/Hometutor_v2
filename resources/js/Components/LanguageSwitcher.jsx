// resources/js/Components/LanguageSwitcher.jsx
import React from 'react';
import { useLanguage } from '../Contexts/LanguageContext';

const LanguageSwitcher = ({ type = 'buttons' }) => {
    const { locale, changeLanguage, isEnglish, isMalay } = useLanguage();
    
    if (type === 'dropdown') {
        return (
            <select 
                value={locale}
                onChange={(e) => changeLanguage(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white"
            >
                <option value="en">English</option>
                <option value="ms">Bahasa Melayu</option>
            </select>
        );
    }
    
    return (
        <div className="inline-flex rounded-md shadow-sm">
            <button
                onClick={() => changeLanguage('en')}
                disabled={isEnglish}
                className={`px-3 py-2 text-sm font-medium border rounded-l-md ${
                    isEnglish 
                    ? 'bg-[#30918F] text-white border-[#30918F]' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
                EN
            </button>
            
            <button
                onClick={() => changeLanguage('ms')}
                disabled={isMalay}
                className={`px-3 py-2 text-sm font-medium border-t border-b border-r rounded-r-md ${
                    isMalay 
                    ? 'bg-[#30918F] text-white border-[#30918F]' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
                MS
            </button>
        </div>
    );
};

export default LanguageSwitcher;