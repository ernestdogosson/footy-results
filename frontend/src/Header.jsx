import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b p-4">
      <Link to="/" className="text-2xl font-bold text-emerald-600">
        Footy Results
      </Link>
      {/* plain anchor — /login is an Auth0 redirect handled by the backend */}
      <a
        href="/login"
        className="bg-emerald-600 text-white rounded px-3 py-1 hover:bg-emerald-700"
      >
        Log in
      </a>
    </header>
  );
}
