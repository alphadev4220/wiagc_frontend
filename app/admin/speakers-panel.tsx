"use client";

import { FormEvent, useState } from "react";
import { GROUPS, photoUrl, type Speaker } from "../../lib/speakers";

// Add, edit, reorder and remove the people shown on the public home page.
//
// Everything posts as multipart/form-data because a portrait comes with it. The form is
// uncontrolled -- defaultValue rather than useState per field -- so editing a bio does not
// re-render the panel on every keystroke, and so the file input keeps the browser's own
// behaviour instead of being fought with React state it cannot hold anyway.
const BLANK = { id: 0, group: "guest", name: "", country: "", role: "", bio: "", photoPath: "", photoType: "", sortOrder: 0 };

export default function SpeakersPanel({ speakers }: { speakers: Speaker[] }) {
  const [editing, setEditing] = useState<Speaker | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const id = editing?.id;
    try {
      const response = await fetch(id ? `/api/admin/speakers/${id}` : "/api/admin/speakers",
        { method: "POST", body: form });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not save.");
      window.location.reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save.");
      setBusy(false);
    }
  }

  async function remove(person: Speaker) {
    // A speaker removed here disappears from the public site immediately, and the photo bytes go
    // with them. Worth one confirm.
    if (!window.confirm(`Remove ${person.name} from the public site? This cannot be undone.`)) return;
    setBusy(true);
    await fetch(`/api/admin/speakers/${person.id}`, { method: "DELETE" });
    window.location.reload();
  }

  const current = editing ?? (BLANK as Speaker);
  const byGroup = GROUPS.map((g) => ({ ...g, people: speakers.filter((s) => s.group === g.value) }));

  return (
    <>
      <section className="panel-form">
        <h2>{editing ? `Editing ${editing.name}` : "Add someone to the public site"}</h2>
        <form onSubmit={submit} key={editing?.id ?? "new"}>
          <div className="admin-formgrid">
            <label>
              Section
              <select name="group" defaultValue={current.group}>
                {GROUPS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </label>
            <label>
              Name *
              <input name="name" defaultValue={current.name} required
                     placeholder="Apostle Jane Doe" />
            </label>
            <label>
              Country or city
              <input name="country" defaultValue={current.country} placeholder="South Africa" />
            </label>
            <label>
              Label
              <input name="role" defaultValue={current.role}
                     placeholder="left blank, uses the section's own label" />
            </label>
            <label>
              Order
              {/* Lower numbers come first WITHIN a section. Plain numbers rather than drag and
                  drop: the office edits this rarely and a number is unambiguous over the phone. */}
              <input name="sortOrder" type="number" defaultValue={current.sortOrder} step={10} />
            </label>
            <label>
              Photo{editing ? " (leave empty to keep the current one)" : ""}
              <input name="photo" type="file" accept="image/*" />
            </label>
            <label className="full">
              Statement
              <textarea name="bio" defaultValue={current.bio} rows={5}
                        placeholder="Optional. Cards without one show just the name and country." />
            </label>
            {editing && (photoUrl(editing) ? (
              <label className="admin-clear">
                <input name="clearPhoto" type="checkbox" value="1" />
                <span>Remove the current photo</span>
              </label>
            ) : null)}
          </div>
          {error && <div className="error-message" role="alert">{error}</div>}
          <div className="admin-formactions">
            <button className="primary-button" type="submit" disabled={busy}>
              {busy ? "Saving…" : editing ? "Save changes" : "Add to the site"}
            </button>
            {editing && (
              <button type="button" className="secondary-button" onClick={() => { setEditing(null); setError(""); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {byGroup.map((g) => (
        <section className="panel-form" key={g.value}>
          <h2>{g.label} <span className="admin-count">{g.people.length}</span></h2>
          {g.people.length === 0
            ? <p className="admin-empty">Nobody in this section yet.</p>
            : (
              <div className="speaker-rows">
                {g.people.map((person) => {
                  const url = photoUrl(person);
                  return (
                    <div className="speaker-row" key={person.id}>
                      <div className="speaker-thumb">
                        {url
                          ? <img src={url} alt={person.name} />
                          : <span className="admin-dim">no photo</span>}
                      </div>
                      <div className="speaker-meta">
                        <strong>{person.name}</strong>
                        <span className="admin-dim">
                          {[person.country, person.role, `order ${person.sortOrder}`]
                            .filter(Boolean).join(" · ")}
                        </span>
                        <span className="admin-dim speaker-bio">
                          {person.bio || "No statement — the card shows name and country only."}
                        </span>
                      </div>
                      <div className="speaker-acts">
                        <button className="admin-toggle" onClick={() => {
                          setEditing(person); setError("");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}>Edit</button>
                        <button className="admin-toggle danger" onClick={() => remove(person)}>Remove</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </section>
      ))}
    </>
  );
}
