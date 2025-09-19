// resources/js/utils/answerFeedback.js

export const getFeedbackMessage = (isCorrect, schema, similarityPercentage) => {
  if (isCorrect) {
    return "Great job! Your answer is correct.";
  }
  
  if (schema.includes("Pn.") || schema.includes("En.") || schema.includes("Mr.") || 
      schema.includes("Mrs.") || schema.includes("Miss") || schema.includes("Ms.")) {
    return "Names need to match exactly with correct spelling. Pay attention to the person's name.";
  } else if (schema.includes("RM") || schema.includes("$") || 
             schema.includes("€") || schema.includes("£")) {
    return "Monetary values need to match exactly. Check the amount and currency symbol.";
  } else if (/\b(\d{1,2}\s+[A-Za-z]+\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/.test(schema)) {
    return "Dates need to match exactly with correct day, month, and year.";
  } else if (similarityPercentage > 50) {
    return "You're close! Check for spelling errors or missing information.";
  } else {
    return "Your answer doesn't match the expected response. Please review the question and try again.";
  }
};

export const getAnswerType = (schema) => {
  if (schema.includes("Pn.") || schema.includes("En.") || schema.includes("Mr.") || 
      schema.includes("Mrs.") || schema.includes("Miss") || schema.includes("Ms.")) {
    return "name";
  } else if (schema.includes("RM") || schema.includes("$") || 
             schema.includes("€") || schema.includes("£")) {
    return "monetary";
  } else if (/\b(\d{1,2}\s+[A-Za-z]+\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/.test(schema)) {
    return "date";
  } else {
    return "text";
  }
};