import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Button } from '../ui/button';
import { signIn, signInWithGoogle } from '../../lib/firebase';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { user: firebaseUser, error } = await signIn(formData.email, formData.password);
    
    if (error) {
      setError(error);
      setIsLoading(false);
      return;
    }

    if (firebaseUser) {
      setUser(firebaseUser);
      navigate(from, { replace: true });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    const { user, error } = await signInWithGoogle();
    
    if (error) {
      setError(error);
      setIsLoading(false);
      return;
    }

    if (user) {
      setUser(user);
      navigate(from, { replace: true });
    }
  };

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Log in to your account"
    >
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
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
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full px-3 py-2 bg-[#2A2A2A] border border-[#404040] rounded-lg focus:ring-2 focus:ring-[#00A6B2] focus:border-transparent"
              placeholder="Enter your email"
            />
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
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="block w-full px-3 py-2 bg-[#2A2A2A] border border-[#404040] rounded-lg focus:ring-2 focus:ring-[#00A6B2] focus:border-transparent"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-[#C0C0C0]" />
                ) : (
                  <Eye className="h-5 w-5 text-[#C0C0C0]" />
                )}
              </button>
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