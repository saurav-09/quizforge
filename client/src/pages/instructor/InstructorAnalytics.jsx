import { useCallback, useEffect, useState } from "react";
import { BarChart3, BookOpen, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/react";

function InstructorAnalytics() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch("/api/quizzes/analytics/overview", { headers: { Authorization: "Bearer " + token } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to load analytics");
      setData(result);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [getToken]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);
  const overview = data?.overview || {};
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header><p className="text-sm font-medium text-brand-violet">Instructor</p><h1 className="mt-1 text-2xl font-semibold text-text-primary">Analytics</h1><p className="mt-2 text-sm text-text-secondary">Review participation and performance across your quizzes and tests.</p></header>
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? <p className="text-sm text-text-secondary">Loading analytics...</p> : <>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[[BookOpen,"Quizzes",overview.totalQuizzes || 0],[Users,"Submitted attempts",overview.totalAttempts || 0],[TrendingUp,"Average score",(overview.averagePercentage || 0) + "%"],[BarChart3,"Active attempts",overview.activeParticipants || 0]].map(([Icon,label,value]) => <div key={label} className="rounded-xl border border-border bg-white p-4"><div className="flex items-center gap-2 text-text-secondary"><Icon size={16}/><span className="text-xs">{label}</span></div><p className="mt-2 text-2xl font-semibold text-text-primary">{value}</p></div>)}
        </div>
        <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-border bg-white p-4"><p className="text-xs text-text-secondary">Passed (50% or above)</p><p className="mt-1 text-xl font-semibold text-emerald-600">{overview.passed || 0}</p></div><div className="rounded-xl border border-border bg-white p-4"><p className="text-xs text-text-secondary">Needs improvement (below 50%)</p><p className="mt-1 text-xl font-semibold text-amber-600">{overview.needsImprovement || 0}</p></div></div>
        <section className="overflow-hidden rounded-xl border border-border bg-white"><div className="border-b border-border p-4"><h2 className="font-semibold text-text-primary">Quiz performance</h2></div>{!data?.quizPerformance?.length ? <p className="p-8 text-center text-sm text-text-secondary">Create and publish a quiz to start collecting analytics.</p> : <div className="divide-y divide-border">{data.quizPerformance.map((quiz) => <div key={quiz.quizId} className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="min-w-0"><p className="truncate text-sm font-medium text-text-primary">{quiz.title}</p><p className="mt-1 text-xs capitalize text-text-secondary">{quiz.mode} · {quiz.status} · {quiz.participants} submissions</p></div><div className="flex items-center gap-4 text-right"><div><p className="text-sm font-semibold text-text-primary">{quiz.averagePercentage}%</p><p className="text-xs text-text-secondary">Average</p></div><Link to={"/instructor/results/" + quiz.quizId} className="text-xs font-medium text-brand-violet hover:underline">Details</Link></div></div>)}</div>}</section>
      </>}
    </div>
  );
}
export default InstructorAnalytics;
