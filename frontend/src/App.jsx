import { useEffect, useState } from 'react';

export default function App() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetch('/matches')
      .then((res) => res.json())
      .then(setMatches);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-emerald-600 mb-4">Footy Results</h1>
      <ul className="space-y-2">
        {matches.map((m) => (
          <li key={m.id} className="border rounded p-2">
            {m.home_team} vs {m.away_team}
          </li>
        ))}
      </ul>
    </div>
  );
}
