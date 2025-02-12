import React from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '../ui/button';
import { PatternCard, PatternCardBody } from '../ui/card-with-ellipsis-pattern';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '../../lib/utils';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useEffect, useState } from 'react';

interface UserData {
  name: string;
  email: string;
}

export function ProfileHeader() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
          setUserData({
            name: userDoc.data().name || 'No Name',
            email: user.email || 'No Email'
          });
        } else {
          setUserData({
            name: user.displayName || 'No Name',
            email: user.email || 'No Email'
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
    <PatternCard 
      className="bg-[#2A2A2A]/80 border-[#404040] transition-colors duration-300 backdrop-blur-sm"
      gradientClassName="from-[#2A2A2A]/90 via-[#2A2A2A]/40 to-[#2A2A2A]/10"
    >
      <PatternCardBody>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24 ring-2 ring-[#00A6B2]/20">
              <AvatarFallback className="text-lg font-semibold">
                {userData ? getInitials(userData.name) : '??'}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#EAEAEA]">{userData?.name}</h1>
                <p className="text-[#C0C0C0]">{userData?.email}</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </PatternCardBody>
    </PatternCard>
  );
}