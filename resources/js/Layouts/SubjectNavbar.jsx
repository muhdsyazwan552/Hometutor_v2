// SubjectNavbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import ProfileDropdown from '@/Components/ProfileDropdown';
import SubjectMenuDropdown from '@/Components/SubjectMenuDropdown';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { Link } from '@inertiajs/react';

export default function SubjectNavbar({ title }) {
  const { auth } = usePage().props;
  const user = auth?.user;
  const menuRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);

  const toggleAppMenu = () => setIsAppMenuOpen(!isAppMenuOpen); // Toggle app menu
  const closeAppMenu = () => setIsAppMenuOpen(false); // Close app menu

  const appMenuItems = [
    {
      name: 'Quiz Arena',
      href: '/quiz-page',
      icon: '/images/logo_award.png', // Path to your image
      alt: 'Quiz Arena Icon'
    },
    {
      name: 'ePTRS',
      href: 'https://eptrs.my',
      icon: '/images/logo_PTRS.png', // Path to your image
      alt: 'ePTRS Icon',
      external: true
    },

  ];


  // Debug: Check what title we're receiving
  // console.log('SubjectNavbar received title:', title);
  // console.log('Page props:', usePage().props);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav
      className={
        `sticky top-0 z-40 border-b border-gray-200  shadow-sm px-4 sm:px-6
    ${isMenuOpen
          ? 'bg-white text-black'                      // when dropdown open → hide gradient
          : 'bg-[#8F3091] text-white' // when closed → show gradient
        }`
      }
    >
      <div className="mx-auto px-0 sm:px-3 lg:px-3">
        <div className="flex h-16 sm:h-20 items-center justify-between relative">

          {/* Left Side - Subject Menu Dropdown */}
          <div className="flex items-center" ref={menuRef}>
            <SubjectMenuDropdown
              isOpen={isMenuOpen}
              setIsOpen={setIsMenuOpen}
              title={title}
            />
          </div>

          {/* Center - Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
            <Link href="/dashboard">
              <ApplicationLogo className="block h-12 sm:h-16 w-auto fill-current " />
            </Link>
          </div>



          {/* Right Side - Profile Dropdown */}
          <div className="hidden sm:flex sm:items-center items-center space-x-4">
            <div className="relative">
              <button
                onClick={toggleAppMenu}
                className="p-1 rounded-md text-gray-100 border  hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                aria-label="App Menu"
              >
                {/* 4 Box Icon (Grid Icon) */}
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>

              {/* App Menu Dropdown */}
              {isAppMenuOpen && (
                <div className="absolute right-0 mt-2 w-max bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4">
                    <h3 className="text-xs font-semibold text-gray-500 mb-3">Quick Access :</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {appMenuItems.map((item, index) => {
                        // Check if link is external
                        const isExternalLink = item.href.startsWith('http');

                        const handleClick = (e) => {
                          closeAppMenu();

                          if (isExternalLink) {
                            e.preventDefault();
                            // Open external links in new tab
                            window.open(item.href, '_blank', 'noopener,noreferrer');
                          }
                          // Internal links will navigate normally via Inertia
                        };

                        return (
                          <Link
                            key={index}
                            href={item.href}
                            onClick={handleClick}
                            {...(isExternalLink && {
                              as: 'button', // Treat as button for external links
                              type: 'button'
                            })}
                            className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                          >
                            <div className="w-16 h-16 mb-2 flex items-center justify-center rounded-md bg-gray-100 group-hover:bg-gray-200 transition-colors duration-200">
                              <img
                                src={item.icon}
                                alt={item.alt}
                                className="w-16 h-16 object-contain rounded-xl"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = `<span class="text-lg">${item.name.charAt(0)}</span>`;
                                }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-gray-700 text-center leading-tight">
                              {item.name}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                    {/* <div className="mt-4 pt-4 border-t border-gray-100">
                                                <Link
                                                    href="/all-apps"
                                                    onClick={closeAppMenu}
                                                    className="block w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 py-2 rounded-md transition-colors duration-200"
                                                >
                                                    View All Applications
                                                </Link>
                                            </div> */}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:block">
              <LanguageSwitcher type="buttons" />
            </div>

            {/* Mobile Language Switcher (Simplified) */}
            <div className="sm:hidden">
              <LanguageSwitcher type="dropdown" className="text-sm" />
            </div>
            <div className="relative ms-3">
              <ProfileDropdown user={user} student={user?.student} />
            </div>
          </div>

          {/* Mobile - Profile Dropdown */}
          <div className="flex sm:hidden items-center">
            <div className="relative">
              <ProfileDropdown user={user} student={user?.student} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}