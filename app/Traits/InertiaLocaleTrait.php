<?php
// app/Traits/InertiaLocaleTrait.php

namespace App\Traits;

use Inertia\Inertia;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

trait InertiaLocaleTrait
{
    /**
     * Render Inertia page with locale data automatically added
     * 
     * Usage in controller:
     * return $this->renderWithLocale('Dashboard', ['title' => 'Dashboard']);
     * 
     * @param string $component Inertia component name
     * @param array $props Additional props for the page
     * @return \Inertia\Response
     */
    protected function renderWithLocale(string $component, array $props = []): \Inertia\Response
    {
        // Merge locale props with custom props
        $allProps = array_merge($this->getLocaleProps(), $props);
        
        return Inertia::render($component, $allProps);
    }
    
    /**
     * Get all locale-related props
     * 
     * @return array
     */
    protected function getLocaleProps(): array
    {
        return [
            'locale' => $this->getCurrentLocale(),
            'availableLocales' => $this->getAvailableLocales(),
            'translations' => $this->getTranslations(),
        ];
    }
    
    /**
     * Get current application locale
     * 
     * @return string
     */
    protected function getCurrentLocale(): string
    {
        return App::getLocale();
    }
    
    /**
     * Get available locales for language switcher
     * 
     * @return array
     */
    protected function getAvailableLocales(): array
    {
        // You can configure this in config/app.php or use default
        return config('app.available_locales', ['en', 'ms']);
    }
    
    /**
     * Get translations for current locale with caching
     * 
     * @return array
     */
    protected function getTranslations(): array
    {
        $locale = $this->getCurrentLocale();
        $cacheKey = "translations.{$locale}";
        
        // Cache for 1 hour to reduce file reads
        return Cache::remember($cacheKey, 3600, function () use ($locale) {
            return $this->loadTranslationsFromFiles($locale);
        });
    }
    
    /**
     * Load translations from language files
     * 
     * @param string $locale
     * @return array
     */
    protected function loadTranslationsFromFiles(string $locale): array
    {
        $translations = [];
        $fallbackLocale = 'en';
        
        // Load common.php file
        $commonTranslations = $this->loadTranslationFile($locale, 'common');
        
        if (!empty($commonTranslations)) {
            $translations['common'] = $commonTranslations;
        } elseif ($locale !== $fallbackLocale) {
            // Fallback to English if current locale file doesn't exist
            $fallbackTranslations = $this->loadTranslationFile($fallbackLocale, 'common');
            if (!empty($fallbackTranslations)) {
                $translations['common'] = $fallbackTranslations;
            }
        }
        
        // You can load additional translation files here
        // Example: $translations['dashboard'] = $this->loadTranslationFile($locale, 'dashboard');
        
        return $translations;
    }
    
    /**
     * Load a specific translation file
     * 
     * @param string $locale
     * @param string $filename
     * @return array
     */
    protected function loadTranslationFile(string $locale, string $filename): array
    {
        $path = lang_path("{$locale}/{$filename}.php");
        
        if (File::exists($path)) {
            try {
                return require $path;
            } catch (\Exception $e) {
                return [];
            }
        }
        
        return [];
    }
    
    /**
     * Alternative method: Just add locale to existing props
     * 
     * Usage: return Inertia::render('Page', $this->withLocale($props));
     * 
     * @param array $props
     * @return array
     */
    protected function withLocale(array $props = []): array
    {
        return array_merge($this->getLocaleProps(), $props);
    }
    
    /**
     * Quick method for simple pages
     * 
     * Usage: return $this->localeRender('Page', $data);
     * 
     * @param string $component
     * @param mixed ...$args
     * @return \Inertia\Response
     */
    protected function localeRender(string $component, ...$args): \Inertia\Response
    {
        // If first arg is array, treat as props
        if (isset($args[0]) && is_array($args[0])) {
            $props = $args[0];
        } else {
            $props = ['data' => $args];
        }
        
        return $this->renderWithLocale($component, $props);
    }
}