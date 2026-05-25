import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function MatchDetail() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [error, setError] = useState(null);

  async function loadMatch() {
    const res = await api(`/api/matches/${id}`);
    if (res.status === 404) {
      setNotFound(true);
      return;
    }
    setMatch(await res.json());
  }

  useEffect(() => {
    loadMatch();
  }, [id]);

  async function submitReport(e) {
    e.preventDefault();
    setError(null);
    let res;
    try {
      res = await api(`/api/matches/${id}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          home_score: Number(homeScore),
          away_score: Number(awayScore),
        }),
      });
    } catch {
      setError('Could not reach the server.');
      return;
    }
    if (res.status === 401) {
      setError('Log in to report a score.');
      return;
    }
    if (!res.ok) {
      setError('Could not submit report.');
      return;
    }
    setHomeScore('');
    setAwayScore('');
    loadMatch();
  }

  if (notFound) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-ink-muted">Match not found.</p>
      </main>
    );
  }
  if (!match) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-ink-muted">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <section className="mb-8 rounded-lg border border-line bg-surface p-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
          <div className="text-center">
            <p className="mb-2 text-xs uppercase tracking-widest text-ink-muted">Home</p>
            <p className="font-display text-2xl font-bold uppercase">
              {match.home_team}
            </p>
          </div>
          <div className="text-center">
            {match.consensus ? (
              <p className="font-display text-6xl font-bold tabular-nums">
                {match.consensus.home_score}
                <span className="px-3 text-ink-muted">–</span>
                {match.consensus.away_score}
              </p>
            ) : (
              <p className="font-display text-4xl font-bold text-ink-muted">vs</p>
            )}
          </div>
          <div className="text-center">
            <p className="mb-2 text-xs uppercase tracking-widest text-ink-muted">Away</p>
            <p className="font-display text-2xl font-bold uppercase">
              {match.away_team}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          {match.consensus ? (
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
              Final
            </span>
          ) : (
            <span className="rounded-full border border-line px-3 py-1 text-xs font-semibold uppercase tracking-widest text-ink-muted">
              Awaiting consensus
            </span>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-ink-muted">
          Report a scoreline
        </h2>
        <form onSubmit={submitReport} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="uppercase text-ink-muted">{match.home_team}</span>
            <input
              type="number"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              required
              min="0"
              className="w-20 rounded-md border border-line bg-canvas px-3 py-2 text-ink focus:border-accent focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="uppercase text-ink-muted">{match.away_team}</span>
            <input
              type="number"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              required
              min="0"
              className="w-20 rounded-md border border-line bg-canvas px-3 py-2 text-ink focus:border-accent focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-canvas hover:brightness-110"
          >
            Report
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </section>
    </main>
  );
}
