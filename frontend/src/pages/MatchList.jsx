import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function MatchList() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetch('/api/matches')
      .then((res) => res.json())
      .then(setMatches);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-emerald-600 mb-4">Footy Results</h1>
      <ul className="space-y-2">
        {matches.map((m) => (
          <li key={m.id} className="border rounded">
            <Link to={`/matches/${m.id}`} className="block p-2 hover:bg-gray-50">
              {m.home_team} vs {m.away_team}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
