import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const store = {
  listMatches() {
    return prisma.match.findMany({ orderBy: { id: 'asc' } });
  },

  addMatch({ home_team, away_team }) {
    return prisma.match.create({ data: { home_team, away_team } });
  },

  findMatch(id) {
    const numeric = Number(id);
    if (!Number.isInteger(numeric)) return null;
    return prisma.match.findUnique({ where: { id: numeric } });
  },

  addReport(matchId, { home_score, away_score, sub }) {
    return prisma.report.create({
      data: { match_id: Number(matchId), home_score, away_score, sub },
    });
  },

  listReportsFor(matchId) {
    return prisma.report.findMany({ where: { match_id: Number(matchId) } });
  },
};
