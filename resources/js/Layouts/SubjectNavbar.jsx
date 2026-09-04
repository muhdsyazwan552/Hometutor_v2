import ApplicationLogo from '@/Components/ApplicationLogo';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import ProfileDropdown from '@/Components/ProfileDropdown';
<<<<<<< HEAD
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
  AcademicCapIcon,
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  HomeIcon,
  Squares2X2Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function SubjectNavbar({ title }) {
  const { auth, schoolSubjects = [] } = usePage().props;
  const user = auth?.user;
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setSubjectsOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const subjectUrl = (subject) => {
    const slug = subject.abbr || subject.name.toLowerCase().replace(/\s+/g, '-');
    const subjectLevel = subject.level_id || 10;
    return `/subject/${slug}?subject_id=${subject.id}&level_id=${subjectLevel}&form=${encodeURIComponent(subjectLevel === 10 ? 'Form 4' : 'Form 5')}`;
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-7">
          <Link href={route('dashboard')} className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-slate-950 shadow-sm">
              <ApplicationLogo className="h-9 w-9 object-contain" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-none tracking-tight text-slate-900">PTRS Learning</p>
              <p className="mt-1 max-w-[150px] truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-500">{title || 'Course workspace'}</p>
            </div>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            <Link href={route('dashboard')} className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
              <HomeIcon className="h-4 w-4" /> Dashboard
            </Link>
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setSubjectsOpen(!subjectsOpen)} className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3.5 py-2 text-sm font-semibold text-indigo-700">
                <AcademicCapIcon className="h-4 w-4" /> Courses
                <ChevronDownIcon className={`h-3.5 w-3.5 transition ${subjectsOpen ? 'rotate-180' : ''}`} />
              </button>
              {subjectsOpen && (
                <div className="absolute left-0 top-full mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-200/70">
                  <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Switch subject</p>
                  <div className="max-h-80 overflow-y-auto">
                    {schoolSubjects.length ? schoolSubjects.map((subject) => (
                      <Link key={subject.id} href={subjectUrl(subject)} onClick={() => setSubjectsOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><AcademicCapIcon className="h-4 w-4" /></span>
                        <span className="truncate">{subject.name}</span>
                      </Link>
                    )) : <p className="px-3 py-5 text-sm text-slate-400">No other subjects available.</p>}
                  </div>
                </div>
              )}
            </div>
            <Link href={route('quiz-page')} className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
              <Squares2X2Icon className="h-4 w-4" /> Quiz arena
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block"><LanguageSwitcher type="buttons" /></div>
          <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100" aria-label="Notifications">
            <BellIcon className="h-5 w-5" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>
          <div className="h-6 w-px bg-slate-200" />
          <ProfileDropdown user={user} student={user?.student} />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="ml-1 flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Toggle navigation">
            {mobileOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 shadow-lg lg:hidden">
          <div className="mx-auto grid max-w-[1440px] gap-1">
            <Link href={route('dashboard')} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"><HomeIcon className="h-5 w-5" /> Dashboard</Link>
            <Link href={route('quiz-page')} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"><Squares2X2Icon className="h-5 w-5" /> Quiz arena</Link>
            <p className="mt-2 border-t border-slate-100 px-4 pb-1 pt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Switch subject</p>
            {schoolSubjects.slice(0, 6).map((subject) => <Link key={subject.id} href={subjectUrl(subject)} className="rounded-xl px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">{subject.name}</Link>)}
            <div className="mt-3 sm:hidden"><LanguageSwitcher type="dropdown" /></div>
          </div>
        </div>
      )}
    </nav>
  );
