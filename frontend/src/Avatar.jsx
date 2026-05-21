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
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent font-display font-bold text-canvas">
      {initials}
    </div>
  );
}
