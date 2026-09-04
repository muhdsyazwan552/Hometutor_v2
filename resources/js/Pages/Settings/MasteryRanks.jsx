import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

const rankIcons = ['✦', '➤', '★', '⬟', '♛'];
const rankGradients = [
    'from-rose-400 to-orange-400',
    'from-cyan-400 to-blue-500',
    'from-amber-300 to-orange-500',
    'from-violet-400 to-indigo-600',
    'from-emerald-400 to-teal-600',
];

export default function MasteryRanks({ configuration, ranks }) {
    const { flash } = usePage().props;
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        questions_per_session: configuration?.questions_per_session || 10,
        ranks: ranks.map((rank) => ({
            rank: rank.rank,
            label: rank.label,
            min_questions: rank.min_questions,
            min_accuracy: Number(rank.min_accuracy),
        })),
    });

    const updateRank = (index, field, value) => {
        const updated = [...data.ranks];
        updated[index] = { ...updated[index], [field]: value };
        setData('ranks', updated);
    };

    const submit = (event) => {
        event.preventDefault();
        put(route('mastery-ranks.update'), { preserveScroll: true });
    };

    return (
        <DashboardLayout>
            <Head title="Mastery Rank Settings" />
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">Learning configuration</p>
                        <h1 className="mt-2 text-3xl font-black text-blue-950">Mastery Rank Settings</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Manage how many questions and what accuracy a student needs for each topic rank.</p>
                    </div>
                    <Link href="/dashboard" className="rounded-xl border border-sky-200 bg-white px-4 py-2.5 text-sm font-bold text-sky-700 shadow-sm transition hover:bg-sky-50">← Dashboard</Link>
                </div>

                {(flash?.success || recentlySuccessful) && <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{flash?.success || 'Settings saved successfully.'}</div>}

                <form onSubmit={submit} className="space-y-6">
                    <section className="rounded-3xl border border-sky-100 bg-gradient-to-r from-white to-sky-50 p-6 shadow-lg shadow-sky-100/60">
                        <div className="grid gap-5 md:grid-cols-[1fr_220px] md:items-center">
                            <div><h2 className="text-lg font-black text-blue-950">Questions per session</h2><p className="mt-1 text-sm text-slate-500">This controls the size of both mastery challenges and focused topic practice.</p></div>
                            <label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Questions</span><input type="number" min="5" max="50" value={data.questions_per_session} onChange={(event) => setData('questions_per_session', Number(event.target.value))} className="w-full rounded-xl border-sky-200 bg-white text-lg font-black text-blue-950 focus:border-sky-400 focus:ring-sky-300" />{errors.questions_per_session && <span className="mt-1 block text-xs font-semibold text-rose-600">{errors.questions_per_session}</span>}</label>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-sky-100 bg-white p-5 shadow-xl shadow-sky-100/50 sm:p-6">
                        <div className="mb-5"><h2 className="text-lg font-black text-blue-950">Topic rank requirements</h2><p className="mt-1 text-sm text-slate-500">A student must meet both requirements to unlock a rank.</p></div>
                        <div className="space-y-4">
                            {data.ranks.map((rank, index) => {
                                const estimatedSessions = Math.ceil(Number(rank.min_questions || 0) / Number(data.questions_per_session || 10));
                                return (
                                    <article key={rank.rank} className="grid gap-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-4 lg:grid-cols-[1fr_190px_190px_130px] lg:items-center">
                                        <div className="flex items-center gap-3"><span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${rankGradients[index]} text-2xl font-black text-white shadow-lg`}>{rankIcons[index]}</span><div><p className="text-xs font-black uppercase tracking-wider text-slate-400">Rank {rank.rank}</p><p className="font-black text-slate-800">{rank.label}</p></div></div>
                                        <label><span className="mb-1 block text-xs font-bold text-slate-500">Minimum questions</span><input type="number" min="1" value={rank.min_questions} onChange={(event) => updateRank(index, 'min_questions', Number(event.target.value))} className="w-full rounded-xl border-slate-200 text-sm font-bold focus:border-sky-400 focus:ring-sky-300" />{errors[`ranks.${index}.min_questions`] && <span className="text-xs text-rose-600">{errors[`ranks.${index}.min_questions`]}</span>}</label>
                                        <label><span className="mb-1 block text-xs font-bold text-slate-500">Minimum accuracy</span><div className="relative"><input type="number" min="0" max="100" step="0.01" value={rank.min_accuracy} onChange={(event) => updateRank(index, 'min_accuracy', Number(event.target.value))} className="w-full rounded-xl border-slate-200 pr-9 text-sm font-bold focus:border-sky-400 focus:ring-sky-300" /><span className="absolute right-3 top-2.5 text-sm font-bold text-slate-400">%</span></div>{errors[`ranks.${index}.min_accuracy`] && <span className="text-xs text-rose-600">{errors[`ranks.${index}.min_accuracy`]}</span>}</label>
                                        <div className="rounded-xl bg-sky-50 px-3 py-2 text-center"><p className="text-xl font-black text-sky-700">{estimatedSessions}</p><p className="text-[10px] font-bold uppercase tracking-wider text-sky-600">session{estimatedSessions === 1 ? '' : 's'}</p></div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    <div className="flex items-center justify-end gap-3"><p className="mr-auto hidden text-xs text-slate-400 sm:block">Changes affect future answers immediately.</p><button type="submit" disabled={processing} className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60">{processing ? 'Saving…' : 'Save mastery rules'}</button></div>
                </form>
            </div>
        </DashboardLayout>
    );
}
