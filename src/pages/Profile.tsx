import React, { useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { AccountSettings } from '../components/profile/AccountSettings';
import { UsageStatistics } from '../components/profile/UsageStatistics';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

type TabType = 'account' | 'statistics';

export function Profile() {
  const [activeTab, setActiveTab] = useState<TabType>('account');

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 space-y-8 pb-8 max-w-7xl">
        <ProfileHeader />

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#404040]">
          <Button
            variant="ghost"
            className={cn(
              "relative pb-4 flex-1 sm:flex-none",
              activeTab === 'account' ? "text-[#00A6B2]" : "text-[#C0C0C0] hover:text-[#EAEAEA]"
            )}
            onClick={() => setActiveTab('account')}
          >
            Account Settings
            {activeTab === 'account' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00A6B2]" />
            )}
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "relative pb-4 flex-1 sm:flex-none",
              activeTab === 'statistics' ? "text-[#00A6B2]" : "text-[#C0C0C0] hover:text-[#EAEAEA]"
            )}
            onClick={() => setActiveTab('statistics')}
          >
            Usage Statistics
            {activeTab === 'statistics' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00A6B2]" />
            )}
          </Button>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'account' ? <AccountSettings /> : <UsageStatistics />}
        </div>
      </div>
    </DashboardLayout>
  );
}