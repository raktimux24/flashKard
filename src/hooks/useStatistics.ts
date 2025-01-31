import { useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useAuthStore } from '../store/authStore';
import { useStatisticsStore, UserStatistics } from '../store/statisticsStore';
import { statisticsService } from '../services/statisticsService';

export function useStatistics() {
  const { user } = useAuthStore();
  const { 
    statistics,
    setStatistics,
    updateStatistic: updateStoreStatistic,
    incrementStatistic: incrementLocalStatistic,
    addStudyTime: addLocalStudyTime,
    isLoading,
    error 
  } = useStatisticsStore();

  // Load statistics when user changes
  useEffect(() => {
    if (!user?.uid) return;

    // Subscribe to real-time updates
    const unsubscribe = statisticsService.subscribeToStatistics(user.uid, (stats) => {
      setStatistics(stats);
    });

    // Cleanup subscription on unmount or user change
    return () => unsubscribe();
  }, [user?.uid, setStatistics]);

  const updateLocalStatistic = (key: keyof UserStatistics, value: number) => {
    if (!statistics) return;
    setStatistics({
      ...statistics,
      [key]: value,
      lastActive: new Date() as unknown as Timestamp
    });
  };

  // Handle statistics updates
  const updateStatistic = async (key: keyof UserStatistics, value: number | ((prev: number) => number)) => {
    if (!user?.uid || !statistics) return;
    
    try {
      if (typeof value === 'function') {
        const newValue = value(statistics[key] as number);
        updateStoreStatistic(key, newValue);
      } else {
        updateStoreStatistic(key, value);
      }
      await statisticsService.updateStatistic(user.uid, key, value);
    } catch (error) {
      console.error('Error updating statistic:', error);
    }
  };

  const incrementStatistic = async (key: keyof UserStatistics) => {
    if (!user?.uid || !statistics) return;
    
    try {
      const newValue = (statistics[key] as number) + 1;
      updateStoreStatistic(key, newValue);
      await statisticsService.updateStatistic(user.uid, key, prev => prev + 1);
    } catch (error) {
      console.error('Error incrementing statistic:', error);
    }
  };

  const addStudyTime = async (seconds: number) => {
    if (!user?.uid || !statistics || seconds <= 0) return;
    
    try {
      const newValue = statistics.totalStudyTime + seconds;
      updateStoreStatistic('totalStudyTime', newValue);
      await statisticsService.addStudyTime(user.uid, seconds);
    } catch (error) {
      console.error('Error updating study time:', error);
      // Don't throw the error to prevent React cleanup issues
    }
  };

  const batchUpdateStatistics = async (updates: { key: keyof UserStatistics; value: number | ((prev: number) => number) }[]) => {
    if (!user?.uid || !statistics) return;
    
    try {
      // Update local state first
      for (const update of updates) {
        if (typeof update.value === 'function') {
          const newValue = update.value(statistics[update.key] as number);
          updateStoreStatistic(update.key, newValue);
        } else {
          updateStoreStatistic(update.key, update.value);
        }
      }
      
      // Then update Firestore
      await statisticsService.batchUpdateStatistics(user.uid, updates);
    } catch (error) {
      console.error('Error batch updating statistics:', error);
    }
  };

  return {
    statistics,
    isLoading,
    error,
    incrementStatistic,
    updateStatistic,
    batchUpdateStatistics,
    addStudyTime,
  };
}
