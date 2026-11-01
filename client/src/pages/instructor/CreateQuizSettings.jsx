import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Shuffle,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";

function CreateQuizSettings() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken } = useAuth();

 const quizData = location.state || {};

const searchParams = new URLSearchParams(
  location.search
);

const quizId =
  searchParams.get("quizId") ||
  quizData.quizId;

  const isEditMode = Boolean(quizId);

  const [settings, setSettings] = useState({
    timeLimit: 30,
    noTimeLimit: false,
    attemptsAllowed: 1,
    unlimitedAttempts: quizData.quizMode === "practice",
    shuffleQuestions: false,
    shuffleOptions: false,
    allowBackNavigation: true,
    negativeMarkingEnabled: false,
    negativeMarkingPoints: 0,
  });

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [rooms, setRooms] = useState([]);
  const [assignedRooms, setAssignedRooms] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!quizId) {
      setLoading(false);
      return;
    }

    const fetchQuizSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const token = await getToken();

        const response = await fetch(`/api/quizzes/${quizId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load quiz settings"
          );
        }

        const quiz = data.quiz;
        const existingSettings = quiz.settings || {};
        setAssignedRooms((quiz.assignedRooms || []).map((room) => String(room._id || room)));

        setSettings({
          timeLimit: existingSettings.timeLimit ?? 30,
          noTimeLimit: existingSettings.timeLimit === 0,
          attemptsAllowed:
            existingSettings.attemptsAllowed || 1,
          shuffleQuestions: existingSettings.shuffleQuestions || false,
          shuffleOptions: existingSettings.shuffleOptions || false,
          allowBackNavigation: existingSettings.allowBackNavigation !== false,
          negativeMarkingEnabled: existingSettings.negativeMarkingEnabled || false,
          negativeMarkingPoints: existingSettings.negativeMarkingPoints || 0,
          unlimitedAttempts: existingSettings.unlimitedAttempts ?? quiz.settings?.quizMode === "practice",
        });

        if (quiz.startTime) {
          const date = new Date(quiz.startTime);

          const localDateTime = new Date(
            date.getTime() -
              date.getTimezoneOffset() * 60000
          )
            .toISOString()
            .slice(0, 16);

          setStartTime(localDateTime);
        }
        if (quiz.endTime) {
          const date = new Date(quiz.endTime);
          setEndTime(new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
        }
      } catch (error) {
        console.error(
          "Fetch quiz settings error:",
          error
        );

        setError(
          error.message || "Failed to load quiz settings"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuizSettings();
  }, [quizId]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = await getToken();
        const response = await fetch("/api/rooms/my", { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (response.ok) setRooms(data.rooms || []);
      } catch (roomError) { console.error("Load rooms error:", roomError); }
    };
    fetchRooms();
  }, [getToken]);

  const toggleRoom = (roomId) => setAssignedRooms((current) => current.includes(roomId) ? current.filter((id) => id !== roomId) : [...current, roomId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "noTimeLimit") {
      setSettings((prev) => ({ ...prev, noTimeLimit: checked, timeLimit: checked ? 0 : 30 }));
      return;
    }
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : Number(value),
    }));
  };

const handleContinue = () => {
  if (!quizData) {
    return;
  }

  if (quizData.quizMode === "practice" && assignedRooms.length === 0) {
    setError("Select at least one room for this practice quiz.");
    return;
  }

  if (quizData.quizMode === "test" && startTime && endTime && new Date(endTime) <= new Date(startTime)) {
    setError("Test end time must be after its start time.");
    return;
  }

  if (
    (!settings.noTimeLimit && settings.timeLimit < 1) ||
    (!settings.unlimitedAttempts && settings.attemptsAllowed < 1)
  ) {
    setError(
      "Time limit and attempts allowed must be at least 1."
    );
    return;
  }

  setError("");

  const params = new URLSearchParams();

  if (quizId) {
    params.set("quizId", quizId);
  }

  navigate(
    `/instructor/quizzes/create/preview${
      params.toString()
        ? `?${params.toString()}`
        : ""
    }`,
    {
      state: {
        ...quizData,
        settings: { ...settings, timeLimit: settings.noTimeLimit ? 0 : settings.timeLimit, unlimitedAttempts: quizData.quizMode === "practice" && settings.unlimitedAttempts },
        assignedRooms,
        assignedStudents: quizData.assignedStudents || [],
        startTime: quizData.quizMode === "test" && startTime ? startTime : null,
        endTime: quizData.quizMode === "test" && endTime ? endTime : null,
        quizId,
        isEditMode,
      },
    }
  );
};

  if (!quizData) {
    return (
      <div className="text-sm text-text-secondary">
        Quiz information not found.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-text-secondary">
          Loading settings...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/instructor/quizzes/create/questions"
          state={quizData}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface hover:text-text-primary"
        >
          <ArrowLeft size={17} />
        </Link>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-text-primary">
            {isEditMode ? "Edit Quiz Settings" : "Quiz Settings"}
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Configure how students will take this quiz.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* General Settings */}
      <div className="rounded-xl border border-border bg-white p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-text-primary">
          General settings
        </h3>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-primary">
              Time limit
            </label>

            <label className="mb-2 flex items-center gap-2 text-xs text-text-secondary"><input name="noTimeLimit" type="checkbox" checked={settings.noTimeLimit} onChange={handleChange} className="h-4 w-4 accent-[#8B5CF6]" /> No time limit</label>
            <div className="relative">
              <Clock3
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
              />

              <input
                name="timeLimit"
                type="number"
                min="1"
                value={settings.timeLimit}
                onChange={handleChange}
                disabled={settings.noTimeLimit}
                className="h-10 w-full rounded-lg border border-border pl-9 pr-3 text-sm outline-none focus:border-[#8B5CF6] disabled:bg-surface disabled:text-text-secondary"
              />
            </div>

            <p className="mt-1 text-xs text-text-secondary">
              Time in minutes.
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-text-primary">
              <input name="unlimitedAttempts" type="checkbox" checked={settings.unlimitedAttempts} onChange={handleChange} disabled={quizData.quizMode === "test"} className="h-4 w-4 accent-[#8B5CF6]" />
              Unlimited attempts
            </label>
            {!settings.unlimitedAttempts && <><label className="mb-1.5 mt-3 block text-xs font-medium text-text-primary">
              Attempts allowed
            </label>

            <input
              name="attemptsAllowed"
              type="number"
              min="1"
              value={settings.attemptsAllowed}
              onChange={handleChange}
              className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-[#8B5CF6]"
            />

            <p className="mt-1 text-xs text-text-secondary">
              Maximum attempts per student.
            </p></>}
          </div>
        </div>
      </div>

      {/* Quiz Behavior */}
      <div className="rounded-xl border border-border bg-white p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-text-primary">
          Quiz behavior
        </h3>

        <div className="mt-4 space-y-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              name="shuffleQuestions"
              type="checkbox"
              checked={settings.shuffleQuestions}
              onChange={handleChange}
              className="mt-0.5 h-4 w-4 accent-[#8B5CF6]"
            />

            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <Shuffle size={15} />
                Shuffle questions
              </div>

              <p className="mt-1 text-xs text-text-secondary">
                Show questions in a different order for each attempt.
              </p>
            </div>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input name="shuffleOptions" type="checkbox" checked={settings.shuffleOptions} onChange={handleChange} className="mt-0.5 h-4 w-4 accent-[#8B5CF6]" />
            <span><span className="block text-sm font-medium text-text-primary">Shuffle answer options</span><span className="mt-1 block text-xs text-text-secondary">Randomize option order for each attempt.</span></span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input name="allowBackNavigation" type="checkbox" checked={settings.allowBackNavigation} onChange={handleChange} className="mt-0.5 h-4 w-4 accent-[#8B5CF6]" />
            <span><span className="block text-sm font-medium text-text-primary">Allow previous-question navigation</span><span className="mt-1 block text-xs text-text-secondary">Students can revisit and change saved answers.</span></span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input name="negativeMarkingEnabled" type="checkbox" checked={settings.negativeMarkingEnabled} onChange={handleChange} className="mt-0.5 h-4 w-4 accent-[#8B5CF6]" />
            <span><span className="block text-sm font-medium text-text-primary">Enable negative marking</span><span className="mt-1 block text-xs text-text-secondary">Apply a penalty for incorrect answers.</span></span>
          </label>
          {settings.negativeMarkingEnabled && <div className="max-w-xs"><label className="mb-1 block text-xs font-medium text-text-primary">Penalty per incorrect answer</label><input name="negativeMarkingPoints" type="number" min="0" step="0.25" value={settings.negativeMarkingPoints} onChange={handleChange} className="h-10 w-full rounded-lg border border-border px-3 text-sm" /></div>}
        </div>
      </div>

      {quizData.quizMode === "practice" && <div className="rounded-xl border border-border bg-white p-4 sm:p-6"><h3 className="text-sm font-semibold text-text-primary">Assign to rooms</h3><p className="mt-1 text-xs text-text-secondary">Only students in selected rooms can access this practice quiz.</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{rooms.length === 0 ? <p className="text-sm text-text-secondary">Create a room first to assign practice quizzes.</p> : rooms.map((room) => <label key={room._id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm"><input type="checkbox" checked={assignedRooms.includes(String(room._id))} onChange={() => toggleRoom(String(room._id))} className="h-4 w-4 accent-[#8B5CF6]" /><span className="text-text-primary">{room.name}</span><span className="ml-auto text-xs text-text-secondary">{room.members?.length || 0} students</span></label>)}</div></div>}

      {/* Test Schedule */}
      {quizData.quizMode === "test" && (
        <div className="rounded-xl border border-border bg-white p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-text-primary">
            Test schedule
          </h3>

          <p className="mt-1 text-sm text-text-secondary">
            Optionally set when the test opens and when it closes. Leave blank to make it available immediately with no closing time.
          </p>

          <div className="mt-5">
            <label className="mb-1.5 block text-xs font-medium text-text-primary">
              Starting time
            </label>

            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) =>
                setStartTime(e.target.value)
              }
              className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-[#8B5CF6] sm:max-w-sm"
            />

            <p className="mt-1 text-xs text-text-secondary">Leave blank to allow students to start immediately.</p>
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-text-primary">Availability end (optional)</label>
            <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-[#8B5CF6] sm:max-w-sm" />
            <p className="mt-1 text-xs text-text-secondary">Students cannot start after this time; active attempts also expire at the deadline.</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Link
          to="/instructor/quizzes/create/questions"
          state={quizData}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary"
        >
          <ArrowLeft size={15} />
          Back
        </Link>

        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#8B5CF6] px-4 text-sm font-medium text-white hover:bg-[#7C3AED]"
        >
          Preview
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

export default CreateQuizSettings;