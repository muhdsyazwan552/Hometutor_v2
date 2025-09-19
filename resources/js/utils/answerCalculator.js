// resources/js/utils/answerCalculator.js

// Levenshtein distance function
export const levenshteinDistance = (a, b) => {
  const matrix = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
};

// Date comparison handler
export const handleDateComparison = (answer, schema) => {
  // Check if both strings contain date-like patterns
  const datePattern = /\b(\d{1,2}\s+[A-Za-z]+\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/;
  
  if (datePattern.test(answer) && datePattern.test(schema)) {
    // Parse dates
    const parseDate = (str) => {
      // Try different date formats
      const formats = [
        { pattern: /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/, handler: (m) => {
          const months = {
            jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
            jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
          };
          const month = months[m[2].toLowerCase().substring(0, 3)];
          return month !== undefined ? new Date(parseInt(m[3]), month, parseInt(m[1])) : null;
        }},
        { pattern: /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/, handler: (m) => {
          const year = parseInt(m[3]) < 100 ? 2000 + parseInt(m[3]) : parseInt(m[3]);
          return new Date(year, parseInt(m[2]) - 1, parseInt(m[1]));
        }}
      ];
      
      for (const format of formats) {
        const match = str.match(format.pattern);
        if (match) return format.handler(match);
      }
      
      return null;
    };
    
    const answerDate = parseDate(answer);
    const schemaDate = parseDate(schema);
    
    if (answerDate && schemaDate && !isNaN(answerDate.getTime()) && !isNaN(schemaDate.getTime())) {
      // Dates are completely different (different day, month, or year)
      if (answerDate.getDate() !== schemaDate.getDate() ||
          answerDate.getMonth() !== schemaDate.getMonth() ||
          answerDate.getFullYear() !== schemaDate.getFullYear()) {
        return 0; // Completely different dates
      }
      
      // Same date
      return 1;
    }
  }
  
  return null; // Not a date comparison
};

// Name comparison handler
export const handleNameComparison = (answer, schema) => {
  // Check if both strings contain name titles (Pn., En., Mr., Mrs., etc.)
  const nameTitlePattern = /(pn|en|mr|mrs|miss|ms)\.?\s+[a-z]+/i;
  
  if (nameTitlePattern.test(answer) && nameTitlePattern.test(schema)) {
    // Extract names without titles
    const extractName = (str) => {
      return str.replace(/(pn|en|mr|mrs|miss|ms)\.?\s+/i, '').trim();
    };
    
    const answerName = extractName(answer);
    const schemaName = extractName(schema);
    
    // For names, use strict comparison with slight tolerance for typos
    const distance = levenshteinDistance(answerName.toLowerCase(), schemaName.toLowerCase());
    const maxLength = Math.max(answerName.length, schemaName.length);
    const similarity = 1 - distance / maxLength;
    
    // Names require very high similarity (at least 90%)
    return similarity >= 0.9 ? similarity : 0;
  }
  
  return null; // Not a name comparison
};

// Monetary comparison handler
export const handleMonetaryComparison = (answer, schema) => {
  // Check if schema contains monetary patterns
  const monetaryPattern = /(RM|USD|\$|€|£)\s*\d+/i;
  
  if (monetaryPattern.test(schema)) {
    // Extract monetary values
    const extractValue = (str) => {
      const match = str.match(/(RM|USD|\$|€|£)\s*(\d+)/i);
      return match ? parseInt(match[2]) : null;
    };
    
    const answerValue = extractValue(answer);
    const schemaValue = extractValue(schema);
    
    if (answerValue !== null && schemaValue !== null) {
      // Monetary values must match exactly
      return answerValue === schemaValue ? 1 : 0;
    }
  }
  
  return null; // Not a monetary comparison
};

// Default comparison handler
export const handleDefaultComparison = (answer, schema) => {
  // Normalize strings
  const normalizeString = (str) => {
    return str
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const normalizedAnswer = normalizeString(answer);
  const normalizedSchema = normalizeString(schema);

  // If strings are identical after normalization
  if (normalizedAnswer === normalizedSchema) {
    return 1;
  }

  // Use Levenshtein distance for general comparison
  const distance = levenshteinDistance(normalizedAnswer, normalizedSchema);
  const maxLength = Math.max(normalizedAnswer.length, normalizedSchema.length);
  const similarity = 1 - distance / maxLength;
  
  return Math.max(0, similarity);
};

// Main similarity calculation function
export const calculateSimilarity = (answer, schema) => {
  if (!answer.trim()) return 0;
  
  // Specialized handlers for different data types
  const handlers = [
    handleDateComparison,
    handleNameComparison,
    handleMonetaryComparison,
    handleDefaultComparison
  ];
  
  // Try each handler until one returns a result
  for (const handler of handlers) {
    const result = handler(answer, schema);
    if (result !== null) return result;
  }
  
  return 0;
};

// Function to determine if answer is correct
export const isAnswerCorrect = (answer, schema) => {
  if (!answer.trim()) return false;
  
  const similarity = calculateSimilarity(answer, schema);
  const similarityPercentage = Math.round(similarity * 100);
  
  // Different thresholds for different types of answers
  if (schema.includes("Pn.") || schema.includes("En.") || schema.includes("Mr.") || 
      schema.includes("Mrs.") || schema.includes("Miss") || schema.includes("Ms.")) {
    // Names require very high similarity
    return similarityPercentage >= 90;
  } else if (schema.includes("RM") || schema.includes("$") || 
             schema.includes("€") || schema.includes("£")) {
    // Monetary values require exact match
    return similarityPercentage >= 95;
  } else if (/\b(\d{1,2}\s+[A-Za-z]+\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/.test(schema)) {
    // Dates require exact match
    return similarityPercentage >= 95;
  } else {
    // Other answers require reasonable similarity
    return similarityPercentage >= 80;
  }
};

// Function to calculate total score
export const calculateScore = (answers, questions, skippedQuestions) => {
  let totalScore = 0;
  const correctness = [];
  const similarityPercentages = [];
  
  questions.forEach((question, index) => {
    // Skip calculation for skipped questions
    if (skippedQuestions.includes(index)) {
      correctness[index] = null;
      similarityPercentages[index] = 0;
      return;
    }
    
    const similarity = calculateSimilarity(answers[index], question.schema);
    const similarityPercentage = Math.round(similarity * 100);
    const correct = isAnswerCorrect(answers[index], question.schema);
    
    const questionScore = correct ? 1 : 0;
    totalScore += questionScore;
    correctness[index] = correct;
    similarityPercentages[index] = similarityPercentage;
  });
  
  return {
    score: totalScore,
    correctness,
    similarityPercentages
  };
};