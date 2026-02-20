/**
 * Leaderboard - Per-level best scores for Conduit
 */

export interface LevelScore {
  name: string;
  score: number;
  pipesUsed: number;
  completedAt: string;
}

export interface LeaderboardData {
  [levelIndex: number]: LevelScore[];
}

const STORAGE_KEY = 'conduit_leaderboard';
const MAX_SCORES_PER_LEVEL = 5;

export class Leaderboard {
  private static data: LeaderboardData | null = null;

  static load(): LeaderboardData {
    if (this.data !== null) return this.data;
    if (typeof window === 'undefined') {
      this.data = {};
      return this.data;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      this.data = stored ? JSON.parse(stored) : {};
    } catch {
      this.data = {};
    }
    return this.data ?? {};
  }

  private static save(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {}
  }

  static recordScore(levelIndex: number, name: string, score: number, pipesUsed: number): number | null {
    const data = this.load();
    const now = new Date().toISOString();

    if (!data[levelIndex]) data[levelIndex] = [];
    const scores = data[levelIndex];

    scores.push({ name, score, pipesUsed, completedAt: now });
    scores.sort((a, b) => b.score - a.score);

    const rank = scores.findIndex(s => s.completedAt === now);
    data[levelIndex] = scores.slice(0, MAX_SCORES_PER_LEVEL);
    this.data = data;
    this.save();

    return rank >= 0 && rank < MAX_SCORES_PER_LEVEL ? rank + 1 : null;
  }

  static getLevelScores(levelIndex: number): LevelScore[] {
    return this.load()[levelIndex] || [];
  }

  static getBest(levelIndex: number): LevelScore | null {
    return this.getLevelScores(levelIndex)[0] || null;
  }

  static getTotalLevelsCompleted(): number {
    return Object.keys(this.load()).length;
  }

  static clear(): void {
    this.data = {};
    this.save();
  }

  static resetCache(): void {
    this.data = null;
  }
}
