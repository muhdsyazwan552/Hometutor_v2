import React, { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import SubjectLayout from '@/Layouts/SubjectLayout';
import DonutChart from '@/Components/ChartJsDonut';
import SubtopicDetailModal from '@/Components/SubtopicDetailModal';

export default function SubjectReportPage() {
  const { props } = usePage();

  const {
    subject,
    subject_abbr,
    form,
    subject_id,
    level_id,
    question_type = 'Objective',
    objective_topics = [],  
    subjective_topics = [], 
  } = props;

  const [currentStandard, setCurrentStandard] = useState(form || 'Form 4');
  const [expandedTopics, setExpandedTopics] = useState({});
  const [activeTab, setActiveTab] = useState(question_type);
  const [timeRange, setTimeRange] = useState('Last 7 Days');
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get topics based on active tab
  const topics = activeTab === 'Objective' ? objective_topics : subjective_topics;

  const handleStandardChange = (standard) => {
    setCurrentStandard(standard);
    setIsLoading(true);
    
    router.get(route('subject-report-page', {
      subject: subject_abbr || subject,
      form: standard,
      level_id: level_id,
      subject_id: subject_id,
      question_type: activeTab,
      preload_both: 'true'
    }), {
      preserveState: true,
      preserveScroll: true,
       onStart: () => setIsLoading(true),
      onFinish: () => setIsLoading(false),
      onError: () => setIsLoading(false),
    });
  };

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    
    // Set loading state
    setIsLoading(true);
    setActiveTab(tab);
    
    router.get(route('subject-report-page', {
      subject: subject_abbr || subject,
      form: currentStandard,
      level_id: level_id,
      subject_id: subject_id,
      question_type: tab
    }), {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setIsLoading(false),
    });
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const toggleTopic = (topicId) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const handleSubtopicClick = (subtopic) => {
    setSelectedSubtopic(subtopic);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSubtopic(null);
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          {/* Topic header skeleton */}
          <div className="px-6 py-4 border-b border-gray-200 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            </div>
          </div>
          
          {/* Table skeleton */}
          <div className="bg-gray-200 p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="grid grid-cols-5 gap-4 items-center py-3 px-4">
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/4 mx-auto"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/4 mx-auto"></div>
                  <div className="h-10 w-10 bg-gray-300 rounded-full mx-auto"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/3 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <SubjectLayout
      subject={subject}
      activeTab="Report"
      selectedStandard={currentStandard}
      onStandardChange={handleStandardChange}
    >
      <div className="py-0 mx-6 mt-0">
        <div className="px-6 py-0 min-w-full mx-auto">

          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {activeTab} Analysis
              </h2>
              <p className="text-gray-600">
                This report analyses the {activeTab.toLowerCase()} practice that you have done earlier and helps to evaluate your progress.
              </p>
            </div>

            {/* Tabs with loading indicator */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit relative">
              <button
                className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center min-w-[80px] ${activeTab === 'Objective'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                  } ${isLoading && activeTab === 'Objective' ? 'opacity-75' : ''}`}
                onClick={() => handleTabChange('Objective')}
                disabled={isLoading}
              >
                {isLoading && activeTab === 'Objective' ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Loading...
                  </div>
                ) : (
                  'Objective'
                )}
              </button>

              <button
                className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center min-w-[80px] ${activeTab === 'Subjective'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                  } ${isLoading && activeTab === 'Subjective' ? 'opacity-75' : ''}`}
                onClick={() => handleTabChange('Subjective')}
                disabled={isLoading}
              >
                {isLoading && activeTab === 'Subjective' ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Loading...
                  </div>
                ) : (
                  'Subjective'
                )}
              </button>
            </div>
          </div>

          {/* Global loading overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-700">Loading {activeTab.toLowerCase()} data...</p>
              </div>
            </div>
          )}

          {/* Progress Details */}
          <div className="mb-8 border border-gray-300 rounded-lg bg-gray-50 shadow-sm transition-opacity duration-300">
            <div className="flex items-center justify-between mb-2 bg-slate-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800">Progress Details</h3>

              {/* Time range */}
              <div className="gap-2 flex">
                <span className="text-sm text-gray-600">Activity from :</span>
                <select
                  value={timeRange}
                  onChange={(e) => handleTimeRangeChange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-0 text-sm bg-white"
                  disabled={isLoading}
                >
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                  <option>All Time</option>
                </select>
              </div>
            </div>

            {/* Topic listing with loading state */}
            <div className="space-y-1 p-2">
              {isLoading ? (
                <LoadingSkeleton />
              ) : topics.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 text-lg">No {activeTab.toLowerCase()} topics with questions available</p>
                </div>
              ) : (
                topics.map((topic) => (
                  <div 
                    key={topic.id} 
                    className="border border-gray-200 rounded-lg overflow-hidden bg-white transition-all duration-300 hover:shadow-md"
                  >
                    {/* Topic header */}
                    <div
                      className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-200"
                      onClick={() => toggleTopic(topic.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <svg
                            className={`w-5 h-5 transform transition-transform ${expandedTopics[topic.id] ? 'rotate-90' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="font-semibold text-gray-800 text-base">
                            {topic.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded */}
                    {expandedTopics[topic.id] && (
                      <div className="bg-gray-200">

                        {/* Table header */}
                        <div className="px-6 py-3">
                          <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-700">
                            <div className="border-b-2 border-gray-50">Subtopics</div>
                            <div className="text-center border-b-2 border-gray-50">Total Session</div>

                            {activeTab === 'Objective' && (
                              <>
                                <div className="text-center border-b-2 border-gray-50">Score Statistic</div>
                                <div className="text-center border-b-2 border-gray-50">Average Score</div>
                                <div className="text-center border-b-2 border-gray-50">Last Session</div>
                              </>
                            )}

                            {activeTab === 'Subjective' && (
                              <>
                                <div className="text-center border-b-2 border-gray-50">Last Session</div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Table body */}
                        <div className="px-2 py-0">
                          {topic.subtopics && topic.subtopics.length > 0 ? (
                            <div className="space-y-3">
                              {topic.subtopics.map((subtopic) => (
                                <div
                                  key={subtopic.id}
                                  className="grid grid-cols-5 gap-4 items-center py-3 px-4 bg-gray-200 cursor-pointer hover:bg-gray-300 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSubtopicClick(subtopic);
                                  }}
                                >
                                  {/* Subtopic name */}
                                  <div className="text-sm font-medium text-gray-900">
                                    {subtopic.name}
                                  </div>

                                  {/* Total sessions */}
                                  <div className="text-sm text-gray-600 text-center">
                                    {subtopic.progress?.total_sessions || 0}
                                  </div>

                                  {/* Objective mode */}
                                  {activeTab === 'Objective' && (
                                    <>
                                      <div className="text-sm text-gray-600 text-center">
                                        {subtopic.progress?.score_statistic || '—'}
                                      </div>

                                      <div className="text-center" onClick={(e) => e.stopPropagation()}>
                                        <DonutChart
                                          percentage={subtopic.progress?.average_score || 0}
                                          size={40}
                                          strokeWidth={4}
                                          label="Accuracy"
                                        />
                                      </div>

                                      <div className="text-sm text-gray-600 text-center">
                                        {subtopic.progress?.last_session || '-'}
                                      </div>
                                    </>
                                  )}

                                  {/* Subjective mode */}
                                  {activeTab === 'Subjective' && (
                                    <>
                                      <div className="text-sm text-gray-600 text-center">
                                        {subtopic.progress?.last_session || '-'}
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            // No subtopics - show topic directly
                            <div
                              className="grid grid-cols-5 gap-4 items-center py-3 px-4 bg-gray-200 cursor-pointer hover:bg-gray-300 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubtopicClick(topic);
                              }}
                            >
                              <div className="text-sm font-medium text-gray-900">
                                {topic.name}
                              </div>

                              <div className="text-sm text-gray-600 text-center">
                                {topic.total_sessions || '0'}
                              </div>

                              {/* Objective mode */}
                              {activeTab === 'Objective' && (
                                <>
                                  <div className="text-sm text-gray-600 text-center">
                                    {topic.score_statistic || '—'}
                                  </div>

                                  <div className="text-center">
                                    <DonutChart
                                      percentage={topic.average_score || 0}
                                      size={40}
                                      strokeWidth={4}
                                      label="Accuracy"
                                    />
                                  </div>

                                  <div className="text-sm text-gray-600 text-center">
                                    {topic.last_session || '-'}
                                  </div>
                                </>
                              )}

                              {/* Subjective mode */}
                              {activeTab === 'Subjective' && (
                                <>
                                  <div className="text-sm text-gray-600 text-center">
                                    {topic.last_session || '-'}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subtopic Detail Modal */}
      <SubtopicDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        subtopicData={selectedSubtopic}
        questionType={activeTab}
      />
    </SubjectLayout>
  );
}