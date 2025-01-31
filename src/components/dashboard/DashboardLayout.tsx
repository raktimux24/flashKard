import React from 'react';
import { DashboardNavbar } from './DashboardNavbar';
import { Footer } from '../Footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#121212] text-[#EAEAEA]">
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-8 pt-24">
        {children}
      </main>
      <Footer />
    </div>
  );
}