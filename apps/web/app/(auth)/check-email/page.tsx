'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ClozeLogo } from '@/components/ui/cloze-logo';

export default function CheckEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    setResending(true);
    try {
      await fetch('/api/auth/resend-verification', { method: 'POST' });
      setResent(true);
    } catch {
      // silently fail
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="relative z-0 w-full max-w-[440px]">
      {/* Ambient background */}
      <div className="pointer-events-none absolute -inset-32">
        <div className="absolute left-1/2 top-[-40px] h-64 w-64 -translate-x-1/2 rounded-full bg-violet-500/25 blur-[100px]" style={{ animation: 'aurora-drift 8s ease-in-out infinite alternate' }} />
        <div className="absolute bottom-[-20px] right-[-40px] h-48 w-48 rounded-full bg-sky-500/20 blur-[80px]" style={{ animation: 'aurora-drift-2 10s ease-in-out infinite alternate' }} />
      </div>

      {/* Logo */}
      <div className="relative mb-12 flex flex-col items-center overflow-hidden py-10">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full border border-violet-500/20" style={{ animation: 'login-pulse-ring 3s ease-in-out infinite' }} />
          <div className="absolute -inset-8 rounded-full border border-sky-500/10" style={{ animation: 'login-pulse-ring 3s ease-in-out infinite 0.5s' }} />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl">
            <ClozeLogo size={36} />
          </div>
        </div>
        <h1 className="mt-6 bg-gradient-to-b from-white via-white to-neutral-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          Check your email
        </h1>
        <p className="mt-2 text-center text-sm text-neutral-500">
          We sent a verification link to{' '}
          {email ? <span className="text-white font-medium">{email}</span> : 'your email'}
        </p>
      </div>

      {/* Card */}
      <div className="group relative rounded-[20px] p-px">
        <div
          className="absolute inset-0 rounded-[20px] opacity-60 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: 'conic-gradient(from var(--login-border-angle, 0deg), transparent 40%, #a855f7 50%, #6366f1 55%, #38bdf8 60%, transparent 70%)',
            animation: 'login-border-spin 4s linear infinite',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            padding: '1px',
          }}
        />

        <div className="relative overflow-hidden rounded-[20px] bg-black/70 px-8 py-10 backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 rounded-[20px]" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.08) 0%, transparent 60%)' }} />

          <div className="relative flex flex-col items-center text-center">
            {/* Email icon */}
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-sky-500/20">
              <svg className="h-8 w-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>

            <p className="text-sm leading-relaxed text-neutral-400">
              Click the link in the email to verify your account. If you don&apos;t see it, check your spam folder.
            </p>

            <button
              onClick={handleResend}
              disabled={resending || resent}
              className="mt-6 text-sm font-medium text-sky-400 transition-colors duration-300 hover:text-sky-300 disabled:text-neutral-600 disabled:cursor-not-allowed"
            >
              {resent ? 'Email sent!' : resending ? 'Sending...' : 'Resend verification email'}
            </button>

            <Link
              href="/login"
              className="mt-4 text-sm text-neutral-500 transition-colors duration-300 hover:text-white"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
