import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function MatchDetail() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [error, setError] = useState(null);

  async function loadMatch() {
    const res = await fetch(`/api/matches/${id}`);
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
      res = await fetch(`/api/matches/${id}/reports`, {
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
    return <div className="p-6 text-gray-500">Match not found.</div>;
  }
  if (!match) {
    return <div className="p-6 text-gray-500">Loading…</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-emerald-600 mb-4 capitalize">
        {match.home_team} vs {match.away_team}
      </h1>
      {match.consensus ? (
        <p className="text-xl mb-6">
          Final score: {match.consensus.home_score}–{match.consensus.away_score}
        </p>
      ) : (
        <p className="text-gray-500 mb-6">No consensus yet.</p>
      )}

      <form onSubmit={submitReport} className="flex items-end gap-2">
        <label className="flex flex-col text-sm capitalize">
          {match.home_team}
          <input
            type="number"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            required
            min="0"
            className="border rounded p-1 w-16"
          />
        </label>
        <label className="flex flex-col text-sm capitalize">
          {match.away_team}
          <input
            type="number"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            required
            min="0"
            className="border rounded p-1 w-16"
          />
        </label>
        <button
          type="submit"
          className="bg-emerald-600 text-white rounded px-3 py-1 hover:bg-emerald-700"
        >
          Report
        </button>
      </form>
      {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
    </div>
  );
}
