// Pages/CombinedResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import QuestionLayout from '@/Layouts/QuestionLayout';
import ResultQuestion from '@/Pages/ResultQuestion';

export default function CombinedResultsPage() {
  const [objectiveResults, setObjectiveResults] = useState(null);
  const [subjectiveResults, setSubjectiveResults] = useState(null);

  // Load results from storage or props
  useEffect(() => {
    const savedObjective = localStorage.getItem('objectiveQuizResults');
    const savedSubjective = localStorage.getItem('subjectiveQuizResults');
    
    if (savedObjective) setObjectiveResults(JSON.parse(savedObjective));
    if (savedSubjective) setSubjectiveResults(JSON.parse(savedSubjective));
  }, []);

  const handleTryAgain = () => {
    // Clear stored results
    localStorage.removeItem('objectiveQuizResults');
    localStorage.removeItem('subjectiveQuizResults');
    
    // Redirect to quiz selection or start over
    window.location.href = '/quiz-selection'; // Adjust based on your routes
  };

  return (
    <ResultQuestion 
      quizType="combined"
      objectiveResults={objectiveResults}
      subjectiveResults={subjectiveResults}
      onTryAgain={handleTryAgain}
    />
  );
}