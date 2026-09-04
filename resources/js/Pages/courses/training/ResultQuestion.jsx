import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const formatDuration = (value) => {
  const seconds = Math.max(0, Number(value) || 0);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return minutes ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
};

const Icon = ({ children, className = '' }) => (
  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xl ${className}`}>{children}</span>
);

export default function ResultQuestion({
  objectiveResults,
  subjectiveResults,
  onTryAgain,
  quizType = 'objective',
  subject,
  standard,
  sectionId,
  contentId,
  topic,
  sectionTitle,
  topic_id,
  form,
  level_id,
  subject_id,
<<<<<<< HEAD
   isEarlyExit = false
=======
  isEarlyExit = false,
  customBackAction,
>>>>>>> 917d4bb (Initial project commit)
}) {
  const results = quizType === 'objective' ? objectiveResults : subjectiveResults;
  const [topicNavigation, setTopicNavigation] = useState(undefined);

  const metrics = useMemo(() => {
    const total = Math.max(0, Number(results?.totalQuestions) || 0);
    const skipped = Math.min(total, Math.max(0, Number(results?.skippedAnswers ?? results?.skipped) || 0));
    const answered = Math.min(total, Math.max(0, Number(results?.answered) || total - skipped));
    const correct = quizType === 'objective'
      ? Math.min(total, Math.max(0, Number(results?.correctAnswers) || 0))
      : answered;
    const timeElapsed = Math.max(0, Number(results?.timeElapsed ?? results?.total_time_seconds) || 0);
    const accuracy = total ? Math.round((correct / total) * 100) : 0;

    return {
      total,
      skipped,
      answered,
      correct,
      timeElapsed,
      accuracy,
      averageTime: total ? Math.round(timeElapsed / total) : 0,
    };
  }, [quizType, results]);

  useEffect(() => {
    if (!subject_id || !level_id || !topic_id) {
      setTopicNavigation(null);
      return undefined;
    }

    let active = true;
    setTopicNavigation(undefined);

    axios.get(route('practice.next-topic'), {
      params: {
        subject_id,
        level_id,
        topic_id,
        question_type_id: quizType === 'objective' ? 1 : 2,
      },
    }).then((response) => {
      if (active) {
        setTopicNavigation({
          currentTopic: response.data.current_topic || null,
          nextTopic: response.data.next_topic || null,
        });
      }
    }).catch(() => {
      if (active) setTopicNavigation(null);
    });

    return () => { active = false; };
  }, [level_id, quizType, subject_id, topic_id]);

  const practiceUrl = (targetTopicId) => {
    const query = new URLSearchParams();
    const values = {
      topic_id: targetTopicId,
      subject,
      standard,
      form: form || standard,
      sectionId,
      sectionTitle,
      contentId,
      subject_id,
      level_id,
    };

    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') query.set(key, value);
    });

    return `/${quizType === 'objective' ? 'objective-page' : 'subjective-page'}?${query.toString()}`;
  };

  const handleBackToSubject = () => {
    if (customBackAction) {
      customBackAction();
      return;
    }

    const query = new URLSearchParams();
    if (form || standard) query.set('form', form || standard);
    if (level_id) query.set('level_id', level_id);
    if (subject_id) query.set('subject_id', subject_id);
    window.location.assign(`/subject/${subject}?${query.toString()}`);
  };

<<<<<<< HEAD
  // 🖨️ Print the received props to verify
  // console.log('=== RESULT PAGE PROPS ===');
  // console.log('Subject:', subject);
  // console.log('Standard:', standard);
  // console.log('Topic:', topic);
  // console.log('Topic ID:', topic_id);
  // console.log('Section ID:', sectionId);
  // console.log('Content ID:', contentId);
  // console.log('Section Title:', sectionTitle);
  // console.log('=== END RESULT PROPS ===');

=======
>>>>>>> 917d4bb (Initial project commit)
  if (!results) {
    return <div className="grid min-h-screen place-items-center bg-slate-50 p-6 text-slate-600">Loading your results…</div>;
  }

  const completionText = metrics.skipped === 0 && !isEarlyExit ? 'Completed' : 'Saved progress';
  const repeatTopic = topicNavigation?.currentTopic;
  const nextTopic = topicNavigation?.nextTopic;
  const isCheckingTopics = topicNavigation === undefined;
  const encouragement = metrics.accuracy >= 80
    ? 'Excellent work — you are building strong mastery.'
    : metrics.accuracy >= 50
      ? 'Good effort — a little more practice will strengthen this topic.'
      : 'Every attempt counts. Review the topic and try once more.';

  const isComplete = results.isComplete || 
                     (results.completionType === 'all_questions') || 
                     (results.skippedAnswers === 0 && !isEarlyExit);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0f2fe,_#f8fafc_42rem)] px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-5 flex items-center justify-between gap-3 sm:mb-8">
          <button onClick={handleBackToSubject} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400">
            <span aria-hidden="true">←</span><span className="hidden sm:inline">Back to subject</span>
          </button>
          <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-sky-700 shadow-sm ring-1 ring-sky-100">{quizType === 'objective' ? 'Objective practice' : 'Subjective practice'}</span>
        </header>

        <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl shadow-sky-200/60">
          <div className="bg-[linear-gradient(120deg,_#075985,_#0f172a_70%)] px-5 py-8 sm:px-9 sm:py-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200 ring-1 ring-emerald-300/30">{completionText}</span>
                <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-4xl">Nice work!</h1>
                <p className="mt-2 text-sm font-medium text-sky-100 sm:text-base">{topic || sectionTitle || 'Practice results'}</p>
                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-200 sm:text-base">{encouragement}</p>
              </div>
              <div className="relative grid h-24 w-24 place-items-center self-start rounded-3xl bg-white/10 ring-1 ring-white/15 sm:h-28 sm:w-28" style={{ background: `conic-gradient(#38bdf8 ${metrics.accuracy * 3.6}deg, rgba(255,255,255,.12) 0deg)` }}>
                <div className="grid h-[calc(100%-10px)] w-[calc(100%-10px)] place-items-center rounded-[1.2rem] bg-slate-950 text-center sm:rounded-[1.35rem]">
                  <span className="text-2xl">{metrics.accuracy >= 80 ? '🏆' : '✨'}</span>
                  <span className="text-xs font-black text-sky-200">{metrics.accuracy}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-y divide-white/10 border-t border-white/10 sm:grid-cols-4 sm:divide-y-0">
            <div className="p-4 sm:p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Accuracy</p><p className="mt-1 text-2xl font-black text-white sm:text-3xl">{metrics.accuracy}%</p></div>
            <div className="p-4 sm:p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Correct</p><p className="mt-1 text-2xl font-black text-emerald-300 sm:text-3xl">{metrics.correct}<span className="text-base text-slate-400">/{metrics.total}</span></p></div>
            <div className="p-4 sm:p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Time</p><p className="mt-1 text-2xl font-black text-white sm:text-3xl">{formatDuration(metrics.timeElapsed)}</p></div>
            <div className="p-4 sm:p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Average</p><p className="mt-1 text-2xl font-black text-white sm:text-3xl">{formatDuration(metrics.averageTime)}</p></div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-black text-slate-900 sm:text-xl">Practice summary</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-sky-50 p-4"><Icon className="bg-sky-100">📝</Icon><p className="mt-3 text-sm text-slate-500">Answered</p><p className="text-2xl font-black text-slate-900">{metrics.answered}</p></div>
              <div className="rounded-2xl bg-emerald-50 p-4"><Icon className="bg-emerald-100">✓</Icon><p className="mt-3 text-sm text-slate-500">Correct</p><p className="text-2xl font-black text-slate-900">{metrics.correct}</p></div>
              <div className="rounded-2xl bg-amber-50 p-4"><Icon className="bg-amber-100">↷</Icon><p className="mt-3 text-sm text-slate-500">Skipped</p><p className="text-2xl font-black text-slate-900">{metrics.skipped}</p></div>
            </div>
          </div>

          <aside className="rounded-3xl border border-sky-100 bg-sky-50 p-5 shadow-sm sm:p-6">
            <p className="text-sm font-black text-sky-950">Continue learning</p>
            <p className="mt-1 text-xs leading-5 text-sky-800">Choose a verified topic with available questions.</p>
            <div className="mt-4 space-y-3">
              <button onClick={() => repeatTopic && window.location.assign(practiceUrl(repeatTopic.id))} disabled={isCheckingTopics || !repeatTopic} className="flex min-h-14 w-full items-center justify-between rounded-2xl bg-white px-4 text-left text-sm font-bold text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-sky-400"><span><span className="block">{isCheckingTopics ? 'Checking this topic…' : repeatTopic ? `Repeat: ${repeatTopic.name}` : 'Repeat unavailable'}</span><span className="mt-0.5 block text-xs font-medium text-slate-500">Practice this same topic or subtopic again</span></span><span className="grid h-8 w-8 place-items-center rounded-full bg-sky-100 text-base text-sky-700" aria-hidden="true">↻</span></button>
              <button onClick={() => nextTopic && window.location.assign(practiceUrl(nextTopic.id))} disabled={isCheckingTopics || !nextTopic} className="flex min-h-14 w-full items-center justify-between rounded-2xl bg-sky-600 px-4 text-left text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"><span><span className="block">{isCheckingTopics ? 'Checking next topic…' : nextTopic ? `Next: ${nextTopic.name}` : 'No next topic available'}</span><span className="mt-0.5 block text-xs font-medium text-sky-100">{nextTopic?.is_subtopic ? 'Continue with the next subtopic' : 'Continue with the next topic'}</span></span><span className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-base" aria-hidden="true">→</span></button>
            </div>
            {!isCheckingTopics && (!repeatTopic || !nextTopic) && <p className="mt-3 text-xs leading-5 text-slate-500">Topics without active, published questions are disabled or skipped automatically.</p>}
          </aside>
        </section>
      </div>
    </main>
  );
}
