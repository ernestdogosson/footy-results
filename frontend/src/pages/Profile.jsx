import { useEffect, useState } from 'react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch('/api/profile');
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
      <div className="p-6">
        <a href="/login" className="text-emerald-600 hover:underline">
          Log in to view your profile.
        </a>
      </div>
    );
  }

  if (!user) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-emerald-600 mb-4">Profile</h1>
      <dl className="space-y-1">
        <div>
          <dt className="inline font-semibold">Name: </dt>
          <dd className="inline">{user.name}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Email: </dt>
          <dd className="inline">{user.email}</dd>
        </div>
      </dl>
    </div>
  );
}
