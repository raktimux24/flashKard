import React from 'react';
import { Brain, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#121212] text-[#EAEAEA] flex flex-col relative">
      {/* Back to Home Button */}
      <div className="absolute top-4 left-4 z-10">
        <Link to="/">
          <Button variant="ghost" className="gap-2 text-[#C0C0C0] hover:text-[#00A6B2]">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center justify-center mb-8">
              <Brain className="h-12 w-12 text-[#00A6B2]" />
            </Link>
            <h2 className="text-3xl font-bold text-[#00A6B2]">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-[#C0C0C0]">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </main>

      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0F766E/30%,transparent_70%)] blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#2DD4BF/15%,transparent)] blur-[80px]" />
      </div>
    </div>
  );
}