import { useParams } from 'react-router-dom';

export default function MatchDetail() {
  const { id } = useParams();
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-emerald-600">Match #{id}</h1>
    </div>
  );
}
