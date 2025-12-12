// resources/js/Contexts/LanguageContext.jsx
import React, { createContext, useContext } from 'react';
import { router } from '@inertiajs/react';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children, pageProps }) => {
    console.log('LanguageProvider - pageProps:', {
        locale: pageProps?.locale,
        translationsKeys: Object.keys(pageProps?.translations || {}),
        hasTranslations: !!pageProps?.translations
    });

    const locale = pageProps?.locale || 'en';
    const translations = pageProps?.translations || {};
    const availableLocales = pageProps?.availableLocales || ['en', 'ms'];

    const changeLanguage = (newLocale) => {
    console.log('Changing language to:', newLocale);
    
    if (newLocale === locale) return;
    
    // Create loading overlay
    const overlay = createLoadingOverlay();
    
    // Use preserveState: true but manually reload on success
    router.post('/change-language', 
        { locale: newLocale },
        {
            preserveState: true, // Don't let Inertia auto-reload
            preserveScroll: true,
            replace: true,
            
            onSuccess: (page) => {
                console.log('Language changed successfully, reloading...', page.props);
                
              
                    window.location.reload();
               
            },
            
            onError: (errors) => {
                console.error('Language change error:', errors);
                removeOverlay(overlay);
                alert('Failed to change language. Please try again.');
            },
            
            onFinish: () => {
                // Only cleanup on error, successful reload will remove overlay
                setTimeout(() => {
                    const overlayEl = document.getElementById('language-change-overlay');
                    if (overlayEl && overlayEl.parentNode) {
                        overlayEl.remove();
                    }
                }, 4000);
            }
        }
    );
};

// Helper functions
const createLoadingOverlay = () => {
    const overlay = document.createElement('div');
    overlay.id = 'language-change-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 50px;
        height: 50px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    
    overlay.appendChild(spinner);
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    
    // Fade in overlay
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 10);
    
    return { overlay, style };
};

const removeOverlay = ({ overlay, style }) => {
    if (overlay && overlay.parentNode) {
        overlay.remove();
    }
    if (style && style.parentNode) {
        style.remove();
    }
};

// LanguageContext.jsx - Updated t function
const t = (key, fallback = '') => {
    // Your translations now come flat from backend
    // No need to look for 'common' prefix
    
    // If key contains dots, split and navigate
    if (key.includes('.')) {
        const keys = key.split('.');
        let value = translations;
        
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                console.warn(`Translation key "${key}" not found`);
                return fallback || key;
            }
        }
        return value;
    }
    
    // Simple key
    return translations[key] || fallback || key;
};

    return (
        <LanguageContext.Provider value={{
            locale,
            translations,
            availableLocales,
            changeLanguage,
            t,
            isEnglish: locale === 'en',
            isMalay: locale === 'ms'
        }}>
            {children}
        </LanguageContext.Provider>
    );
};