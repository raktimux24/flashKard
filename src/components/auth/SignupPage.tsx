import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Button } from '../ui/button';
import { signUp, signInWithGoogle } from '../../lib/firebase';
import { SocialLoginButton } from './SocialLoginButton';
import { useAuthStore } from '../../store/authStore';

export function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const setUser = useAuthStore(state => state.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);
    const { user: firebaseUser, error } = await signUp(
      formData.email, 
      formData.password, 
      formData.name
    );
    
    if (error) {
      setError(error);
      setIsLoading(false);
      return;
    }

    if (firebaseUser) {
      setUser(firebaseUser);
      navigate('/dashboard');
    }
  };

  const handleGoogleSignUp = async () => {
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
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your learning journey today"
    >
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 bg-[#2A2A2A] border border-[#404040] rounded-lg focus:ring-2 focus:ring-[#00A6B2] focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>

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
                placeholder="Create a password"
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              Confirm Password
            </label>
            <div className="mt-1 relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="block w-full px-3 py-2 bg-[#2A2A2A] border border-[#404040] rounded-lg focus:ring-2 focus:ring-[#00A6B2] focus:border-transparent"
                placeholder="Confirm your password"
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
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating account...
            </>
          ) : (
            'Create Account'
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
          onClick={handleGoogleSignUp}
        />

        <div className="text-center text-sm">
          <span className="text-[#C0C0C0]">Already have an account? </span>
          <a
            href="/login"
            className="text-[#00A6B2] hover:text-[#008C96] font-semibold"
          >
            Sign in
          </a>
        </div>
      </form>
    </AuthLayout>
  );
}