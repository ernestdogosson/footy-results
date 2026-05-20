export function getConsensus(reports, { threshold = 3 } = {}) {
  if (reports.length === 0) return null;

  // tally each scoreline as "home-away"
  const counts = new Map();
  for (const r of reports) {
    const key = `${r.home_score}-${r.away_score}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  let topKey = null;
  let topCount = 0;
  let tied = false;
  for (const [key, count] of counts) {
    if (count > topCount) {
      topKey = key;
      topCount = count;
      tied = false;
    } else if (count === topCount) {
      tied = true;
    }
  }

  if (tied || topCount < threshold) return null;
  const [home, away] = topKey.split('-').map(Number);
  return { home_score: home, away_score: away };
}
