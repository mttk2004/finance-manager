'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.refresh();
        router.push('/');
      } else {
        const data = await res.json();
        setError(data.error || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-neutral-200 font-sans p-4">
      <div className="w-full max-w-md rounded-2xl bg-neutral-900/50 p-8 border border-white/5">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800 border border-white/10">
            <svg
              className="h-5 w-5 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Sign in</h1>
          <p className="mt-2 text-sm text-neutral-400 text-balance">
            Enter your personal password to access your finance dashboard.
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-11 bg-neutral-800/50 border-white/5 text-white focus:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 placeholder:text-neutral-500"
              autoFocus
            />
            {error && (
              <p className="text-sm font-medium text-rose-500 text-center">
                {error}
              </p>
            )}
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
            {loading ? 'ĐANG XÁC THỰC...' : 'UNLOCK'}
          </Button>
        </form>
      </div>
    </div>
  );
}
