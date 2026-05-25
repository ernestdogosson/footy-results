import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, apiUrl } from './api.js';

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 200 = logged in, 401 = anonymous
    async function loadUser() {
      const res = await api('/api/profile');
      if (res.ok) setUser(await res.json());
    }
    loadUser();
  }, []);

  return (
    <header className="border-b border-line bg-canvas">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span className="font-display text-xl font-bold uppercase tracking-tight">
            Pitchside Scores
          </span>
        </Link>
        <div className="flex items-center gap-6">
          {user && (
            <Link to="/profile" className="text-sm text-ink-muted hover:text-ink">
              Profile
            </Link>
          )}
          {/* plain anchor, /login and /logout are Auth0 redirects handled by the backend */}
          <a
            href={apiUrl(user ? '/logout' : '/login')}
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-canvas hover:brightness-110"
          >
            {user ? 'Log out' : 'Log in'}
          </a>
        </div>
      </div>
    </header>
  );
}
