import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";
import { useAuth } from "@clerk/react";
import { useLocation } from "react-router-dom";

function StudentRooms() {
  const { getToken } = useAuth();
  const location = useLocation();
  const [rooms, setRooms] = useState([]);
  const [code, setCode] = useState(() => new URLSearchParams(location.search).get("code") || "");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadRooms = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch("/api/rooms/joined", { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load rooms");
      setRooms(data.rooms || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [getToken]);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  const joinRoom = async (event) => {
    event.preventDefault(); setJoining(true); setError(""); setNotice("");
    try {
      const token = await getToken();
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to join room");
      setNotice(data.alreadyMember ? "You are already a member of this room." : `You joined ${data.room.name} successfully.`);
      setCode(""); await loadRooms();
    } catch (err) { setError(err.message); }
    finally { setJoining(false); }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header><p className="text-sm font-medium text-brand-violet">Student</p><h1 className="mt-1 text-2xl font-semibold text-text-primary">My Rooms</h1><p className="mt-2 text-sm text-text-secondary">Join a class using the room code shared by your instructor.</p></header>
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
      <form onSubmit={joinRoom} className="flex flex-col gap-3 rounded-xl border border-border bg-white p-5 sm:flex-row">
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={10} minLength={10} required placeholder="Enter 10-character room code" className="h-10 flex-1 rounded-lg border border-border px-3 text-sm uppercase tracking-widest" />
        <button disabled={joining || code.trim().length !== 10} className="h-10 rounded-lg bg-brand-violet px-5 text-sm font-medium text-white disabled:opacity-50">{joining ? "Joining..." : "Join room"}</button>
      </form>
      <section className="space-y-3"><h2 className="font-semibold text-text-primary">Joined rooms</h2>
        {loading ? <p className="text-sm text-text-secondary">Loading rooms...</p> : rooms.length === 0 ? <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-secondary">You have not joined any rooms yet.</p> : <div className="grid gap-3 sm:grid-cols-2">{rooms.map((room) => <article key={room._id} className="rounded-xl border border-border bg-white p-5"><div className="flex items-center gap-2"><Users size={17} className="text-brand-violet" /><h3 className="font-semibold text-text-primary">{room.name}</h3></div><p className="mt-2 text-sm text-text-secondary">{room.description || "Class room"}</p><p className="mt-3 text-xs text-text-secondary">Instructor: {room.instructor?.name || "Instructor"}</p></article>)}</div>}
      </section>
    </div>
  );
}
export default StudentRooms;
