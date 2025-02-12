import React, { useState, useEffect } from 'react';
import { AlertCircle, Crown, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { PatternCard, PatternCardBody } from '../ui/card-with-ellipsis-pattern';
import { db } from '../../firebase/firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../components/ui/use-toast';
import { changePassword } from '../../lib/firebase';

export function AccountSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user } = useAuthStore();

  // Fetch initial subscription status
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!user?.uid) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setIsPro(userDoc.data().isPro ?? false);
        }
      } catch (error) {
        console.error('Error fetching subscription status:', error);
        toast({
          title: "Error",
          description: "Failed to fetch subscription status",
          variant: "destructive",
        });
      }
    };

    fetchSubscriptionStatus();
  }, [user?.uid]);

  const handleSubscriptionChange = async () => {
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to change your subscription",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Update the subscription status in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        isPro: !isPro,
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      setIsPro(!isPro);
      
      toast({
        title: "Success",
        description: `Successfully ${!isPro ? 'upgraded to Pro' : 'downgraded to Free'} plan`,
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to change your password",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await changePassword(user, currentPassword, newPassword);

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Clear form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    toast({
      title: "Success",
      description: "Password changed successfully",
    });
    setIsLoading(false);
  };

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
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#404040] rounded-lg focus:ring-2 focus:ring-[#00A6B2] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5 text-[#C0C0C0]" />
                    ) : (
                      <Eye className="h-5 w-5 text-[#C0C0C0]" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm text-[#C0C0C0]">New Password</label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#404040] rounded-lg focus:ring-2 focus:ring-[#00A6B2] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 text-[#C0C0C0]" />
                    ) : (
                      <Eye className="h-5 w-5 text-[#C0C0C0]" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm text-[#C0C0C0]">Confirm New Password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#404040] rounded-lg focus:ring-2 focus:ring-[#00A6B2] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-[#C0C0C0]" />
                    ) : (
                      <Eye className="h-5 w-5 text-[#C0C0C0]" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <Button 
              onClick={handlePasswordChange} 
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </div>
        </PatternCardBody>
      </PatternCard>

      {/* Subscription Plan */}
      <PatternCard 
        className="bg-[#2A2A2A]/80 border-[#404040] transition-colors duration-300 backdrop-blur-sm"
        gradientClassName="from-[#2A2A2A]/90 via-[#2A2A2A]/40 to-[#2A2A2A]/10"
      >
        <PatternCardBody>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#EAEAEA]">Subscription Plan</h2>
              <div className={`px-3 py-1 rounded-full text-sm ${
                isPro ? 'bg-[#00A6B2]/10 text-[#00A6B2]' : 'bg-[#404040] text-[#C0C0C0]'
              }`}>
                {isPro ? 'Pro Plan' : 'Free Plan'}
              </div>
            </div>
            
            <div className="space-y-4">
              {isPro ? (
                <div className="flex items-start gap-3">
                  <Crown className="h-5 w-5 text-[#00A6B2] shrink-0 mt-1" />
                  <div className="space-y-2">
                    <p className="text-[#EAEAEA]">You're currently on the Pro Plan</p>
                    <p className="text-sm text-[#C0C0C0]">Enjoy unlimited flashcard sets, AI-powered learning, and advanced analytics.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <Crown className="h-5 w-5 text-[#C0C0C0] shrink-0 mt-1" />
                  <div className="space-y-2">
                    <p className="text-[#EAEAEA]">You're currently on the Free Plan</p>
                    <p className="text-sm text-[#C0C0C0]">Upgrade to Pro for unlimited flashcard sets, AI-powered learning, and advanced analytics.</p>
                  </div>
                </div>
              )}
              
              <Button
                onClick={handleSubscriptionChange}
                className={`w-full sm:w-auto ${
                  isPro 
                    ? "border border-[#404040] hover:bg-[#404040]/20" 
                    : "bg-[#00A6B2] hover:bg-[#00A6B2]/90"
                }`}
                variant={isPro ? "outline" : "default"}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isPro ? 'Downgrading...' : 'Upgrading...'}
                  </>
                ) : (
                  isPro ? 'Downgrade to Free Plan' : 'Upgrade to Pro Plan'
                )}
              </Button>
            </div>
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