import { useCallback, useEffect, useState } from "react";
import { Copy, Plus, Trash2, Users } from "lucide-react";
import { useAuth } from "@clerk/react";

function InstructorRooms() {
  const { getToken } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadRooms = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch("/api/rooms/my", { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load rooms");
      setRooms(data.rooms || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  const createRoom = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const token = await getToken();
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, description }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to create room");
      setRooms((current) => [data.room, ...current]);
      setName(""); setDescription("");
      setNotice("Room created. Share its code with your students.");
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const removeMember = async (roomId, studentId) => {
    setError(""); setNotice("");
    try {
      const token = await getToken();
      const response = await fetch(`/api/rooms/${roomId}/members/${studentId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to remove student");
      setRooms((current) => current.map((room) => room._id === roomId ? data.room : room));
    } catch (err) { setError(err.message); }
  };

  const archiveRoom = async (roomId) => {
    if (!window.confirm("Archive this room? Students will no longer be able to join it.")) return;
    try {
      const token = await getToken();
      const response = await fetch(`/api/rooms/${roomId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to archive room");
      setRooms((current) => current.filter((room) => room._id !== roomId));
    } catch (err) { setError(err.message); }
  };

  const copyCode = async (code) => {
    try { await navigator.clipboard.writeText(code); setNotice("Room code copied."); }
    catch { setNotice("Room code: " + code); }
  };
  const copyInviteLink = async (code) => {
    const link = window.location.origin + "/student/rooms?code=" + encodeURIComponent(code);
    try { await navigator.clipboard.writeText(link); setNotice("Invitation link copied."); }
    catch { setNotice(link); }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header><p className="text-sm font-medium text-brand-violet">Instructor</p><h1 className="mt-1 text-2xl font-semibold text-text-primary">My Rooms</h1><p className="mt-2 text-sm text-text-secondary">Create rooms for your classes and manage student membership.</p></header>
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
      <form onSubmit={createRoom} className="space-y-3 rounded-xl border border-border bg-white p-5">
        <h2 className="font-semibold text-text-primary">Create a room</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required placeholder="Room name (e.g. Java CSE-A)" className="h-10 rounded-lg border border-border px-3 text-sm" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} placeholder="Description (optional)" className="h-10 rounded-lg border border-border px-3 text-sm" />
        </div>
        <button disabled={saving || !name.trim()} className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-violet px-4 text-sm font-medium text-white disabled:opacity-50"><Plus size={16} />{saving ? "Creating..." : "Create room"}</button>
      </form>
      <section className="space-y-3">
        <h2 className="font-semibold text-text-primary">Your rooms</h2>
        {loading ? <p className="text-sm text-text-secondary">Loading rooms...</p> : rooms.length === 0 ? <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-secondary">You have not created any rooms yet.</p> : rooms.map((room) => (
          <article key={room._id} className="rounded-xl border border-border bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="font-semibold text-text-primary">{room.name}</h3><p className="mt-1 text-sm text-text-secondary">{room.description || "No description"}</p><p className="mt-2 text-xs text-text-secondary">{room.members?.length || 0} students</p></div>
              <div className="flex gap-2"><button type="button" onClick={() => copyCode(room.code)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-medium"><Copy size={14} />{room.code}</button><button type="button" onClick={() => copyInviteLink(room.code)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-medium">Copy invite link</button><button type="button" onClick={() => archiveRoom(room._id)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs text-red-600"><Trash2 size={14} />Archive</button></div>
            </div>
            <div className="mt-4 border-t border-border pt-3">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-text-secondary"><Users size={14} /> Members</p>
              {room.members?.length ? <div className="space-y-2">{room.members.map((member) => <div key={member._id} className="flex items-center justify-between gap-3 text-sm"><span className="min-w-0 truncate text-text-primary">{member.name} <span className="text-xs text-text-secondary">{member.email}</span></span><button type="button" onClick={() => removeMember(room._id, member._id)} className="text-xs text-red-600 hover:underline">Remove</button></div>)}</div> : <p className="text-xs text-text-secondary">No students have joined yet. Share the room code to invite them.</p>}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
export default InstructorRooms;
