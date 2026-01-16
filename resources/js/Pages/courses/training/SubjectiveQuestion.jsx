import React, { useState, useMemo, useEffect, useRef } from "react";
import SubjectiveQuestionLayout from "@/Layouts/SubjectiveQuestionLayout";
import ResultQuestion from "@/Pages/courses/training/ResultQuestion";
import { Head, usePage, router } from '@inertiajs/react'; // Added router import

export default function SubjectiveQuestion({ title = "Subjective Quiz" }) {
  const pageProps = usePage().props;

  const {
    subject,
    standard,
    sectionId,
    contentId,
    topic,
    sectionTitle,
    questions: initialQuestions,
    topic_id,
    subject_id,
    level_id,
    question_count,
    total_available
  } = pageProps;



  const [open, setOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState("");

  // Add missing state variables
  const [practiceStartTime, setPracticeStartTime] = useState(new Date().toISOString());
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Initialize practice start time when component mounts
  useEffect(() => {
    setPracticeStartTime(new Date().toISOString());
  }, []);



  // Call this when quiz completes
  useEffect(() => {
    if (quizCompleted) {
      savePracticeSession();
    }
  }, [quizCompleted]);

  // Add this useEffect near the top, after the other useEffects
  useEffect(() => {
    console.log('🔍 PAGE PROPS DEBUG:', {
      subject,
      standard,
      topic,
      topic_id,
      subject_id,
      level_id,
      initialQuestionsCount: initialQuestions?.length || 0,
      question_count,
      total_available,
      initialQuestionsPreview: initialQuestions?.map(q => ({
        id: q.id,
        schema: q.schema ? q.schema.substring(0, 50) + '...' : 'No schema',
        question_text: q.question_text ? q.question_text.substring(0, 50) + '...' : 'No text'
      }))
    });
  }, [subject, standard, topic, topic_id, subject_id, level_id, initialQuestions, question_count, total_available]);

  // Update handleSubmit to set quizCompleted
  const handleSubmit = () => {
    // Stop the timer
    setTimerRunning(false);

    // Calculate results
    const answered = answers.filter(answer => answer.trim() !== "").length;
    const skipped = questions.length - answered;

    const results = {
      totalQuestions: questions.length,
      score: answered,
      answered: answered,
      skipped: skipped,
      timeElapsed: timeElapsed,
      questions: questions.map((q, index) => ({
        question: q.question,
        answered: answers[index].trim() !== "",
        correct: true
      }))
    };

    // Set completed state and pass results
    setShowScore(true);
    setQuizResults(results);
    setQuizCompleted(true); // Add this line
  };

  // Get questions from subjective question bank with better error handling
  const questions = useMemo(() => {
    try {
      const controllerQuestions = initialQuestions || [];

      if (!controllerQuestions || controllerQuestions.length === 0) {
        console.log('No questions from controller, using fallback');
        // You need to define defaultQuestion or handle this case
        return [];
      }

      // Transform controller questions to match component format
      const transformedQuestions = controllerQuestions.map((q, index) => ({
        id: q.id || index,
        question: q.question_text || 'No question available',
        schema: q.schema || 'No schema answer available',
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'medium',
        type: 'subjective',
        question_type: q.question_type || 'html'
      }));

      return transformedQuestions;
    } catch (error) {
      console.error('Error processing questions:', error);
      return [];
    }
  }, [initialQuestions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [error, setError] = useState("");
  const [showScore, setShowScore] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  // Timer state
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // per-question state
  const [checked, setChecked] = useState(Array(questions.length).fill(false));
  const [showSchema, setShowSchema] = useState(Array(questions.length).fill(false));
  const [isCorrect, setIsCorrect] = useState(Array(questions.length).fill(null));
  const [firstTryResults, setFirstTryResults] = useState(Array(questions.length).fill(null));

  // Audio refs
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);
  const successSoundRef = useRef(null);

  // Play sound function
  const playSound = (type, volume = 1.0) => {
    let audio;

    if (type === "correct") {
      audio = new Audio("/sounds/correct.mp3");
    } else if (type === "wrong") {
      audio = new Audio("/sounds/wrong.mp3");
    } else if (type === "success") {
      audio = new Audio("/sounds/success.mp3");
    }

    if (audio) {
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play();
    }
  };

  // Timer effect
  useEffect(() => {
    let interval = null;

    if (timerRunning) {
      interval = setInterval(() => {
        setTimeElapsed(seconds => seconds + 1);
      }, 1000);
    } else if (!timerRunning && timeElapsed !== 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timerRunning]);

  // Start timer when component mounts
  useEffect(() => {
    setTimerRunning(true);

    return () => {
      setTimerRunning(false);
    };
  }, []);

  // Handle image clicks in HTML content
  useEffect(() => {
    const handleImageClick = (e) => {
      if (e.target.tagName === 'IMG') {
        setZoomedImage(e.target.src);
        setOpen(true);
      }
    };

    const questionContent = document.querySelector('.question-content');
    if (questionContent) {
      questionContent.addEventListener('click', handleImageClick);
    }

    return () => {
      if (questionContent) {
        questionContent.removeEventListener('click', handleImageClick);
      }
    };
  }, [currentIndex, questions]);

  // Format time function
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get time color based on elapsed time
  const getTimeColor = () => {
    if (timeElapsed < 300) return 'text-green-600';
    if (timeElapsed < 600) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleAnswerChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = value;
    setAnswers(newAnswers);
    setError("");
  };

  // Process HTML content for better rendering - FIX FOR INLINE IMAGES
const processHtmlContent = (html) => {
  if (!html) return '';
  
  // First, handle the specific pattern from your database
  // Example: <p>Diberi bahawa... <img> dengan lebar...</p>
  
  // Remove text-align: justify styles that might cause issues
  let processedHtml = html.replace(/text-align:\s*justify;/g, '');
  
  // Replace paragraph tags with div for better control (paragraphs create block elements)
  processedHtml = processedHtml.replace(/<p([^>]*)>/g, '<div$1 class="question-paragraph mb-4">');
  processedHtml = processedHtml.replace(/<\/p>/g, '</div>');
  
  // Process images - make them inline with text
  // Add inline display and vertical alignment
  processedHtml = processedHtml.replace(
    /<img([^>]*width="([^"]*)"[^>]*height="([^"]*)")/g,
    '<img$1 class="inline-image align-middle mx-1 my-0 cursor-zoom-in" style="max-height: 28px; width: auto;"'
  );
  
  // Fallback for images without width/height attributes
  processedHtml = processedHtml.replace(
    /<img([^>]*)>/g,
    (match, attributes) => {
      if (!match.includes('class=')) {
        return `<img${attributes} class="inline-image align-middle mx-1 my-0 cursor-zoom-in" style="max-height: 28px; width: auto;">`;
      }
      return match.replace('class="', 'class="inline-image align-middle mx-1 my-0 cursor-zoom-in ');
    }
  );
  
  // Handle the non-breaking space entity
  processedHtml = processedHtml.replace(/&nbsp;/g, ' ');
  
  // Handle the ndash entity
  processedHtml = processedHtml.replace(/&ndash;/g, '–');
  
  return processedHtml;
};

  // In SubjectiveQuestion.jsx, update the handleCheckAnswer function:

  const handleCheckAnswer = () => {
    if (!answers[currentIndex].trim()) {
      setError("⚠️ Please enter your answer first.");
      return;
    }

    const newChecked = [...checked];
    newChecked[currentIndex] = true;
    setChecked(newChecked);

    const newShowSchema = [...showSchema];
    newShowSchema[currentIndex] = true;
    setShowSchema(newShowSchema);

    // For subjective questions, we'll consider it correct if they attempt
    const newIsCorrect = [...isCorrect];
    newIsCorrect[currentIndex] = true;
    setIsCorrect(newIsCorrect);

    // Record first attempt result
    const newFirstTryResults = [...firstTryResults];
    if (newFirstTryResults[currentIndex] === null) {
      newFirstTryResults[currentIndex] = true;
      setFirstTryResults(newFirstTryResults);
    }

    // Calculate time taken for this question
    const timeTaken = questionStartTime ? Math.floor((Date.now() - questionStartTime) / 1000) : 0;

    // Record the attempt for saving later
    const attemptData = {
      question_id: questions[currentIndex].id,
      topic_id: topic_id,
      choosen_answer_id: 0, // Always 0 for subjective
      answer_status: 1, // Always 1 (considered correct for subjective)
      question_type_id: 2, // Subjective
      time_taken: timeTaken,
      subjective_answer: answers[currentIndex], // Store the user's written answer
      attempted_at: new Date().toISOString()
    };

    // Add to questionAttempts array
    setQuestionAttempts(prev => {
      const filtered = prev.filter(attempt => attempt.question_id !== questions[currentIndex].id);
      return [...filtered, attemptData];
    });

    // Reset question timer for next question
    setQuestionStartTime(Date.now());

    // Play success sound
    playSound('correct', 1.0);
  };

  // Add questionStartTime state for tracking per-question time:
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Update handleNext to reset question timer:
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1); // Changed from setCurrentQuestionIndex to setCurrentIndex
      setError("");
      setQuestionStartTime(Date.now()); // Reset timer for next question
    } else {
      handleSubmit();
    }
  };

  // Update the savePracticeSession function to include question_attempts:
  const savePracticeSession = async () => {
    const endTime = new Date().toISOString();

    try {
      // Calculate answered and skipped questions
      const answeredQuestions = answers.filter(answer => answer.trim() !== "").length;
      const totalQuestions = questions.length;
      const skippedQuestions = totalQuestions - answeredQuestions;

      const response = await router.post('/practice-session/subjective', {
        subject_id: subject_id,
        topic_id: topic_id,
        start_at: practiceStartTime,
        end_at: endTime,
        total_time_seconds: timeElapsed,
        total_correct: answeredQuestions, // Number of questions answered
        total_skipped: skippedQuestions,  // Total - answered
        score: null,
        question_attempts: questionAttempts // Add this line
      });

      console.log('✅ Subjective practice session saved:', {
        answered: answeredQuestions,
        skipped: skippedQuestions,
        total: totalQuestions,
        duration: timeElapsed + ' seconds',
        attempts_sent: questionAttempts.length
      });
    } catch (error) {
      console.error('❌ Failed to save subjective session:', error);
    }
  };

  // Add questionAttempts state at the top with other state declarations:
  const [questionAttempts, setQuestionAttempts] = useState([]);

  const isImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;

    // If it contains HTML tags, it's not a plain image URL
    if (/<[^>]+>/.test(url)) return false;

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();

    return imageExtensions.some(ext => lowerUrl.endsWith(ext) || lowerUrl.includes(ext + '?'));
  };

  const isHtmlContent = (content) => {
    if (!content || typeof content !== 'string') return false;

    // Check for HTML tags
    return /<[^>]+>/.test(content);
  };

  const containsImageTags = (html) => {
    if (!html || typeof html !== 'string') return false;

    // Check for <img> tags
    return /<img[^>]*>/i.test(html);
  };

  




  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setError("");
    }
  };

  const toggleSchema = () => {
    const newShowSchema = [...showSchema];
    newShowSchema[currentIndex] = !newShowSchema[currentIndex];
    setShowSchema(newShowSchema);
  };



  const resetQuiz = () => {
    setAnswers(Array(questions.length).fill(""));
    setError("");
    setShowScore(false);
    setQuizResults(null);
    setChecked(Array(questions.length).fill(false));
    setShowSchema(Array(questions.length).fill(false));
    setIsCorrect(Array(questions.length).fill(null));
    setFirstTryResults(Array(questions.length).fill(null));
    setCurrentIndex(0);
    setQuestionAttempts([]); // Add this line
    // Reset timer
    setTimeElapsed(0);
    setTimerRunning(true);
    setQuestionStartTime(Date.now()); // Add this line
  };



  // Responsive Progress Circles Component
  const ProgressCircles = () => (
    <div className="flex justify-center space-x-2 md:space-x-3 overflow-x-auto py-2 px-2">
      {questions.map((_, index) => {
        let circleColor = 'bg-gray-300';

        if (firstTryResults[index] !== null) {
          circleColor = firstTryResults[index] ? 'bg-green-500' : 'bg-red-500';
        } else if (index === currentIndex) {
          circleColor = 'bg-blue-500';
        }

        return (
          <div
            key={index}
            className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 ${circleColor} ${index === currentIndex ? 'ring-2 md:ring-4 ring-blue-200 scale-110' : ''
              } flex-shrink-0`}
          >
            {index + 1}
          </div>
        );
      })}
    </div>
  );

  // Responsive Footer Content
  const footerContent = (
    <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 px-4 md:px-10 py-3">
      {/* Tools Button - Hidden on mobile, visible on tablet and up */}
      <button className="hidden sm:flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
        <span>🔧</span>
        <span className="hidden md:inline">Tools</span>
      </button>

      {/* Mobile Tools Button */}
      <button className="sm:hidden flex items-center gap-2 px-3 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
        <span>🔧</span>
      </button>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        {/* Check Answer button */}
        {!checked[currentIndex] && (
          <button
            onClick={handleCheckAnswer}
            disabled={!answers[currentIndex].trim()}
            className={`w-full sm:w-auto px-4 py-3 md:px-6 md:py-3 rounded-lg font-medium shadow-md  text-sm md:text-base hover:scale-105 ${!answers[currentIndex].trim()
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 '
              }`}
          >
            Check Answer
          </button>
        )}

        {/* Next/Finish button */}
        {checked[currentIndex] && (
          <button
            onClick={handleNext}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-lg hover:bg-blue-700  font-medium shadow-md text-sm md:text-lg"
          >
            {currentIndex < questions.length - 1 ? (
              <>
                <span className="hidden sm:inline">Next Question</span>
                <span className="sm:hidden">Next</span>
                
              </>
            ) : (
              'Finish Quiz 🎉'
            )}
          </button>
        )}
      </div>
    </div>
  );

  // Main content for children prop
  const mainContent = (
    <div className="py-4 md:py-6 bg-cover bg-center bg-no-repeat min-h-screen" style={{ backgroundImage: 'url(/images/background_classroom.jpg)' }}>
      <div className="max-w-4xl mx-auto relative px-4 md:px-0">
        {/* Floating Feedback Messages - Hidden on mobile */}
        {isCorrect[currentIndex] === true && (
          <div className="hidden lg:block absolute -right-44 top-1/2 transform -translate-y-1/2 z-10 w-40">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 shadow-lg min-w-[200px] animate-bounce">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-800 font-medium text-sm">
                  Answer submitted! ✓
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Feedback Banner */}
        {isCorrect[currentIndex] === true && (
          <div className="lg:hidden bg-green-50 border-2 border-green-200 rounded-xl p-3 mb-4 animate-fade-in">
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-800 font-medium text-sm">
                Answer submitted! ✓
              </span>
            </div>
          </div>
        )}

        
        {/* Question Card */}
<div className="bg-white opacity-100 rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6 mb-6 md:mb-10 transition-all duration-300 hover:shadow-xl md:hover:shadow-2xl">
  {/* Mobile Question Counter */}
  <div className="lg:hidden mb-4 pb-3 border-b border-gray-200">
    <h2 className="text-lg font-semibold text-gray-800 text-center">
      Question {currentIndex + 1} of {questions.length}
    </h2>
  </div>

  {/* Question content with HTML rendering */}
  <div className="text-gray-700 mb-4 md:mb-6 text-base md:text-lg question-content">
    {questions[currentIndex]?.question ? (
    <div className="smart-question-renderer">
      <div 
        dangerouslySetInnerHTML={{
          __html: processHtmlContent(questions[currentIndex].question)
        }}
      />
      <style jsx>{`
        .question-paragraph {
          line-height: 1.6;
        }
        .inline-image {
          display: inline-block;
          vertical-align: middle;
          margin: 0 4px;
          transition: transform 0.2s ease;
        }
        .inline-image:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  ) : (
    <p className="text-red-500">No question content available</p>
  )}
  </div>

  <span className="text-gray-600 text-sm md:text-md mb-3 md:mb-4 block">Type your answer below:</span>

  {/* Answer input */}
  <textarea
    value={answers[currentIndex]}
    onChange={(e) => handleAnswerChange(e.target.value)}
    rows={4}
    className="w-full resize-none border-2 border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base md:text-lg font-medium mb-4 md:mb-6 p-3 md:p-4 bg-white transition-all duration-200"
    placeholder="Type your detailed answer with explanations and working here..."
    disabled={checked[currentIndex]}
  />

  {/* Error */}
  {error && (
    <div className="bg-red-50 border border-red-200 rounded-lg md:rounded-xl p-3 md:p-4 mb-3 md:mb-4 animate-shake">
      <p className="text-red-600 font-medium text-sm md:text-base">{error}</p>
    </div>
  )}

  {/* Buttons Section */}
  <div className="flex flex-col gap-3">
   
    

    {/* Schema Toggle Button - shown AFTER checking */}
    {checked[currentIndex] && (
      <button
        onClick={toggleSchema}
        className="max-w-xs sm:w-auto px-2 py-2 md:px-2 md:py-3 rounded-lg md:rounded-xl shadow bg-yellow-500 hover:bg-yellow-600 text-white font-medium transition-all duration-300 hover:scale-105 text-xs md:text-sm"
      >
        {showSchema[currentIndex] ? "Hide Schema Answer" : "Show Schema Answer"}
      </button>
    )}

   
  </div>

  {/* Schema Content - shown when toggled ON */}
  {checked[currentIndex] && showSchema[currentIndex] && (
    <div className="mt-4 p-3 md:p-4 bg-green-50 border-2 border-green-200 rounded-lg md:rounded-xl shadow-sm animate-fade-in">
      <h3 className="text-green-800 font-semibold mb-2 flex items-center text-sm md:text-base">
        <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Schema Answer:
      </h3>
      
      {questions[currentIndex]?.schema ? (
        (() => {
          const schema = questions[currentIndex].schema;

          // Case 1: HTML content with images
          if (isHtmlContent(schema) && containsImageTags(schema)) {
            return (
              <div className="text-green-700">
                <div 
                  className="prose max-w-none prose-sm md:prose-base"
                  dangerouslySetInnerHTML={{ __html: schema }}
                />
              </div>
            );
          }
          
          // Case 2: HTML content without images
          else if (isHtmlContent(schema)) {
            return (
              <div className="text-green-700 text-base md:text-lg prose max-w-none prose-sm md:prose-base">
                <div dangerouslySetInnerHTML={{ __html: schema }} />
              </div>
            );
          }
          
          // Case 3: Plain image URL
          else if (isImageUrl(schema)) {
            return (
              <div className="flex flex-col items-center">
                <img
                  src={schema}
                  alt="Schema Answer"
                  className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain border border-gray-200"
                  onError={(e) => {
                    console.error('❌ Failed to load schema image:', schema);
                    e.target.style.display = 'none';
                    if (!e.target.parentNode.querySelector('.image-fallback')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'image-fallback text-red-500 text-center p-4 bg-red-50 rounded-lg mt-2';
                      fallback.textContent = `Failed to load schema image`;
                      e.target.parentNode.appendChild(fallback);
                    }
                  }}
                  onLoad={() => {
                    console.log('✅ Schema image loaded successfully');
                  }}
                />
              </div>
            );
          }
          
          // Case 4: Regular URL (not an image)
          else if (schema.startsWith('http://') || schema.startsWith('https://')) {
            return (
              <div className="text-green-700">
                <p className="mb-2">Schema answer is available at:</p>
                <a
                  href={schema}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all bg-blue-50 p-2 rounded block"
                >
                  {schema}
                </a>
              </div>
            );
          }
          
          // Case 5: Plain text
          else {
            return (
              <div className="text-green-700 text-base md:text-lg whitespace-pre-wrap">
                {schema}
              </div>
            );
          }
        })()
      ) : (
        <div className="text-red-500 bg-red-50 p-3 rounded-lg">
          <p>No schema answer available for this question.</p>
        </div>
      )}
    </div>
  )}
</div>

      </div>

      {/* Zoom Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <img
            src={zoomedImage}
            alt="Zoomed question image"
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg cursor-zoom-out"
          />
        </div>
      )}
    </div>
  );

  // If quiz is completed, show the results page
  if (showScore && quizResults) {
    return (
      <ResultQuestion
        subjectiveResults={quizResults}
        onTryAgain={resetQuiz}
        quizType="subjective"
        subject={subject}
        standard={standard}
        sectionId={sectionId}
        contentId={contentId}
        topic={topic}
        sectionTitle={sectionTitle}
        topic_id={topic_id}
        form={standard}
        level_id={level_id}
        subject_id={subject_id}
      />
    );
  }

  return (
    <>
      {/* Hidden Audio Elements */}
      <audio ref={correctSoundRef} src="/sounds/correct.mp3" preload="auto" />
      <audio ref={wrongSoundRef} src="/sounds/wrong.mp3" preload="auto" />
      <audio ref={successSoundRef} src="/sounds/success.mp3" preload="auto" />

      <Head title={`${subject} - Subjective Quiz`} />

      <SubjectiveQuestionLayout
        subject={subject}
        standard={standard}
        currentTopic={topic || "Subjective Questions"}
        progressCircles={<ProgressCircles />}
        timeElapsed={timeElapsed}
        getTimeColor={getTimeColor}
        sectionTitle={sectionTitle || getSectionTitle()}
        formatTime={formatTime}
        footerContent={footerContent}
      >
        {mainContent}
      </SubjectiveQuestionLayout>

      {/* Custom CSS for animations and responsive design */}
      <style>{`
@keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        
        /* Improve table responsiveness */
        .prose table {
          display: block;
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        /* Better image rendering */
        .smart-question-renderer img {
          transition: transform 0.3s ease;
        }
        .smart-question-renderer img:hover {
          transform: scale(1.02);
        }
        
        /* Improve code block styling */
        .prose code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
        }
`}</style>

    </>
  );
}