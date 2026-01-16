import React, { useEffect, useState } from "react";
import { usePage, router } from "@inertiajs/react";
import SubjectLayout from "@/Layouts/SubjectLayout";
import MasteryChallenge from "@/Components/MasteryChallenge";
import PracticeChallenge from "@/Components/PracticeChallenge";

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
    const [progressData, setProgressData] = useState(null);
    const [skills, setSkills] = useState([]);
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
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

                const progressJson = await progressRes.json();
                const skillsJson = await skillsRes.json();
                const challengeJson = await challengeRes.json();

                setProgressData(progressJson);
                setSkills(skillsJson);
                setChallenge(challengeJson);
            } catch (err) {
                console.error("Error fetching subject data", err);
            } finally {
                setLoading(false);
            }
        }

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

    if (loading) {
        return (
            <SubjectLayout subject={subjectKey} activeTab="Mission">
                <div className="flex justify-center items-center h-96">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </SubjectLayout>
        );
    }

    return (
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
                        </div>
                    </div>
                </div>
            </div>
        </SubjectLayout>
    );
}