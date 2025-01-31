import React from 'react';
import { FileText, Book, Upload, Clock } from 'lucide-react';
import { PatternCard, PatternCardBody } from '../ui/card-with-ellipsis-pattern';

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
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-[#00A6B2]/10 p-3">
            {icon}
          </div>
          <div>
            <p className="text-sm text-[#C0C0C0]">{label}</p>
            <p className="text-2xl font-semibold text-[#EAEAEA] mt-1">{value}</p>
          </div>
        </div>
      </PatternCardBody>
    </PatternCard>
  );
}

export function DashboardHeader() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#EAEAEA]">Welcome back, John!</h1>
        <p className="text-[#C0C0C0] mt-2">Here's an overview of your learning progress</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        />
      </div>
    </div>
  );
}