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
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#30918F] focus:border-[#30918F] transition"
            >
                <option value="en">English</option>
                <option value="ms">Bahasa Melayu</option>
            </select>
        );
    }
    
    return (
        <div className="inline-flex rounded-lg shadow-sm overflow-hidden border border-gray-300">
            <button
                onClick={() => changeLanguage('en')}
                disabled={isEnglish}
                className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                    isEnglish 
                        ? 'bg-[#30918F] text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                } ${!isEnglish && 'border-r border-gray-300'}`}
            >
                EN
            </button>
            
            <button
                onClick={() => changeLanguage('ms')}
                disabled={isMalay}
                className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                    isMalay 
                        ? 'bg-[#30918F] text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                } ${!isMalay && 'border-l border-gray-300'}`}
            >
                MS
            </button>
        </div>
    );
};

export default LanguageSwitcher;