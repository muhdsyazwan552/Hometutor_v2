import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import SubjectLayout from '@/Layouts/SubjectLayout';
import StandardModules from './interactive/StandardModules';

function InteractiveGameModal({ game, onClose }) {
    const [loading, setLoading] = useState(true);
    const isReactGame = game.type === 'react_literasi';

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 p-3 backdrop-blur-sm sm:p-6"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => event.target === event.currentTarget && onClose()}
        >
          <div className="flex h-[min(94vh,920px)] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-slate-900 px-4 py-3 text-white sm:px-6">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                        {isReactGame ? 'React Drag & Drop' : 'Unity Interactive'}
                    </p>
                    <h2 className="truncate text-lg font-bold">{game.title}</h2>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <a
                        href={game.launch_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-white/20 px-3 py-2 text-sm font-medium hover:bg-white/10"
                    >
                        Open new tab
                    </a>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-700"
                    >
                        Close
                    </button>
                </div>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
                {loading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 text-white">
                        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-cyan-400" />
                        <p>Loading {game.title}...</p>
                    </div>
                )}
                <iframe
                    key={game.id}
                    src={game.launch_url}
                    title={game.title}
                    className="h-full w-full border-0"
                    allow="autoplay; fullscreen; gamepad; clipboard-read; clipboard-write"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    onLoad={() => setLoading(false)}
                />
            </div>
          </div>
        </div>
    );
}

export default function SubjectInteractivePage() {
    const { props } = usePage();
    const {
        subject,
        subject_abbr,
        subject_id,
        level_id,
        form = 'Standard 1',
        availableForms = [],
        availableLevels = {},
        availableSubjects = {},
        interactiveModules = [],
    } = props;

    const [currentGame, setCurrentGame] = useState(null);

    const handleStandardChange = (standard) => {
        const newLevelId = availableLevels?.[standard];
        const newSubjectId = availableSubjects?.[standard];

        if (!newLevelId || !newSubjectId) {
            return;
        }

        router.get(route('subject-interactive-page', {
            subject: subject_abbr || subject,
            form: standard,
            level_id: newLevelId,
            subject_id: newSubjectId,
        }));
    };

    return (
        <SubjectLayout
            subject={subject}
            activeTab="Interact"
            selectedStandard={form}
            onStandardChange={handleStandardChange}
            availableForms={availableForms}
        >
            <div className="px-4 py-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-5">
                        <h1 className="text-xl font-bold text-gray-800">Interactive Learning</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {subject} · {form} · {interactiveModules.length} activities
                        </p>
                    </div>

                    {interactiveModules.length > 0 ? (
                        <StandardModules
                            modules={interactiveModules}
                            onModuleClick={setCurrentGame}
                            standard={form}
                        />
                    ) : (
                        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                            <div className="mb-4 text-6xl">🎮</div>
                            <h2 className="text-xl font-semibold text-gray-800">No interactive games available</h2>
                            <p className="mt-2 text-gray-500">
                                No active interactive game is assigned to {subject} for {form}.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {currentGame && (
                <InteractiveGameModal game={currentGame} onClose={() => setCurrentGame(null)} />
            )}
        </SubjectLayout>
    );
}
