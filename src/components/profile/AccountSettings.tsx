import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { PatternCard, PatternCardBody } from '../ui/card-with-ellipsis-pattern';

export function AccountSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <PatternCard 
        className="bg-[#2A2A2A]/80 border-[#404040] transition-colors duration-300 backdrop-blur-sm"
        gradientClassName="from-[#2A2A2A]/90 via-[#2A2A2A]/40 to-[#2A2A2A]/10"
      >
        <PatternCardBody>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#EAEAEA]">Change Password</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="block text-sm text-[#C0C0C0]">Current Password</label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#404040] rounded-lg focus:ring-2 focus:ring-[#00A6B2] focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm text-[#C0C0C0]">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#404040] rounded-lg focus:ring-2 focus:ring-[#00A6B2] focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm text-[#C0C0C0]">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#404040] rounded-lg focus:ring-2 focus:ring-[#00A6B2] focus:border-transparent"
                />
              </div>
            </div>
            <Button className="w-full sm:w-auto">Change Password</Button>
          </div>
        </PatternCardBody>
      </PatternCard>

      {/* Delete Account */}
      <PatternCard 
        className="bg-[#2A2A2A]/80 border-[#404040] transition-colors duration-300 backdrop-blur-sm"
        gradientClassName="from-[#2A2A2A]/90 via-[#2A2A2A]/40 to-[#2A2A2A]/10"
      >
        <PatternCardBody>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-destructive">Delete Account</h2>
            <div className="flex items-start gap-2 p-4 bg-destructive/10 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                Warning: This action is irreversible. All your data, including flashcard sets and study progress, will be permanently deleted.
              </p>
            </div>
            <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-white">
              Delete Account
            </Button>
          </div>
        </PatternCardBody>
      </PatternCard>
    </div>
  );
}