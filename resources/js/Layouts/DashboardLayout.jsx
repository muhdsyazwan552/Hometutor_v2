import ApplicationLogo from '@/Components/ApplicationLogo';
import ApplicationLogoImg from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import ProfileDropdown from '@/Components/ProfileDropdown';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function DashboardLayout({ header, children }) {
    const { t, locale, translations } = useLanguage();
    const user = usePage().props.auth.user;
    const schoolSubjects = usePage().props.schoolSubjects || [];

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isAppMenuOpen, setIsAppMenuOpen] = useState(false); // New state for app menu

    const toggleDropdown = () => setIsOpen(!isOpen);
    const closeDropdown = () => setIsOpen(false);
    const toggleAppMenu = () => setIsAppMenuOpen(!isAppMenuOpen); // Toggle app menu
    const closeAppMenu = () => setIsAppMenuOpen(false); // Close app menu

    // Function to generate subject URL
    const getSubjectUrl = (subject) => {
        const subjectSlug = subject.abbr || subject.name.toLowerCase().replace(/\s+/g, '-');
        const levelId = subject.level_id || 10;
        const form = levelId === 10 ? 'Form 4' : 'Form 5';

        return `/subject/${subjectSlug}?subject_id=${subject.id}&level_id=${levelId}&form=${encodeURIComponent(form)}`;
    };

    // App menu items - you can customize these
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

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-lg px-4 sm:px-8 lg:px-24">
                <div className="mx-0 max-w-full px-0 sm:px-3 lg:px-3">
                    <div className="flex h-16 sm:h-20 items-center justify-between relative">
                        {/* Left Side - Courses Nav */}
                        <div className="relative z-40">
                            {/* Courses Button with animated icon */}
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
                                <span className="hidden sm:inline">{t('courses', 'Courses')}</span>

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
                                                {t('school subjects', 'School Subjects ')}
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
                                                        </Link>
                                                    </li>
                                                ))}
                                                {schoolSubjects.length === 0 && (
                                                    <li className="text-gray-500">No Form 4 subjects available</li>
                                                )}
                                            </ul>
                                        </div>

                                        {/* VideoTube */}
                                        {/* <div>
                                            <h4 className="mb-2 border-b pb-1 text-sm font-semibold text-gray-700">
                                                VideoTube
                                            </h4>
                                            <ul className="space-y-1 text-sm text-red-500">
                                                <li><Link href="#" className="hover:underline block py-1" onClick={closeDropdown}>General Learning</Link></li>
                                            </ul>
                                        </div> */}

                                        {/* Games */}
                                        {/* <div>
                                            <h4 className="mb-2 border-b pb-1 text-sm font-semibold text-gray-700">
                                                {t('games', 'Games')}
                                            </h4>
                                            <ul className="space-y-1 text-sm text-gray-600">
                                                <li><Link href="/tekakata-page" className="hover:underline block py-1" onClick={closeDropdown}>Teka Kata</Link></li>
                                                <li><Link href="/quiz-page" className="hover:underline block py-1" onClick={closeDropdown}>Quiz Arena</Link></li>
                                            </ul>
                                        </div> */}
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

                        {/* Right Side - Icons Menu, Language Switcher & User Dropdown */}
                        <div className="flex items-center space-x-4">
                            {/* 4 Box Icon Menu Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={toggleAppMenu}
                                    className="p-1 rounded-md border-2 border-gray-500 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
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

                            {/* Language Switcher */}
                            <div className="hidden sm:block">
                                <LanguageSwitcher type="buttons" />
                            </div>

                            {/* Mobile Language Switcher (Simplified) */}
                            <div className="sm:hidden">
                                <LanguageSwitcher type="dropdown" className="text-sm" />
                            </div>

                            {/* User Dropdown */}
                            <div className="relative">
                                <ProfileDropdown user={user} student={user?.student} />
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

            {/* Backdrop for closing dropdowns when clicking outside */}
            {(isOpen || isAppMenuOpen) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        closeDropdown();
                        closeAppMenu();
                    }}
                />
            )}
        </div>
    );
}