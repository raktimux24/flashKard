import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { Footer } from './components/Footer';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { Dashboard } from './pages/Dashboard';
import { FlashcardDisplay } from './pages/FlashcardDisplay';
import { Profile } from './pages/Profile';

// Add interface for props
interface AppProps {
  flashcards?: Array<{ question: string; answer: string }>;
  title?: string;
}

const AnimatedGrid = () => (
  <motion.div
    className="fixed inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)]"
    animate={{
      backgroundPosition: ["0% 0%", "100% 100%"],
    }}
    transition={{
      duration: 40,
      repeat: Number.POSITIVE_INFINITY,
      ease: "linear",
    }}
  >
    <div className="h-full w-full [background-image:repeating-linear-gradient(100deg,#64748B_0%,#64748B_1px,transparent_1px,transparent_4%)] opacity-20" />
  </motion.div>
);

function App({ flashcards = [], title = 'Flashcards' }: AppProps) {
  const location = useLocation();
  const { user, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#00A6B2]" />
      </div>
    );
  }

  // Redirect authenticated users away from auth pages
  if (user && ['/login', '/signup', '/forgot-password'].includes(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Protected routes
  if (location.pathname.startsWith('/dashboard') || location.pathname === '/profile') {
    return (
      <Routes>
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/flashcards/:id" element={
          <ProtectedRoute>
            <FlashcardDisplay flashcards={flashcards} title={title} />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Routes>
    );
  }

  // Auth routes
  if (['/login', '/signup', '/forgot-password'].includes(location.pathname)) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>
    );
  }

  // Public routes
  return (
    <Routes>
      <Route path="/" element={
        <div className="min-h-screen bg-[#121212] text-[#EAEAEA] relative overflow-hidden">
          <AnimatedGrid />
          <div className="relative z-10">
            <Navbar />
            <Hero />
            <Features />
            <Pricing />
            <Testimonials />
            <Footer />
          </div>
          <div className="fixed inset-0 pointer-events-none [mask-image:radial-gradient(90%_60%_at_50%_50%,#000_40%,transparent)]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0F766E/30%,transparent_70%)] blur-[120px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#2DD4BF/15%,transparent)] blur-[80px]" />
          </div>
        </div>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App