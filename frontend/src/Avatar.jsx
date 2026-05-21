export default function Avatar({ name, email }) {
  // first letters of the first two words, or fall back to email's first char
  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : (email?.[0] ?? '?').toUpperCase();

  return (
    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
      {initials}
    </div>
  );
}
