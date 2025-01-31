import React from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { FileUploader } from '../components/dashboard/FileUploader';
import { FlashcardSets } from '../components/dashboard/FlashcardSets';

export function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <DashboardHeader />
        <FileUploader />
        <FlashcardSets />
      </div>
    </DashboardLayout>
  );
}