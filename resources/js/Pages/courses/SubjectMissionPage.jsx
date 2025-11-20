import React, { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import SubjectLayout from "@/Layouts/SubjectLayout";
import MasteryChallenge from "@/Components/MasteryChallenge";

export default function SubjectMissionPage() {
    const { props } = usePage();
    const subjectKey = props.subject;
    const subjectTitle = props.subjectTitle;

    // ---------- STATE ----------
    const [progressData, setProgressData] = useState(null); // from API #1
    const [skills, setSkills] = useState([]);               // from API #2
    const [challenge, setChallenge] = useState(null);       // from API #3
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    // ---------- FETCH DATA ----------
    useEffect(() => {
        async function fetchData() {
            try {
                // NOTE: Replace with your real API endpoints
                const [progressRes, skillsRes, challengeRes] = await Promise.all([
                    fetch(`/progress/${subjectKey}`),   // API #1: mastery progress
                    fetch(`/skills/${subjectKey}`),     // API #2: skill list
                    fetch(`/challenge/${subjectKey}`),  // API #3: mastery challenge
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

        fetchData();
    }, [subjectKey]);

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
        <SubjectLayout subject={subjectKey} activeTab="Mission">
            {/* Header */}
            <div className="max-w-8xl px-6 sm:px-6 lg:px-0 bg-gradient-to-t from-sky-500 to-indigo-500 py-6 border-b border-gray-200">
                <div className="max-w-6xl mx-auto flex items-center">
                    <h1 className="text-4xl font-bold text-white mb-4">{subjectTitle}</h1>
                </div>
            </div>

            {/* Content */}
            <div className="py-8 mx-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {/* LEFT: Mastery Progress */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            MASTERY PROGRESS
                        </h2>

                        <div className="flex flex-col items-center">
                            {/* Circular Progress */}
                            <div className="relative w-28 h-28 mb-4">
                                <svg className="w-full h-full">
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
                                        className="text-sky-500"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="48"
                                        cx="56"
                                        cy="56"
                                        strokeDasharray={2 * Math.PI * 48}
                                        strokeDashoffset={
                                            2 * Math.PI * 48 * (1 - progressData?.percentage / 100)
                                        }
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                                    {progressData?.percentage || 0}%
                                </span>
                            </div>

                            {/* Progress Breakdown */}
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>{progressData?.skills.mastered} skills mastered</li>
                                <li>{progressData?.skills.proficient} skills proficient</li>
                                <li>{progressData?.skills.familiar} skills familiar</li>
                                <li>{progressData?.skills.practiced} skills practiced</li>
                                <li>{progressData?.skills.needPractice} skills need practice</li>
                            </ul>
                        </div>

                        <div className="mt-6 space-y-4">
                            {progressData?.topics?.map((topic, idx) => (
                                <div key={idx} className="flex items-center space-x-3 border-b pb-3">
                                    {/* Status Color Box */}
                                    <div
                                        className="w-4 h-4 rounded-sm"
                                        style={{ backgroundColor: topic.color || "#a5f3fc" }} // default sky-200
                                    ></div>
                                    {/* Topic Title */}
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
                            <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    {/* Trophy Icon */}
                                    <div className="w-16 h-16 flex items-center justify-center bg-sky-100 rounded-lg">
                                        <img
                                            src="https://hometutor.com.my/landing_page/img/activity/trophy.png"
                                            alt="Trophy"
                                            className="w-10 h-10"
                                        />
                                    </div>

                                    {/* Text */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">
                                            {challenge.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {challenge.description}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setOpen(true)}
                                    className="px-4 py-2 bg-sky-600 text-white rounded-lg shadow hover:bg-sky-700"
                                >
                                    Start
                                </button>
                            </div>
                        )}

                        <MasteryChallenge
                            isOpen={open}
                            onClose={() => setOpen(false)}
                            subjectKey="math"
                        />



                        {/* Skills to Practice */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">
                                SKILL YOU NEED TO PRACTICE
                            </h3>
                            <div className="space-y-3">
                                {skills.map((skill, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 flex items-center justify-center bg-sky-100 rounded">
                                                ⭐
                                            </div>
                                            <span className="font-medium text-gray-700">
                                                {skill.name}
                                            </span>
                                        </div>
                                        <button className="px-3 py-1 border border-sky-500 text-sky-500 rounded-full hover:bg-sky-500 hover:text-white transition">
                                            Practice
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SubjectLayout>
    );
}
