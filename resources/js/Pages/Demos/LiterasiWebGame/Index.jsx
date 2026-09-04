import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Howl } from 'howler';
import './literasi-game.css';

const SUBJECTS = {
    english: {
        label: 'English', icon: '💬', theme: 'language', instruction: 'Drag the best reply here',
        questions: [
            { question: 'How are you?', answer: 'I am fine.', options: ['I am fine.', 'Good night.', 'Thank you.'] },
            { question: 'What is your name?', answer: 'My name is Ali.', options: ['My name is Ali.', 'I am seven.', 'You are welcome.'] },
            { question: 'Good morning!', answer: 'Good morning!', options: ['Good morning!', 'Goodbye!', 'I am hungry.'] },
            { question: 'How old are you?', answer: 'I am eight.', options: ['I am eight.', 'It is blue.', 'See you later.'] },
            { question: 'Thank you.', answer: 'You are welcome.', options: ['You are welcome.', 'My name is Mei.', 'Good afternoon.'] },
        ],
    },
    bahasa: {
        label: 'Bahasa Malaysia', icon: '🗨️', theme: 'language', instruction: 'Seret jawapan terbaik di sini',
        questions: [
            { question: 'Apa khabar?', answer: 'Saya sihat.', options: ['Saya sihat.', 'Selamat malam.', 'Terima kasih.'] },
            { question: 'Siapakah nama kamu?', answer: 'Nama saya Siti.', options: ['Nama saya Siti.', 'Saya lapan tahun.', 'Sama-sama.'] },
            { question: 'Selamat pagi!', answer: 'Selamat pagi!', options: ['Selamat pagi!', 'Jumpa lagi.', 'Saya lapar.'] },
            { question: 'Berapakah umur kamu?', answer: 'Saya lapan tahun.', options: ['Saya lapan tahun.', 'Saya suka biru.', 'Selamat petang.'] },
            { question: 'Terima kasih.', answer: 'Sama-sama.', options: ['Sama-sama.', 'Nama saya Amir.', 'Selamat malam.'] },
        ],
    },
    mathematics: {
        label: 'Mathematics', icon: '➕', theme: 'mathematics', instruction: 'Seret jawapan ke sini',
        questions: [
            { question: '7 + 5 = ?', answer: '12', options: ['10', '12', '13'], counters: [{ icon: '🍎', count: 7 }, { icon: '🍏', count: 5 }] },
            { question: '9 − 3 = ?', answer: '6', options: ['5', '6', '7'], counters: [{ icon: '🐟', count: 9 }, { icon: '➖', count: 3 }] },
            { question: '4 + 4 = ?', answer: '8', options: ['6', '7', '8'], counters: [{ icon: '⭐', count: 4 }, { icon: '⭐', count: 4 }] },
            { question: '10 − 2 = ?', answer: '8', options: ['7', '8', '9'], counters: [{ icon: '🖍️', count: 10 }, { icon: '➖', count: 2 }] },
            { question: '6 + 3 = ?', answer: '9', options: ['8', '9', '10'], counters: [{ icon: '🧸', count: 6 }, { icon: '🧸', count: 3 }] },
        ],
    },
    science: {
        label: 'Science', icon: '🔬', theme: 'science', instruction: 'Drag the best answer here',
        questions: [
            { question: 'Ice changes into water when it…', answer: 'melts', options: ['melts', 'grows', 'flies'], object: 'ice.png', objectAlt: 'A melting ice cube' },
            { question: 'A plant needs water and…', answer: 'sunlight', options: ['sunlight', 'a toy', 'a pencil'], object: 'plant.png', objectAlt: 'A green plant' },
            { question: 'Fish live in…', answer: 'water', options: ['water', 'a tree', 'the sky'], object: 'fish.png', objectAlt: 'A colourful fish' },
            { question: 'We use an umbrella when it…', answer: 'rains', options: ['rains', 'sleeps', 'reads'], object: 'umbrella-rain.png', objectAlt: 'An umbrella in the rain' },
            { question: 'We hear with our…', answer: 'ears', options: ['ears', 'hands', 'feet'], object: 'ear.png', objectAlt: 'A human ear' },
        ],
    },
};

