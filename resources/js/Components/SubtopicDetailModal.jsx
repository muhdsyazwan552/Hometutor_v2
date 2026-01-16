import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import DonutChart from '@/Components/ChartJsDonut';
import QuestionReviewModal from '@/Components/QuestionReviewModal';
import { exportSessionsToPdf } from '@/utils/exportPdf';

export default function SubtopicDetailModal({ isOpen, onClose, subtopicData, questionType }) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [exporting, setExporting] = useState(false);

    const openReviewModal = (sessionId) => {
        setSelectedSessionId(sessionId);
        setShowReviewModal(true);
    };

    const handleExportToPdf = () => {
        if (sessions.length === 0) {
            alert('No session data to export');
            return;
        }
        
        setExporting(true);
        try {
            exportSessionsToPdf(
                sessions, 
                subtopicData?.name || 'Subtopic',
                questionType
            );
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Failed to export PDF. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => {
        if (isOpen && subtopicData) {
            fetchSessionDetails();
        } else {
            // Reset state when modal closes
            setSessions([]);
            setError(null);
        }
    }, [isOpen, subtopicData]);

    const fetchSessionDetails = async () => {
        if (!subtopicData?.id) return;

        setLoading(true);
        setError(null);
        try {
            const url = route('subtopic-details', {
                subtopicId: subtopicData.id,
                questionType: questionType
            });

            // console.log('Fetching from:', url);

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setSessions(data.sessions || []);
        } catch (error) {
            console.error('Error fetching subtopic details:', error);
            setError('Failed to load details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Early return if not open
    if (!isOpen) return null;

    return (
        <>
            {/* Question Review Modal */}
            <QuestionReviewModal
                isOpen={showReviewModal}
                onClose={() => {
                    setShowReviewModal(false);
                    setSelectedSessionId(null);
                }}
                sessionId={selectedSessionId}
            />

            {/* Subtopic Detail Modal */}
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
                <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">
                            {subtopicData?.name || 'Subtopic'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                                                
                    
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {error ? (
                            <div className="text-center py-8">
                                <div className="text-red-600 mb-4">{error}</div>
                                <button
                                    onClick={fetchSessionDetails}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-600 mt-4">Loading session details...</p>
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-8">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-gray-500 text-lg">No practice sessions found</p>
                            </div>
                        ) : (
                            <>
                                {/* Sessions Table */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white border border-gray-200">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                    No
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                    Total Questions
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                    {questionType === 'Objective' ? 'Correct' : 'Answered'}
                                                </th>
                                                {/* Show Wrong column only for Objective */}
                                                {questionType === 'Objective' && (
                                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                        Wrong
                                                    </th>
                                                )}
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                    Skipped
                                                </th>
                                                {/* Show Score column only for Objective */}
                                                {questionType === 'Objective' && (
                                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                        Score
                                                    </th>
                                                )}
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                    Time Spent
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                    Avg Time
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                    Session Date
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {sessions.map((session, index) => (
                                                <tr key={session.id || index} className="">
                                                    <td className="px-4 py-3 text-sm text-gray-500 text-center whitespace-nowrap">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-700 text-center bg-gray-100">
                                                        {session.total_questions || 0}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-green-700 font-medium text-center bg-green-100">
                                                        {session.total_correct || 0}
                                                    </td>
                                                    {/* Show Wrong cell only for Objective */}
                                                    {questionType === 'Objective' && (
                                                        <td className="px-4 py-3 text-sm text-red-700 font-medium text-center bg-red-100">
                                                            {session.total_wrong || 0}
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-3 text-sm text-yellow-700 font-medium text-center bg-yellow-100">
                                                        {session.total_skipped || 0}
                                                    </td>
                                                    {/* Show Score cell only for Objective */}
                                                    {questionType === 'Objective' && (
                                                        <td className="px-4 py-3 text-center bg-gray-50">
                                                            <div className="flex justify-center items-center">
                                                                <DonutChart
                                                                    percentage={parseFloat(session.score) || 0}
                                                                    size={40}
                                                                    strokeWidth={4}
                                                                    label="Score"
                                                                    color="#3b82f6"
                                                                />
                                                            </div>
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                                        {session.total_time || '0 min 0 secs'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                                        {session.average_time || '0 min 0 secs'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 text-center">
                                                        {session.session_date || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => openReviewModal(session.id)}
                                                            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                                                            title="Review Questions"
                                                        >
                                                            Review
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end p-6 border-t border-gray-200 gap-2">
                        <div className="flex items-center space-x-3">
                            {sessions.length > 0 && (
                                <button
                                    onClick={handleExportToPdf}
                                    disabled={exporting}
                                    className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                                        exporting 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-green-600 hover:bg-green-700'
                                    } text-white`}
                                >
                                    {exporting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Exporting...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Export PDF
                                        </>
                                    )}
                                </button>
                            )}
                            
                        </div>

                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}