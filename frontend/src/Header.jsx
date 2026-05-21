import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 200 = logged in, 401 = anonymous
    async function loadUser() {
      const res = await fetch('/api/profile');
      if (res.ok) setUser(await res.json());
    }
    loadUser();
  }, []);

  return (
    <header className="flex items-center justify-between border-b p-4">
      <Link to="/" className="text-2xl font-bold text-emerald-600">
        Pitchside Scores
      </Link>
      <div className="flex items-center gap-4">
        {user && (
          <Link to="/profile" className="text-emerald-600 hover:underline">
            Profile
          </Link>
        )}
        {/* plain anchor — /login and /logout are Auth0 redirects handled by the backend */}
        <a
          href={user ? '/logout' : '/login'}
          className="bg-emerald-600 text-white rounded px-3 py-1 hover:bg-emerald-700"
        >
          {user ? 'Log out' : 'Log in'}
        </a>
      </div>
    </header>
  );
}