=======
import SubjectMenuDropdown from '@/Components/SubjectMenuDropdown';
import { useLanguage } from '@/Contexts/LanguageContext';
import { Link, usePage } from '@inertiajs/react';
import { HomeIcon, Squares2X2Icon, TrophyIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const appMenuItems = [
    { name: 'Quiz Arena', href: '/quiz-page', icon: '/images/logo_award.png' },
    { name: 'ePTRS', href: 'https://eptrs.my', icon: '/images/logo_PTRS.png', external: true },
];

export default function SubjectNavbar({ title }) {
    const { locale, t } = useLanguage();
    const pageProps = usePage().props;
    const { auth } = pageProps;
    const user = auth?.user;
    const student = pageProps.student ?? auth?.student ?? user?.student;
    const userLevel = locale === 'ms'
        ? (student?.level?.name_my || student?.level?.name)
        : (student?.level?.name || student?.level?.name_my);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);
    const closeMenus = () => { setIsMenuOpen(false); setIsAppMenuOpen(false); };

    return (
        <nav className="sticky top-0 z-[110] border-b border-sky-400/30 bg-gradient-to-r from-[#087fbd] via-[#129dd6] to-[#78d5eb] shadow-[0_8px_26px_rgba(8,123,184,.2)]">
            <div className="relative mx-auto max-w-[1600px] px-3 py-2 sm:px-5 lg:px-8">
                <div className="flex h-12 items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <Link href="/dashboard" aria-label="HomeTutor dashboard" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#082c58] text-white shadow-[0_5px_12px_rgba(4,31,68,.25)] transition hover:-translate-y-0.5 hover:bg-[#061f42]"><HomeIcon className="h-5 w-5" /></Link>
                        <Link href="/quiz-page" aria-label="Quiz Arena" className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-[#d99a00] shadow-sm transition hover:-translate-y-0.5 hover:bg-white sm:flex"><TrophyIcon className="h-5 w-5" /></Link>
                        <div className="hidden h-7 w-px bg-white/35 md:block" />
                        <Link href="/dashboard" className="hidden shrink-0 items-center rounded-xl bg-white/95 p-1 shadow-sm md:flex"><ApplicationLogo className="h-8 w-auto object-contain" /></Link>
                        <SubjectMenuDropdown title={title} isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} onToggle={() => setIsAppMenuOpen(false)} />
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
                        <Link  aria-label="Your learning level" className="hidden h-11 items-center gap-2 rounded-2xl border border-white/60 bg-white/90 px-3 text-xs font-extrabold text-[#087bb8] shadow-sm transition hover:-translate-y-0.5 hover:bg-white lg:flex"><span className="h-2 w-2 rounded-full bg-emerald-400" />{userLevel || t('your_level', 'Your level')}</Link>
                        {/* <div className="relative">
                            <button type="button" onClick={() => { setIsAppMenuOpen((open) => !open); setIsMenuOpen(false); }} aria-label="Open quick access" aria-expanded={isAppMenuOpen} className={`flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm transition focus:outline-none focus:ring-2 focus:ring-white/80 ${isAppMenuOpen ? 'border-white bg-[#082c58] text-white' : 'border-white/70 bg-white/90 text-[#087bb8] hover:-translate-y-0.5 hover:bg-white'}`}><Squares2X2Icon className="h-5 w-5" /></button>
                            <div className={`absolute right-0 top-[calc(100%+0.75rem)] z-[60] w-64 origin-top-right rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/20 transition duration-200 ${isAppMenuOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'}`}><p className="px-2 pb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Quick access</p><div className="grid grid-cols-2 gap-2">{appMenuItems.map((item) => item.external ? <a key={item.name} href={item.href} target="_blank" rel="noreferrer" onClick={closeMenus} className="group rounded-2xl p-3 text-center transition hover:bg-sky-50"><img src={item.icon} alt="" className="mx-auto h-12 w-12 rounded-xl object-contain shadow-sm" /><span className="mt-2 block text-xs font-bold text-slate-700 group-hover:text-[#087bb8]">{item.name}</span></a> : <Link key={item.name} href={item.href} onClick={closeMenus} className="group rounded-2xl p-3 text-center transition hover:bg-sky-50"><img src={item.icon} alt="" className="mx-auto h-12 w-12 rounded-xl object-contain shadow-sm" /><span className="mt-2 block text-xs font-bold text-slate-700 group-hover:text-[#087bb8]">{item.name}</span></Link>)}</div></div>
                        </div> */}
                        <div className="hidden rounded-2xl bg-white/90 p-0.5 shadow-sm sm:block"><LanguageSwitcher type="buttons" /></div>
                        <div className="sm:hidden"><LanguageSwitcher type="dropdown" /></div>
                        <div className="rounded-2xl bg-white/90 p-1 shadow-sm"><ProfileDropdown user={user} student={user?.student} /></div>
                    </div>
                </div>
            </div>
            {(isMenuOpen || isAppMenuOpen) && <button type="button" aria-label="Close menu" onClick={closeMenus} className="fixed inset-0 z-40 cursor-default" />}
        </nav>
    );
>>>>>>> 917d4bb (Initial project commit)
}
