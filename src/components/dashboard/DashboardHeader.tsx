import React from 'react';
import { FileText, Book, Upload, Clock } from 'lucide-react';
import { PatternCard, PatternCardBody } from '../ui/card-with-ellipsis-pattern';
import { useStatistics } from '../../hooks/useStatistics';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <PatternCard 
      className="bg-[#2A2A2A]/80 border-[#404040] hover:border-[#00A6B2]/50 transition-colors duration-300 backdrop-blur-sm"
      gradientClassName="from-[#2A2A2A]/90 via-[#2A2A2A]/40 to-[#2A2A2A]/10"
    >
      <PatternCardBody>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="rounded-full bg-[#00A6B2]/10 p-2.5 sm:p-3">
            {icon}
          </div>
          <div>
            <p className="text-xs sm:text-sm text-[#C0C0C0]">{label}</p>
            <p className="text-xl sm:text-2xl font-semibold text-[#EAEAEA] mt-0.5 sm:mt-1">{value}</p>
          </div>
        </div>
      </PatternCardBody>
    </PatternCard>
  );
}

export function DashboardHeader() {
  const { statistics, isLoading } = useStatistics();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#EAEAEA]">Welcome back!</h1>
        <p className="text-sm sm:text-base text-[#C0C0C0] mt-1.5 sm:mt-2">Here's an overview of your learning progress</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={<Book className="h-5 w-5 sm:h-6 sm:w-6 text-[#00A6B2]" />}
          label="Flashcard Sets"
          value={isLoading ? '...' : statistics?.totalFlashcardSets.toString() || '0'}
        />
        <StatCard
          icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-[#00A6B2]" />}
          label="Total Flashcards"
          value={isLoading ? '...' : statistics?.totalFlashcards.toString() || '0'}
        />
        <StatCard
          icon={<Upload className="h-5 w-5 sm:h-6 sm:w-6 text-[#00A6B2]" />}
          label="Files Uploaded"
          value={isLoading ? '...' : statistics?.filesUploaded.toString() || '0'}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 sm:h-6 sm:w-6 text-[#00A6B2]" />}
          label="Study Time"
          value={isLoading ? '...' : formatStudyTime(statistics?.totalStudyTime || 0)}
        />
      </div>
    </div>
  );
}

function formatStudyTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}