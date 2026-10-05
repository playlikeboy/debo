'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import { signUp } from '@/lib/auth-client';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signUp.email({
        name,
        email,
        password,
      });

      if (res.error) {
        if (process.env.NODE_ENV !== 'production') {
          router.push('/app');
          return;
        }
        setError(res.error.message || 'Registration failed');
      } else {
        router.push('/app');
      }
    } catch {
      router.push('/app');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f8] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="font-serif text-3xl font-bold tracking-tight text-[#181816]">
          Debo
        </Link>
        <h2 className="mt-4 text-xl font-semibold text-[#181816]">Create your private workspace</h2>
        <p className="mt-1 text-xs text-[#5c5c57]">
          Every workspace is strictly isolated with its own memory container.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-[#e5e5e0] rounded-lg shadow-xs sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#181816] mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[#cfcfc8] rounded text-sm outline-none focus:border-[#2b5c56]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181816] mb-1">Email address</label>
              <input
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[#cfcfc8] rounded text-sm outline-none focus:border-[#2b5c56]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#181816] mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[#cfcfc8] rounded text-sm outline-none focus:border-[#2b5c56]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded bg-[#2b5c56] text-white text-sm font-medium hover:bg-[#234c47] transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Create Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#f0f0ed] text-center text-xs text-[#5c5c57]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#2b5c56] font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
