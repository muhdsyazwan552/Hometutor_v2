// resources/js/Components/ProfileDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useForm } from '@inertiajs/react';
import avatars from '@/Data/avatars';

export default function ProfileDropdown({ user, student }) {
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [browseMode, setBrowseMode] = useState(false);
  const dropdownRef = useRef(null);

  // Debug logging - updated to use the student prop
  // useEffect(() => {
  //   console.log('ProfileDropdown debug:');
  //   console.log('User data:', user);
  //   console.log('Student prop:', student);
  //   console.log('User.student relationship:', user?.student);
  //   console.log('Profile picture path:', student?.profile_picture || user?.student?.profile_picture);
  //   console.log('Full URL would be:', `/storage/${student?.profile_picture || user?.student?.profile_picture}`);
  // }, [user, student]);

  // Use student prop if available, otherwise use user.student
  const studentData = student || user?.student;

  const { data, setData, post, processing, progress, errors, reset } = useForm({
    profile_picture: null,
    avatar_filename: null,
  });

  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('profile_picture', file);
      setData('avatar_filename', null);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('profile.picture.update'), {
      onSuccess: () => {
        setModalOpen(false);
        reset();
        setPreview(null);
        setBrowseMode(false);
        setOpen(false);
      },
      preserveScroll: true,
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center text-gray-500 justify-center w-9 h-9 rounded-full bg-gray-200 hover:ring-2 hover:ring-black hover:text-black  transition focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5 overflow-hidden z-50">
          {/* Email Header */}
          <div className="bg-gray-900 text-center px-4 py-4">
            <p className="text-sm text-gray-300">{user?.email}</p>
          </div>

          {/* Profile Section */}
          <div className="relative flex flex-col items-center px-6 py-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white text-2xl font-semibold shadow-md overflow-hidden">
                {studentData?.profile_picture ? (
                  <img
                    src={`/storage/${studentData.profile_picture}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Failed to load profile picture:', studentData.profile_picture);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() ?? 'U'
                )}
              </div>

              {/* Camera Button */}
              <button
                type="button"
                onClick={() => {
                  setModalOpen(true);
                  setOpen(false);
                }}
                className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow hover:bg-gray-100 transition"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 7h3l2-3h8l2 3h3v11H3V7z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </button>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-800">
              Hi, {user?.name ?? 'User'}!
            </h2>

            <Link
              href={route('profile.edit')}
              onClick={() => setOpen(false)}
              className="mt-3 px-6 py-2 text-sm text-black font-medium rounded-full border border-gray-300 hover:bg-gray-100 transition"
            >
              Manage your account
            </Link>

          </div>

          {/* Action Buttons */}
          <div className="px-4 space-y-2 py-2 border-t border-gray-200">
            <Link
              href={route('profile.edit')}
              onClick={() => setOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded bg-gray-300 hover:bg-gray-400 transition"
            >
              <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.38.138.751.43.992l1.003.827a1.125 1.125 0 0 1 .26 1.431l-1.297 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.127c-.331.184-.582.495-.644.87l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.643-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.431l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.127.332-.184.582-.495.645-.87l.213-1.281Z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Settings</span>
            </Link>

            <Link
              href={route('logout')}
              method="post"
              as="button"
              onClick={() => setOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded bg-red-300 hover:bg-red-400 transition"
            >
              <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              <span className="text-sm font-medium text-red-700">Sign out</span>
            </Link>
          </div>
        </div>
      )}

      {/* Change Profile Picture Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-80 px-4 pb-8 pt-20 sm:items-center">
          <div className="w-full max-w-md rounded-t-3xl bg-gray-900 sm:rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  reset();
                  setPreview(null);
                  setBrowseMode(false);
                }}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-lg font-semibold text-white">Change profile picture</h3>
              <div className="w-8" />
            </div>

            {/* Preview */}
            <div className="flex justify-center my-8">
              <div className="relative">
                <div className="w-48 h-48 rounded-full overflow-hidden ring-4 ring-gray-800">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : studentData?.profile_picture ? (
                    <img
                      src={`/storage/${studentData.profile_picture}`}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Failed to load profile picture in modal:', studentData.profile_picture);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white text-6xl font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </div>
                  )}
                </div>
                {preview && (
                  <div className="absolute bottom-2 right-2 bg-gray-800 rounded-full p-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-8">
              <input type="file" id="profile-upload-input" accept="image/*" onChange={handleFileChange} className="hidden" />

              {!browseMode ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setBrowseMode(true)}
                      className="flex flex-col items-center py-5 bg-gray-800 rounded-2xl hover:bg-gray-700 transition"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-3">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-300">Choose Avatar</span>
                    </button>

                    <label
                      htmlFor="profile-upload-input"
                      className="flex flex-col items-center py-5 bg-gray-800 rounded-2xl hover:bg-gray-700 transition cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-3">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-300">Upload Photo</span>
                    </label>
                  </div>

                  {/* Save button for Upload Photo */}
                  {(data.profile_picture || data.avatar_filename) && (
                    <div className="mt-6">
                      {(errors.profile_picture || errors.avatar_filename) && (
                        <p className="text-red-400 text-sm text-center mb-4">
                          {errors.profile_picture || errors.avatar_filename}
                        </p>
                      )}
                      {progress && (
                        <div className="mb-4 text-center">
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress.percentage}%` }} />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{progress.percentage}%</p>
                        </div>
                      )}
                      <button
                        onClick={handleSubmit}
                        disabled={processing}
                        className="w-full py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 disabled:opacity-50 transition"
                      >
                        {processing ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setBrowseMode(false)}
                    className="mb-4 text-sm text-gray-400 hover:text-white flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>

                  {/* Avatars Grid */}
                  <div className="grid grid-cols-4 gap-4 max-h-96 overflow-y-auto pb-4">
                    {avatars.map((filename, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          const url = `/avatars/${filename}`;
                          setPreview(url);
                          setData('avatar_filename', filename);
                          setData('profile_picture', null);
                        }}
                        className="aspect-square rounded-xl overflow-hidden ring-2 ring-transparent hover:ring-blue-500 transition shadow-lg"
                      >
                        <img
                          src={`/avatars/${filename}`}
                          alt={`Avatar ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>

                  {/* Save button for Choose Avatar */}
                  {data.avatar_filename && (
                    <div className="mt-6">
                      {errors.avatar_filename && (
                        <p className="text-red-400 text-sm text-center mb-4">{errors.avatar_filename}</p>
                      )}
                      <button
                        onClick={handleSubmit}
                        disabled={processing}
                        className="w-full py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 disabled:opacity-50 transition"
                      >
                        {processing ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}