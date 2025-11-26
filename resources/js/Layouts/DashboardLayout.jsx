import ApplicationLogo from '@/Components/ApplicationLogo';
import ApplicationLogoImg from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import ProfileDropdown from '@/Components/ProfileDropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function DashboardLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const schoolSubjects = usePage().props.schoolSubjects || [];

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => setIsOpen(!isOpen);
    const closeDropdown = () => setIsOpen(false);

    // Debug: Check what data we're receiving
    // console.log('School Subjects:', schoolSubjects);

   

    // Function to generate subject URL
    // STANDARDIZED VERSION - guna dalam kedua-dua files
    const getSubjectUrl = (subject) => {
        // PASTIKAN GUNA subject.abbr untuk consistency
        const subjectSlug = subject.abbr || subject.name.toLowerCase().replace(/\s+/g, '-');
        const levelId = subject.level_id || 10;
        const form = levelId === 10 ? 'Form 4' : 'Form 5';

        // Standard encoding
        return `/subject/${subjectSlug}?subject_id=${subject.id}&level_id=${levelId}&form=${encodeURIComponent(form)}`;
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-lg px-4 sm:px-8 lg:px-24">
                <div className="mx-0 max-w-full px-0 sm:px-3 lg:px-3">
                    <div className="flex h-16 sm:h-20 items-center justify-between relative">
                        {/* Left Side - Courses Nav */}
                        <div className="relative z-40">
                            {/* Courses Button with animated icon - Always visible */}
                            <button
                                onClick={toggleDropdown}
                                className="flex items-center text-sm font-semibold text-gray-700 hover:text-gray-900 focus:outline-none"
                            >
                                {/* Hamburger icon for mobile */}
                                <svg
                                    className="h-5 w-5 sm:hidden"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>

                                {/* Courses text for tablet and desktop */}
                                <span className="hidden sm:inline">Courses</span>

                                {/* Chevron icon for tablet and desktop */}
                                <svg
                                    className={`hidden sm:block ml-1 h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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

                            {/* Courses Dropdown with animation */}
                            <div
                                className={`fixed left-0 top-16 sm:top-20 w-screen h-auto bg-white px-4 sm:px-6 py-2 shadow-lg transition-all duration-300 ease-in-out z-50 ${isOpen
                                        ? "opacity-100 translate-y-0"
                                        : "opacity-0 -translate-y-2 pointer-events-none"
                                    }`}
                            >
                                <div className="px-2 sm:px-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                        {/* School Subjects */}
                                        <div>
                                            <h4 className="mb-2 border-b pb-1 text-sm font-semibold text-gray-700">
                                                School Subjects
                                            </h4>
                                            <ul className="space-y-1 text-sm text-sky-600">
                                                {schoolSubjects.map((subject) => (
                                                    <li key={subject.id}>
                                                        <Link
                                                            href={getSubjectUrl(subject)}
                                                            className="hover:underline block py-1"
                                                            onClick={closeDropdown}
                                                        >
                                                            {subject.name}
                                                            {/* Debug: Show IDs */}
                                                            {/* <span className="text-xs text-gray-500 ml-2">
                                                                (ID: {subject.id}, Level: {subject.level_id})
                                                            </span> */}
                                                        </Link>
                                                    </li>
                                                ))}
                                                {schoolSubjects.length === 0 && (
                                                    <li className="text-gray-500">No Form 4 subjects available</li>
                                                )}
                                            </ul>
                                        </div>

                                        {/* VideoTube */}
                                        <div>
                                            <h4 className="mb-2 border-b pb-1 text-sm font-semibold text-gray-700">
                                                VideoTube
                                            </h4>
                                            <ul className="space-y-1 text-sm text-red-500">
                                                <li><Link href="#" className="hover:underline block py-1" onClick={closeDropdown}>General Learning</Link></li>
                                            </ul>
                                        </div>

                                        {/* Games */}
                                        <div>
                                            <h4 className="mb-2 border-b pb-1 text-sm font-semibold text-gray-700">
                                                Games
                                            </h4>
                                            <ul className="space-y-1 text-sm text-gray-600">
                                                <li><Link href="/tekakata-page" className="hover:underline block py-1" onClick={closeDropdown}>Teka Kata</Link></li>
                                                <li><Link href="/quiz-page" className="hover:underline block py-1" onClick={closeDropdown}>Quiz Arena</Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Center - Logo */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
                            <Link href="/dashboard">
                                <ApplicationLogoImg className="block h-12 sm:h-16 w-auto fill-current text-gray-800" />
                            </Link>
                        </div>

                        {/* Right Side - User Dropdown (Desktop) */}
                        <div className="hidden sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <ProfileDropdown user={user} />
                            </div>
                        </div>

                        {/* Mobile - Profile Icon */}
                        <div className="flex sm:hidden items-center space-x-3">
                            <div className="relative">
                                <ProfileDropdown user={user} />
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Optional Header */}
            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}