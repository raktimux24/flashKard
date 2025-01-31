import { create } from 'zustand';
import { Timestamp } from 'firebase/firestore';

export interface UserStatistics {
  totalFlashcardSets: number;
  totalFlashcards: number;
  filesUploaded: number;
  lastActive: Timestamp | null;
  flashcardsReviewedToday: number;
  totalStudyTime: number; // in seconds
  totalExports: number;
}

type StatisticsKey = keyof UserStatistics;

interface StatisticsState {
  statistics: UserStatistics | null;
  isLoading: boolean;
  error: string | null;
  setStatistics: (stats: UserStatistics | null) => void;
  updateStatistic: <K extends StatisticsKey>(key: K, value: UserStatistics[K]) => void;
  incrementStatistic: (key: StatisticsKey) => void;
  addStudyTime: (seconds: number) => void;
}

const initialStatistics: UserStatistics = {
  totalFlashcardSets: 0,
  totalFlashcards: 0,
  filesUploaded: 0,
  lastActive: null,
  flashcardsReviewedToday: 0,
  totalStudyTime: 0,
  totalExports: 0,
};

export const useStatisticsStore = create<StatisticsState>((set) => ({
  statistics: null,
  isLoading: true,
  error: null,
  setStatistics: (stats) => set({ statistics: stats, isLoading: false }),
  updateStatistic: (key, value) =>
    set((state) => ({
      statistics: state.statistics
        ? { ...state.statistics, [key]: value }
        : initialStatistics,
    })),
  incrementStatistic: (key) =>
    set((state) => ({
      statistics: state.statistics
        ? {
            ...state.statistics,
            [key]: (state.statistics[key] as number) + 1,
          }
        : initialStatistics,
    })),
  addStudyTime: (seconds) =>
    set((state) => ({
      statistics: state.statistics
        ? {
            ...state.statistics,
            totalStudyTime: state.statistics.totalStudyTime + seconds,
          }
        : initialStatistics,
    })),
}));
