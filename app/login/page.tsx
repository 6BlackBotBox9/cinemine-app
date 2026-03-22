"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { DM_Sans } from 'next/font/google';
import { useRouter } from 'next/navigation';

const dmsans = DM_Sans({ subsets: ['latin'], weight: '400' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnon);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Guard: if already logged in, go straight to dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/dashboard');
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show signup success message if navigated from signup
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('signup') === 'success') {
      alert('Check your email to verify your account.');
    }
  }, []);

  async function handleLogin() {
    if (!email || !password) {
      alert('Please enter email and password.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password } as any);
    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark">
      <div className="w-full max-w-md p-8 bg-white/5 border border-white/10 rounded-2xl text-white">
        <h1 className="text-3xl font-bold text-brand mb-1 tracking-wider">CineMine</h1>
        <p className="text-gray-400 text-sm mb-6">Sign in to your account</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="you@example.com"
              className="w-full p-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              className="w-full p-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-brand focus:outline-none"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 bg-brand text-white rounded-lg font-semibold hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          No account?{' '}
          <a href="/signup" className="text-brand hover:underline">Sign up free</a>
        </p>
      </div>
    </div>
  );
}
