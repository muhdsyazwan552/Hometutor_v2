// components/QuizDashboard.jsx
// components/QuizDashboard.jsx
import React, { useState, useEffect } from 'react';
import ObjectiveSection from './QuizInterface';
import { router, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';


const QuizLeaderboard = ({ schools = [], quizSessions = [] }) => {
  const [userInfo, setUserInfo] = useState({
    nickname: '',
    icNumber: '',
    school: ''
  });
  
  const [quizStarted, setQuizStarted] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState('');

  const selectedSchool = schools?.find(s => s.id == userInfo.school);
  const filteredSchools = schools?.filter(school => 
    school.name.toLowerCase().includes(schoolSearch.toLowerCase())
  ) || [];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Load leaderboard from database
  useEffect(() => {
    if (quizSessions && quizSessions.length > 0) {
      const transformedLeaderboard = quizSessions.map(session => ({
        id: session.id,
        nickname: session.display_name,
        school: session.school?.name || 'Unknown School',
        correct: session.total_correct,
        totalQuestions: 5,
        time: session.total_time_seconds,
        percentage: Math.round((session.total_correct / 5) * 100),
        timestamp: session.created_at
      })).sort((a, b) => {
        if (b.percentage !== a.percentage) return b.percentage - a.percentage;
        return a.time - b.time;
      });

      setLeaderboard(transformedLeaderboard);
    }
  }, [quizSessions]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleModalClose = () => {
    setShowForm(false);
    setSchoolSearch('');
  };

  const handleStartQuiz = (e) => {
    e.preventDefault();

    if (userInfo.nickname && userInfo.icNumber && userInfo.school) {
      const icExists = quizSessions.some(session => 
        session.ic_number === userInfo.icNumber
      );

      if (icExists) {
        alert("🎮 IC number already exists! You cannot take the quiz again.");
        return;
      }

      setShowForm(false);
      setQuizStarted(true);
    } else {
      alert('⚠️ Please fill in all fields');
    }
  };

  const handleQuizComplete = async (results) => {
    const percentage = Math.round((results.correctAnswers / results.totalQuestions) * 100);
    const selectedSchool = schools?.find(s => s.id == userInfo.school);

    const newScore = {
      nickname: userInfo.nickname,
      icNumber: userInfo.icNumber,
      school: userInfo.school,
      schoolName: selectedSchool ? selectedSchool.name : 'Unknown School',
      correct: results.correctAnswers,
      totalQuestions: results.totalQuestions,
      time: results.timeElapsed,
      percentage: percentage
    };

    await submitToDatabase(newScore);
  };

  const submitToDatabase = async (scoreData) => {
    setLoading(true);
    setError(null);

    router.post('/quiz/submit', {
      display_name: scoreData.nickname,
      ic_number: scoreData.icNumber,
      school_id: scoreData.school,
      total_correct: scoreData.correct,
      total_time_seconds: scoreData.time
    }, {
      onSuccess: (page) => {
        setQuizCompleted(true);
        setQuizStarted(false);
      },
      onError: (errors) => {
        setError('Failed to save quiz results. Please try again.');
      }
    });
  };

  const QuizWrapper = () => {
    const handleQuizFinish = (results) => {
      handleQuizComplete(results);
    };

    return (
      <div className="game-interface">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Quiz Challenge</h1>
                <p className="text-blue-100 text-sm">Player: {userInfo.nickname} | School: {selectedSchool?.name}</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
                  setQuizStarted(false);
                  setShowForm(true);
                }
              }}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition duration-200"
            >
              🚪 Exit Quiz
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 m-4 rounded-lg">
            <strong>Error: </strong>
            {error}
          </div>
        )}

        <ObjectiveSection onQuizComplete={handleQuizFinish} />
      </div>
    );
  };

  if (quizStarted) {
    return <QuizWrapper />;
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
       <div className="text-center mb-12 relative">
  {/* Quit Button - Floating Top Left */}
  <Link 
    href="/dashboard"
    className="absolute top-0 left-0 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
</svg>
  </Link>

  <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 p-1 rounded-xl mb-6">
    <h1 className="text-4xl font-bold text-white bg-gray-800 py-4 px-8 rounded-xl w-auto justify-items-center">
      <ApplicationLogo className="block h-16 w-auto fill-current text-gray-800" /> QUIZ ARENA
    </h1>
  </div>
  <p className="text-lg text-gray-300 mb-4">
    Test your knowledge • Compete with others • Become the champion
  </p>
  <div className="flex justify-center space-x-4 text-blue-300 text-sm">
    <span>🎯 5 Questions</span>
    <span>•</span>
    <span>⏱️ Beat the Clock</span>
    <span>•</span>
    <span>🏅 Global Ranking</span>
  </div>
</div>

        
      

        {/* Registration Modal */}
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl border-2 border-blue-500 w-full max-w-md">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-t-2xl">
                <h2 className="text-2xl font-bold text-white text-center">Join the Challenge</h2>
              </div>
              
              <form onSubmit={handleStartQuiz} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-300 mb-2">
                    Player Name *
                  </label>
                  <input
                    type="text"
                    name="nickname"
                    value={userInfo.nickname}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border-2 border-blue-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-300 mb-2">
                    IC Number *
                  </label>
                  <input
                    type="text"
                    name="icNumber"
                    value={userInfo.icNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border-2 border-blue-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    placeholder="Enter your IC number"
                    required
                  />
                </div>

                <div>
  <label className="block text-sm font-medium text-blue-300 mb-2">
    School *
  </label>
  
  <div className="relative mb-2">
    <input
      type="text"
      placeholder="Search school..."
      className="w-full px-4 py-3 pl-10 bg-gray-700 border-2 border-blue-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
      onChange={(e) => setSchoolSearch(e.target.value)}
      value={schoolSearch}
    />
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <span className="text-blue-400">🔍</span>
    </div>
  </div>
  
  <select
    name="school"
    value={userInfo.school}
    onChange={handleInputChange}
    className="w-full px-4 py-3 bg-gray-700 border-2 border-blue-500 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-all duration-200"
    required
    size={4}
  >
    <option value="" className="text-gray-400">-- Select School --</option>
    {filteredSchools.map((school) => (
      <option 
        key={school.id} 
        value={school.id} 
        className={`transition-all duration-200 ${
          userInfo.school == school.id 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg' 
            : 'text-white hover:bg-gray-600'
        }`}
      >
        {userInfo.school == school.id ? `✅ ${school.name}` : school.name}
      </option>
    ))}
  </select>
  
  <div className="mt-2 text-sm">
    {!schools || schools.length === 0 ? (
      <p className="text-red-400">No schools available</p>
    ) : filteredSchools.length === 0 ? (
      <p className="text-yellow-400">No schools found matching "{schoolSearch}"</p>
    ) : (
      <p className="text-green-400">
        Found {filteredSchools.length} of {schools.length} schools
        {schoolSearch && (
          <button 
            onClick={() => setSchoolSearch('')}
            className="ml-2 text-blue-400 hover:text-blue-300 underline"
          >
            Clear
          </button>
        )}
      </p>
    )}
  </div>
</div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-gray-700 transition duration-200 border-2 border-gray-500"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={!userInfo.nickname || !userInfo.icNumber || !userInfo.school}
                    className={`flex-1 py-3 px-6 rounded-lg font-bold transition duration-200 border-2 ${
                      userInfo.nickname && userInfo.icNumber && userInfo.school
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white border-green-400 hover:shadow-lg'
                        : 'bg-gray-500 text-gray-300 border-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Start Quiz
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl border-2 border-blue-500 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                Leaderboard - <span className="bg-white text-blue-600 px-2 py-1 rounded">JERAYAWARA</span>
              </h2>
              <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
                {leaderboard.length} Players
              </span>
            </div>
          </div>

          <div className="p-6">
            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🏆</div>
                <p className="text-xl text-blue-300 mb-4">Be the first to take the challenge!</p>
                <p className="text-gray-400">No scores yet. Start the quiz to claim the top spot!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="max-h-[400px] overflow-y-auto border border-gray-600 rounded-lg">
                <table className="w-full relative">
                  <thead className="bg-gray-700 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-blue-300 uppercase">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-blue-300 uppercase">
                        Player
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-blue-300 uppercase">
                        School
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-blue-300 uppercase">
                        Score
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-blue-300 uppercase">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {leaderboard.map((entry, index) => (
                      <tr
                        key={entry.id}
                        className="hover:bg-gray-700 transition duration-150"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            {index === 0 && <span className="text-2xl">🥇</span>}
                            {index === 1 && <span className="text-2xl">🥈</span>}
                            {index === 2 && <span className="text-2xl">🥉</span>}
                            {index > 2 && (
                              <span className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                                {index + 1}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-white">{entry.nickname}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-300">{entry.school}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-green-400">
                              {entry.correct}/5
                            </span>
                            <span className="text-sm bg-blue-600 text-white px-2 py-1 rounded">
                              {entry.percentage}%
                            </span>
                            {entry.percentage === 100 && (
                              <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded">
                                PERFECT!
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-300 font-mono">{formatTime(entry.time)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Start Button */}
      <div className="fixed bottom-8 right-8">
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 
                     rounded-xl font-bold text-lg shadow-lg hover:shadow-xl 
                     transform hover:scale-105 transition duration-200 
                     flex items-center gap-2 border-2 border-blue-400"
        >
          <span>⚔️</span>
          Start Quiz
          <span>🎯</span>
        </button>
      </div>
    </div>
  );
};

export default QuizLeaderboard;