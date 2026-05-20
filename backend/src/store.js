const matches = [];
const reports = [];
let nextMatchId = 1;
let nextReportId = 1;

export const store = {
  listMatches() {
    return matches;
  },

  addMatch({ home_team, away_team }) {
    const match = { id: nextMatchId++, home_team, away_team };
    matches.push(match);
    return match;
  },

  findMatch(id) {
    return matches.find((m) => m.id === Number(id));
  },

  addReport(matchId, { home_score, away_score, sub }) {
    const report = { id: nextReportId++, match_id: matchId, home_score, away_score, sub };
    reports.push(report);
    return report;
  },
};
