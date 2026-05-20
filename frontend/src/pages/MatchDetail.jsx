import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function MatchDetail() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/matches/${id}`).then((res) => {
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      res.json().then(setMatch);
    });
  }, [id]);

  if (notFound) {
    return <div className="p-6 text-gray-500">Match not found.</div>;
  }
  if (!match) {
    return <div className="p-6 text-gray-500">Loading…</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-emerald-600 mb-4">
        {match.home_team} vs {match.away_team}
      </h1>
      {match.consensus ? (
        <p className="text-xl">
          Final score: {match.consensus.home_score}–{match.consensus.away_score}
        </p>
      ) : (
        <p className="text-gray-500">No consensus yet.</p>
      )}
    </div>
  );
}
