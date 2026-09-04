import { Link, usePage } from '@inertiajs/react';
import { BookOpenIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/Contexts/LanguageContext';

<<<<<<< HEAD
export default function SubjectMenuDropdown({ isOpen, setIsOpen, title }) {
  const schoolSubjects = usePage().props.schoolSubjects || [];
  const { t } = useLanguage();

  const getSubjectUrl = (subject) => {
    const subjectSlug = subject.abbr || subject.name.toLowerCase().replace(/\s+/g, '-');
    const subjectId = subject.id;
    const levelId = subject.level_id;
    const form = levelId === 10 ? 'Form 4' : 'Form 5';
    return `/subject/${subjectSlug}?subject_id=${subjectId}&level_id=${levelId}&form=${encodeURIComponent(form)}`;
  };

  return (
    <>
      {/* Game-style Dropdown Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 text-sm font-semibold rounded-xl transition-all duration-200
          ${isOpen 
            ? 'bg-white text-amber-600 shadow-md' 
            : 'bg-white/10 text-white hover:bg-white/20'
          }
          focus:outline-none focus:ring-2 focus:ring-amber-400 px-3 py-2
        `}
      >
        {/* Hamburger icon */}
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

        {/* Tablet view */}
        <span className="hidden sm:flex lg:hidden flex-col items-start">
          <span className="text-xs text-white/80">Menu</span>
          <span className="flex items-center text-sm font-semibold">
            {title}
            <svg
              className={`ml-1 h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="currentColor"
              viewBox="0 0 20 20"
=======
export default function SubjectMenuDropdown({ isOpen, setIsOpen, title, onToggle }) {
    const schoolSubjects = usePage().props.schoolSubjects || [];
    const { t } = useLanguage();

    const getSubjectUrl = (subject) => {
        const subjectSlug = subject.abbr || subject.name.toLowerCase().replace(/\s+/g, '-');
        const form = subject.level_id === 10 ? 'Form 4' : 'Form 5';

        return `/subject/${subjectSlug}?subject_id=${subject.id}&level_id=${subject.level_id}&form=${encodeURIComponent(form)}`;
    };

    const toggleMenu = () => {
        onToggle?.();
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={toggleMenu}
                aria-expanded={isOpen}
                className={`group inline-flex h-11 max-w-[7rem] items-center gap-2 rounded-2xl border px-2.5 text-left text-sm font-bold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-white/80 sm:max-w-xs sm:px-3 ${isOpen ? 'border-white bg-[#082c58] text-white' : 'border-white/60 bg-white/95 text-[#082c58] hover:-translate-y-0.5 hover:bg-white'}`}
>>>>>>> 917d4bb (Initial project commit)
            >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-[#087bb8] transition group-hover:bg-[#087bb8] group-hover:text-white"><BookOpenIcon className="h-4 w-4" /></span>
                <span className="min-w-0">
                    <span className="hidden text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:block">{t('school_subject', 'Subject')}</span>
                    <span className="block truncate sm:text-xs lg:text-sm">{title || t('courses', 'Courses')}</span>
                </span>
                <ChevronDownIcon className={`hidden h-4 w-4 shrink-0 transition sm:block ${isOpen ? 'rotate-180' : ''}`} />
            </button>

<<<<<<< HEAD
        {/* Desktop view */}
        <span className="hidden lg:flex items-center gap-2">
          <span className="text-lg">📚</span>
          <span className='text-black'>Subjects</span>
          <svg
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      {/* Game-style Dropdown Menu */}
      <div
        className={`
          fixed left-0 top-16 sm:top-20 w-screen bg-gradient-to-b from-white to-amber-50 
          shadow-xl transition-all duration-300 ease-out z-50 border-t-4 border-amber-400
          ${isOpen
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-4 invisible"
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Menu Header with Decoration */}
          <div className="flex items-center gap-2 mb-5 pb-2 border-b border-amber-200">
            <div className="w-1 h-6 bg-amber-400 rounded-full"></div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Explore Your Quests
            </span>
            <div className="flex-1"></div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-amber-100 rounded-full transition"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* School Subjects - Quest Categories */}
            <div className="group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                  <span className="text-lg">📖</span>
                </div>
                <h4 className="font-bold text-gray-800">
                  {t('school_subject', 'School Subjects')}
                </h4>
                <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                  {schoolSubjects.length}
                </span>
              </div>
              
              <ul className="space-y-1">
                {schoolSubjects.map((subject, idx) => (
                  <li key={subject.id}>
                    <Link
                      href={getSubjectUrl(subject)}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-amber-50 transition-all duration-200"
                    >
                      <span className="text-lg opacity-60 group-hover:opacity-100 transition">
                        {getSubjectIcon(idx)}
                      </span>
                      <span className="text-sm text-gray-700 group-hover:text-amber-700 group-hover:font-medium transition">
                        {subject.name}
                      </span>
                      <span className="ml-auto text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
                {schoolSubjects.length === 0 && (
                  <li className="px-3 py-4 text-center text-gray-400 text-sm">
                    📭 {t('no_subjects_available', 'No subjects available')}
                  </li>
                )}
              </ul>
            </div>

            {/* Games Section - Play & Learn */}
            {/* <div className="group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-lg">🎮</span>
                </div>
                <h4 className="font-bold text-gray-800">
                  {t('games', 'Games')}
                </h4>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                  Play & Earn
                </span>
              </div>
              
              <ul className="space-y-1">
                <li>
                  <Link 
                    href="/tekakata-page" 
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-green-50 transition-all duration-200"
                  >
                    <span className="text-lg">🔤</span>
                    <span className="text-sm text-gray-700 group-hover:text-green-700 transition">
                      {t('teka_kata', 'Word Puzzle')}
                    </span>
                    <span className="ml-auto text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition">
                      +50 XP
                    </span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/quiz-page" 
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-green-50 transition-all duration-200"
                  >
                    <span className="text-lg">⚡</span>
                    <span className="text-sm text-gray-700 group-hover:text-green-700 transition">
                      {t('quiz_arena', 'Quiz Arena')}
                    </span>
                    <span className="ml-auto text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition">
                      +100 XP
                    </span>
                  </Link>
                </li>
              </ul>
            </div> */}

            
          </div>

          {/* Menu Footer - Quick Tips */}
          <div className="mt-6 pt-4 border-t border-amber-100 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-amber-400">💡</span>
              <span>Complete subjects to earn XP and unlock new adventures!</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-amber-400">🏆</span>
              <span>{schoolSubjects.length} Subjects Available</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper function to get subject icons
function getSubjectIcon(index) {
  const icons = ['📘', '📗', '📕', '📙', '📔', '📒', '📚', '🔬', '🧮', '🎨', '🌍', '💻'];
  return icons[index % icons.length];
}
=======
            <div className={`absolute left-0 top-[calc(100%+0.75rem)] z-[60] w-[min(34rem,calc(100vw-1.5rem))] origin-top-left rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/15 transition duration-200 ${isOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'}`}>
                <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#082c58] to-[#087bb8] px-4 py-3 text-white">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15"><BookOpenIcon className="h-5 w-5" /></span>
                    <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-100">{t('school_subject', 'School subjects')}</p><p className="mt-0.5 text-sm font-medium">Switch subjects whenever you are ready.</p></div>
                </div>
                <div className="mt-2 grid max-h-[min(55vh,26rem)] grid-cols-1 gap-1 overflow-y-auto p-1 sm:grid-cols-2">
                    {schoolSubjects.map((subject) => (
                        <Link key={subject.id} href={getSubjectUrl(subject)} onClick={() => setIsOpen(false)} className="group flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-sky-50 hover:text-[#087bb8]">
                            <span>{subject.name}</span>
                            <span className="text-xs text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#087bb8]">Open →</span>
                        </Link>
                    ))}
                    {schoolSubjects.length === 0 && <p className="col-span-full px-3 py-5 text-sm text-slate-500">{t('no_subjects_available', 'No subjects available')}</p>}
                </div>
            </div>
        </div>
    );
}
>>>>>>> 917d4bb (Initial project commit)
