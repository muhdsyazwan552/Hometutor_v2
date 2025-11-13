// SubjectNavbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import ProfileDropdown from '@/Components/ProfileDropdown';
import MobileProfileDropdown from '@/Components/MobileProfileDropdown';
import SubjectMenuDropdown from '@/Components/SubjectMenuDropdown';
import { Link } from '@inertiajs/react';

export default function SubjectNavbar({ title }) {
  const { auth } = usePage().props;
  const user = auth?.user;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

    // Debug: Check what title we're receiving
  console.log('SubjectNavbar received title:', title);
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
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm px-4 sm:px-6">
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
              <ApplicationLogo className="block h-12 sm:h-16 w-auto fill-current text-gray-800" />
            </Link>
          </div>

          {/* Right Side - Profile Dropdown */}
          <div className="hidden sm:flex sm:items-center">
            <div className="relative ms-3">
              <ProfileDropdown user={user} />
            </div>
          </div>

          {/* Mobile - Profile Dropdown */}
          <div className="flex sm:hidden items-center">
            <div className="relative">
              <ProfileDropdown user={user} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}