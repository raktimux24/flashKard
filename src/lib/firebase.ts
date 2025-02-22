import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const getAuthErrorMessage = (error: { code: string }) => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please try logging in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign up is not enabled. Please contact support.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please check your email or sign up.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again or reset your password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later or reset your password.';
    default:
      return 'An error occurred. Please try again.';
  }
};

// Auth functions
export const signUp = async (email: string, password: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    
    // Create user document in Firestore
    const userDoc = doc(db, 'users', userCredential.user.uid);
    const userData = {
      name,
      email,
      createdAt: serverTimestamp(),
      flashcardSets: 0,
      totalFlashcards: 0,
      filesUploaded: 0,
      lastActive: serverTimestamp(),
    };
    await setDoc(userDoc, userData);

    // Initialize statistics document
    const statsDoc = doc(db, 'userStatistics', userCredential.user.uid);
    const initialStats = {
      totalFlashcardSets: 0,
      totalFlashcards: 0,
      filesUploaded: 0,
      lastActive: serverTimestamp(),
      flashcardsReviewedToday: 0,
      totalStudyTime: 0,
      totalExports: 0,
    };
    await setDoc(statsDoc, initialStats);

    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: getAuthErrorMessage(error) };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last active timestamp in users collection
    const userDoc = doc(db, 'users', userCredential.user.uid);
    await updateDoc(userDoc, {
      lastActive: serverTimestamp(),
    });

    // Update last active timestamp in userStatistics collection
    const statsDoc = doc(db, 'userStatistics', userCredential.user.uid);
    await updateDoc(statsDoc, {
      lastActive: serverTimestamp(),
    });

    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: getAuthErrorMessage(error) };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// User data functions
export const getUserData = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { data: userDoc.data(), error: null };
    }
    return { data: null, error: 'User not found' };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Check if user document exists
    const userDoc = doc(db, 'users', result.user.uid);
    const userSnap = await getDoc(userDoc);

    if (!userSnap.exists()) {
      // Create user document if it doesn't exist
      const userData = {
        name: result.user.displayName || '',
        email: result.user.email || '',
        createdAt: serverTimestamp(),
        flashcardSets: 0,
        totalFlashcards: 0,
        filesUploaded: 0,
        lastActive: serverTimestamp(),
      };
      await setDoc(userDoc, userData);

      // Initialize statistics document
      const statsDoc = doc(db, 'userStatistics', result.user.uid);
      const initialStats = {
        totalFlashcardSets: 0,
        totalFlashcards: 0,
        filesUploaded: 0,
        lastActive: serverTimestamp(),
        flashcardsReviewedToday: 0,
        totalStudyTime: 0,
        totalExports: 0,
      };
      await setDoc(statsDoc, initialStats);
    } else {
      // Update last active timestamp
      await updateDoc(userDoc, {
        lastActive: serverTimestamp(),
      });
    }

    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const reauthenticateUser = async (user: User, currentPassword: string) => {
  try {
    const credential = EmailAuthProvider.credential(user.email!, currentPassword);
    await reauthenticateWithCredential(user, credential);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const changePassword = async (user: User, currentPassword: string, newPassword: string) => {
  try {
    // First reauthenticate
    const { error: reauthError } = await reauthenticateUser(user, currentPassword);
    if (reauthError) {
      return { error: reauthError };
    }

    // Then update password
    await updatePassword(user, newPassword);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};