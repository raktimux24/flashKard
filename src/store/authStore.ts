import { create } from 'zustand';
import { User } from 'firebase/auth';
import { auth, getUserData } from '../lib/firebase';

interface UserData {
  name: string;
  email: string;
  createdAt: string;
  flashcardSets: number;
  totalFlashcards: number;
  filesUploaded: number;
  lastActive: string;
}

interface AuthState {
  user: User | null;
  userData: UserData | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setUserData: (data: UserData | null) => void;
  setError: (error: string | null) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userData: null,
  isLoading: true,
  error: null,
  setUser: (user) => set({ user, isLoading: false }),
  setUserData: (data) => set({ userData: data }),
  setError: (error) => set({ error }),
  initialize: async () => {
    set({ isLoading: true });
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          const { data } = await getUserData(user.uid);
          set({ user, userData: data as UserData | null, isLoading: false });
        } else {
          set({ user: null, userData: null, isLoading: false });
        }
        resolve();
      });

      // Cleanup subscription
      return () => unsubscribe();
    });
  },
}));