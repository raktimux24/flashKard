import React from 'react';
import { Book, FileText, Upload, Clock, Brain, Timer, FileDown, Database } from 'lucide-react';
import { PatternCard, PatternCardBody } from '../ui/card-with-ellipsis-pattern';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description?: string;
}

function StatCard({ icon, label, value, description }: StatCardProps) {
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

export function UsageStatistics() {
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
                value="25"
              />
              <StatCard
                icon={<FileText className="h-6 w-6 text-[#00A6B2]" />}
                label="Total Flashcards"
                value="500"
              />
              <StatCard
                icon={<Upload className="h-6 w-6 text-[#00A6B2]" />}
                label="Files Uploaded"
                value="20"
              />
              <StatCard
                icon={<Clock className="h-6 w-6 text-[#00A6B2]" />}
                label="Last Active"
                value="Today"
                description="2 hours ago"
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
                value="30"
              />
              <StatCard
                icon={<Timer className="h-6 w-6 text-[#00A6B2]" />}
                label="Total Study Time"
                value="5 Hours"
                description="This week"
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
                value="10"
              />
              <StatCard
                icon={<Database className="h-6 w-6 text-[#00A6B2]" />}
                label="Anki Exports"
                value="5"
              />
            </div>
          </div>
        </PatternCardBody>
      </PatternCard>
    </div>
  );
}