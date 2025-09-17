import DashboardLayout from '@/Layouts/DashboardLayout';
import React, { useState, useEffect } from 'react';
import AlertMessage from '@/Components/AlertMessage';
import { Head, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "En Haical",
      period: "Dinamik (1st period)",
      avatar: "/path/to/avatar1.jpg",
      teacher: "Teccher",
      date: "January 01, 1970",
      likes: 5,
      comments: 3
    },
    {
      id: 2,
      author: "En Haical",
      period: "Dinamik (1st period)",
      avatar: "/path/to/avatar1.jpg",
      teacher: "Teccher",
      date: "January 01, 1970",
      likes: 2,
      comments: 1
    }
  ]);
  const [newPostContent, setNewPostContent] = useState("");
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

      <div className=" max-w-full py-6 sm:px-6 lg:px-20 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-4 sm:gap-6">

          {/* Left Column - Profile Card */}

          <div className="sm:col-span-2 md:col-span-2 lg:col-span-3 xl:col-span-3">
  <motion.div
    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    {/* Header */}
    <div className="px-5 pt-5 pb-3">
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
    <div className="px-5 pb-5">
      <div className="flex flex-col items-center text-center mb-5">
        {/* Avatar */}
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-xl border-4 border-white shadow-lg">
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
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
        </div>

        {/* Name & Email */}
        <div>
          <h3 className="font-semibold text-gray-800">{user.name}</h3>
          <p className="text-gray-500 text-sm mt-1">{user.email}</p>
        </div>
      </div>

      {/* Profile Details */}
      <div className="space-y-4">
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
            <span className="text-sm text-gray-600">School</span>
          </div>
          <span className="text-sm font-medium text-gray-800">{profileData.school}</span>
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
            <span className="text-sm text-gray-600">Grade</span>
          </div>
          <span className="text-sm font-medium text-gray-800">{profileData.grade}</span>
        </div>
        
        {/* <div className="pt-2">
          <div className="flex items-center mb-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-2 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm text-gray-600">Bio</span>
          </div>
          <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-lg">{profileData.bio}</p>
        </div> */}
      </div>
    </div>

    {/* Edit Button */}
    {/* <div className="px-5 pb-5">
      <button className="w-full bg-gray-50 text-gray-700 hover:bg-gray-100 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 mr-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit Profile
      </button>
    </div> */}
  </motion.div>
</div>


        

          {/* Middle Column - Posting Section */}
          <div className="sm:col-span-4 md:col-span-4 lg:col-span-4 xl:col-span-6">
            {/* Compose Post Section */}
            <motion.div
              className="bg-white rounded-xl shadow p-4 mb-6 sm:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {showNewPostForm ? (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Compose Post</h2>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What's on your mind?"
                    rows="3"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />
                  <div className="flex justify-between mt-3">
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => setShowNewPostForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                      onClick={handlePostSubmit}
                      disabled={!newPostContent.trim()}
                    >
                      Post
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="cursor-pointer text-gray-500 p-3 border border-dashed border-gray-300 rounded-md hover:border-gray-400"
                  onClick={() => setShowNewPostForm(true)}
                >
                  What's on your mind?
                </div>
              )}
            </motion.div>

            {/* Posts Section */}
            <div className="space-y-4 sm:space-y-6">
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  className="bg-white rounded-xl shadow p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >

                  <div className="mb-3">
                    <div className="flex items-center space-x-3">
                      {/* Avatar Icon */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {post.author.split(" ").map(name => name[0]).join("").toUpperCase()}
                      </div>
                      <div>
                        <div className='flex items-center justify-center'>
                          <h3 className="font-semibold">{post.author}</h3>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 ml-1 text-gray-400"
                            viewBox="0 0 256 512"
                            fill="currentColor"
                          >
                            <path d="M118.6 105.4l128 127.1C252.9 239.6 256 247.8 256 255.1s-3.125 16.38-9.375 22.63l-128 127.1c-9.156 9.156-22.91 11.9-34.88 6.943S64 396.9 64 383.1V128c0-12.94 7.781-24.62 19.75-29.58S109.5 96.23 118.6 105.4z" />
                          </svg>
                          <p className="text-sm text-gray-500">{post.period}</p>
                        </div>
                        <p className="text-xs text-gray-400">
                          <span className="font-semibold text-gray-600">👨‍🏫 {post.teacher}</span> - {post.date}
                        </p>
                      </div>
                    </div>
                  </div>
                  {post.content && <p className="mt-2 mb-4">{post.content}</p>}

                  {/* Like count and comments count */}
                  {(post.likes > 0 || post.comments > 0) && (
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      {post.likes > 0 && (
                        <div className="flex items-center mr-3">
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs mr-1">
                            👍
                          </div>
                          <span>{post.likes}</span>
                        </div>
                      )}
                      {post.comments > 0 && (
                        <span>{post.comments} comments</span>
                      )}
                    </div>
                  )}

                  {/* Like and Comment Actions */}
                  <div className="flex items-center justify-between space-x-4 mt-3 pt-3 border-t border-gray-100">
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      <span className="text-sm">Like</span>
                    </button>

                    <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-sm">Comment</span>
                    </button>

                    <button className="flex items-center space-x-1 text-gray-500 hover:text-purple-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      <span className="text-sm">Share</span>
                    </button>
                  </div>

                  {/* Comment Input */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
                        {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm cursor-text hover:bg-gray-200 transition-colors">
                        Write a comment...
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column - Assignments and Courses */}
          <div className="sm:col-span-2 md:col-span-2 lg:col-span-3 xl:col-span-3">
            {/* What's Due Card */}
            <motion.div
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4 sm:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h2 className="text-xl font-bold mb-4">What's Due</h2>
              <p className="text-gray-600">No assignment due!</p>
              <p className="text-green-600 mt-2">Nice! You're all set for the next 7 days.</p>
            </motion.div>

            {/* Assignment Card */}
            {assignments.map((assignment, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4 sm:mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h3 className="font-semibold text-lg mb-2">{assignment.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{assignment.dueDate}</p>
                <div className="pl-2 border-l-4 border-blue-500">
                  <p className="font-medium">{assignment.topic}</p>
                  <p className="text-sm text-gray-600">{assignment.description}</p>
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
              <h2 className="text-sm font-bold mb-4 px-4 pt-3 pb-2 border-b border-grey">My Courses</h2>

              <div className="grid grid-cols-1 gap-3 p-3 max-h-[400px] overflow-y-auto">
                {courses.map((course, index) => (
                  <div
                    key={index}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`bg-white rounded-xl shadow p-4 transform transition duration-300 ${hoveredIndex === index ? "scale-[1.02] shadow-md" : ""
                      }`}
                  >
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">Up First: {course.topic}</p>
                    {course.total && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
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