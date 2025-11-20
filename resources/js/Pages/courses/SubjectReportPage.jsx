// resources/js/Pages/courses/SubjectReportPage.jsx
import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import SubjectLayout from '@/Layouts/SubjectLayout';

export default function SubjectReportPage() {
  const { props } = usePage();

  const {
    subject,
    subject_abbr,
    form,
    subject_id,
    level_id,
    topics = []
  } = props;

  const [currentStandard, setCurrentStandard] = useState(form || 'Form 4');
  const [expandedTopics, setExpandedTopics] = useState({});
  const [activeTab, setActiveTab] = useState('Objective');
  const [timeRange, setTimeRange] = useState('Last 7 Days');

  const handleStandardChange = (standard) => {
    setCurrentStandard(standard);

    router.get(route('subject-report-page', {
      subject: subject_abbr || subject,
      form: standard,
      level_id: level_id,
      subject_id: subject_id
    }));
  };

  const toggleTopic = (topicId) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  return (
    <SubjectLayout
      subject={subject}
      activeTab="Report"
      selectedStandard={currentStandard}
      onStandardChange={handleStandardChange}
    >
      {/* Report Content */}
      <div className="py-0 mx-6 mt-0">
        <div className=" px-6 py-0 min-w-full mx-auto">
          {/* Header - Match Image */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Objective Analysis
          </h2>
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-600 ">
              This report analyses the practice that you have done earlier and helps to evaluate your progress.
            </p>

            {/* Objective/Subjective Tabs - Match Image */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1  w-fit">
              <button
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'Objective'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
                onClick={() => setActiveTab('Objective')}
              >
                Objective
              </button>
              <button
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'Subjective'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
                onClick={() => setActiveTab('Subjective')}
              >
                Subjective
              </button>
            </div>

          </div>

          {/* Progress Details Section */}
          <div className="mb-8 border border-gray-300 rounded-lg bg-gray-50 shadow-sm">
            <div className="flex items-center justify-between mb-2 bg-slate-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 ">Progress Details</h3>



              {/* Time Range Filter - Match Image */}
              <div className=" gap-2 flex">
                <span className="text-sm text-gray-600">Activity from :</span>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-0 text-sm bg-white"
                >
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                  <option>All Time</option>
                </select>
              </div>
            </div>


            {/* Topics List - Match Image Design */}
            <div className="space-y-1 p-2">
              {topics.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 text-lg">No topics with questions available</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Topics will appear here once questions are added to them.
                  </p>
                </div>
              ) : (
                topics.map((topic) => (
                  <div key={topic.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    {/* Topic Header - Simple design like image */}
                    <div
                      className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-200"
                      onClick={() => toggleTopic(topic.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <svg
                            className={`w-5 h-5 transform transition-transform ${expandedTopics[topic.id] ? 'rotate-90' : ''
                              }`}
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

                        {/* Topic progress indicator */}
                        {/* <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            {topic.total_sessions || '0'} sessions
                          </span>
                          <span className="text-sm font-medium text-gray-800">
                            ({topic.average_score || '0'}%)
                          </span>
                        </div> */}
                      </div>
                    </div>

                    {/* Dropdown Content - Table like image */}
                    {expandedTopics[topic.id] && (
                      <div className="bg-gray-200">
                        {/* Table Header */}
                        <div className="px-6 py-3">
                          <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-700">
                            <div className="border-b-2 border-gray-50">Subtopics</div>
                            <div className="text-center border-b-2 border-gray-50 ">Total Session</div>
                            <div className="text-center border-b-2 border-gray-50">Score Statistic</div>
                            <div className="text-center border-b-2 border-gray-50">Average Score</div>
                            <div className="text-center border-b-2 border-gray-50">Last Session</div>
                          </div>
                        </div>

                        {/* Table Body */}
                        <div className="px-2 py-0">
                          {topic.subtopics && topic.subtopics.length > 0 ? (
                            <div className="space-y-3">
                              {topic.subtopics.map((subtopic) => (
                                <div
                                  key={subtopic.id}
                                  className="grid grid-cols-5 gap-4 items-center py-3 px-4  bg-gray-200"
                                >
                                  <div className="text-sm font-medium text-gray-900">
                                    {subtopic.name}
                                  </div>
                                  <div className="text-sm text-gray-600 text-center">
                                    {subtopic.progress.total_sessions || '0'}
                                  </div>
                                  <div className="text-sm text-gray-600 text-center">
                                    —
                                  </div>
                                  <div className="text-center">
                                    <span className="text-sm font-semibold text-gray-800">
                                      {subtopic.progress.average_score || '0'}%
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-600 text-center">
                                    {subtopic.progress.last_session || '-'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            // Single row for main topic when no subtopics
                            <div className="grid grid-cols-5 gap-4 items-center py-3 px-4 bg-gray-200 ">
                              <div className="text-sm font-medium text-gray-900">
                                {topic.name}
                              </div>
                              <div className="text-sm text-gray-600 text-center">
                                {topic.total_sessions || '0'}
                              </div>
                              <div className="text-sm text-gray-600 text-center">
                                —
                              </div>
                              <div className="text-center">
                                <span className="text-sm font-semibold text-gray-800">
                                  {topic.average_score || '0'}%
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 text-center">
                                {topic.last_session || '-'}
                              </div>
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
    </SubjectLayout>
  );
}