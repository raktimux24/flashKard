import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { getUserData } from '../lib/firebase';

interface UserData {
  name: string;
  email: string;
  createdAt: string;
  flashcardSets: number;
  totalFlashcards: number;
  filesUploaded: number;
  lastActive: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  error: null,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? `User ${user.uid}` : 'No user');
      setUser(user);
      
      if (user) {
        try {
          console.log('Fetching user data for:', user.uid);
          const { data, error: userDataError } = await getUserData(user.uid);
          
          if (userDataError) {
            console.error('Error fetching user data:', userDataError);
            setError(userDataError);
            setUserData(null);
          } else if (data) {
            console.log('User data fetched successfully:', data);
            setUserData(data as UserData);
            setError(null);
          } else {
            console.log('No user data found, creating initial data');
            // If no user data exists, we might want to initialize it
            setUserData(null);
            setError('User data not initialized');
          }
        } catch (err) {
          console.error('Error in auth state change:', err);
          setError(err instanceof Error ? err.message : 'An error occurred');
          setUserData(null);
        }
      } else {
        console.log('Clearing user data');
        setUserData(null);
        setError(null);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, [auth]);

  const value = {
    user,
    userData,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 