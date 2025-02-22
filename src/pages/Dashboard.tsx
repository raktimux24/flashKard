import React from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { FileUploader } from '../components/dashboard/FileUploader';
import { FlashcardSets } from '../components/dashboard/FlashcardSets';

export function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8 px-2 sm:px-4 py-4 sm:py-6 md:py-8">
        <DashboardHeader />
        <FileUploader />
        <FlashcardSets />
      </div>
    </DashboardLayout>
  );
}