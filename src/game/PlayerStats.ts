export interface PlayerStatsData {
  totalQuestionsCompleted: number;
  totalCorrectAnswers: number;
  highestTotalScore: number;
  totalStepsUsed: number;
}

interface LegacyPlayerStatsData {
  totalQuestionsCompleted?: number;
  totalCorrectAnswers?: number;
  highestSingleScore?: number;
  totalStepsUsed?: number;
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
        const parsed = JSON.parse(stored) as PlayerStatsData | LegacyPlayerStatsData;
        return this.migrateLegacyData(parsed);
      }
    } catch (e) {
      console.error('Failed to load player stats:', e);
    }
    return this.createDefaultData();
  }

  private migrateLegacyData(data: PlayerStatsData | LegacyPlayerStatsData): PlayerStatsData {
    const legacy = data as LegacyPlayerStatsData;
    const modern = data as PlayerStatsData;

    const hasNewField = typeof modern.highestTotalScore === 'number';
    const hasLegacyField = typeof legacy.highestSingleScore === 'number';

    if (hasNewField && !hasLegacyField) {
      return {
        totalQuestionsCompleted: modern.totalQuestionsCompleted ?? 0,
        totalCorrectAnswers: modern.totalCorrectAnswers ?? 0,
        highestTotalScore: modern.highestTotalScore,
        totalStepsUsed: modern.totalStepsUsed ?? 0
      };
    }

    const migrated: PlayerStatsData = {
      totalQuestionsCompleted: legacy.totalQuestionsCompleted ?? modern.totalQuestionsCompleted ?? 0,
      totalCorrectAnswers: legacy.totalCorrectAnswers ?? modern.totalCorrectAnswers ?? 0,
      highestTotalScore: hasLegacyField ? (legacy.highestSingleScore as number) : (modern.highestTotalScore ?? 0),
      totalStepsUsed: legacy.totalStepsUsed ?? modern.totalStepsUsed ?? 0
    };

    this.saveToStorage(migrated);
    return migrated;
  }

  private createDefaultData(): PlayerStatsData {
    return {
      totalQuestionsCompleted: 0,
      totalCorrectAnswers: 0,
      highestTotalScore: 0,
      totalStepsUsed: 0
    };
  }

  private saveToStorage(data?: PlayerStatsData): void {
    try {
      const target = data ?? this.data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(target));
    } catch (e) {
      console.error('Failed to save player stats:', e);
    }
  }

  recordQuestionCompleted(isCorrect: boolean, currentTotalScore: number, stepsUsed: number): void {
    this.data.totalQuestionsCompleted++;
    this.data.totalStepsUsed += stepsUsed;

    if (isCorrect) {
      this.data.totalCorrectAnswers++;
    }

    this.updateHighestTotalScore(currentTotalScore);
  }

  updateHighestTotalScore(currentTotalScore: number): void {
    if (currentTotalScore > this.data.highestTotalScore) {
      this.data.highestTotalScore = currentTotalScore;
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
    this.data = this.createDefaultData();
    this.saveToStorage();
  }
}
