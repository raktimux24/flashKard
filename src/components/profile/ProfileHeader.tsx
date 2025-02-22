import React from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '../ui/button';
import { PatternCard, PatternCardBody } from '../ui/card-with-ellipsis-pattern';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '../../lib/utils';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

interface UserData {
  name: string;
  email: string;
  bio?: string;
}

export function ProfileHeader() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: ''
  });
  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('No user logged in');
          setLoading(false);
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            name: data.name || 'No Name',
            email: user.email || 'No Email',
            bio: data.bio || ''
          });
          setEditForm({
            name: data.name || '',
            bio: data.bio || ''
          });
        } else {
          setUserData({
            name: user.displayName || 'No Name',
            email: user.email || 'No Email',
            bio: ''
          });
          setEditForm({
            name: user.displayName || '',
            bio: ''
          });
        }
      } catch (err) {
        setError('Error fetching user data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEditSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('No user logged in');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: editForm.name,
        bio: editForm.bio
      });

      setUserData(prev => ({
        ...prev!,
        name: editForm.name,
        bio: editForm.bio
      }));

      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <PatternCard 
        className="bg-[#2A2A2A]/80 border-[#404040] transition-colors duration-300 backdrop-blur-sm"
        gradientClassName="from-[#2A2A2A]/90 via-[#2A2A2A]/40 to-[#2A2A2A]/10"
      >
        <PatternCardBody>
          <div className="flex items-center justify-center p-6">
            <div className="animate-pulse text-[#C0C0C0]">Loading...</div>
          </div>
        </PatternCardBody>
      </PatternCard>
    );
  }

  if (error) {
    return (
      <PatternCard 
        className="bg-[#2A2A2A]/80 border-[#404040] transition-colors duration-300 backdrop-blur-sm"
        gradientClassName="from-[#2A2A2A]/90 via-[#2A2A2A]/40 to-[#2A2A2A]/10"
      >
        <PatternCardBody>
          <div className="flex items-center justify-center p-6">
            <div className="text-red-400">{error}</div>
          </div>
        </PatternCardBody>
      </PatternCard>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <PatternCard 
        className="bg-[#2A2A2A]/80 border-[#404040] transition-colors duration-300 backdrop-blur-sm"
        gradientClassName="from-[#2A2A2A]/90 via-[#2A2A2A]/40 to-[#2A2A2A]/10"
      >
        <PatternCardBody>
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4">
            <div className="relative shrink-0">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-2 ring-[#00A6B2]/20">
                <AvatarFallback className="text-lg font-semibold">
                  {userData ? getInitials(userData.name) : '??'}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 text-center sm:text-left w-full">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-auto">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#EAEAEA] break-words">{userData?.name}</h1>
                  <p className="text-sm sm:text-base text-[#C0C0C0] break-words">{userData?.email}</p>
                  {userData?.bio && (
                    <p className="text-sm sm:text-base text-[#C0C0C0] mt-2 break-words max-w-prose">{userData.bio}</p>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 w-full sm:w-auto mt-4 sm:mt-0"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </PatternCardBody>
      </PatternCard>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="bg-[#2A2A2A] border-[#404040] w-[90vw] max-w-[425px] p-4 sm:p-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl sm:text-2xl text-[#EAEAEA]">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm sm:text-base text-[#C0C0C0]">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="bg-[#1A1A1A] border-[#404040] text-[#EAEAEA] focus:ring-[#00A6B2] focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm sm:text-base text-[#C0C0C0]">Bio</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                className="bg-[#1A1A1A] border-[#404040] text-[#EAEAEA] focus:ring-[#00A6B2] focus:border-transparent min-h-[100px] text-sm sm:text-base"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="w-full sm:w-auto border-[#404040] text-[#C0C0C0] hover:bg-[#404040]/10 hover:text-[#EAEAEA] order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              className="w-full sm:w-auto bg-[#00A6B2] text-white hover:bg-[#00A6B2]/90 order-1 sm:order-2"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}