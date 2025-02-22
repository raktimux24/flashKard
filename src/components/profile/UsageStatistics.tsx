import React from 'react';
import { Book, FileText, Upload, Clock, Brain, Timer, FileDown, Database } from 'lucide-react';
import { PatternCard, PatternCardBody } from '../ui/card-with-ellipsis-pattern';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { statisticsService } from '../../services/statisticsService';
import { useAuthStore } from '../../store/authStore';

interface UsageStats {
  flashcardSets: number;
  totalFlashcards: number;
  filesUploaded: number;
  lastActive: string;
  flashcardsReviewedToday: number;
  totalStudyTimeThisWeek: number;
  pdfsExported: number;
  ankiExports: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description?: string;
  isLoading?: boolean;
}

const StatCard = ({ icon, label, value, description, isLoading }: StatCardProps) => {
  if (isLoading) {
    return (
      <div className="flex items-start gap-4">
        <Skeleton className="rounded-full h-12 w-12" />
        <div className="space-y-2 w-full">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          {description && <Skeleton className="h-4 w-40" />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4">
      <div className="rounded-full bg-[#00A6B2]/10 p-3">
        {icon}
      </div>
      <div>
        <p className="text-sm text-[#C0C0C0]">{label}</p>
        <p className="text-2xl font-semibold text-[#EAEAEA] mt-1">{value}</p>
        {description && (
          <p className="text-sm text-[#C0C0C0] mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}

const fetchUsageStats = async (userId: string): Promise<UsageStats> => {
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const stats = await statisticsService.getUserStatistics(userId);
  if (!stats) {
    throw new Error('Failed to fetch usage statistics');
  }

  return {
    flashcardSets: stats.totalFlashcardSets,
    totalFlashcards: stats.totalFlashcards,
    filesUploaded: stats.filesUploaded,
    lastActive: stats.lastActive ? new Date(stats.lastActive.seconds * 1000).toISOString() : new Date().toISOString(),
    flashcardsReviewedToday: stats.flashcardsReviewedToday,
    totalStudyTimeThisWeek: stats.totalStudyTime / 3600, // Convert seconds to hours
    pdfsExported: stats.totalExports,
    ankiExports: 0 // This might need to be added to the statistics model if needed
  };
};

export const UsageStatistics = () => {
  const user = useAuthStore(state => state.user);
  const { data, isLoading, error } = useQuery({
    queryKey: ['usage-statistics', user?.uid],
    queryFn: () => fetchUsageStats(user?.uid || ''),
    enabled: !!user?.uid,
  });

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg">
        <p className="text-red-500">Failed to load usage statistics</p>
      </div>
    );
  }

  const formatStudyTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    }
    return `${hours.toFixed(2)} ${hours === 1 ? 'hour' : 'hours'}`;
  };

  return (
    <div className="space-y-6">
      {/* Flashcard Activity */}
      <PatternCard 
        className="bg-[#2A2A2A]/80 border-[#404040] transition-colors duration-300 backdrop-blur-sm"
        gradientClassName="from-[#2A2A2A]/90 via-[#2A2A2A]/40 to-[#2A2A2A]/10"
      >
        <PatternCardBody>
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[#EAEAEA]">Flashcard Activity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatCard
                icon={<Book className="h-6 w-6 text-[#00A6B2]" />}
                label="Flashcard Sets"
                value={data?.flashcardSets ?? 0}
                isLoading={isLoading}
              />
              <StatCard
                icon={<FileText className="h-6 w-6 text-[#00A6B2]" />}
                label="Total Flashcards"
                value={data?.totalFlashcards ?? 0}
                isLoading={isLoading}
              />
              <StatCard
                icon={<Upload className="h-6 w-6 text-[#00A6B2]" />}
                label="Files Uploaded"
                value={data?.filesUploaded ?? 0}
                isLoading={isLoading}
              />
              <StatCard
                icon={<Clock className="h-6 w-6 text-[#00A6B2]" />}
                label="Last Active"
                value={data ? formatDistanceToNow(new Date(data.lastActive), { addSuffix: true }) : 'Never'}
                description="Last study session"
                isLoading={isLoading}
              />
            </div>
          </div>
        </PatternCardBody>
      </PatternCard>

      {/* Study Habits */}
      <PatternCard 
        className="bg-[#2A2A2A]/80 border-[#404040] transition-colors duration-300 backdrop-blur-sm"
        gradientClassName="from-[#2A2A2A]/90 via-[#2A2A2A]/40 to-[#2A2A2A]/10"
      >
        <PatternCardBody>
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[#EAEAEA]">Study Habits</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatCard
                icon={<Brain className="h-6 w-6 text-[#00A6B2]" />}
                label="Flashcards Reviewed Today"
                value={data?.flashcardsReviewedToday ?? 0}
                isLoading={isLoading}
              />
              <StatCard
                icon={<Timer className="h-6 w-6 text-[#00A6B2]" />}
                label="Total Study Time"
                value={data ? formatStudyTime(data.totalStudyTimeThisWeek) : '0 hours'}
                description="This week"
                isLoading={isLoading}
              />
            </div>
          </div>
        </PatternCardBody>
      </PatternCard>

      {/* Export History */}
      <PatternCard 
        className="bg-[#2A2A2A]/80 border-[#404040] transition-colors duration-300 backdrop-blur-sm"
        gradientClassName="from-[#2A2A2A]/90 via-[#2A2A2A]/40 to-[#2A2A2A]/10"
      >
        <PatternCardBody>
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[#EAEAEA]">Export History</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatCard
                icon={<FileDown className="h-6 w-6 text-[#00A6B2]" />}
                label="PDFs Exported"
                value={data?.pdfsExported ?? 0}
                isLoading={isLoading}
              />
              <StatCard
                icon={<Database className="h-6 w-6 text-[#00A6B2]" />}
                label="Anki Exports"
                value={data?.ankiExports ?? 0}
                isLoading={isLoading}
              />
            </div>
          </div>
        </PatternCardBody>
      </PatternCard>
    </div>
  );
}