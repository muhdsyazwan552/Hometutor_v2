import React, { useEffect, useState } from "react";
import { usePage, router } from "@inertiajs/react";
import SubjectLayout from "@/Layouts/SubjectLayout";
import MasteryChallenge from "@/Components/MasteryChallenge";
import PracticeChallenge from "@/Components/PracticeChallenge";
<<<<<<< HEAD

export default function SubjectMissionPage() {
    const { props } = usePage();
    const subjectKey = props.subject_abbr;
    const subjectTitle = props.subject;
    const subjectId = props.subject_id;
    const levelId = props.level_id;
    const {
        subject,
        subject_abbr,
        form,
        subject_id,
        level_id,
    } = props;
    // ---------- STATE ----------
=======

const stages = [
    ["needPractice", "Rank 1 · Need practice"],
    ["practiced", "Rank 2 · Practised"],
    ["familiar", "Rank 3 · Familiar"],
    ["proficient", "Rank 4 · Proficient"],
    ["mastered", "Rank 5 · Mastered"],
];

const rankMap = {
    not_started: { rank: 1, label: "Need practice", color: "#fb7185" },
    need_practice: { rank: 1, label: "Need practice", color: "#fb7185" },
    practiced: { rank: 2, label: "Practised", color: "#22d3ee" },
    familiar: { rank: 3, label: "Familiar", color: "#fbbf24" },
    proficient: { rank: 4, label: "Proficient", color: "#a78bfa" },
    mastered: { rank: 5, label: "Mastered", color: "#34d399" },
};

const getTopicRank = (level) => rankMap[level] || rankMap.not_started;

function RankIcon({ rank, size = "md", muted = false }) {
    const colors = ["#fb7185", "#22d3ee", "#fbbf24", "#8b5cf6", "#10b981"];
    const dimensions = size === "sm" ? "h-5 w-5" : size === "lg" ? "h-14 w-14" : "h-9 w-9";
    const iconClass = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-8 w-8" : "h-5 w-5";
    const icons = {
        1: <path d="m12 2 1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2Zm6 12 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z" />,
        2: <path d="m3 11 17-7-7 17-2.7-7.3L3 11Zm7.3 2.7L20 4" />,
        3: <><path d="M4 5.5h16v11H9l-5 3v-14Z" /><path d="m12 7 1.2 2.4 2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4L12 7Z" /></>,
        4: <><path d="M12 3 18 6v5c0 4-2.6 7.2-6 9-3.4-1.8-6-5-6-9V6l6-3Z" /><path d="m12 7 1.2 2.3 2.6.4-1.9 1.9.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.9 2.6-.4L12 7ZM6 8 2.5 6.5 4 11l2 1m12-4 3.5-1.5L20 11l-2 1" /></>,
        5: <><path d="M7 5 9 8l3-4 3 4 2-3 1 6H6l1-6Z" /><circle cx="12" cy="14" r="5" /><path d="m12 11.5.8 1.6 1.8.3-1.3 1.3.3 1.8-1.6-.8-1.6.8.3-1.8-1.3-1.3 1.8-.3.8-1.6ZM9 19l-1 3 4-2 4 2-1-3" /></>,
    };

    return (
        <span className={`${dimensions} flex shrink-0 items-center justify-center rounded-full border-2 border-white/70 text-white shadow-lg transition ${muted ? "grayscale opacity-40" : ""}`} style={{ background: `linear-gradient(145deg, ${colors[rank - 1]}, #0f172a)` }} aria-label={`Rank ${rank} icon`}>
            <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[rank]}</svg>
        </span>
    );
}

function RankTrack({ rank, compact = false }) {
    return (
        <div className={`flex items-center ${compact ? "gap-1" : "gap-1.5"}`} aria-label={`Rank ${rank} of 5`}>
            {[1, 2, 3, 4, 5].map((step) => (
                <React.Fragment key={step}>
                    <RankIcon rank={step} size="sm" muted={step > rank} />
                    {step < 5 && <span className={`${compact ? "h-0.5 w-2" : "h-1 flex-1"} rounded-full ${step < rank ? "bg-cyan-400" : "bg-slate-200"}`} />}
                </React.Fragment>
            ))}
        </div>
    );
}

