import { doc, getDoc, setDoc, updateDoc, serverTimestamp, increment, onSnapshot, Timestamp } from 'firebase/firestore';
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
        const currentValue = (await getDoc(docRef)).data()?.[key] as number || 0;
        const newValue = value(currentValue);
        
        const updateData: Partial<UserStatistics> = {
          lastActive: serverTimestamp() as unknown as Timestamp,
        };

        if (key === 'lastActive') {
          updateData[key] = newValue as unknown as Timestamp;
        } else {
          updateData[key] = newValue;
        }

        await updateDoc(docRef, updateData);
      } else {
        const updateData: Partial<UserStatistics> = {
          lastActive: serverTimestamp() as unknown as Timestamp,
        };

        if (key === 'lastActive') {
          updateData[key] = value as unknown as Timestamp;
        } else {
          updateData[key] = value;
        }

        await updateDoc(docRef, updateData);
      }
    } catch (error) {
      console.error('Error updating statistic:', error);
      throw error;
    }
  },

  async batchUpdateStatistics(
    userId: string,
    updates: { key: keyof UserStatistics; value: number | ((prev: number) => number) }[]
  ): Promise<void> {
    try {
      const docRef = doc(db, STATISTICS_COLLECTION, userId);
      const currentStats = await this.getUserStatistics(userId);
      if (!currentStats) return;

      const updateData: Partial<UserStatistics> = {
        lastActive: serverTimestamp() as unknown as Timestamp,
      };

      for (const update of updates) {
        if (typeof update.value === 'function') {
          const currentValue = (await getDoc(docRef)).data()?.[update.key] as number || 0;
          if (update.key === 'lastActive') {
            updateData[update.key] = update.value(currentValue) as unknown as Timestamp;
          } else {
            updateData[update.key] = update.value(currentValue);
          }
        } else {
          if (update.key === 'lastActive') {
            updateData[update.key] = update.value as unknown as Timestamp;
          } else {
            updateData[update.key] = update.value;
          }
        }
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error batch updating statistics:', error);
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
      console.error('Error adding study time:', error);
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

  subscribeToStatistics(userId: string, callback: (stats: UserStatistics | null) => void) {
    const docRef = doc(db, STATISTICS_COLLECTION, userId);
    return onSnapshot(docRef, 
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as UserStatistics);
        } else {
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
          setDoc(docRef, initialStats)
            .then(() => callback(initialStats))
            .catch((error) => console.error('Error initializing statistics:', error));
        }
      },
      (error) => {
        console.error('Error subscribing to statistics:', error);
        callback(null);
      }
    );
  },
};
