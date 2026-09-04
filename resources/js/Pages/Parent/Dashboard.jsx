import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AcademicCapIcon,
    ArrowRightIcon,
    BoltIcon,
    BookOpenIcon,
    CalendarDaysIcon,
    CheckCircleIcon,
    ChevronRightIcon,
    ClockIcon,
    FireIcon,
    PencilSquareIcon,
    PlayIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';

const subjectStyles = [
    { gradient: 'from-sky-400 to-blue-500', icon: '📘' },
    { gradient: 'from-violet-400 to-purple-500', icon: '🔬' },
    { gradient: 'from-amber-400 to-orange-500', icon: '✏️' },
    { gradient: 'from-emerald-400 to-teal-500', icon: '🌱' },
];

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function StreakCard({ icon: Icon, title, value, description, colour, delay }) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay }}
            className="relative overflow-hidden rounded-3xl border border-white/70 bg-white p-5 shadow-[0_12px_30px_rgba(45,110,149,.09)]"
        >
            <div className={`absolute -right-5 -top-5 h-20 w-20 rounded-full opacity-15 ${colour}`} />
            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-500">{title}</p>
                    <p className="mt-2 text-3xl font-extrabold text-[#082c58]">{value}<span className="ml-1 text-base font-bold text-slate-400">days</span></p>
                    <p className="mt-2 text-xs font-medium text-slate-500">{description}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg ${colour}`}><Icon className="h-6 w-6" /></div>
            </div>
        </motion.article>
    );
}

function StreakCalendar({ streaks }) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
    const monthName = now.toLocaleString('en-MY', { month: 'long', year: 'numeric' });

    const isInStreak = (day, lastDate, length) => {
        if (!lastDate || !length) return false;

        const date = new Date(year, month, day);
        const last = new Date(`${lastDate}T00:00:00`);
        const difference = Math.round((last - date) / 86400000);

        return difference >= 0 && difference < length;
    };

    const isToday = (day) => day === now.getDate();

    return (
        <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.28 }}
            className="rounded-[2rem] bg-gradient-to-br from-[#14a5dc] to-[#2073cf] p-5 text-white shadow-[0_16px_30px_rgba(20,128,204,.21)] sm:p-6"
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-bold text-cyan-100">Your streak calendar</p>
                    <h2 className="mt-1 text-xl font-extrabold">{monthName}</h2>
                </div>
                <CalendarDaysIcon className="h-9 w-9 text-[#ffdc50]" />
            </div>

            <div className="mt-5 rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                <div className="grid grid-cols-7 gap-1 text-center">
                    {weekdays.map((day) => <span key={day} className="pb-1 text-[10px] font-bold text-cyan-100 sm:text-xs">{day}</span>)}
                    {Array.from({ length: firstDayOffset }).map((_, index) => <span key={`blank-${index}`} />)}
                    {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
                        const loginDay = isInStreak(day, streaks.lastLoginDate, streaks.login);
                        const answerDay = isInStreak(day, streaks.lastAnswerDate, streaks.questions);
                        const active = loginDay || answerDay;
                        const colour = loginDay && answerDay
                            ? 'bg-gradient-to-br from-[#ffdc50] to-[#ff9d3e] text-[#074f98]'
                            : loginDay
                                ? 'bg-white text-[#0879bc]'
                                : answerDay
                                    ? 'bg-[#ffdc50] text-[#075a9d]'
                                    : 'text-white/70';

                        return (
                            <span
                                key={day}
                                className={`relative mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-extrabold sm:h-8 sm:w-8 sm:text-xs ${colour} ${isToday(day) && !active ? 'ring-2 ring-[#ffdc50] ring-offset-2 ring-offset-[#148fce]' : ''}`}
                                title={loginDay && answerDay ? 'Login and answer streak' : loginDay ? 'Login streak' : answerDay ? 'Answer streak' : undefined}
                            >
                                {day}
                                {isToday(day) && active && <span className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-white" />}
                            </span>
                        );
                    })}
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-cyan-50">
                <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-white" /> Login streak</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-[#ffdc50]" /> Answer streak</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-gradient-to-br from-[#ffdc50] to-[#ff9d3e]" /> Both</span>
            </div>
        </motion.article>
    );
}

export default function Dashboard() {
    const { auth, profileData = {}, student, courses = [], zoomMeetings = [], streaks = {}, teachers = [], viewerMode, viewedChild, returnToParentUrl, parentReportUrl, reportCardUrl } = usePage().props;
    const user = auth?.user;
    const isParentView = viewerMode === 'parent';
    const firstName = (profileData.name || user?.name || 'Super Learner').split(' ')[0];
    const primaryCourse = courses[0];
    const teacher = teachers[0];
    const answersToday = streaks.answersToday || 0;
    const goalRemaining = Math.max(5 - answersToday, 0);

    return (
        <DashboardLayout>
            <Head title="My Learning Space" />

            <div className="min-h-[calc(100vh-5rem)] bg-[#eff9ff] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
                <div className="mx-auto max-w-7xl space-y-7">
                    {isParentView && (
                        <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-950 shadow-sm">
                            <div>
                                <p className="font-extrabold">Viewing {viewedChild?.name || 'child'} as a parent</p>
                                <p className="mt-1 text-sm font-medium text-amber-800">This dashboard is read-only. Practice, Mission, quiz and answer actions are disabled.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">{reportCardUrl && <a href={reportCardUrl} className="rounded-xl bg-[#0788c9] px-4 py-2.5 text-sm font-extrabold text-white">View report card</a>}{parentReportUrl && <a href={parentReportUrl} className="rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-[#082c58]">Session history</a>}<a href={returnToParentUrl || '/parent'} className="rounded-xl bg-[#082c58] px-4 py-2.5 text-sm font-extrabold text-white">Back to parent dashboard</a></div>
                        </section>
                    )}
                    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="relative overflow-hidden rounded-[2rem] bg-[#082c58] px-6 py-8 text-white shadow-[0_20px_50px_rgba(8,44,88,.23)] sm:px-9 sm:py-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_92%_10%,rgba(42,188,237,.38),transparent_28%),radial-gradient(circle_at_10%_100%,rgba(255,211,73,.22),transparent_26%)]" />
                        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.45)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.45)_1px,transparent_1px)] [background-size:36px_36px]" />
                        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-semibold text-cyan-100"><SparklesIcon className="h-4 w-4 text-[#ffdc50]" /> Your learning space</div>
                                <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Hello, {firstName}! <span className="inline-block animate-wave">👋</span></h1>
                                <p className="mt-3 max-w-xl text-base leading-7 text-blue-100 sm:text-lg">A little practice today makes tomorrow feel easier. Ready for your next small win?</p>
                            </div>
                            {primaryCourse && !isParentView ? (
                                <Link href={route('subject-page', primaryCourse.id)} className="group inline-flex w-fit items-center gap-2 rounded-2xl bg-[#ffdc50] px-5 py-3.5 text-sm font-extrabold text-[#082c58] shadow-[0_12px_24px_rgba(255,220,80,.22)] transition hover:-translate-y-0.5 hover:bg-white">
                                    Start learning <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                                </Link>
                            ) : <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-100"><AcademicCapIcon className="h-5 w-5" /> {isParentView ? 'Learning actions are available from the child account.' : 'Your lessons will appear here soon.'}</div>}
                        </div>
                    </motion.section>

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <StreakCard icon={FireIcon} title="Login streak" value={streaks.login || 0} description="Come back each day to keep your flame glowing." colour="bg-gradient-to-br from-orange-400 to-rose-500" delay={0.05} />
                        <StreakCard icon={BoltIcon} title="Answer streak" value={streaks.questions || 0} description="Answer a question today to continue your streak." colour="bg-gradient-to-br from-[#11a4db] to-[#3275df]" delay={0.1} />
                        <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }} className="rounded-3xl border border-white/70 bg-white p-5 shadow-[0_12px_30px_rgba(45,110,149,.09)]">
                            <div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-slate-500">Today’s questions</p><p className="mt-2 text-3xl font-extrabold text-[#082c58]">{answersToday}<span className="ml-1 text-base font-bold text-slate-400">answered</span></p></div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e6f7ff] text-[#0788c9]"><PencilSquareIcon className="h-6 w-6" /></div></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(answersToday * 20, 100)}%` }} transition={{ duration: 0.7, delay: 0.3 }} className="h-full rounded-full bg-gradient-to-r from-[#10a7dd] to-[#76d5ee]" /></div><p className="mt-2 text-xs font-medium text-slate-500">{goalRemaining ? `${goalRemaining} more to reach today’s goal!` : 'Amazing! You reached today’s goal!'}</p></motion.article>
                    </section>

                    <section className="grid gap-7 lg:grid-cols-[1.35fr_.65fr]">
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.18 }} className="rounded-[2rem] border border-white bg-white p-5 shadow-[0_12px_30px_rgba(45,110,149,.08)] sm:p-7">
                            <div className="flex items-center justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.14em] text-[#0788c9]">Choose a subject</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#082c58]">What would you like to practise?</h2></div><BookOpenIcon className="h-8 w-8 text-[#86d5ef]" /></div>
                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                {courses.length ? courses.map((course, index) => {
                                    const style = subjectStyles[index % subjectStyles.length];
                                    const content = <><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl shadow-md ${style.gradient}`}>{style.icon}</div><div className="min-w-0 flex-1"><h3 className="truncate font-extrabold text-[#082c58]">{course.title}</h3><p className="mt-0.5 truncate text-xs font-medium text-slate-500">{course.topic}</p></div><ChevronRightIcon className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0788c9]" /></>;
                                    return isParentView
                                        ? <div key={course.id} className="flex cursor-not-allowed items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 opacity-80" title="Open this subject from the child account">{content}</div>
                                        : <Link key={course.id} href={route('subject-page', course.id)} className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white hover:shadow-lg">{content}</Link>;
                                }) : <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Your subjects will appear once they are ready.</p>}
                            </div>
                        </motion.div>

                        {teacher && <motion.aside initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }} className="relative overflow-hidden rounded-[2rem] bg-[#fff5cd] p-6 shadow-[0_12px_30px_rgba(181,130,0,.11)]"><div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#ffd942]/30" /><div className="relative"><div className="flex items-center gap-2 text-sm font-bold text-[#9a6900]"><AcademicCapIcon className="h-5 w-5" /> Cikgu</div><img src={teacher.image} alt={teacher.name} className="mt-4 h-36 w-full rounded-2xl object-cover object-top shadow-md" /><div className="mt-4"><div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-extrabold text-[#5a3b00]">{teacher.name}</h2><p className="mt-1 text-sm font-medium text-[#8c681f]">{teacher.available}</p></div><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg shadow-sm">👩‍🏫</span></div><p className="mt-4 rounded-xl bg-white/65 px-3 py-2 text-sm font-semibold leading-6 text-[#725319]">“{teacher.message}”</p><p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-[#9a6900]">Teaches</p><div className="mt-2 flex flex-wrap gap-2">{teacher.subjects.map((subject) => <span key={subject} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#725319] shadow-sm">{subject}</span>)}</div></div></div></motion.aside>}
                    </section>

                    <section className="grid gap-7 lg:grid-cols-[.95fr_1.05fr]">
                        <StreakCalendar streaks={streaks} />

                        <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.32 }} className="rounded-[2rem] border border-white bg-white p-6 shadow-[0_12px_30px_rgba(45,110,149,.08)]"><div className="flex items-center justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.14em] text-[#0788c9]">Live learning</p><h2 className="mt-1 text-xl font-extrabold text-[#082c58]">Upcoming sessions</h2></div><CalendarDaysIcon className="h-8 w-8 text-[#86d5ef]" /></div>{zoomMeetings.length ? <div className="mt-5 space-y-3">{zoomMeetings.slice(0, 2).map((meeting) => <div key={meeting.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4"><div><p className="font-extrabold text-[#082c58]">{meeting.title}</p><p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500"><ClockIcon className="h-3.5 w-3.5" /> {new Date(meeting.startsAt).toLocaleString()}</p></div>{meeting.canJoin ? <Link href={meeting.joinUrl} className="inline-flex items-center gap-1 rounded-xl bg-[#0788c9] px-3 py-2 text-xs font-bold text-white hover:bg-[#056fa7]"><PlayIcon className="h-3.5 w-3.5 fill-current" /> Join</Link> : <span className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-500">Coming soon</span>}</div>)}</div> : <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-medium text-slate-500"><CheckCircleIcon className="h-6 w-6 text-emerald-500" /> No live session right now. Explore a subject instead!</div>}</motion.article>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}
