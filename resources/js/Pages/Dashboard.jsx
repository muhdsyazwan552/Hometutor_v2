import DashboardLayout from '@/Layouts/DashboardLayout';
import React, { useState, useEffect } from 'react';
import AlertMessage from '@/Components/AlertMessage';
import { Head, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showNewPostForm, setShowNewPostForm] = useState(false);

  const user = usePage().props.auth.user;

  const profileData = {
    name: "Daniel Irnan",
    handle: "@danielirnan011",
    school: "Add your school",
    grade: "Form 5",
    bio: "Add your bio"
  };

  const courses = [
    {
      title: "Babana lingerie",
      topic: "Graphic Stimuli",
      progress: 0,
      total: 4
    },
    {
      title: "Metematik",
      topic: "Asas Nombor",
      progress: 0,
      total: 10
    },
    {
      title: "Metematik Tambaban",
      topic: "Fungsi Trigonometri",
      progress: 0,
      total: 10
    },
    {
      title: "Sans",
      topic: "Mikroorganisma Dan Kesannya Terhadap..."
    }
  ];

  const assignments = [
    {
      title: "New Assignment",
      dueDate: "Due Jun 26th, 11:59 PM",
      topic: "Nombor Dan Operasi",
      description: "Objective - Same question set"
    }
  ];

  const initials = profileData.name
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

  return (
    <DashboardLayout>
      <Head title="Dashboard" />

      <div className="max-w-full py-4 sm:py-6 px-4 sm:px-6 lg:px-20 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-10">
          
          {/* Left Column - Profile Card - Full width on mobile, then responsive */}
          <div className="lg:col-span-4 lg:col-start-2 xl:col-span-3 xl:col-start-3">
            <motion.div
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
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
                  Profile
                </h2>
              </div>

              {/* Profile Section */}
              <div className="px-4 sm:px-5 pb-4 sm:pb-5">
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
                    <h3 className="font-semibold text-gray-800 text-base sm:text-lg">{user.name}</h3>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1 break-all">{user.email}</p>
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
                      <span className="text-xs sm:text-sm text-gray-600">School</span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-800 truncate ml-2 max-w-[120px] sm:max-w-none">{profileData.school}</span>
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
                      <span className="text-xs sm:text-sm text-gray-600">Grade</span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-800">{profileData.grade}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Assignments and Courses - Full width on mobile, then responsive */}
          <div className="lg:col-span-5 xl:col-span-4">
            {/* What's Due Card */}
            <motion.div
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4 mb-4 sm:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">What's Due</h2>
              <p className="text-gray-600 text-sm sm:text-base">No assignment due!</p>
              <p className="text-green-600 mt-2 text-sm sm:text-base">Nice! You're all set for the next 7 days.</p>
            </motion.div>

            {/* Assignment Card */}
            {assignments.map((assignment, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4 mb-4 sm:mb-6"
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
              className="bg-white rounded-lg shadow-sm border border-gray-100"
            >
              <h2 className="text-sm font-bold mb-4 px-3 sm:px-4 pt-3 pb-2 border-b border-grey">My Courses</h2>

              <div className="grid grid-cols-1 gap-3 p-3 max-h-[350px] sm:max-h-[400px] overflow-y-auto">
                {courses.map((course, index) => (
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}