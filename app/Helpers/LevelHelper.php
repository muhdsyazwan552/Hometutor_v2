<?php
// app/Helpers/LevelHelper.php

namespace App\Helpers;

class LevelHelper
{
    /**
     * Map level_id to form/standard name with clear distinction
     */
    public static function getFormName($levelId)
    {
        if ($levelId >= 1 && $levelId <= 3) {
            return "Standard $levelId";
        } elseif ($levelId >= 4 && $levelId <= 6) {
            return "Standard $levelId"; // Show actual Standard 4-6
        } elseif ($levelId >= 7 && $levelId <= 9) {
            $formNum = $levelId - 6;
            return "Form $formNum";
        } elseif ($levelId >= 10 && $levelId <= 11) {
            $formNum = $levelId - 9;
            return "Form $formNum";
        }
        
        return "Unknown Level";
    }
    
    /**
     * FILTER METHOD: Map level_id to display level_id
     * - Level ID 1-3 → Show 1
     * - Level ID 4-6 → Show 4
     * - Level ID 7-9 → Show 7
     * - Level ID 10-11 → Show 10
     */
    public static function filterDisplayLevelId($levelId)
    {
        if ($levelId >= 1 && $levelId <= 3) {
            return 1;
        } elseif ($levelId >= 4 && $levelId <= 6) {
            return 4;
        } elseif ($levelId >= 7 && $levelId <= 9) {
            return 7;
        } elseif ($levelId >= 10 && $levelId <= 11) {
            return 10;
        }
        
        return $levelId; // Return original if not in range
    }
    
    /**
     * Get available forms for a student based on their level
     * Students can select all levels within their category
     */
    public static function getAvailableForms($studentLevelId)
    {
        // Standard 1-3 category (levels 1-3)
        if ($studentLevelId >= 1 && $studentLevelId <= 3) {
            return ['Standard 1', 'Standard 2', 'Standard 3'];
        }
        // Standard 4-6 category (levels 4-6)
        elseif ($studentLevelId >= 4 && $studentLevelId <= 6) {
            return ['Standard 4', 'Standard 5', 'Standard 6'];
        }
        // Form 1-3 category (levels 7-9)
        elseif ($studentLevelId >= 7 && $studentLevelId <= 9) {
            return ['Form 1', 'Form 2', 'Form 3'];
        }
        // Form 4-5 category (levels 10-11)
        elseif ($studentLevelId >= 10 && $studentLevelId <= 11) {
            return ['Form 4', 'Form 5'];
        }
        
        // Default for non-logged in users
        return ['Form 1', 'Form 2', 'Form 3'];
    }
    
    /**
     * Get category for a level
     */
    public static function getLevelCategory($levelId)
    {
        if ($levelId >= 1 && $levelId <= 3) {
            return 'standard_1_3';
        } elseif ($levelId >= 4 && $levelId <= 6) {
            return 'standard_4_6';
        } elseif ($levelId >= 7 && $levelId <= 9) {
            return 'form_1_3';
        } elseif ($levelId >= 10 && $levelId <= 11) {
            return 'form_4_5';
        }
        
        return 'unknown';
    }
    
    /**
     * Convert form name to level_id
     */
    public static function formToLevelId($formName)
    {
        $mapping = [
            'Standard 1' => 1,
            'Standard 2' => 2,
            'Standard 3' => 3,
            'Standard 4' => 4,
            'Standard 5' => 5,
            'Standard 6' => 6,
            'Form 1' => 7,
            'Form 2' => 8,
            'Form 3' => 9,
            'Form 4' => 10,
            'Form 5' => 11,
        ];
        
        return $mapping[$formName] ?? null;
    }
    
    /**
     * Get all level IDs for a category
     */
    public static function getLevelIdsForCategory($category)
    {
        $categories = [
            'standard_1_3' => [1, 2, 3],
            'standard_4_6' => [4, 5, 6],
            'form_1_3' => [7, 8, 9],
            'form_4_5' => [10, 11],
        ];
        
        return $categories[$category] ?? [];
    }
    
    /**
     * Check if a student can access a specific form
     */
    public static function canAccessForm($studentLevelId, $targetForm)
    {
        $targetLevelId = self::formToLevelId($targetForm);
        if (!$targetLevelId) {
            return false;
        }
        
        $studentCategory = self::getLevelCategory($studentLevelId);
        $targetCategory = self::getLevelCategory($targetLevelId);
        
        // Students can access any level within their category
        return $studentCategory === $targetCategory;
    }
    
    /**
     * Get the appropriate subject level ID for a student
     * Now uses filterDisplayLevelId to return the display level
     */
    public static function getSubjectLevelId($studentLevelId)
    {
        return self::filterDisplayLevelId($studentLevelId);
    }
    
    /**
     * Get standard level ID (for backward compatibility)
     * Now uses filterDisplayLevelId
     */
    public static function getStandardLevelId($levelId)
    {
        return self::filterDisplayLevelId($levelId);
    }
    
    /**
     * Get current form name for a student
     */
    public static function getCurrentForm($studentLevelId)
    {
        return self::getFormName($studentLevelId);
    }
    
    /**
     * Get default form for non-logged in users
     */
    public static function getDefaultForm()
    {
        return 'Form 1';
    }
    
    /**
     * Get display name for level (for UI)
     */
    public static function getDisplayName($levelId)
    {
        return self::getFormName($levelId);
    }
}