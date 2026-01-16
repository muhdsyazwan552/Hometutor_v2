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
        console.log('🔄 Changing language to:', newLocale);
        
        if (newLocale === locale) {
            console.log('⚠️ Already in this language');
            return;
        }
        
        // Create loading overlay
        const overlay = createLoadingOverlay();
        
        // Use router.post with preserveState: true to prevent auto-reload
        router.post('/change-language', 
            { locale: newLocale },
            {
                preserveState: true,  // Don't let Inertia auto-reload
                preserveScroll: true,
                replace: true,
                
                onSuccess: (page) => {
                    console.log('✅ Language changed successfully, reloading...', page.props);
                    
                    // Force full page reload after backend confirms
                    window.location.reload();
                },
                
                onError: (errors) => {
                    console.error('❌ Language change error:', errors);
                    removeOverlay(overlay);
                    alert('Failed to change language. Please try again.');
                },
                
                onFinish: () => {
                    // Cleanup overlay on error (success will reload page)
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

    // ✅ Translation helper - MOVED INSIDE PROVIDER to access translations
    const t = (key, fallback = '') => {
        // Handle dot notation (e.g., 'common.school')
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
        
        // Simple key (e.g., 'school')
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

// ✅ Helper functions OUTSIDE component
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
        flex-direction: column;
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
        margin-bottom: 16px;
    `;
    
    const text = document.createElement('div');
    text.style.cssText = `
        color: #333;
        font-size: 16px;
        font-weight: 500;
    `;
    text.textContent = 'Changing language...';
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    
    overlay.appendChild(spinner);
    overlay.appendChild(text);
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
        overlay.style.opacity = '0';
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 300);
    }
    if (style && style.parentNode) {
        style.remove();
    }
};