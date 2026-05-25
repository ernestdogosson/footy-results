import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function MatchList() {
  const [matches, setMatches] = useState([]);
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [error, setError] = useState(null);

  async function loadMatches() {
    const res = await api('/api/matches');
    setMatches(await res.json());
  }

  useEffect(() => {
    loadMatches();
  }, []);

  async function addFixture(e) {
    e.preventDefault();
    setError(null);
    let res;
    try {
      res = await api('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ home_team: homeTeam, away_team: awayTeam }),
      });
    } catch {
      setError('Could not reach the server.');
      return;
    }
    if (res.status === 401) {
      setError('Log in to add a fixture.');
      return;
    }
    if (!res.ok) {
      setError('Could not add fixture.');
      return;
    }
    setHomeTeam('');
    setAwayTeam('');
    loadMatches();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-8 font-display text-4xl font-bold uppercase tracking-tight">
        Matches
      </h1>

      <section className="mb-8 rounded-lg border border-line bg-surface p-5">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-ink-muted">
          Add a fixture
        </h2>
        <form onSubmit={addFixture} className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-40 flex-1 flex-col gap-1.5 text-sm">
            <span className="text-ink-muted">Home team</span>
            <input
              type="text"
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              required
              className="rounded-md border border-line bg-canvas px-3 py-2 text-ink focus:border-accent focus:outline-none"
            />
          </label>
          <label className="flex min-w-40 flex-1 flex-col gap-1.5 text-sm">
            <span className="text-ink-muted">Away team</span>
            <input
              type="text"
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              required
              className="rounded-md border border-line bg-canvas px-3 py-2 text-ink focus:border-accent focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-canvas hover:brightness-110"
          >
            Add
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </section>

      {matches.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line p-12 text-center">
          <p className="font-display text-lg text-ink">No matches yet</p>
          <p className="mt-1 text-sm text-ink-muted">
            Add the first fixture above to get started.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {matches.map((m) => (
            <li key={m.id}>
              <Link
                to={`/matches/${m.id}`}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-lg border border-line bg-surface p-5 transition hover:border-accent"
              >
                <span className="font-display text-lg font-semibold uppercase">
                  {m.home_team}
                </span>
                {m.consensus ? (
                  <span className="font-display text-lg font-bold tabular-nums">
                    {m.consensus.home_score}
                    <span className="px-2 text-ink-muted">–</span>
                    {m.consensus.away_score}
                  </span>
                ) : (
                  <span className="text-xs uppercase tracking-widest text-accent">
                    vs
                  </span>
                )}
                <span className="text-right font-display text-lg font-semibold uppercase">
                  {m.away_team}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
