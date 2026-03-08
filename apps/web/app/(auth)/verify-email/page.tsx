'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ClozeLogo } from '@/components/ui/cloze-logo';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus('success');
          setMessage(data.message ?? 'Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.message ?? 'Verification failed. The link may have expired.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      });
  }, [token]);

  return (
    <div className="relative z-0 w-full max-w-[440px]">
      {/* Ambient background */}
      <div className="pointer-events-none absolute -inset-32">
        <div className="absolute left-1/2 top-[-40px] h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/25 blur-[100px]" style={{ animation: 'aurora-drift 8s ease-in-out infinite alternate' }} />
        <div className="absolute bottom-[-20px] right-[-40px] h-48 w-48 rounded-full bg-sky-500/20 blur-[80px]" style={{ animation: 'aurora-drift-2 10s ease-in-out infinite alternate' }} />
      </div>

      {/* Logo */}
      <div className="relative mb-12 flex flex-col items-center overflow-hidden py-10">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full border border-emerald-500/20" style={{ animation: 'login-pulse-ring 3s ease-in-out infinite' }} />
          <div className="absolute -inset-8 rounded-full border border-sky-500/10" style={{ animation: 'login-pulse-ring 3s ease-in-out infinite 0.5s' }} />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl">
            <ClozeLogo size={36} />
          </div>
        </div>
        <h1 className="mt-6 bg-gradient-to-b from-white via-white to-neutral-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          {status === 'loading' ? 'Verifying...' : status === 'success' ? 'Verified!' : 'Verification failed'}
        </h1>
      </div>

      {/* Card */}
      <div className="group relative rounded-[20px] p-px">
        <div
          className="absolute inset-0 rounded-[20px] opacity-60 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: status === 'success'
              ? 'conic-gradient(from var(--login-border-angle, 0deg), transparent 40%, #10b981 50%, #0ea5e9 55%, #6366f1 60%, transparent 70%)'
              : 'conic-gradient(from var(--login-border-angle, 0deg), transparent 40%, #ef4444 50%, #f97316 55%, #eab308 60%, transparent 70%)',
            animation: 'login-border-spin 4s linear infinite',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            padding: '1px',
          }}
        />

        <div className="relative overflow-hidden rounded-[20px] bg-black/70 px-8 py-10 backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 rounded-[20px]" style={{ background: status === 'success' ? 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 60%)' : 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.08) 0%, transparent 60%)' }} />

          <div className="relative flex flex-col items-center text-center">
            {status === 'loading' && (
              <div className="mb-6 h-12 w-12 animate-spin rounded-full border-2 border-neutral-700 border-t-sky-400" />
            )}

            {status === 'success' && (
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20">
                <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            )}

            <p className="text-sm leading-relaxed text-neutral-400">{message}</p>

            {status === 'success' && (
              <Link
                href="/login"
                className="group/btn relative mt-6 w-full overflow-hidden rounded-2xl py-3.5 text-center text-sm font-semibold text-white shadow-[0_8px_32px_rgba(16,185,129,0.3)] transition-all duration-300 hover:shadow-[0_8px_40px_rgba(16,185,129,0.45)] hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9, #6366f1)', display: 'block' }}
              >
                Log in to your account
              </Link>
            )}

            {status === 'error' && (
              <Link
                href="/signup"
                className="mt-6 text-sm font-medium text-sky-400 transition-colors duration-300 hover:text-sky-300"
              >
                Try signing up again
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
