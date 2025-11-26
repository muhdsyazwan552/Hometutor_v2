import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import DonutChart from '@/Components/ChartJsDonut';

export default function SubtopicDetailModal({ isOpen, onClose, subtopicData, questionType }) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

            console.log('Fetching from:', url);

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                                                Correct
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                Wrong
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                Skipped
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                Score
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                Time Spent
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                Avg Time
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                Session Date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {sessions.map((session, index) => (
                                            <tr key={session.id || index} className="">
                                                <td className="px-4 py-3 text-sm text-gray-500 text-center whitespace-nowrap">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700 text-center bg-gray-300">
                                                    {session.total_questions || 0}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-green-700 font-medium text-center bg-green-200">
                                                    {session.total_correct || 0}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-red-700 font-medium text-center bg-red-200">
                                                    {session.total_wrong || 0}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-yellow-700 font-medium text-center bg-orange-200">
                                                    {session.total_skipped || 0}
                                                </td>
                                                <td className="px-4 py-3 text-center bg-gray-100">
                                                    <div className="flex justify-center items-center">
                                                        <DonutChart
                                                            percentage={parseFloat(session.score) || 0}
                                                            size={40}
                                                            strokeWidth={4}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                                    {session.total_time || '0 min 0 secs'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                                    {session.average_time || '0 min 0 secs'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-center">
                                                    {session.session_date || '-'}
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
                <div className="flex justify-end p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}