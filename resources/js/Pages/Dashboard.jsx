import DashboardLayout from '@/Layouts/DashboardLayout';
import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/Contexts/LanguageContext';


export default function Dashboard() {
  const { t, locale, translations } = useLanguage();
  const pageProps = usePage().props;

    useEffect(() => {
    console.log('Current locale:', locale);
    console.log('Available translations:', translations);
    console.log('Test translation:', t('school'));
    console.log('Page props:', pageProps);
  }, [locale, translations, t, pageProps]); // Hanya log ketika dependencies ini berubah

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const { auth, profileData, courses, assignments, quizSessions, friends, pendingRequests } = usePage().props;
  const user = auth.user;

  const friendsData = friends || [];
  const friendRequestsData = pendingRequests || [];

  // Format time to MM:SS
  const formatTime = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Process quiz sessions data for leaderboard
  const processedLeaderboardData = quizSessions ? quizSessions.map((session, index) => ({
    rank: index + 1,
    name: session.display_name || 'Anonymous',
    school: session.school?.name || 'Unknown School',
    time: session.total_time_seconds || 0,
    avatar: (session.display_name || 'AN')
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2),
    isCurrentUser: session.user_id === user.id // Adjust based on your user identification
  })) : [];

  const initials = (profileData?.name || user.name)
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    const interval = setInterval(() => {
      setShowEmoji((prev) => !prev);
    }, 2000); // change every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const handlePostSubmit = () => {
    if (newPostContent.trim()) {
      const newPost = {
        id: posts.length + 1,
        author: user.name,
        period: "Your period",
        teacher: "Your teacher",
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        content: newPostContent
      };
      setPosts([newPost, ...posts]);
      setNewPostContent("");
      setShowNewPostForm(false);
    }
  };

  // Handle accept friend request
  const handleAcceptRequest = (requestId) => {
    router.post(`/friends/accept-request/${requestId}`, {}, {
      preserveScroll: true,
      onSuccess: () => {
        // Refresh the page or update local state
        router.reload({ only: ['friends', 'pendingRequests'] });
      }
    });
  };

  // Handle reject friend request
  const handleRejectRequest = (requestId) => {
    router.post(`/friends/reject-request/${requestId}`, {}, {
      preserveScroll: true,
      onSuccess: () => {
        router.reload({ only: ['friends', 'pendingRequests'] });
      }
    });
  };

  // Chat data class structure
  class Chat {
    constructor(id, name, avatar, avatarColor, lastMessage, lastMessageTime, status, subject, unreadCount = 0) {
      this.id = id;
      this.name = name;
      this.avatar = avatar;
      this.avatarColor = avatarColor;
      this.lastMessage = lastMessage;
      this.lastMessageTime = lastMessageTime;
      this.status = status; // 'online', 'away', 'offline'
      this.subject = subject;
      this.unreadCount = unreadCount;
    }

    get subjectBadge() {
      const subjects = {
        'Mathematics': { text: 'Mathematics', color: 'bg-blue-100 text-blue-800' },
        'Science': { text: 'Science', color: 'bg-purple-100 text-purple-800' },
        'History': { text: 'History', color: 'bg-yellow-100 text-yellow-800' },
        'English': { text: 'English', color: 'bg-green-100 text-green-800' },
        'Physics': { text: 'Physics', color: 'bg-red-100 text-red-800' }
      };
      return subjects[this.subject] || { text: this.subject, color: 'bg-gray-100 text-gray-800' };
    }

    get statusBadge() {
      const statuses = {
        'online': { text: 'Online', color: 'bg-green-100 text-green-800' },
        'away': { text: 'Away', color: 'bg-yellow-100 text-yellow-800' },
        'offline': { text: 'Offline', color: 'bg-gray-100 text-gray-800' }
      };
      return statuses[this.status] || statuses.offline;
    }
  }

  // Sample chat data using the class
  const chatData = [
    new Chat(
      1,
      'Ahmad Salleh',
      'AS',
      'bg-gradient-to-r from-blue-400 to-purple-500',
      'Hey, can you help me with the math assignment?',
      '2 min ago',
      'online',
      'Mathematics',
      2
    ),
    new Chat(
      2,
      'Nurul Huda',
      'NH',
      'bg-gradient-to-r from-pink-400 to-red-500',
      'I shared the science notes with you. Check your email!',
      '1 hr ago',
      'online',
      'Science',
      1
    ),
    new Chat(
      3,
      'Mohd Rizal',
      'MR',
      'bg-gradient-to-r from-green-400 to-teal-500',
      'Let\'s meet tomorrow for group study session',
      '3 hrs ago',
      'offline',
      'History',
      0
    )
  ];

  // Event handlers
  const handleChatClick = (chatId) => {
    console.log('Chat clicked:', chatId);
    // Navigate to chat or open chat modal
  };

  const handleNewChat = () => {
    console.log('Start new chat');
    // Open new chat modal or navigate to contacts
  };

  // Class structure for friends data
  class Friend {
    constructor(id, name, avatar, avatarColor, status, mutualFriends) {
      this.id = id;
      this.name = name;
      this.avatar = avatar;
      this.avatarColor = avatarColor;
      this.status = status;
      this.mutualFriends = mutualFriends;
    }
  }

  class FriendRequest {
    constructor(id, name, avatar, mutualFriends) {
      this.id = id;
      this.name = name;
      this.avatar = avatar;
      this.mutualFriends = mutualFriends;
    }
  }

  const filterButtons = [
    { id: 'all', label: 'All' },
    { id: 'bahasa', label: 'BM' },
    { id: 'english', label: 'English' },
    { id: 'matematik', label: 'Math' },
    { id: 'sejarah', label: 'History' },
    { id: 'sains', label: 'Science' }
  ];

  const teachersData = [
    {
      id: 1,
      name: 'Ahmad Hassan',
      avatar: 'AH',
      avatarColor: 'bg-gradient-to-br from-blue-500 to-purple-600',
      subject: 'Bahasa Melayu',
      school: 'SMK Seri Aman',
      status: 'online',
      experience: 5
    },
    {
      id: 2,
      name: 'Sarah Wong',
      avatar: 'SW',
      avatarColor: 'bg-gradient-to-br from-green-500 to-teal-600',
      subject: 'Mathematics',
      school: 'SMK Puteri',
      status: 'offline',
      experience: 7
    },
    {
      id: 3,
      name: 'Raj Kumar',
      avatar: 'RK',
      avatarColor: 'bg-gradient-to-br from-rose-500 to-pink-600',
      subject: 'Science',
      school: 'SMK Taman Desa',
      status: 'online',
      experience: 8
    },
    {
      id: 4,
      name: 'Lisa Tan',
      avatar: 'LT',
      avatarColor: 'bg-gradient-to-br from-yellow-500 to-orange-600',
      subject: 'English',
      school: 'SMK Bandar Baru',
      status: 'online',
      experience: 6
    },
    {
      id: 5,
      name: 'Mohd Salim',
      avatar: 'MS',
      avatarColor: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      subject: 'History',
      school: 'SMK Seri Permata',
      status: 'offline',
      experience: 4
    }
  ];

  const filteredTeachers = activeFilter === 'all'
    ? teachersData
    : teachersData.filter(teacher =>
      teacher.subject.toLowerCase().includes(activeFilter.toLowerCase())
    );

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
  };

  const handleTeacherClick = (teacherId) => {
    console.log('Teacher clicked:', teacherId);
    // Navigate to teacher profile or open modal
  };

  return (
    
    <DashboardLayout>
      <Head title="Dashboard" />

      <div className="max-w-full px-4 py-4 xl:py-6 xl:px-12 lg:py-4 lg:px-4 ">
        <div className="grid grid-cols-1 gap-4 sm:gap-6  lg:grid-cols-8  xl:grid-cols-11">

          {/* Column 1 */}
          <div className="lg:col-span-2 xl:col-span-3">
            <div className="grid md:grid-cols-2 md:gap-4">
              {/* Profile Card */}
              <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-2 lg:col-span-2 xl:col-span-2 h-96"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-indigo-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {t( 'profile', 'Profile')}
                  </h2>
                </div>

                {/* Profile Section */}
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 md:col-span-1">
                  <div className="flex flex-col items-center text-center mb-4 sm:mb-5">
                    {/* Avatar */}
                    <div className="relative mb-3 sm:mb-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-lg sm:text-xl border-4 border-white shadow-lg">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={showEmoji ? 'emoji' : 'initials'}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            {showEmoji ? '😎' : initials}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                      {/* Online Status Indicator */}
                      <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>

                    {/* Name & Email */}
                    <div>
                      <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                        {profileData?.name || user.name}
                      </h3>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-xs sm:text-sm text-gray-600">
                          {t( 'school','School')}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-800 truncate ml-2 max-w-[120px] sm:max-w-none">
                        {profileData?.school || 'Not specified'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                        <span className="text-xs sm:text-sm text-gray-600">
                          {t('grade','Grade')}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-800">
                        {profileData?.grade || 'Form 5'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Friends Card */}
              <div className="lg:col-span-2 xl:col-span-2">
                <motion.div
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  {/* Header with Search */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {t('friends_ptrs','Friends_ptrs')}
                      </h2>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {friendsData.length}
                      </span>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder={t('search_friends', 'Search friends...')}
                        className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Friends List */}
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-700">
                        Online
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {friendsData.map((friend) => (
                        <div key={friend.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-semibold text-sm ${friend.avatarColor} shadow-sm`}>
                                {friend.avatar}
                              </div>
                              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${friend.status === 'online' ? 'bg-green-400' :
                                  friend.status === 'away' ? 'bg-yellow-400' : 'bg-gray-300'
                                }`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{friend.name}</p>
                              <p className="text-xs text-gray-500">
                                {friend.mutualFriends} mutual
                              </p>
                            </div>
                          </div>

                          <button
                            className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1.5 rounded-lg font-medium"
                            onClick={() => router.get(route('chat.lobby'))}
                          >
                            Chat
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Friend Requests */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold">
                        Friend Requests
                      </h3>
                      {friendRequestsData.length > 0 && (
                        <span className="text-xs text-blue-600 font-medium">
                          See all
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {friendRequestsData.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                              {request.avatar}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{request.name}</p>
                              <p className="text-xs text-gray-500">
                                {request.mutualFriends} mutual friends
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              className="w-7 h-7 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm"
                              onClick={() => handleAcceptRequest(request.id)}
                            >
                              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button
                              className="w-7 h-7 bg-gray-300 hover:bg-gray-400 text-white rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm"
                              onClick={() => handleRejectRequest(request.id)}
                            >
                              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}

                      {friendRequestsData.length === 0 && (
                        <div className="text-center py-3">
                          <p className="text-sm text-gray-400">
                            No pending requests
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Column 2 - Assignments and Courses */}
          <div className="lg:col-span-3 xl:col-span-4">
            {/* Assignment Card */}
            {assignments && assignments.map((assignment, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4 mb-2 sm:mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h3 className="font-semibold text-base sm:text-lg mb-2">{assignment.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-2">{assignment.dueDate}</p>
                <div className="pl-2 border-l-4 border-blue-500">
                  <p className="font-medium text-sm sm:text-base">{assignment.topic}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{assignment.description}</p>
                </div>
              </motion.div>
            ))}

            {/* My Courses Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-100 mb-2"
            >
              <h2 className="text-sm font-bold mb-4 px-3 sm:px-4 pt-3 pb-2 border-b border-grey">My Courses</h2>

              <div className="grid grid-cols-1 gap-3 p-3 max-h-[350px] sm:max-h-[150px] overflow-y-auto">
                {courses && courses.map((course, index) => (
                  <div
                    key={index}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`bg-white rounded-xl shadow p-3 sm:p-4 transform transition duration-300 ${hoveredIndex === index ? "scale-[1.02] shadow-md" : ""
                      }`}
                  >
                    <h3 className="font-semibold text-sm sm:text-base">{course.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-2">Up First: {course.topic}</p>
                    {course.total && (
                      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                        <div
                          className="bg-blue-600 h-2 sm:h-2.5 rounded-full"
                          style={{ width: `${(course.progress / course.total) * 100}%` }}
                        ></div>
                      </div>
                    )}
                    {course.total && (
                      <p className="text-xs text-gray-500 mt-1">
                        {course.progress} / {course.total} exercises complete
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Chat List Card */}
            <div className="lg:col-span-2 xl:col-span-2">
              <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                {/* Header */}
                <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-green-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                    Perbincangan PTRS
                  </h2>
                </div>

                {/* Chat List */}
                <div className="divide-y divide-gray-100">
                  {chatData.map((chat, index) => (
                    <div
                      key={chat.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                      onClick={() => handleChatClick(chat.id)}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Avatar */}
                        <div className="relative">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm ${chat.avatarColor}`}
                          >
                            {chat.avatar}
                          </div>
                          {/* Online Status */}
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${chat.status === 'online' ? 'bg-green-400' :
                            chat.status === 'away' ? 'bg-yellow-400' : 'bg-gray-300'
                            }`}></div>
                        </div>

                        {/* Chat Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800 truncate">{chat.name}</h3>
                            <span className="text-xs text-gray-500">{chat.lastMessageTime}</span>
                          </div>
                          <p className="text-sm text-gray-600 truncate mt-1">{chat.lastMessage}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${chat.subjectBadge.color}`}>
                              {chat.subjectBadge.text}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${chat.statusBadge.color}`}>
                              {chat.statusBadge.text}
                            </span>
                            {chat.unreadCount > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {chat.unreadCount} new
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Column 3 - Leaderboard - Table Version */}
          <div className="lg:col-span-3 xl:col-span-4 relative">
            <div className='relative mb-2'>
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-top bg-no-repeat z-0 rounded-lg"
                style={{ backgroundImage: 'url(/images/bg_leaderboard.jpg)' }}
              />
              <div className="relative z-10">
                <motion.div
                  className="rounded-none shadow-sm overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  {/* Header */}
                  <div className="px-2 sm:px-3 pt-3 sm:pt-4">
                    <div className="flex flex-col items-center justify-center space-y-1 sm:space-y-2">
                      <img
                        src="/images/child_celeb.png"
                        alt="Leaderboard"
                        className="h-32 sm:h-40 md:h-48 w-auto object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 bg-gray-100 rounded-t-xl border-b-2 py-2 sm:py-3 flex items-center justify-center">
                      Leaderboard
                    </h2>
                  </div>

                  {/* Leaderboard Table */}
                  <div className="px-2 sm:px-3 pb-2 sm:pb-3 rounded-xl">
                    {processedLeaderboardData.length > 0 ? (
                      <div className="space-y-1 sm:space-y-2">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 bg-gray-100 rounded-b-xl text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                          <div className="col-span-1 text-center text-xs">Rank</div>
                          <div className="col-span-4 text-xs lg:ms-2">Name</div>
                          <div className="col-span-5 text-xs">School</div>
                          <div className="col-span-2 text-right text-xs">Time</div>
                        </div>

                        {/* Table Rows */}
                        <div className="space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200 max-h-[400px] sm:max-h-[350px] md:max-h-[500px] xl:max-h-[600px]">
                          {processedLeaderboardData.map((user) => (
                            <div
                              key={user.rank}
                              className={`grid grid-cols-12 gap-1 sm:gap-2 items-center p-2 sm:p-3 rounded-lg ${user.isCurrentUser ? "bg-blue-50 border border-blue-100" : "bg-gray-50"
                                }`}
                            >
                              {/* Rank */}
                              <div className="col-span-1 flex justify-center">
                                <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium relative ${user.rank === 1 ? "bg-yellow-500 shadow-lg" :
                                  user.rank === 2 ? "bg-gray-400 shadow-md" :
                                    user.rank === 3 ? "bg-orange-500 shadow-md" : "bg-gray-600"
                                  }`}>
                                  {user.rank <= 3 ? (
                                    <span className="text-xs font-bold">
                                      {user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : "🥉"}
                                    </span>
                                  ) : (
                                    user.rank
                                  )}
                                </div>
                              </div>

                              {/* Name - Single line */}
                              <div className="col-span-4 min-w-0">
                                <div className="flex items-center">
                                  <p className={`text-xs font-bold truncate ${user.isCurrentUser ? "text-blue-700" : "text-gray-800"}`}>
                                    {user.name}
                                  </p>
                                </div>
                              </div>

                              {/* School - Multi-line (2 lines) */}
                              <div className="col-span-5 min-w-0">
                                <p className="text-xs text-gray-600 font-bold overflow-hidden"
                                  style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                  }}>
                                  {user.school}
                                </p>
                              </div>

                              {/* Time and Points */}
                              <div className="col-span-2 text-right">
                                <p className="text-xs font-semibold text-gray-500">
                                  {formatTime(user.time)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8">
                        <p className="text-gray-500 text-sm sm:text-base">No quiz data available yet</p>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">Take a quiz to appear on the leaderboard!</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t-4 border-gray-100 bg-transparent opacity-90 rounded-b-md">
                    <button className="w-full text-center py-1.5 text-gray-50 hover:text-purple-700 text-sm font-medium transition duration-200">
                      View All Leaderboard
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Teacher/PTS List Box - Interactive */}
            <div className="lg:col-span-2 xl:col-span-2">
              <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                {/* Header */}
                <div className="p-3 border-b border-gray-100">
                  <h2 className="text-base font-semibold text-gray-800">Cikgu PTRS</h2>
                </div>

                {/* Filter Section */}
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex flex-wrap gap-1.5">
                    {filterButtons.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => handleFilterChange(filter.id)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${activeFilter === filter.id
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Teacher List */}
                <div className="max-h-72 overflow-y-auto">
                  <div className="divide-y divide-gray-100">
                    {filteredTeachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleTeacherClick(teacher.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm ${teacher.avatarColor} shadow-sm`}>
                            {teacher.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-gray-800 truncate">{teacher.name}</h3>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${teacher.status === 'online'
                                ? 'text-green-600 bg-green-50'
                                : 'text-gray-500 bg-gray-100'
                                }`}>
                                {teacher.status === 'online' ? 'Online' : 'Offline'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5">{teacher.subject}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500 truncate">{teacher.school}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">{teacher.experience}y exp</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-gray-100 bg-gray-50">
                  <button className="w-full text-center py-1.5 text-blue-600 hover:text-blue-700 text-xs font-medium transition duration-200">
                    View All Teachers →
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>

  );
}