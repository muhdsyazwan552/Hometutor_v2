import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

function errorMessage(error) {
    return error?.response?.data?.message
        || error?.reason
        || error?.message
        || 'Unable to join the Zoom meeting.';
}

export default function JoinMeeting({ meeting, zoomConfigured }) {
    const meetingRoot = useRef(null);
    const clientRef = useRef(null);
    const startedRef = useRef(false);
    const [status, setStatus] = useState('Preparing your meeting…');
    const [error, setError] = useState(
        zoomConfigured ? null : 'Zoom Meeting SDK credentials are not configured.'
    );

    const joinMeeting = async () => {
        if (!zoomConfigured || startedRef.current || !meetingRoot.current) {
            return;
        }

        startedRef.current = true;
        setError(null);
        setStatus('Connecting to Zoom…');

        try {
            const [{ default: ZoomMtgEmbedded }, response] = await Promise.all([
                import('@zoom/meetingsdk/embedded'),
                axios.post(`/zoom/meetings/${meeting.id}/signature`),
            ]);

            const client = ZoomMtgEmbedded.createClient();
            clientRef.current = client;

            await client.init({
                zoomAppRoot: meetingRoot.current,
                language: 'en-US',
                patchJsMedia: true,
                leaveOnPageUnload: true,
                customize: {
                    video: {
                        isResizable: true,
                        viewSizes: {
                            default: {
                                width: Math.min(window.innerWidth - 32, 1200),
                                height: Math.min(window.innerHeight - 160, 720),
                            },
                        },
                    },
                },
            });

            setStatus('Joining meeting…');
            await client.join(response.data);
            setStatus('');
        } catch (joinError) {
            startedRef.current = false;
            setStatus('');
            setError(errorMessage(joinError));
        }
    };

    useEffect(() => {
        joinMeeting();

        return () => {
            if (clientRef.current) {
                clientRef.current.leaveMeeting().catch(() => {});
                clientRef.current = null;
            }
        };
    }, []);

    return (
        <>
            <Head title={`Join ${meeting.title}`} />

            <main className="min-h-screen bg-slate-950 px-4 py-6 text-white">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium text-sky-300">Live class</p>
                            <h1 className="text-2xl font-bold">{meeting.title}</h1>
                        </div>
                        <Link
                            href="/dashboard"
                            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold hover:bg-slate-800"
                        >
                            Back to dashboard
                        </Link>
                    </div>

                    {status && (
                        <div className="mb-4 rounded-lg bg-slate-800 p-4 text-slate-200">
                            {status}
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-950/60 p-4">
                            <p className="font-semibold">Could not join the meeting</p>
                            <p className="mt-1 text-sm text-red-100">{error}</p>
                            {zoomConfigured && (
                                <button
                                    type="button"
                                    onClick={joinMeeting}
                                    className="mt-3 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
                                >
                                    Try again
                                </button>
                            )}
                        </div>
                    )}

                    <div
                        ref={meetingRoot}
                        className="min-h-[70vh] overflow-hidden rounded-xl bg-black shadow-2xl"
                    />
                </div>
            </main>
        </>
    );
}
