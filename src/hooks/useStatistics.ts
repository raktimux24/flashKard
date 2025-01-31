import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useStatisticsStore, UserStatistics } from '../store/statisticsStore';
import { statisticsService } from '../services/statisticsService';

export function useStatistics() {
  const { user } = useAuthStore();
  const { 
    statistics,
    setStatistics,
    updateStatistic: updateLocalStatistic,
    incrementStatistic: incrementLocalStatistic,
    addStudyTime: addLocalStudyTime,
    isLoading,
    error 
  } = useStatisticsStore();

  // Load statistics when user changes
  useEffect(() => {
    async function loadStatistics() {
      if (!user?.uid) return;
      
      try {
        const stats = await statisticsService.getUserStatistics(user.uid);
        setStatistics(stats);
      } catch (error) {
        console.error('Error loading statistics:', error);
      }
    }

    loadStatistics();
  }, [user?.uid, setStatistics]);

  // Handle statistics updates
  const updateStatistic = async (key: keyof UserStatistics, value: number | ((prev: number) => number)) => {
    if (!user?.uid || !statistics) return;
    
    try {
      await statisticsService.updateStatistic(user.uid, key, value);
      if (typeof value === 'function') {
        const newValue = value(statistics[key] as number);
        updateLocalStatistic(key, newValue);
      } else {
        updateLocalStatistic(key, value);
      }
    } catch (error) {
      console.error('Error updating statistic:', error);
    }
  };

  const incrementStatistic = async (key: keyof UserStatistics) => {
    if (!user?.uid || !statistics) return;
    
    try {
      await statisticsService.incrementStatistic(user.uid, key);
      incrementLocalStatistic(key);
    } catch (error) {
      console.error('Error incrementing statistic:', error);
    }
  };

  const addStudyTime = async (seconds: number) => {
    if (!user?.uid || !statistics) return;
    
    try {
      await statisticsService.addStudyTime(user.uid, seconds);
      addLocalStudyTime(seconds);
    } catch (error) {
      console.error('Error adding study time:', error);
    }
  };

  return {
    statistics,
    isLoading,
    error,
    updateStatistic,
    incrementStatistic,
    addStudyTime,
    statisticsService,
  };
}
