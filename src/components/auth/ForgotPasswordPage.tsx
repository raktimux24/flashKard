import React, { useState } from 'react';
import { AuthLayout } from './AuthLayout';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Handle password reset logic here
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link"
    >
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-[#2A2A2A] border border-[#404040] rounded-lg focus:ring-2 focus:ring-[#00A6B2] focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#00A6B2] hover:bg-[#008C96] rounded-lg transition-colors font-semibold"
          >
            Send Reset Link
          </button>

          <div className="text-center">
            <a
              href="/login"
              className="text-sm text-[#00A6B2] hover:text-[#008C96]"
            >
              Back to login
            </a>
          </div>
        </form>
      ) : (
        <div className="mt-8 text-center">
          <p className="text-[#C0C0C0] mb-4">
            If an account exists with that email, we've sent a password reset link.
          </p>
          <a
            href="/login"
            className="text-[#00A6B2] hover:text-[#008C96]"
          >
            Return to login
          </a>
        </div>
      )}
    </AuthLayout>
  );
}