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
          <h1 className="text-2xl font-semibold tracking-tight text-white">Đăng nhập</h1>
          <p className="mt-2 text-sm text-neutral-400 text-balance">
            Nhập mật khẩu cá nhân để truy cập ứng dụng quản lý tài chính.
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-11 bg-[#1A1A1A] border-white/[0.04] text-white focus:border-white focus-visible:ring-1 focus-visible:ring-white placeholder:text-neutral-600 rounded-xl transition-colors"
              autoFocus
            />
            {error && (
              <p className="text-sm font-medium text-rose-500 text-center">
                {error}
              </p>
            )}
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 text-sm font-bold bg-white text-black hover:bg-neutral-200 rounded-xl transition-colors">
            {loading ? 'ĐANG MỞ KHÓA...' : 'MỞ KHÓA'}
          </Button>
        </form>
      </div>
    </div>
  );
}