export default function SubjectMissionPage() {
    const { props } = usePage();
    const { subject, subject_abbr, form, subject_id, level_id, availableLevels = {}, availableSubjects = {} } = props;
>>>>>>> 917d4bb (Initial project commit)
    const [progressData, setProgressData] = useState(null);
    const [skills, setSkills] = useState([]);
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
<<<<<<< HEAD
    const [open, setOpen] = useState(false);
    const [currentStandard, setCurrentStandard] = useState(form || 'Form 4');

    const [practiceOpen, setPracticeOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedTopicName, setSelectedTopicName] = useState('');

    const handleStandardChange = (standard) => {
        setCurrentStandard(standard);

        router.get(route('subject-mission-page', {
            subject: subjectTitle || subject,
            form: standard,
            level_id: level_id,
            subject_id: subject_id
        }));
    };
    // ---------- FETCH DATA ----------
    useEffect(() => {
        async function fetchData() {
            try {
                const params = new URLSearchParams({
                    subject_id: subjectId,
                    level_id: levelId
                });

                const [progressRes, skillsRes, challengeRes] = await Promise.all([
                    fetch(`/api/progress/${subjectKey}?${params}`),
                    fetch(`/api/skills/${subjectKey}?${params}`),
                    fetch(`/api/subject/${subjectKey}/challenge?${params}`),
                ]);
=======
    const [challengeOpen, setChallengeOpen] = useState(false);
    const [practiceOpen, setPracticeOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedTopicName, setSelectedTopicName] = useState("");
    const [subtopicPage, setSubtopicPage] = useState(1);
    const [subtopicsPerPage, setSubtopicsPerPage] = useState(8);
    const [currentStandard, setCurrentStandard] = useState(form || "Form 4");

    const loadMission = async () => {
        const [progressRes, skillsRes, challengeRes] = await Promise.all([
            fetch(route("mission.progress", { subject: subject_abbr, subject_id, level_id })),
            fetch(route("mission.skills", { subject: subject_abbr, subject_id, level_id })),
            fetch(route("mission.challenge.info", { subject: subject_abbr, subject_id, level_id })),
        ]);
        const [progress, topicSkills, challengeInfo] = await Promise.all([
            progressRes.json(), skillsRes.json(), challengeRes.json(),
        ]);
        setProgressData(progress);
        setSkills(Array.isArray(topicSkills) ? topicSkills : []);
        setSubtopicPage(1);
        setChallenge(challengeInfo);
    };

    useEffect(() => {
        if (!subject_id || !level_id) return;
        loadMission().catch((error) => console.error("Error fetching subject data", error)).finally(() => setLoading(false));
    }, [subject_abbr, subject_id, level_id]);
>>>>>>> 917d4bb (Initial project commit)

    useEffect(() => {
        const updatePageSize = () => {
            if (window.innerWidth < 640) {
                setSubtopicsPerPage(4);
            } else if (window.innerWidth < 1024) {
                setSubtopicsPerPage(6);
            } else {
                setSubtopicsPerPage(8);
            }
        };

<<<<<<< HEAD
        if (subjectId && levelId) {
            fetchData();
        }
    }, [subjectKey, subjectId, levelId]);

    const handlePractice = (topicId, topicName) => {
        setSelectedTopic(topicId);
        setSelectedTopicName(topicName);
        setPracticeOpen(true);
    };

    const refreshData = async () => {
        // Refresh all data after completing challenge
        try {
            const params = new URLSearchParams({
                subject_id: subjectId,
                level_id: levelId
            });

            const [progressRes, skillsRes] = await Promise.all([
                fetch(`/api/progress/${subjectKey}?${params}`),
                fetch(`/api/skills/${subjectKey}?${params}`),
            ]);

            const progressJson = await progressRes.json();
            const skillsJson = await skillsRes.json();

            setProgressData(progressJson);
            setSkills(skillsJson);
        } catch (err) {
            console.error("Error refreshing data", err);
        }
    };
=======
        updatePageSize();
        window.addEventListener("resize", updatePageSize);
        return () => window.removeEventListener("resize", updatePageSize);
    }, []);
>>>>>>> 917d4bb (Initial project commit)

    useEffect(() => {
        setSubtopicPage(1);
    }, [subtopicsPerPage]);

    const refreshMission = () => loadMission().catch((error) => console.error("Error refreshing data", error));
    const changeStandard = (standard) => {
        setCurrentStandard(standard);
        router.get(route("subject-mission-page", {
            subject: subject_abbr || subject,
            form: standard,
            level_id: availableLevels?.[standard] || level_id,
            subject_id: availableSubjects?.[standard] || subject_id,
        }));
    };
    const openPractice = (topic) => {
        setSelectedTopic(topic.id);
        setSelectedTopicName(topic.name);
        setPracticeOpen(true);
    };

    if (loading) return <SubjectLayout subject={subject_abbr} activeTab="Mission"><div className="flex h-96 items-center justify-center text-slate-500">Loading mission...</div></SubjectLayout>;

    const percentage = progressData?.percentage || 0;
    const totalSubtopicPages = Math.max(1, Math.ceil(skills.length / subtopicsPerPage));
    const visibleSkills = skills.slice((subtopicPage - 1) * subtopicsPerPage, subtopicPage * subtopicsPerPage);
    const firstVisiblePage = Math.max(1, Math.min(subtopicPage - 2, totalSubtopicPages - 4));
    const visiblePageNumbers = Array.from({ length: Math.min(5, totalSubtopicPages) }, (_, index) => firstVisiblePage + index);
    return (
<<<<<<< HEAD
        <SubjectLayout
            subject={subject}
            activeTab="Mission"
            selectedStandard={currentStandard}
            onStandardChange={handleStandardChange}>

            {/* Content */}
            <div className="py-2 mx-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {/* LEFT: Mastery Progress */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            MASTERY PROGRESS
                        </h2>

                        <div className="flex flex-col items-center">
                            {/* Circular Progress */}
                            <div className="relative w-28 h-28 mb-4">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        className="text-gray-200"
                                        strokeWidth="8"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="48"
                                        cx="56"
                                        cy="56"
                                    />
                                    <circle
                                        className="text-sky-500 transition-all duration-500"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="48"
                                        cx="56"
                                        cy="56"
                                        strokeDasharray={2 * Math.PI * 48}
                                        strokeDashoffset={
                                            2 * Math.PI * 48 * (1 - (progressData?.percentage || 0) / 100)
                                        }
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                                    {progressData?.percentage || 0}%
                                </span>
                            </div>

                            {/* Progress Breakdown */}
                            <ul className="text-sm text-gray-600 space-y-1 w-full">
                                <li className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-sm bg-sky-700"></div>
                                    <span>{progressData?.skills.mastered || 0} skills mastered</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-sm bg-sky-600"></div>
                                    <span>{progressData?.skills.proficient || 0} skills proficient</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-sm bg-sky-400"></div>
                                    <span>{progressData?.skills.familiar || 0} skills familiar</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-sm bg-sky-200"></div>
                                    <span>{progressData?.skills.practiced || 0} skills practiced</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-sm bg-gray-300"></div>
                                    <span>{progressData?.skills.needPractice || 0} skills need practice</span>
                                </li>
                            </ul>
                        </div>

                        {/* Topic List */}
                        <div className="mt-6 space-y-3 max-h-96 overflow-y-auto">
                            {progressData?.topics?.map((topic, idx) => (
                                <div key={idx} className="flex items-center space-x-3 pb-2 border-b border-gray-100">
                                    <div
                                        className="w-4 h-4 rounded-sm flex-shrink-0"
                                        style={{ backgroundColor: topic.color || "#f3f4f6" }}
                                    ></div>
                                    <span className="text-gray-800 text-sm font-medium">
                                        {topic.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Challenge + Skills */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Challenge Box */}
                        {challenge && (
                            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg shadow-lg p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 flex items-center justify-center bg-white/20 backdrop-blur rounded-lg">
                                            <svg className="w-10 h-10 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-1">
                                                {challenge.title}
                                            </h3>
                                            <p className="text-sm text-white/90">
                                                {challenge.description}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setOpen(true)}
                                        className="px-6 py-3 bg-white text-teal-600 rounded-lg shadow-lg hover:bg-gray-50 font-semibold transition-all hover:scale-105"
                                    >
                                        Start
                                    </button>
                                </div>
                            </div>
                        )}

                        <MasteryChallenge
                            isOpen={open}
                            onClose={() => {
                                setOpen(false);
                                refreshData();
                            }}
                            subjectId={subjectId}
                            levelId={levelId}
                            subjectKey={subject}
                        />

                        <PracticeChallenge
                            isOpen={practiceOpen}
                            onClose={() => {
                                setPracticeOpen(false);
                                refreshData(); // Refresh progress data after practice
                            }}
                            subjectId={subjectId}
                            levelId={levelId}
                            subjectKey={subject}
                            topicId={selectedTopic}
                            topicName={selectedTopicName}
                        />

                        {/* Skills to Practice */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">
                                SKILLS YOU NEED TO PRACTICE
                            </h3>
                            {skills.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Great job! All skills are mastered or proficient.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {skills.map((skill, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className="w-3 h-3 rounded-sm"
                                                    style={{ backgroundColor: skill.mastery_color }}
                                                ></div>
                                                <span className="font-medium text-gray-700">
                                                    {skill.name}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handlePractice(skill.id, skill.name)}
                                                className="px-4 py-2 border border-sky-500 text-sky-500 rounded-full hover:bg-sky-500 hover:text-white transition-colors"
                                            >
                                                Practice
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
=======
        <SubjectLayout subject={subject} activeTab="Mission" selectedStandard={currentStandard} onStandardChange={changeStandard}>
            <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
                    <aside className="overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-50 via-blue-50 to-white p-5 text-slate-900 shadow-2xl shadow-sky-200/60">
                        <div className="flex items-center justify-between"><h2 className="text-sm font-black tracking-widest text-blue-950">LEARNING QUEST</h2><span className="text-sky-500">✦</span></div>
                        <div className="mt-5 flex items-center gap-4 rounded-2xl border border-sky-100 bg-white/90 p-3 shadow-sm">
                            <div className="relative h-20 w-20 shrink-0"><svg className="h-full w-full -rotate-90"><circle className="text-sky-100" strokeWidth="8" stroke="currentColor" fill="transparent" r="34" cx="40" cy="40" /><circle className="text-sky-500" strokeWidth="8" strokeLinecap="round" stroke="currentColor" fill="transparent" r="34" cx="40" cy="40" strokeDasharray={2 * Math.PI * 34} strokeDashoffset={2 * Math.PI * 34 * (1 - percentage / 100)} /></svg><span className="absolute inset-0 flex items-center justify-center text-xl font-black text-blue-950">{percentage}%</span></div>
                            <div><p className="text-xs font-semibold uppercase tracking-wider text-sky-600">Topic mastery</p><p className="mt-1 text-sm text-slate-500">Built from each subtopic rank.</p></div>
                        </div>
                        <div className="relative mt-6 space-y-3 before:absolute before:left-4 before:top-5 before:h-[calc(100%-2.5rem)] before:w-px before:bg-sky-200">
                            {stages.map(([key, label], index) => {
                                const count = progressData?.skills?.[key] || 0;
                                return <div key={key} className="relative flex items-center gap-3"><span className="z-10"><RankIcon rank={index + 1} /></span><div className="flex-1 rounded-xl border border-sky-100 bg-white/90 px-3 py-2 shadow-sm"><div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-slate-700">{label}</p><span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-black text-sky-700">{count}</span></div><p className="text-xs text-slate-400">{count} topic{count === 1 ? "" : "s"}</p></div></div>;
                            })}
                        </div>
                        <div className="mt-6 border-t border-sky-100 pt-4">
                            <div className="mb-3 flex items-center justify-between"><h3 className="text-xs font-black tracking-widest text-sky-700">TOPIC RANKS</h3><span className="text-xs text-slate-400">{progressData?.topics?.length || 0}</span></div>
                            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                                {progressData?.topics?.map((topic) => {
                                    const topicRank = getTopicRank(topic.mastery_level);
                                    return (
                                        <div key={topic.id} className="rounded-xl border border-sky-100 bg-white/90 px-3 py-2.5 shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <RankIcon rank={topicRank.rank} size="sm" />
                                                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-700">{topic.title}</span>
                                                <span className="text-[10px] font-bold text-slate-400">{topicRank.label}</span>
                                            </div>
                                            {topic.subtopic_count > 0 && <p className="mt-1 pl-7 text-[10px] font-semibold text-sky-600">{topic.subtopic_count} subtopic{topic.subtopic_count === 1 ? "" : "s"}</p>}
                                            <div className="mt-2"><RankTrack rank={topicRank.rank} compact /></div>
                                        </div>
                                    );
                                })}
                            </div>
>>>>>>> 917d4bb (Initial project commit)
                        </div>
                    </aside>

                    <main className="rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-blue-50 p-4 shadow-2xl shadow-sky-200/50 sm:p-6">
                        <div className="mb-5 flex items-center gap-3 text-blue-950"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-xl text-sky-600">◉</span><h2 className="text-xl font-black tracking-wide">PRACTICE ARENA</h2></div>
                        {challenge && <section className="relative overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-r from-white via-sky-50 to-blue-100 p-6 text-slate-900 shadow-lg shadow-sky-100"><div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-cyan-300/30 blur-2xl" /><div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-white text-3xl text-amber-400 shadow-sm">✦</div><div><p className="text-xs font-bold uppercase tracking-widest text-sky-600">Featured mission</p><h3 className="mt-1 text-2xl font-black text-blue-950">{challenge.title}</h3><p className="mt-1 text-sm text-slate-600">{challenge.description}</p><div className="mt-3 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-white px-3 py-1 text-slate-600 shadow-sm">{challenge.question_count || 10} questions</span><span className="rounded-full bg-cyan-100 px-3 py-1 text-cyan-700">Topic-based mastery</span></div></div></div><button onClick={() => setChallengeOpen(true)} className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 font-black text-white shadow-lg shadow-sky-200 transition hover:scale-[1.03]">Play now →</button></div></section>}

                        <section className="mt-5 rounded-2xl bg-white p-3 shadow-sm sm:p-5">
                            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-cyan-600">Subtopic missions</p><h3 className="text-xl font-black text-slate-900">Choose a subtopic to practise</h3></div><p className="text-sm text-slate-500">Each subtopic has its own rank</p></div>
                            {skills.length === 0 ? (
                                <div className="rounded-2xl bg-sky-50 px-5 py-10 text-center text-lg font-bold text-sky-800">No subtopics are available for this subject and level.</div>
                            ) : (
                                <>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {visibleSkills.map((skill, index) => {
                                        const topicRank = getTopicRank(skill.mastery_level);
                                        return (
                                            <article key={skill.id || index} className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex shrink-0 flex-col items-center gap-1"><RankIcon rank={topicRank.rank} size="lg" /><span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Rank {topicRank.rank}</span></div>
                                                    <div className="min-w-0 flex-1">{skill.parent_name && <p className="mb-1 truncate text-[10px] font-black uppercase tracking-wider text-sky-600">{skill.parent_name}</p>}<p className="truncate font-bold text-slate-800">{skill.name}</p><div className="mt-1 flex flex-wrap items-center gap-2"><span className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white" style={{ backgroundColor: topicRank.color }}>{topicRank.label}</span><span className="text-[10px] font-semibold text-slate-400">Rank {topicRank.rank} of 5</span></div></div>
                                                </div>
                                                <div className="mt-4 rounded-xl bg-slate-50 p-3"><div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400"><span>Rank progress</span><span>R1 → R5</span></div><RankTrack rank={topicRank.rank} /></div>
                                                <div className="mt-4 flex items-center justify-between"><span className="text-xs font-bold text-slate-500">Next: {topicRank.rank < 5 ? rankMap[Object.keys(rankMap).find((key) => rankMap[key].rank === topicRank.rank + 1)]?.label : "Complete"}</span><button onClick={() => openPractice(skill)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition group-hover:bg-cyan-600">Practise →</button></div>
                                            </article>
                                        );
                                    })}
                                </div>
                                {totalSubtopicPages > 1 && <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                                    <p className="text-xs font-semibold text-slate-500">Showing {(subtopicPage - 1) * subtopicsPerPage + 1}–{Math.min(subtopicPage * subtopicsPerPage, skills.length)} of {skills.length} subtopics</p>
                                    <div className="flex w-full items-center gap-1.5 sm:w-auto">
                                        <button type="button" disabled={subtopicPage === 1} onClick={() => setSubtopicPage((page) => Math.max(1, page - 1))} className="flex-1 rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs font-bold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none">← Previous</button>
                                        <span className="whitespace-nowrap px-2 text-xs font-black text-sky-700 sm:hidden">{subtopicPage} / {totalSubtopicPages}</span>
                                        <div className="hidden items-center gap-1.5 sm:flex">{visiblePageNumbers.map((page) => <button key={page} type="button" onClick={() => setSubtopicPage(page)} className={`h-8 min-w-8 rounded-lg px-2 text-xs font-black transition ${page === subtopicPage ? "bg-sky-500 text-white shadow-sm" : "bg-sky-50 text-sky-700 hover:bg-sky-100"}`}>{page}</button>)}</div>
                                        <button type="button" disabled={subtopicPage === totalSubtopicPages} onClick={() => setSubtopicPage((page) => Math.min(totalSubtopicPages, page + 1))} className="flex-1 rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs font-bold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none">Next →</button>
                                    </div>
                                </div>}
                                </>
                            )}
                        </section>
                    </main>
                </div>
            </div>
            <MasteryChallenge isOpen={challengeOpen} onClose={() => { setChallengeOpen(false); refreshMission(); }} subjectId={subject_id} levelId={level_id} subjectKey={subject} />
            <PracticeChallenge isOpen={practiceOpen} onClose={() => { setPracticeOpen(false); refreshMission(); }} subjectId={subject_id} levelId={level_id} subjectKey={subject} topicId={selectedTopic} topicName={selectedTopicName} />
        </SubjectLayout>
    );
}