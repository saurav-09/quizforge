import { useCallback, useEffect, useState } from "react";
import { BarChart3, Target, TrendingUp } from "lucide-react";
import { useAuth } from "@clerk/react";

function StudentPerformance() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch("/api/quiz-attempts/analytics/me", { headers: { Authorization: "Bearer " + token } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to load analytics");
      setData(result);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [getToken]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  const summary = data?.summary || {};
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header><p className="text-sm font-medium text-brand-violet">Student</p><h1 className="mt-1 text-2xl font-semibold text-text-primary">My Performance</h1><p className="mt-2 text-sm text-text-secondary">Understand your progress and identify topics that need more practice.</p></header>
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? <p className="text-sm text-text-secondary">Loading your performance...</p> : <>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[[ "Quizzes attempted", summary.totalQuizzesAttempted || 0 ],[ "Results available", summary.resultsAvailable || 0 ],[ "Average score", (summary.averageScore || 0) + "%" ],[ "Best score", (summary.highestScore || 0) + "%" ]].map(([label,value]) => <div key={label} className="rounded-xl border border-border bg-white p-4"><p className="text-xs text-text-secondary">{label}</p><p className="mt-1 text-2xl font-semibold text-text-primary">{value}</p></div>)}
        </div>
        <section className="rounded-xl border border-border bg-white p-5"><div className="flex items-center gap-2"><BarChart3 size={18} className="text-brand-violet" /><h2 className="font-semibold text-text-primary">Topic-wise accuracy</h2></div>
          {!data?.topics?.length ? <p className="mt-4 text-sm text-text-secondary">Topic analytics will appear after you complete quizzes with released results.</p> : <div className="mt-4 space-y-4">{data.topics.map((topic) => <div key={topic.topic}><div className="flex justify-between gap-3 text-sm"><span className="font-medium text-text-primary">{topic.topic}</span><span className="text-text-secondary">{topic.accuracy}% ({topic.correct}/{topic.answered})</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-surface"><div className="h-full rounded-full bg-brand-violet" style={{ width: topic.accuracy + "%" }} /></div></div>)}</div>}
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-xl border border-border bg-white p-5"><div className="flex items-center gap-2"><Target size={18} className="text-amber-600" /><h2 className="font-semibold text-text-primary">Topics to improve</h2></div>{data?.weakTopics?.length ? <ul className="mt-3 space-y-2">{data.weakTopics.map((topic) => <li key={topic.topic} className="rounded-lg bg-surface p-3"><p className="text-sm font-medium text-text-primary">{topic.topic}</p><p className="mt-1 text-xs text-text-secondary">{topic.accuracy}% accuracy — try another practice quiz on this topic.</p></li>)}</ul> : <p className="mt-3 text-sm text-text-secondary">No weak topics identified yet. Keep attempting quizzes to build a useful history.</p>}</section>
          <section className="rounded-xl border border-border bg-white p-5"><div className="flex items-center gap-2"><TrendingUp size={18} className="text-emerald-600" /><h2 className="font-semibold text-text-primary">Recent activity</h2></div>{data?.recentHistory?.length ? <ul className="mt-3 space-y-2">{data.recentHistory.map((item) => <li key={item.attemptId} className="flex items-center justify-between gap-3 rounded-lg bg-surface p-3"><span className="min-w-0 truncate text-sm text-text-primary">{item.title}</span><span className="shrink-0 text-xs text-text-secondary">{item.resultAvailable ? item.percentage + "%" : "Result pending"}</span></li>)}</ul> : <p className="mt-3 text-sm text-text-secondary">Your submitted quizzes will appear here.</p>}</section>
        </div>
      </>}
    </div>
  );
}
export default StudentPerformance;
