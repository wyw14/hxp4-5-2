export interface PlayerStatsData {
  totalQuestionsCompleted: number;
  totalCorrectAnswers: number;
  highestSingleScore: number;
  totalStepsUsed: number;
}

const STORAGE_KEY = 'origami_game_player_stats';

export class PlayerStats {
  private data: PlayerStatsData;

  constructor() {
    this.data = this.loadFromStorage();
  }

  private loadFromStorage(): PlayerStatsData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load player stats:', e);
    }
    return {
      totalQuestionsCompleted: 0,
      totalCorrectAnswers: 0,
      highestSingleScore: 0,
      totalStepsUsed: 0
    };
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save player stats:', e);
    }
  }

  recordQuestionCompleted(isCorrect: boolean, score: number, stepsUsed: number): void {
    this.data.totalQuestionsCompleted++;
    this.data.totalStepsUsed += stepsUsed;

    if (isCorrect) {
      this.data.totalCorrectAnswers++;
      if (score > this.data.highestSingleScore) {
        this.data.highestSingleScore = score;
      }
    }

    this.saveToStorage();
  }

  getStats(): PlayerStatsData {
    return { ...this.data };
  }

  getAverageSteps(): number {
    if (this.data.totalQuestionsCompleted === 0) {
      return 0;
    }
    return Math.round((this.data.totalStepsUsed / this.data.totalQuestionsCompleted) * 10) / 10;
  }

  getAccuracyRate(): number {
    if (this.data.totalQuestionsCompleted === 0) {
      return 0;
    }
    return Math.round((this.data.totalCorrectAnswers / this.data.totalQuestionsCompleted) * 100);
  }

  reset(): void {
    this.data = {
      totalQuestionsCompleted: 0,
      totalCorrectAnswers: 0,
      highestSingleScore: 0,
      totalStepsUsed: 0
    };
    this.saveToStorage();
  }
}
