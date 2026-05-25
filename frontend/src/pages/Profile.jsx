import { useEffect, useState } from 'react';
import Avatar from '../Avatar.jsx';
import { api, apiUrl } from '../api.js';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const res = await api('/api/profile');
      if (res.status === 401) {
        setNeedsLogin(true);
        return;
      }
      setUser(await res.json());
    }
    loadProfile();
  }, []);

  if (needsLogin) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-lg border border-line bg-surface p-8 text-center">
          <p className="mb-4 text-ink-muted">Log in to view your profile.</p>
          <a
            href={apiUrl('/login')}
            className="inline-block rounded-md bg-accent px-4 py-2 text-sm font-semibold text-canvas hover:brightness-110"
          >
            Log in
          </a>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <p className="text-ink-muted">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-8 font-display text-4xl font-bold uppercase tracking-tight">
        Profile
      </h1>
      <div className="rounded-lg border border-line bg-surface p-8">
        <div className="flex items-center gap-5">
          <Avatar name={user.name} email={user.email} />
          <div>
            <p className="font-display text-xl font-semibold">{user.name}</p>
            <p className="text-sm text-ink-muted">{user.email}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
