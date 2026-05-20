import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function MatchList() {
  const [matches, setMatches] = useState([]);
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [error, setError] = useState(null);

  async function loadMatches() {
    const res = await fetch('/api/matches');
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
      res = await fetch('/api/matches', {
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
    <div className="p-6">
      <h1 className="text-3xl font-bold text-emerald-600 mb-4">Footy Results</h1>

      <form onSubmit={addFixture} className="flex items-end gap-2 mb-6">
        <label className="flex flex-col text-sm">
          Home team
          <input
            type="text"
            value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
            required
            className="border rounded p-1"
          />
        </label>
        <label className="flex flex-col text-sm">
          Away team
          <input
            type="text"
            value={awayTeam}
            onChange={(e) => setAwayTeam(e.target.value)}
            required
            className="border rounded p-1"
          />
        </label>
        <button
          type="submit"
          className="bg-emerald-600 text-white rounded px-3 py-1 hover:bg-emerald-700"
        >
          Add
        </button>
      </form>
      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      <ul className="space-y-2">
        {matches.map((m) => (
          <li key={m.id} className="border rounded">
            <Link to={`/matches/${m.id}`} className="block p-2 hover:bg-gray-50 capitalize">
              {m.home_team} vs {m.away_team}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
