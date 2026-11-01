import { useCallback, useEffect, useState } from "react";
import { Activity, RefreshCw } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@clerk/react";

function InstructorLiveTestMonitor() {
  const { quizId } = useParams();
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadMonitor = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/quizzes/${quizId}/monitor`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to load test progress");
      setData(result);
      setLastUpdated(new Date());
      setError("");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [getToken, quizId]);

  useEffect(() => {
    loadMonitor();
    const intervalId = window.setInterval(loadMonitor, 10000);
    return () => window.clearInterval(intervalId);
  }, [loadMonitor]);

  const stats = data?.analytics || {};
  const participants = data?.participants || [];
  const statusLabel = { "not-started": "Not started", "in-progress": "In progress", submitted: "Submitted", expired: "Expired" };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><Link to="/instructor/quizzes" className="text-xs font-medium text-brand-violet hover:underline">← Back to quizzes</Link><h1 className="mt-2 text-2xl font-semibold text-text-primary">Live Test Monitor</h1><p className="mt-1 text-sm text-text-secondary">{data?.quiz?.title || "Track participant progress without revealing scores."}</p></div><button type="button" onClick={loadMonitor} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm"><RefreshCw size={14} />Refresh</button></div>
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading && !data ? <p className="text-sm text-text-secondary">Loading participant progress...</p> : <>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[["Participants",stats.participants],["Not started",stats.notStarted],["In progress",stats.inProgress],["Submitted",stats.submitted],["Expired",stats.expired]].map(([label,value]) => <div key={label} className="rounded-xl border border-border bg-white p-4"><p className="text-xs text-text-secondary">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums text-text-primary">{value ?? 0}</p></div>)}
        </div>
        <section className="overflow-hidden rounded-xl border border-border bg-white">
          <div className="flex items-center justify-between border-b border-border p-4"><h2 className="font-semibold text-text-primary">Student progress</h2><span className="text-xs text-text-secondary">Updates every 10 seconds</span></div>
          {participants.length === 0 ? <p className="p-8 text-center text-sm text-text-secondary">No students have joined this test yet.</p> : <div className="divide-y divide-border">{participants.map((participant) => <div key={participant.student._id} className="grid gap-3 p-4 sm:grid-cols-[1fr_1.2fr_auto] sm:items-center"><div className="min-w-0"><p className="truncate text-sm font-medium text-text-primary">{participant.student.name}</p><p className="truncate text-xs text-text-secondary">{participant.student.email}</p></div><div><div className="flex justify-between text-xs text-text-secondary"><span>{participant.answeredQuestions}/{participant.totalQuestions} answered</span><span>{participant.progressPercentage}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-surface"><div className="h-full rounded-full bg-brand-violet" style={{ width: `${participant.progressPercentage}%` }} /></div><p className="mt-1 text-xs text-text-secondary">{participant.unansweredQuestions} unanswered</p></div><span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary"><Activity size={13} />{statusLabel[participant.status] || participant.status}</span></div>)}</div>}
        </section>
        <p className="text-xs text-text-secondary">This monitor shows answer progress and submission status only. It does not show marks, correctness, or rankings.</p>
        {lastUpdated && <p className="text-right text-xs text-text-secondary">Last updated: {lastUpdated.toLocaleTimeString()}</p>}
      </>}
    </div>
  );
}
export default InstructorLiveTestMonitor;
