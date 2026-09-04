import QuestionReviewModal from "@/Components/QuestionReviewModal";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router } from "@inertiajs/react";
import {
    AcademicCapIcon,
    ChartBarIcon,
    CheckCircleIcon,
    ClockIcon,
    DocumentMagnifyingGlassIcon,
    ExclamationTriangleIcon,
    ListBulletIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

const filterClass =
    "mt-1.5 w-full rounded-xl border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm focus:border-sky-400 focus:ring-sky-400";

function SummaryCard({ label, value, detail, icon: Icon, colour }) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-500">
                        {label}
                    </p>
                    <p className="mt-2 text-3xl font-extrabold text-[#082c58]">
                        {value}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-400">
                        {detail}
                    </p>
                </div>
                <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${colour}`}
                >
                    <Icon className="h-5 w-5" />
                </span>
            </div>
        </article>
    );
}

function formatDuration(seconds) {
    const value = Number(seconds || 0);
    const minutes = Math.floor(value / 60);
    const remaining = value % 60;
    return minutes ? `${minutes}m ${remaining}s` : `${remaining}s`;
}

export default function ChildReport({
    viewedChild,
    filters,
    forms = [],
    subjects = [],
    topics = [],
    summary = {},
    sessions = {},
    parentReportUrl,
    sessionHistoryUrl,
    reportChildren = [],
}) {
    const [reviewSession, setReviewSession] = useState(null);
    const sessionRows = sessions.data || [];
    const pagination = sessions.meta || {};

    const updateFilter = (name, value) => {
        const next = { ...filters, [name]: value || undefined };
        if (name === "form") {
            next.subject = undefined;
            next.topic = undefined;
        }
        if (name === "subject") next.topic = undefined;

        router.get(sessionHistoryUrl, next, {
            preserveScroll: true,
            preserveState: false,
            replace: true,
        });
    };

    return (
        <DashboardLayout>
            <Head title={`${viewedChild?.name || "Child"} Report`} />
            <main className="min-h-[calc(100vh-5rem)] bg-[#eff9ff] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <section className="overflow-hidden rounded-[2rem] bg-[#082c58] px-6 py-7 text-white shadow-xl sm:px-9">
                        <div className="flex flex-wrap items-end justify-between gap-5">
                            <div>
                                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-200">
                                    Parent report · Read only
                                </p>
                                <h1 className="mt-2 text-3xl font-extrabold">
                                    {viewedChild?.name}
                                </h1>
                                <p className="mt-2 text-sm text-blue-100">
                                    Filter learning performance and safely
                                    review completed sessions.
                                </p>
                            </div>
                            {/* <div className="flex flex-wrap items-center gap-2">
                                <label className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-cyan-100">
                                    Child
                                    <select
                                        value={viewedChild?.uuid || ""}
                                        onChange={(event) =>
                                            router.visit(
                                                reportChildren.find(
                                                    (child) =>
                                                        child.uuid ===
                                                        event.target.value,
                                                )?.history_url,
                                            )
                                        }
                                        className="ml-2 bg-transparent font-extrabold text-white outline-none"
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
                                </label>
                                {parentReportUrl && (
                                    <a
                                        href={parentReportUrl}
                                        className="rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-[#082c58] shadow-sm"
                                    >
                                        View report card
                                    </a>
                                )}
                            </div> */}
                            {/* <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                                <p className="text-xs font-bold text-cyan-100">
                                    Username:
                                </p>
                                <p className="mt-0 text-sm font-bold">
                                    {viewedChild?.username}
                                </p>
                            </div> */}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-2">
                            <ListBulletIcon className="h-5 w-5 text-sky-600" />
                            <h2 className="font-extrabold text-[#082c58]">
                                Report filters
                            </h2>
                        </div>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                Form
                                <select
                                    value={filters.form || ""}
                                    onChange={(event) =>
                                        updateFilter("form", event.target.value)
                                    }
                                    className={filterClass}
                                >
                                    <option value="all">All forms</option>
                                    {forms.map((form) => (
                                        <option key={form.id} value={form.id}>
                                            {form.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                Subject
                                <select
                                    value={filters.subject || ""}
                                    onChange={(event) =>
                                        updateFilter(
                                            "subject",
                                            event.target.value,
                                        )
                                    }
                                    className={filterClass}
                                >
                                    <option value="">All subjects</option>
                                    {subjects.map((subject) => (
                                        <option
                                            key={subject.id}
                                            value={subject.id}
                                        >
                                            {subject.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                Topic
                                <select
                                    value={filters.topic || ""}
                                    disabled={!filters.subject}
                                    onChange={(event) =>
                                        updateFilter(
                                            "topic",
                                            event.target.value,
                                        )
                                    }
                                    className={`${filterClass} disabled:cursor-not-allowed disabled:bg-slate-100`}
                                >
                                    <option value="">All topics</option>
                                    {topics.map((topic) => (
                                        <option key={topic.id} value={topic.id}>
                                            {topic.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                Type
                                <select
                                    value={filters.type}
                                    onChange={(event) =>
                                        updateFilter("type", event.target.value)
                                    }
                                    className={filterClass}
                                >
                                    <option value="all">
                                        Practice & Mission
                                    </option>
                                    <option value="practice">
                                        Practice only
                                    </option>
                                    <option value="mission">
                                        Mission only
                                    </option>
                                </select>
                            </label>
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                Period
                                <select
                                    value={filters.period}
                                    onChange={(event) =>
                                        updateFilter(
                                            "period",
                                            event.target.value,
                                        )
                                    }
                                    className={filterClass}
                                >
                                    <option value="7">Last 7 days</option>
                                    <option value="30">Last 30 days</option>
                                    <option value="90">Last 90 days</option>
                                    <option value="all">All time</option>
                                </select>
                            </label>
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                Result
                                <select
                                    value={filters.result}
                                    onChange={(event) =>
                                        updateFilter(
                                            "result",
                                            event.target.value,
                                        )
                                    }
                                    className={filterClass}
                                >
                                    <option value="all">All results</option>
                                    <option value="passed">
                                        Passed (80%+)
                                    </option>
                                    <option value="needs_improvement">
                                        Needs improvement
                                    </option>
                                </select>
                            </label>
                        </div>
                    </section>

                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <SummaryCard
                            label="Total sessions"
                            value={summary.total_sessions || 0}
                            detail={`${summary.practice_sessions || 0} Practice · ${summary.mission_sessions || 0} Mission`}
                            icon={AcademicCapIcon}
                            colour="bg-sky-100 text-sky-700"
                        />
                        <SummaryCard
                            label="Questions answered"
                            value={summary.total_questions || 0}
                            detail={`${summary.correct || 0} correct · ${summary.wrong || 0} wrong`}
                            icon={ListBulletIcon}
                            colour="bg-violet-100 text-violet-700"
                        />
                        <SummaryCard
                            label="Average score"
                            value={`${summary.average_score || 0}%`}
                            detail="Across the selected sessions"
                            icon={ChartBarIcon}
                            colour="bg-amber-100 text-amber-700"
                        />
                        <SummaryCard
                            label="Last session"
                            value={
                                summary.last_session
                                    ? summary.last_session.split(",")[0]
                                    : "—"
                            }
                            detail={
                                summary.last_session ||
                                "No session in this filter"
                            }
                            icon={ClockIcon}
                            colour="bg-emerald-100 text-emerald-700"
                        />
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                            <div>
                                <h2 className="text-lg font-extrabold text-[#082c58]">
                                    Session history
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Showing {pagination.from || 0}–
                                    {pagination.to || 0} of{
                                        " "
                                    }
                                    {pagination.total || 0} matching sessions.
                                </p>
                            </div>
                            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
                                Page {pagination.current_page || 1} of{
                                    " "
                                }
                                {pagination.last_page || 1}
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3">Date</th>
                                        <th className="px-5 py-3">Type</th>
                                        <th className="px-5 py-3">
                                            Subject / Topic
                                        </th>
                                        <th className="px-5 py-3">Questions</th>
                                        <th className="px-5 py-3">Result</th>
                                        <th className="px-5 py-3">Time</th>
                                        <th className="px-5 py-3 text-right">
                                            Review
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {sessionRows.map((session) => (
                                        <tr
                                            key={session.uuid}
                                            className="hover:bg-sky-50/40"
                                        >
                                            <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-700">
                                                {session.date}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-extrabold capitalize ${session.type === "mission" ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700"}`}
                                                >
                                                    {session.type}
                                                </span>
                                            </td>
                                            <td className="min-w-56 px-5 py-4">
                                                <p className="font-bold text-[#082c58]">
                                                    {session.subject}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {session.topic} ·{" "}
                                                    {session.question_type}
                                                </p>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4">
                                                <p className="font-bold text-slate-700">
                                                    {session.correct}/
                                                    {session.total_questions}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {session.wrong} wrong ·{" "}
                                                    {session.skipped} skipped
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 font-extrabold ${session.score >= 80 ? "text-emerald-700" : "text-amber-700"}`}
                                                >
                                                    {session.score >= 80 ? (
                                                        <CheckCircleIcon className="h-4 w-4" />
                                                    ) : (
                                                        <ExclamationTriangleIcon className="h-4 w-4" />
                                                    )}
                                                    {session.score}%
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                                {formatDuration(
                                                    session.time_seconds,
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setReviewSession(
                                                            session,
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0788c9] px-3 py-2 text-xs font-extrabold text-white transition hover:bg-[#056fa7]"
                                                >
                                                    <DocumentMagnifyingGlassIcon className="h-4 w-4" />{" "}
                                                    Review
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {!sessionRows.length && (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="px-5 py-12 text-center"
                                            >
                                                <ChartBarIcon className="mx-auto h-10 w-10 text-slate-300" />
                                                <p className="mt-3 font-bold text-slate-600">
                                                    No sessions match these
                                                    filters
                                                </p>
                                                <p className="mt-1 text-sm text-slate-400">
                                                    Try another subject, topic,
                                                    type or date period.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {pagination.total > pagination.per_page && (
                            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm font-semibold text-slate-500">
                                    {pagination.from}–{pagination.to} of{
                                        " "
                                    }
                                    {pagination.total} sessions
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={!sessions.links?.previous}
                                        onClick={() =>
                                            sessions.links?.previous &&
                                            router.visit(
                                                sessions.links.previous,
                                                {
                                                    preserveScroll: true,
                                                    preserveState: false,
                                                },
                                            )
                                        }
                                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-extrabold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!sessions.links?.next}
                                        onClick={() =>
                                            sessions.links?.next &&
                                            router.visit(sessions.links.next, {
                                                preserveScroll: true,
                                                preserveState: false,
                                            })
                                        }
                                        className="rounded-xl bg-[#0788c9] px-4 py-2 text-sm font-extrabold text-white transition hover:bg-[#056fa7] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <QuestionReviewModal
                isOpen={Boolean(reviewSession)}
                onClose={() => setReviewSession(null)}
                sessionId={reviewSession?.uuid}
                reviewUrl={reviewSession?.review_url}
                readOnly
            />
        </DashboardLayout>
    );
}
