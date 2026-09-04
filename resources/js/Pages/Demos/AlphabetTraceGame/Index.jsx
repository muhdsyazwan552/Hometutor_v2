import React, { useEffect, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import './alphabet-trace.css';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
const TILE_COLORS = ['#2196f3', '#f43f8f', '#20bd6b', '#ff9f1c', '#a855f7', '#ef4444'];

export default function AlphabetTraceGame() {
    const [active, setActive] = useState({ letter: '', nonce: 0 });
    const [visited, setVisited] = useState(() => new Set());
    const [soundEnabled, setSoundEnabled] = useState(true);

    const completed = visited.size;
    const progress = useMemo(() => (completed / LETTERS.length) * 100, [completed]);
    const assetBase = window.location.pathname.includes('/hometutorV2/public') ? '/hometutorV2/public' : '';

    useEffect(() => () => window.speechSynthesis?.cancel(), []);

    const speak = (letter) => {
        if (!soundEnabled || !('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(letter);
        utterance.lang = 'en-US';
        utterance.rate = 0.72;
        utterance.pitch = 1.12;
        window.speechSynthesis.speak(utterance);
    };

    const activateLetter = (letter) => {
        setActive((current) => ({ letter, nonce: current.nonce + 1 }));
        setVisited((current) => new Set(current).add(letter));
        speak(letter);
    };

    return (
        <>
            <Head title="Literasi Huruf A-Z" />
            <main className="alphabet-game">
                <section
                    className="alphabet-board"
                    aria-label="Permainan Literasi Huruf A hingga Z"
                    style={{ '--alphabet-bg': `url("${assetBase}/images/alphabet-game/park-background.png")` }}
                >
                    <header className="alphabet-header">
                        <div className="mascot" aria-hidden="true">👦🏻</div>
                        <div>
                            <span>Literasi Huruf A–Z</span>
                            <h1>Tekan kotak untuk dengar dan lihat huruf ditulis.</h1>
                        </div>
                        <button
                            type="button"
                            className="alphabet-sound"
                            aria-label={soundEnabled ? 'Matikan suara' : 'Hidupkan suara'}
                            onClick={() => setSoundEnabled((enabled) => !enabled)}
                        >
                            {soundEnabled ? '🔊' : '🔇'}
                        </button>
                    </header>

                    <div className="alphabet-grid">
                        {LETTERS.map((letter, index) => {
                            const isActive = active.letter === letter;
                            const wasVisited = visited.has(letter);

                            return (
                                <button
                                    type="button"
                                    key={letter}
                                    className={`letter-tile ${isActive ? 'active' : ''} ${wasVisited ? 'visited' : ''}`}
                                    style={{ '--tile-color': TILE_COLORS[index % TILE_COLORS.length] }}
                                    aria-label={`Huruf ${letter.toUpperCase()}`}
                                    aria-pressed={isActive}
                                    onClick={() => activateLetter(letter)}
                                >
                                    <svg viewBox="0 0 100 100" aria-hidden="true">
                                        <text className="guide-letter" x="50" y="72" textAnchor="middle">{letter}</text>
                                        {isActive && (
                                            <text key={`${letter}-${active.nonce}`} className="drawn-letter" x="50" y="72" textAnchor="middle">{letter}</text>
                                        )}
                                        {!isActive && wasVisited && <text className="finished-letter" x="50" y="72" textAnchor="middle">{letter}</text>}
                                    </svg>
                                </button>
                            );
                        })}
                    </div>

                    <footer className="alphabet-progress" aria-label={`${completed} daripada 26 huruf telah diteroka`}>
                        <strong>{completed}/26</strong>
                        <span><i style={{ width: `${progress}%` }} /></span>
                        <em>{completed === 26 ? 'Hebat! Semua huruf selesai! ⭐' : active.letter ? `Huruf ${active.letter.toUpperCase()}` : 'Pilih satu huruf'}</em>
                    </footer>
                </section>
            </main>
        </>
    );
}
