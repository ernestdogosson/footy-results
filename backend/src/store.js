const matches = [];
let nextId = 1;

export const store = {
  listMatches() {
    return matches;
  },

  addMatch({ home_team, away_team }) {
    const match = { id: nextId++, home_team, away_team };
    matches.push(match);
    return match;
  },

  findMatch(id) {
    return matches.find((m) => m.id === Number(id));
  },
};
