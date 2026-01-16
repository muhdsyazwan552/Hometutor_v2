import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function QuestionNavbar({ title, visible = true }) {
  const { auth } = usePage().props;
  const user = auth?.user;
  const [isOpen, setIsOpen] = useState(false);
  const [showingNav, setShowingNav] = useState(false);

  return (
    <nav className={`sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 justify-between items-center">

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex h-20 items-center justify-between relative"
            >
              School Subject (Question) - {title}
              <svg
                className={`ml-1 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <div className={`fixed left-0 top-20 w-screen h-auto bg-white px-6 py-2 shadow-lg transition-all duration-300 ease-in-out z-50 ${isOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2 pointer-events-none"
              }`}>
              <div className="px-6 py-2 grid grid-cols-3 gap-4">
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700 border-b">Subjects</h4>
                  <ul className="text-sm text-sky-600 space-y-1">
                    <li><Link href="/subject/bahasa-melayu">Bahasa Melayu</Link></li>
                    <li><Link href="/subject/bahasa-inggeris">Bahasa Inggeris</Link></li>
                    <li><Link href="/subject/matematik">Matematik</Link></li>
                    <li><Link href="/subject/sains">Sains</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 border-b pb-1 text-sm font-semibold text-gray-700">
                    VideoTube
                  </h4>
                  <ul className="space-y-1 text-sm text-red-500">
                    <li><Link href="#" className="hover:underline">General Learning</Link></li>
                  </ul>
                </div>
                {/* <div>
                  <h4 className="mb-2 border-b pb-1 text-sm font-semibold text-gray-700">
                    Games
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li><Link href="/tekakata-page" className="hover:underline">Teka Kata</Link></li>
                  </ul>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li><Link href="/quiz-page" className="hover:underline">Quiz</Link></li>
                  </ul>
                </div> */}
              </div>
            </div>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
            <Link href="/dashboard">
              <ApplicationLogo className="block h-16 w-auto fill-current text-gray-800" />
            </Link>
          </div>

          <div className="hidden sm:flex sm:items-center">
            <div className="relative ms-3">
              <Dropdown>
                <Dropdown.Trigger>
                  <span className="inline-flex rounded-full">
                    <button
                      type="button"
                      className="inline-flex items-center space-x-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {user.avatar ? (
                        <img
                          className="h-8 w-8 rounded-full"
                          src={user.avatar}
                          alt={user.name}
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                          <span className="text-sm font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <svg
                        className="h-4 w-4 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                </Dropdown.Trigger>
                <Dropdown.Content>
                  <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                  <Dropdown.Link href={route('logout')} method="post" as="button">
                    Log 
                  </Dropdown.Link>
                </Dropdown.Content>
              </Dropdown>
            </div>
          </div>

          <div className="-me-2 flex sm:hidden">
            <button
              onClick={() => setShowingNav(prev => !prev)}
              className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path
                  className={!showingNav ? 'inline-flex' : 'hidden'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
                <path
                  className={showingNav ? 'inline-flex' : 'hidden'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={(showingNav ? 'block' : 'hidden') + ' sm:hidden px-4 py-2'}>
        <Link href="/subject/bahasa-melayu" className="block py-1 text-sm text-sky-600">Bahasa Melayu</Link>
        <Link href="/subject/matematik" className="block py-1 text-sm text-sky-600">Matematik</Link>
        <Link href="/profile" className="block py-1 text-sm text-gray-700">Profile</Link>
      </div>
    </nav>
  );
}