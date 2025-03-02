import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  updateProfile, 
  updatePassword, 
  EmailAuthProvider, 
  reauthenticateWithCredential,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { 
  getAnalytics, 
  logEvent,
  Analytics
} from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
} as const;

// Initialize Firebase with validation
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics;

try {
  // Validate config
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ] as const;

  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required Firebase configuration fields: ${missingFields.join(', ')}`);
  }

  console.log('Initializing Firebase with config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
  });

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  analytics = getAnalytics(app);
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Export initialized services
export { auth, db, analytics };

// Analytics Events
export const AnalyticsEvents = {
  // Auth Events
  USER_SIGNUP: 'user_signup',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  GOOGLE_SIGN_IN: 'google_sign_in',
  PASSWORD_RESET: 'password_reset',
  
  // Flashcard Events
  CREATE_FLASHCARD_SET: 'create_flashcard_set',
  DELETE_FLASHCARD_SET: 'delete_flashcard_set',
  EDIT_FLASHCARD_SET: 'edit_flashcard_set',
  VIEW_FLASHCARD_SET: 'view_flashcard_set',
  STUDY_SESSION_START: 'study_session_start',
  STUDY_SESSION_COMPLETE: 'study_session_complete',
  
  // File Operations
  FILE_UPLOAD: 'file_upload',
  FILE_EXPORT: 'file_export',
  
  // User Actions
  PROFILE_UPDATE: 'profile_update',
  SETTINGS_CHANGE: 'settings_change',
  
  // Navigation
  PAGE_VIEW: 'page_view',
  
  // Landing Page Events
  LANDING_PAGE_VIEW: 'landing_page_view',
  GET_STARTED_CLICK: 'get_started_click',
  LEARN_MORE_CLICK: 'learn_more_click',
  FEATURE_CLICK: 'feature_click',
  PRICING_PLAN_VIEW: 'pricing_plan_view',
  PRICING_PLAN_SELECT: 'pricing_plan_select',
  LANDING_PAGE_SIGNUP_CLICK: 'landing_page_signup_click',
  LANDING_PAGE_LOGIN_CLICK: 'landing_page_login_click'
} as const;

// Analytics helper function
export const logAnalyticsEvent = (eventName: string, eventParams?: { [key: string]: any }) => {
  try {
    if (!analytics) {
      console.error('Analytics not initialized');
      return;
    }
    logEvent(analytics, eventName, {
      timestamp: new Date().toISOString(),
      ...eventParams
    });
  } catch (error) {
    console.error('Failed to log analytics event:', error);
  }
};

// Enhanced error handling for auth errors
const getAuthErrorMessage = (error: { code: string }) => {
  console.log('Auth error code:', error.code);
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

// Enhanced user data functions with better error handling
export const getUserData = async (userId: string) => {
  if (!auth || !db) {
    console.error('Firebase services not initialized');
    return { data: null, error: 'Firebase services not initialized' };
  }

  try {
    console.log('Fetching user data for ID:', userId);
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      console.log('User document found');
      return { data: userDoc.data(), error: null };
    }
    
    console.log('No user document found, attempting to create');
    // If document doesn't exist, create it with default values
    const defaultUserData = {
      name: auth.currentUser?.displayName || '',
      email: auth.currentUser?.email || '',
      createdAt: serverTimestamp(),
      flashcardSets: 0,
      totalFlashcards: 0,
      filesUploaded: 0,
      lastActive: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', userId), defaultUserData);
    return { data: defaultUserData, error: null };
  } catch (error: any) {
    console.error('Error in getUserData:', error);
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