function CounterGroup({ group }) {
    return <div className="counter-group">{Array.from({ length: group.count }, (_, index) => <span key={index}>{group.icon}</span>)}</div>;
}

export default function LiterasiWebGameDemo() {
    const dropZone = useRef(null);
    const dragRef = useRef(null);
    const [subjectKey, setSubjectKey] = useState('english');
    const [questionIndex, setQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [drag, setDrag] = useState(null);
    const [isOverDropZone, setIsOverDropZone] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [completed, setCompleted] = useState(false);
    const [muted, setMuted] = useState(false);
    const [showSubjects, setShowSubjects] = useState(false);

    const subject = SUBJECTS[subjectKey];
    const question = subject.questions[questionIndex];
    const total = subject.questions.length;
    const assetBase = window.location.pathname.includes('/hometutorV2/public/') ? '/hometutorV2/public' : '';
    const sceneName = subject.theme === 'language' ? 'language-scene' : `${subject.theme}-scene`;

    const sounds = useMemo(() => ({
        correct: new Howl({ src: ['/sounds/correct.mp3'], volume: .55 }),
        wrong: new Howl({ src: ['/sounds/wrong.mp3'], volume: .45 }),
        success: new Howl({ src: ['/sounds/success.mp3'], volume: .65 }),
    }), []);

    useEffect(() => () => Object.values(sounds).forEach((sound) => sound.unload()), [sounds]);
    useEffect(() => Object.values(sounds).forEach((sound) => sound.mute(muted)), [muted, sounds]);

    const play = (name) => {
        sounds[name].stop();
        sounds[name].play();
    };

    const resetSession = (nextSubject = subjectKey) => {
        setSubjectKey(nextSubject);
        setQuestionIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setFeedback(null);
        setCompleted(false);
        setShowSubjects(false);
    };

    const isDropPoint = (x, y) => {
        const rect = dropZone.current?.getBoundingClientRect();
        return Boolean(rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);
    };

    const submitAnswer = (answer) => {
        if (!answer || feedback || completed) return;
        if (answer !== question.answer) {
            play('wrong');
            setFeedback('wrong');
            window.setTimeout(() => setFeedback(null), 650);
            return;
        }

        const isLastQuestion = questionIndex === total - 1;
        play(isLastQuestion ? 'success' : 'correct');
        setFeedback('correct');
        setScore((current) => current + 1);
        window.setTimeout(() => {
            if (isLastQuestion) setCompleted(true);
            else {
                setQuestionIndex((current) => current + 1);
                setSelectedAnswer(null);
                setFeedback(null);
            }
        }, 850);
    };

    const startDrag = (event, answer) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        const nextDrag = { answer, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: 0, y: 0 };
        dragRef.current = nextDrag;
        setDrag(nextDrag);
        setSelectedAnswer(answer);
    };

    const moveDrag = (event) => {
        if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
        const nextDrag = { ...dragRef.current, x: event.clientX - dragRef.current.startX, y: event.clientY - dragRef.current.startY };
        dragRef.current = nextDrag;
        setDrag(nextDrag);
        setIsOverDropZone(isDropPoint(event.clientX, event.clientY));
    };

    const endDrag = (event) => {
        if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
        const activeDrag = dragRef.current;
        dragRef.current = null;
        setDrag(null);
        setIsOverDropZone(false);
        if (isDropPoint(event.clientX, event.clientY)) submitAnswer(activeDrag.answer);
    };

    const progress = ((questionIndex + (feedback === 'correct' ? 1 : 0)) / total) * 100;

    return <>
        <Head title="Drag & Drop Learning Games" />
        <main className={`literasi-demo theme-${subject.theme}`}>
            <section className="tablet-frame">
                <div className="tablet-camera" aria-hidden="true" />
                <div className="game-screen" style={{
                    '--scene-image': `url("${assetBase}/images/game-backgrounds/${sceneName}.png")`,
                    '--mobile-scene-image': `url("${assetBase}/images/game-backgrounds/${sceneName}-mobile.png")`,
                }}>
                    <div className="question-area">
                        <div className="question-bubble"><span className="subject-name">{subject.icon} {subject.label}</span><h1>{question.question}</h1></div>
                        {subject.theme === 'mathematics' && <div className="counting-board"><CounterGroup group={question.counters[0]} /><div className="counter-divider" /><CounterGroup group={question.counters[1]} /></div>}
                        {subject.theme === 'science' && <div className="science-object"><img src={`${assetBase}/images/science-objects/${question.object}`} alt={question.objectAlt} /></div>}
                    </div>

                    <div className="play-panel">
                        <div className="answer-list">
                            {question.options.map((answer, index) => <button
                                type="button"
                                key={answer}
                                aria-pressed={selectedAnswer === answer}
                                onClick={() => setSelectedAnswer(answer)}
                                onPointerDown={(event) => startDrag(event, answer)}
                                onPointerMove={moveDrag}
                                onPointerUp={endDrag}
                                onPointerCancel={endDrag}
                                className={`draggable-answer answer-${index} ${selectedAnswer === answer ? 'selected' : ''} ${drag?.answer === answer ? 'dragging' : ''}`}
                                style={drag?.answer === answer ? { transform: `translate3d(${drag.x}px, ${drag.y}px, 0) scale(1.06)` } : undefined}
                            >{answer}<span className="drag-hand" aria-hidden="true">☝️</span></button>)}
                        </div>

                        <button type="button" ref={dropZone} onClick={() => submitAnswer(selectedAnswer)} className={`answer-zone ${isOverDropZone ? 'hovered' : ''} ${feedback || ''}`}>
                            {feedback === 'correct' ? 'Correct! Well done! ⭐' : feedback === 'wrong' ? 'Try again!' : selectedAnswer ? `Drop “${selectedAnswer}” here` : subject.instruction}
                        </button>

                        <div className="bottom-hud">
                            <button type="button" className="hud-button back-button" onClick={() => setShowSubjects(true)} aria-label="Choose another subject">←</button>
                            <div className="bottom-progress" aria-label={`Question ${questionIndex + 1} of ${total}`}>
                                <strong>{questionIndex + 1}/{total}</strong>
                                <span><i style={{ width: `${progress}%` }} /></span>
                            </div>
                            <button type="button" className="sound-button" onClick={() => setMuted((value) => !value)} aria-label="Toggle sound">{muted ? '🔇' : '🔊'}</button>
                            <div className="stars-pill"><span>⭐</span><strong>{score}</strong></div>
                        </div>
                    </div>
                </div>
            </section>

            {showSubjects && <div className="subject-overlay" role="dialog" aria-modal="true" aria-label="Choose a subject"><div className="subject-card"><h2>Choose a subject</h2><p>Each session has five drag-and-drop games.</p><div className="subject-grid">{Object.entries(SUBJECTS).map(([key, item]) => <button type="button" key={key} onClick={() => resetSession(key)}><span>{item.icon}</span>{item.label}</button>)}</div><button type="button" className="close-subjects" onClick={() => setShowSubjects(false)}>Continue {subject.label}</button></div></div>}

            {completed && <div className="success-overlay" role="dialog" aria-modal="true"><div className="confetti" aria-hidden="true">🎉 ✨ ⭐ 🎊 ✨</div><div className="success-card"><div className="success-icon">🏆</div><span className="success-label">SESSION COMPLETE!</span><h2>You finished all {total} questions.</h2><p>You earned {score} out of {total} stars in {subject.label}.</p><div className="success-actions"><button type="button" onClick={() => resetSession()}>Play Again</button><button type="button" onClick={() => { setCompleted(false); setShowSubjects(true); }}>Choose Subject</button></div></div></div>}
        </main>
    </>;
}
