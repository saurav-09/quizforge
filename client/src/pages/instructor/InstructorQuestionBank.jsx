import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Plus, Search, Trash2 } from "lucide-react";
import { useAuth } from "@clerk/react";

const emptyForm = { question: "", options: ["", "", "", ""], correctAnswer: "", explanation: "", topic: "", subtopic: "", difficulty: "medium", points: 1 };

function InstructorQuestionBank() {
  const { getToken } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadQuestions = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch("/api/question-bank", { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load question bank");
      setQuestions(data.questions || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [getToken]);

  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return questions.filter((item) => !term || [item.question, item.topic, item.subtopic].some((value) => value?.toLowerCase().includes(term)));
  }, [questions, search]);

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateOption = (index, value) => setForm((current) => ({ ...current, options: current.options.map((option, i) => i === index ? value : option) }));

  const saveQuestion = async (event) => {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      const token = await getToken();
      const response = await fetch(editingId ? `/api/question-bank/${editingId}` : "/api/question-bank", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save question");
      setNotice(editingId ? "Question updated." : "Question saved to your bank.");
      setForm(emptyForm); setEditingId(null); await loadQuestions();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const editQuestion = (item) => {
    setEditingId(item._id);
    setForm({ question: item.question, options: [...item.options], correctAnswer: item.correctAnswer, explanation: item.explanation || "", topic: item.topic, subtopic: item.subtopic || "", difficulty: item.difficulty || "medium", points: item.points || 1 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Delete this saved question? Existing quizzes are not changed.")) return;
    try {
      const token = await getToken();
      const response = await fetch(`/api/question-bank/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to delete question");
      setQuestions((current) => current.filter((item) => item._id !== id));
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header><p className="text-sm font-medium text-brand-violet">Instructor</p><h1 className="mt-1 text-2xl font-semibold text-text-primary">Question Bank</h1><p className="mt-2 text-sm text-text-secondary">Save questions once and reuse them in future quizzes.</p></header>
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
      <form onSubmit={saveQuestion} className="space-y-4 rounded-xl border border-border bg-white p-5">
        <div className="flex items-center justify-between"><h2 className="font-semibold text-text-primary">{editingId ? "Edit saved question" : "Add a question"}</h2>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="text-xs text-text-secondary hover:underline">Cancel edit</button>}</div>
        <textarea required value={form.question} onChange={(e) => updateField("question", e.target.value)} maxLength={3000} rows={2} placeholder="Write the question..." className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
        <div className="grid gap-2 sm:grid-cols-2">{form.options.map((option, index) => <div key={index} className="flex gap-2"><input required value={option} onChange={(e) => updateOption(index, e.target.value)} placeholder={`Option ${index + 1}`} className="h-10 min-w-0 flex-1 rounded-lg border border-border px-3 text-sm" /><label className="flex items-center gap-1 text-xs text-text-secondary"><input type="radio" name="correctAnswer" checked={form.correctAnswer === option && Boolean(option)} onChange={() => updateField("correctAnswer", option)} />Correct</label></div>)}</div>
        <div className="grid gap-3 sm:grid-cols-4">
          <input required value={form.topic} onChange={(e) => updateField("topic", e.target.value)} placeholder="Topic (required)" className="h-10 rounded-lg border border-border px-3 text-sm" />
          <input value={form.subtopic} onChange={(e) => updateField("subtopic", e.target.value)} placeholder="Subtopic" className="h-10 rounded-lg border border-border px-3 text-sm" />
          <select value={form.difficulty} onChange={(e) => updateField("difficulty", e.target.value)} className="h-10 rounded-lg border border-border px-3 text-sm"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
          <input type="number" min="1" value={form.points} onChange={(e) => updateField("points", Number(e.target.value))} className="h-10 rounded-lg border border-border px-3 text-sm" />
        </div>
        <textarea value={form.explanation} onChange={(e) => updateField("explanation", e.target.value)} rows={2} placeholder="Explanation (optional)" className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
        <button disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-violet px-4 text-sm font-medium text-white disabled:opacity-50"><Plus size={15} />{saving ? "Saving..." : editingId ? "Update question" : "Save question"}</button>
      </form>
      <section className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold text-text-primary">Saved questions ({filtered.length})</h2><div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search question or topic" className="h-9 w-64 rounded-lg border border-border pl-9 pr-3 text-sm" /></div></div>
        {loading ? <p className="text-sm text-text-secondary">Loading questions...</p> : filtered.length === 0 ? <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-secondary">No saved questions found.</p> : filtered.map((item) => <article key={item._id} className="rounded-xl border border-border bg-white p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm font-medium text-text-primary">{item.question}</p><p className="mt-2 text-xs text-text-secondary">{item.topic}{item.subtopic ? ` · ${item.subtopic}` : ""} · {item.difficulty} · {item.points} point(s)</p><p className="mt-1 text-xs text-text-secondary">Correct answer: {item.correctAnswer}</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => editQuestion(item)} className="text-xs font-medium text-brand-violet hover:underline">Edit</button><button type="button" onClick={() => deleteQuestion(item._id)} aria-label="Delete question" className="text-red-600"><Trash2 size={15} /></button></div></div></article>)}
      </section>
    </div>
  );
}
export default InstructorQuestionBank;
