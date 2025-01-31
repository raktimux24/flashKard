import { doc, getDoc, setDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserStatistics } from '../store/statisticsStore';

const STATISTICS_COLLECTION = 'userStatistics';

export const statisticsService = {
  async getUserStatistics(userId: string): Promise<UserStatistics | null> {
    try {
      const docRef = doc(db, STATISTICS_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserStatistics;
      }
      
      // Initialize statistics if they don't exist
      const initialStats: UserStatistics = {
        totalFlashcardSets: 0,
        totalFlashcards: 0,
        filesUploaded: 0,
        lastActive: null,
        flashcardsReviewedToday: 0,
        totalStudyTime: 0,
        totalExports: 0,
      };
      
      await setDoc(docRef, initialStats);
      return initialStats;
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      return null;
    }
  },

  async updateStatistic(
    userId: string,
    key: keyof UserStatistics,
    value: number | ((prev: number) => number)
  ): Promise<void> {
    try {
      const docRef = doc(db, STATISTICS_COLLECTION, userId);
      
      if (typeof value === 'function') {
        const currentStats = await this.getUserStatistics(userId);
        if (!currentStats) return;
        
        const currentValue = currentStats[key] as number;
        const newValue = value(currentValue);
        
        await updateDoc(docRef, {
          [key]: newValue,
          lastActive: serverTimestamp(),
        });
      } else {
        await updateDoc(docRef, {
          [key]: value,
          lastActive: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error updating statistic:', error);
      throw error;
    }
  },

  async incrementStatistic(
    userId: string,
    key: keyof UserStatistics
  ): Promise<void> {
    try {
      const docRef = doc(db, STATISTICS_COLLECTION, userId);
      await updateDoc(docRef, {
        [key]: increment(1),
        lastActive: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error incrementing statistic:', error);
      throw error;
    }
  },

  async addStudyTime(userId: string, seconds: number): Promise<void> {
    try {
      const docRef = doc(db, STATISTICS_COLLECTION, userId);
      await updateDoc(docRef, {
        totalStudyTime: increment(seconds),
        lastActive: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating study time:', error);
      throw error;
    }
  },

  async resetDailyStatistics(userId: string): Promise<void> {
    try {
      const docRef = doc(db, STATISTICS_COLLECTION, userId);
      await updateDoc(docRef, {
        flashcardsReviewedToday: 0,
      });
    } catch (error) {
      console.error('Error resetting daily statistics:', error);
      throw error;
    }
  },
};
