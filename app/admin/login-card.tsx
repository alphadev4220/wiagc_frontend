"use client";

import { FormEvent, useState } from "react";
import { EVENT } from "../../lib/event";

// The login card, centred in the viewport. Replaces the browser's Basic-auth dialog, which
// appeared as an unstyled box pinned to the top-left corner and could not be dismissed or
// signed out of.
export default function LoginCard() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Sign in failed.");
      // Full reload rather than a client-side refresh: the page is a server component whose
      // whole tree depends on the cookie that was just set.
      window.location.reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign in failed.");
      setPassword("");
      setBusy(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <p className="eyebrow gold">Word In Action Global Conference</p>
        <h1>Conference office</h1>
        <p className="login-lead">
          Sign in to view delegate registrations for {EVENT.dates}.
        </p>
        <form onSubmit={submit}>
          <label>
            Username
            <input value={username} autoComplete="username" required
                   onChange={(event) => setUsername(event.target.value)} />
          </label>
          <label>
            Password
            {/* autoFocus on the password, not the username: the username is prefilled and the
                password is the only field anyone actually types. */}
            <input type="password" value={password} autoComplete="current-password" required autoFocus
                   onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error && <div className="error-message" role="alert">{error}</div>}
          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="login-foot">
          This page holds delegates&apos; personal details. Do not share the password.
        </p>
      </section>
    </main>
  );
}
