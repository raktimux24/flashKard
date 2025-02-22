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
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const setUser = useAuthStore(state => state.setUser);

  const validateForm = () => {
    const errors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

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
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
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
            <label htmlFor="name" className="block text-sm font-medium">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setFormErrors({ ...formErrors, name: '' });
              }}
              className={`mt-1 block w-full px-3 py-2 bg-[#2A2A2A] border ${
                formErrors.name ? 'border-red-500' : 'border-[#404040]'
              } rounded-lg focus:ring-2 focus:ring-[#00A6B2] focus:border-transparent transition-colors`}
              placeholder="Enter your full name"
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
            )}
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
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
              )}
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
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  setFormErrors({ ...formErrors, confirmPassword: '' });
                }}
                className={`block w-full px-3 py-2 bg-[#2A2A2A] border ${
                  formErrors.confirmPassword ? 'border-red-500' : 'border-[#404040]'
                } rounded-lg focus:ring-2 focus:ring-[#00A6B2] focus:border-transparent pr-10 transition-colors`}
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
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{formErrors.confirmPassword}</p>
              )}
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