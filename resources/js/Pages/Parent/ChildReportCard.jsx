import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router } from "@inertiajs/react";
import {
    BookOpenIcon,
    CalendarDaysIcon,
    ChartBarIcon,
    CheckCircleIcon,
    ChevronRightIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    LightBulbIcon,
    ListBulletIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";

const scoreStyle = (score) =>
    score >= 80
        ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
        : score >= 65
          ? "bg-amber-50 text-amber-700 ring-amber-100"
          : "bg-rose-50 text-rose-700 ring-rose-100";
const progressStyle = (score) =>
    score >= 80
        ? "bg-emerald-500"
        : score >= 65
          ? "bg-amber-500"
          : "bg-rose-500";

function Stat({ label, value, detail, icon: Icon, iconStyle }) {
    return (
        <article className="group rounded-3xl border border-white/80 bg-white p-4 shadow-[0_12px_30px_rgba(8,44,88,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(8,44,88,0.12)] sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                        {label}
                    </p>
                    <p className="mt-2 truncate text-3xl font-extrabold tracking-tight text-[#082c58]">
                        {value}
                    </p>
                    <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-500">
                        {detail}
                    </p>
                </div>
                <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-4 ${iconStyle}`}
                >
                    <Icon className="h-5 w-5" />
                </span>
            </div>
        </article>
    );
}

function SectionTitle({ icon: Icon, eyebrow, title, detail }) {
    return (
        <div>
            <div className="flex items-center gap-2 text-sky-700">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50">
                    <Icon className="h-4 w-4" />
                </span>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em]">
                    {eyebrow}
                </p>
            </div>
            <h2 className="mt-3 text-xl font-extrabold tracking-tight text-[#082c58]">
                {title}
            </h2>
            {detail && (
                <p className="mt-1 text-sm leading-6 text-slate-500">
                    {detail}
                </p>
            )}
        </div>
    );
}

export default function ChildReportCard({
    viewedChild,
    parentReportUrl,
    sessionHistoryUrl,
    reportChildren = [],
    period,
    summary = {},
    subjects = [],
    topics = [],
    consistency = {},
    insights = {},
    recentSessions = [],
}) {
    const changePeriod = (event) =>
        router.get(
            parentReportUrl,
            { period: event.target.value },
            { preserveScroll: true, replace: true },
        );
    const changeChild = (event) => {
        const selected = reportChildren.find(
            (child) => child.uuid === event.target.value,
        );
        if (selected) router.visit(selected.report_url);
    };
    const scoreChange =
        summary.score_change === null || summary.score_change === undefined
            ? "Complete more sessions to compare progress"
            : `${summary.score_change >= 0 ? "+" : ""}${summary.score_change} points from the earlier period`;

    return (
        <DashboardLayout>
            <Head title={`${viewedChild?.name || "Child"} Report Card`} />
            <main className="min-h-[calc(100vh-5rem)] bg-[radial-gradient(circle_at_top_right,_#dff6ff_0,_#eff9ff_36%,_#f8fbff_70%)] px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
                <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
                    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#061f42] via-[#082c58] to-[#087fbd] px-5 py-6 text-white shadow-[0_22px_45px_rgba(8,44,88,0.25)] sm:px-8 sm:py-8">
                        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-2xl" />
                        <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-blue-400/20 blur-2xl" />
                        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                            <div className="max-w-3xl">
                                <div className="flex items-center gap-2 text-cyan-100">
                                    <SparklesIcon className="h-4 w-4" />
                                    <p className="text-xs font-extrabold uppercase tracking-[0.18em]">
                                        Parent report card
                                    </p>
                                </div>
                                <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                                    {viewedChild?.name}
                                </h1>
                                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
                                    A simple view of learning growth, the best
                                    next focus, and the activity behind it.
                                </p>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-3 xl:flex xl:items-center">
                                {/* <label className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5 text-xs font-bold text-cyan-100 backdrop-blur-sm">
                                    Child
                                    <select
                                        aria-label="Select child"
                                        value={viewedChild?.uuid || ""}
                                        onChange={changeChild}
                                        className="mt-1 block w-full bg-transparent font-extrabold text-white outline-none sm:mt-0 sm:ml-2 sm:inline sm:w-auto"
                                    >
                                        {reportChildren.map((child) => (
                                            <option
                                                className="text-slate-800"
                                                key={child.uuid}
                                                value={child.uuid}
                                            >
                                                {child.name}
                                            </option>
                                        ))}
                                    </select>
                                </label> */}
                                {/* <label className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5 text-xs font-bold text-cyan-100 backdrop-blur-sm">
                                    Period
                                    <select
                                        aria-label="Select report period"
                                        value={period}
                                        onChange={changePeriod}
                                        className="mt-1 block w-full bg-transparent font-extrabold text-white outline-none sm:mt-0 sm:ml-2 sm:inline sm:w-auto"
                                    >
                                        <option
                                            className="text-slate-800"
                                            value="7"
                                        >
                                            7 days
                                        </option>
                                        <option
                                            className="text-slate-800"
                                            value="30"
                                        >
                                            30 days
                                        </option>
                                        <option
                                            className="text-slate-800"
                                            value="90"
                                        >
                                            90 days
                                        </option>
                                    </select>
                                </label> */}
                                {/* {sessionHistoryUrl && (
                                    <a
                                        href={sessionHistoryUrl}
                                        className="flex items-center justify-center gap-1.5 rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-[#082c58] shadow-sm transition hover:bg-cyan-50"
                                    >
                                        Session history{" "}
                                        <ChevronRightIcon className="h-4 w-4" />
                                    </a>
                                )} */}
                            </div>
                        </div>
                    </section>
                    {consistency.needs_check_in && (
                        <section className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950 shadow-sm">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                <ExclamationTriangleIcon className="h-5 w-5" />
                            </span>
                            <p>
                                <strong className="font-extrabold">
                                    Check-in suggested.
                                </strong>{" "}
                                There has not been a learning session in the
                                past five days. A short practice this weekend
                                can help maintain momentum.
                            </p>
                        </section>
                    )}
                    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <Stat
                            label="Overall mastery"
                            value={`${summary.average_score || 0}%`}
                            detail={scoreChange}
                            icon={ChartBarIcon}
                            iconStyle="bg-sky-100 text-sky-700 ring-sky-50"
                        />
                        <Stat
                            label="Learning sessions"
                            value={summary.total_sessions || 0}
                            detail={`completed in the last ${period} days`}
                            icon={BookOpenIcon}
                            iconStyle="bg-violet-100 text-violet-700 ring-violet-50"
                        />
                        <Stat
                            label="Active days"
                            value={consistency.active_days || 0}
                            detail="days with learning activity"
                            icon={CalendarDaysIcon}
                            iconStyle="bg-emerald-100 text-emerald-700 ring-emerald-50"
                        />
                        <Stat
                            label="Study time"
                            value={`${consistency.study_minutes || 0} min`}
                            detail={
                                consistency.last_session
                                    ? `Last session: ${consistency.last_session}`
                                    : "No sessions yet"
                            }
                            icon={ClockIcon}
                            iconStyle="bg-amber-100 text-amber-700 ring-amber-50"
                        />
                    </section>
                    <section className="grid gap-5 lg:grid-cols-5">
                        <article className="rounded-3xl border border-white bg-white p-5 shadow-[0_12px_30px_rgba(8,44,88,0.07)] sm:p-7 lg:col-span-3">
                            <SectionTitle
                                icon={ChartBarIcon}
                                eyebrow="Learning progress"
                                title="Subject mastery"
                                detail="The average result across completed learning sessions."
                            />
                            <div className="mt-7 space-y-5">
                                {subjects.map((subject) => (
                                    <div key={subject.name}>
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-bold text-slate-700">
                                                    {subject.name}
                                                </p>
                                                <p className="mt-0.5 text-xs font-semibold text-slate-400">
                                                    {subject.sessions} completed
                                                    session
                                                    {subject.sessions === 1
                                                        ? ""
                                                        : "s"}
                                                </p>
                                            </div>
                                            <span
                                                className={`rounded-full px-3 py-1.5 text-xs font-extrabold ring-1 ${scoreStyle(subject.score)}`}
                                            >
                                                {subject.score}%
                                            </span>
                                        </div>
                                        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className={`h-full rounded-full ${progressStyle(subject.score)}`}
                                                style={{
                                                    width: `${Math.min(subject.score, 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {!subjects.length && (
                                    <p className="rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm font-semibold text-slate-400">
                                        Complete a learning session to start
                                        building this report.
                                    </p>
                                )}
                            </div>
                        </article>
                        <aside className="rounded-3xl border border-white bg-white p-5 shadow-[0_12px_30px_rgba(8,44,88,0.07)] sm:p-7 lg:col-span-2">
                            <SectionTitle
                                icon={LightBulbIcon}
                                eyebrow="Parent guide"
                                title="What to do next"
                                detail="Small actions that support learning at home."
                            />
                            <div className="mt-6 space-y-3">
                                {insights.strength && (
                                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                                        <div className="flex gap-2">
                                            <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                                            <div>
                                                <p className="font-extrabold">
                                                    Current strength
                                                </p>
                                                <p className="mt-1">
                                                    {insights.strength}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {insights.focus && (
                                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                                        <p className="font-extrabold">
                                            Next focus
                                        </p>
                                        <p className="mt-1">{insights.focus}</p>
                                    </div>
                                )}
                                {!insights.strength && !insights.focus && (
                                    <p className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-400">
                                        Insights will appear after a few
                                        completed sessions.
                                    </p>
                                )}
                            </div>
                            <div className="mt-4 rounded-2xl bg-sky-50 p-4 text-sm leading-6 text-sky-950">
                                <p className="font-extrabold">
                                    A simple home prompt
                                </p>
                                <p className="mt-1">
                                    “Can you show me how you worked that out?”
                                    Explaining the method helps learning stick.
                                </p>
                            </div>
                        </aside>
                    </section>
                    <section className="rounded-3xl border border-white bg-white p-5 shadow-[0_12px_30px_rgba(8,44,88,0.07)] sm:p-7">
                        <SectionTitle
                            icon={ListBulletIcon}
                            eyebrow="Topic detail"
                            title="Topics to revisit"
                            detail="Shown from the lowest current average upward, so it is easy to choose the next practice area."
                        />
                        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {topics.map((topic) => (
                                <article
                                    key={`${topic.subject}-${topic.name}`}
                                    className="group rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-sky-100 hover:bg-sky-50"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                                                {topic.subject}
                                            </p>
                                            <p className="mt-1 truncate font-extrabold text-[#082c58]">
                                                {topic.name}
                                            </p>
                                        </div>
                                        <span
                                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ${scoreStyle(topic.score)}`}
                                        >
                                            {topic.score}%
                                        </span>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-500">
                                            {topic.sessions} session
                                            {topic.sessions === 1 ? "" : "s"}
                                        </span>
                                        <span className="text-xs font-extrabold text-sky-700">
                                            Review topic
                                        </span>
                                    </div>
                                </article>
                            ))}
                            {!topics.length && (
                                <p className="rounded-2xl bg-slate-50 px-4 py-8 text-sm font-semibold text-slate-400">
                                    No topic data yet.
                                </p>
                            )}
                        </div>
                    </section>
                    <section className="overflow-hidden rounded-3xl border border-white bg-white shadow-[0_12px_30px_rgba(8,44,88,0.07)]">
                        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                            <div>
                                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">
                                    Reference
                                </p>
                                <h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#082c58]">
                                    Recent session history
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    The original detailed report remains
                                    available when you need it.
                                </p>
                            </div>
                            {sessionHistoryUrl && (
                                <a
                                    href={sessionHistoryUrl}
                                    className="inline-flex items-center gap-1 text-sm font-extrabold text-sky-700"
                                >
                                    Open all sessions{" "}
                                    <ChevronRightIcon className="h-4 w-4" />
                                </a>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3 sm:px-7">
                                            Date
                                        </th>
                                        <th className="px-5 py-3">
                                            Subject / topic
                                        </th>
                                        <th className="px-5 py-3">Questions</th>
                                        <th className="px-5 py-3 sm:px-7">
                                            Result
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentSessions.map((session) => (
                                        <tr
                                            key={session.uuid}
                                            className="transition hover:bg-sky-50/50"
                                        >
                                            <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-700 sm:px-7">
                                                {session.date}
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="font-extrabold text-[#082c58]">
                                                    {session.subject}
                                                </p>
                                                <p className="mt-1 text-xs font-medium text-slate-500">
                                                    {session.topic}
                                                </p>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                                {session.correct}/
                                                {session.total_questions}{" "}
                                                correct
                                            </td>
                                            <td className="px-5 py-4 sm:px-7">
                                                <span
                                                    className={`rounded-full px-3 py-1.5 text-xs font-extrabold ring-1 ${scoreStyle(session.score)}`}
                                                >
                                                    {session.score}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {!recentSessions.length && (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="px-5 py-12 text-center text-sm font-semibold text-slate-400 sm:px-7"
                                            >
                                                No sessions in this period.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>
        </DashboardLayout>
    );
}
