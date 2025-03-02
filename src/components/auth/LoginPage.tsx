import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Button } from '../ui/button';
import { signIn, signInWithGoogle, logAnalyticsEvent, AnalyticsEvents } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';
import { SocialLoginButton } from './SocialLoginButton';
import { User } from 'firebase/auth';

interface LocationState {
  from?: {
    pathname: string;
  };
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState)?.from?.pathname || '/dashboard';
  const setUser = useAuthStore(state => state.setUser);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });

  const validateForm = () => {
    const errors = {
      email: '',
      password: '',
    };
    let isValid = true;

    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const user = await signIn(formData.email, formData.password);
      logAnalyticsEvent(AnalyticsEvents.USER_LOGIN, {
        method: 'email',
        success: true
      });
      setUser(user);
      navigate(from);
    } catch (err: any) {
      logAnalyticsEvent(AnalyticsEvents.USER_LOGIN, {
        method: 'email',
        success: false,
        error: err.message
      });
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await signInWithGoogle();
      logAnalyticsEvent(AnalyticsEvents.GOOGLE_SIGN_IN, {
        success: true
      });
      setUser(user);
      navigate(from);
    } catch (err: any) {
      logAnalyticsEvent(AnalyticsEvents.GOOGLE_SIGN_IN, {
        success: false,
        error: err.message
      });
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Log in to your account"
    >
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start">
            <div className="mr-3 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-red-500 flex-1">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setFormErrors({ ...formErrors, email: '' });
              }}
              className={`mt-1 block w-full px-3 py-2 bg-[#2A2A2A] border ${
                formErrors.email ? 'border-red-500' : 'border-[#404040]'
              } rounded-lg focus:ring-2 focus:ring-[#00A6B2] focus:border-transparent transition-colors`}
              placeholder="Enter your email"
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setFormErrors({ ...formErrors, password: '' });
                }}
                className={`block w-full px-3 py-2 bg-[#2A2A2A] border ${
                  formErrors.password ? 'border-red-500' : 'border-[#404040]'
                } rounded-lg focus:ring-2 focus:ring-[#00A6B2] focus:border-transparent pr-10 transition-colors`}
                placeholder="Enter your password"
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 bg-[#2A2A2A] border-[#404040] rounded focus:ring-[#00A6B2]"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm">
              Remember me
            </label>
          </div>

          <a
            href="/forgot-password"
            className="text-sm text-[#00A6B2] hover:text-[#008C96]"
          >
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#404040]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#1A1A1A] text-[#C0C0C0]">Or continue with</span>
          </div>
        </div>

        <SocialLoginButton 
          provider="google" 
          onClick={handleGoogleSignIn}
        />

        <div className="text-center text-sm">
          <span className="text-[#C0C0C0]">Don't have an account? </span>
          <a
            href="/signup"
            className="text-[#00A6B2] hover:text-[#008C96] font-semibold"
          >
            Sign up
          </a>
        </div>
      </form>
    </AuthLayout>
  );
}