import { describe, it, expect } from 'vitest';
import { getConsensus } from '../src/consensus.js';

describe('getConsensus', () => {
  it('returns null when there are no reports', () => {
    expect(getConsensus([])).toBeNull();
  });

  it('returns null when below the threshold', () => {
    const reports = [
      { home_score: 2, away_score: 1 },
      { home_score: 2, away_score: 1 },
    ];
    expect(getConsensus(reports)).toBeNull();
  });

  it('returns the agreed scoreline when threshold is met', () => {
    const reports = [
      { home_score: 2, away_score: 1 },
      { home_score: 2, away_score: 1 },
      { home_score: 2, away_score: 1 },
    ];
    expect(getConsensus(reports)).toEqual({ home_score: 2, away_score: 1 });
  });

  it('picks the most-reported scoreline over minority ones', () => {
    const reports = [
      { home_score: 2, away_score: 1 },
      { home_score: 2, away_score: 1 },
      { home_score: 2, away_score: 1 },
      { home_score: 1, away_score: 1 },
    ];
    expect(getConsensus(reports)).toEqual({ home_score: 2, away_score: 1 });
  });

  it('returns null when the top is tied', () => {
    const reports = [
      { home_score: 2, away_score: 1 },
      { home_score: 2, away_score: 1 },
      { home_score: 2, away_score: 1 },
      { home_score: 1, away_score: 1 },
      { home_score: 1, away_score: 1 },
      { home_score: 1, away_score: 1 },
    ];
    expect(getConsensus(reports)).toBeNull();
  });

  it('respects a custom threshold', () => {
    const reports = [
      { home_score: 0, away_score: 0 },
      { home_score: 0, away_score: 0 },
    ];
    expect(getConsensus(reports, { threshold: 2 })).toEqual({
      home_score: 0,
      away_score: 0,
    });
  });
});
