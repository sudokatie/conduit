/**
 * @jest-environment jsdom
 */

import { Leaderboard } from '../Leaderboard';

describe('Leaderboard', () => {
  beforeEach(() => {
    localStorage.clear();
    Leaderboard.resetCache();
  });

  it('should return empty data when no scores', () => {
    expect(Leaderboard.load()).toEqual({});
  });

  it('should record a level score', () => {
    const rank = Leaderboard.recordScore(0, 'Plumber', 1500, 12);
    expect(rank).toBe(1);
    expect(Leaderboard.getLevelScores(0)[0].score).toBe(1500);
  });

  it('should sort by score descending', () => {
    Leaderboard.recordScore(0, 'Low', 500, 20);
    Leaderboard.recordScore(0, 'High', 2000, 8);
    Leaderboard.recordScore(0, 'Mid', 1000, 15);

    const scores = Leaderboard.getLevelScores(0);
    expect(scores[0].name).toBe('High');
    expect(scores[1].name).toBe('Mid');
    expect(scores[2].name).toBe('Low');
  });

  it('should limit scores per level', () => {
    for (let i = 0; i < 10; i++) {
      Leaderboard.recordScore(0, `P${i}`, i * 100, 10);
    }
    expect(Leaderboard.getLevelScores(0).length).toBe(5);
  });

  it('should track levels separately', () => {
    Leaderboard.recordScore(0, 'Level0', 1000, 10);
    Leaderboard.recordScore(1, 'Level1', 1500, 12);
    expect(Leaderboard.getLevelScores(0)[0].name).toBe('Level0');
    expect(Leaderboard.getLevelScores(1)[0].name).toBe('Level1');
  });

  it('should persist to localStorage', () => {
    Leaderboard.recordScore(0, 'Saved', 800, 8);
    const stored = JSON.parse(localStorage.getItem('conduit_leaderboard')!);
    expect(stored[0][0].name).toBe('Saved');
  });

  it('should return best score for level', () => {
    Leaderboard.recordScore(0, 'Second', 1000, 10);
    Leaderboard.recordScore(0, 'First', 2500, 6);
    expect(Leaderboard.getBest(0)?.name).toBe('First');
  });

  it('should count completed levels', () => {
    Leaderboard.recordScore(0, 'A', 500, 10);
    Leaderboard.recordScore(2, 'B', 750, 12);
    expect(Leaderboard.getTotalLevelsCompleted()).toBe(2);
  });

  it('should clear all data', () => {
    Leaderboard.recordScore(0, 'Gone', 500, 10);
    Leaderboard.clear();
    expect(Leaderboard.getLevelScores(0).length).toBe(0);
  });
});
