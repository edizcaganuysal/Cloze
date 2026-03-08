'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClozeLogo } from '@/components/ui/cloze-logo';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const configError =
    searchParams.get('config') === 'missing-jwt-secret' ||
    searchParams.get('config') === 'missing-api-base-url'
      ? 'Service configuration is incomplete. Please contact support.'
      : '';
  const oauthErrorCode = searchParams.get('error') ?? '';
  const oauthError =
    oauthErrorCode === 'google_config_missing'
      ? 'Google login is not configured yet. Please contact support.'
      : oauthErrorCode === 'google_login_not_found'
        ? 'No account was found for that Google user. Create an account first.'
        : oauthErrorCode === 'google_oauth_failed'
          ? 'Google login could not be completed. Please try again.'
          : '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          message?: string;
          traceId?: string;
          upstreamStatus?: number;
          reason?: string;
          apiBaseUrl?: string;
        };
        const message = data.message ?? 'Invalid credentials';
        const upstream =
          typeof data.upstreamStatus === 'number'
            ? ` (upstream ${data.upstreamStatus})`
            : '';
        const reason = typeof data.reason === 'string' ? ` [reason ${data.reason}]` : '';
        const apiBase =
          typeof data.apiBaseUrl === 'string' ? ` [api ${data.apiBaseUrl}]` : '';
        const trace = typeof data.traceId === 'string' ? ` [trace ${data.traceId}]` : '';
        let debugSuffix = `${upstream}${reason}${apiBase}${trace}`;
        if (res.status >= 500) {
          try {
            const probe = await fetch('/api/debug/upstream', { cache: 'no-store' });
            const probeData = (await probe.json().catch(() => null)) as
              | {
                  ok?: boolean;
                  status?: number;
                  latencyMs?: number;
                  apiBaseUrl?: string;
                }
              | null;
            if (probeData) {
              const probeStatus =
                typeof probeData.status === 'number' ? probeData.status : probe.status;
              const probeLatency =
                typeof probeData.latencyMs === 'number' ? `${probeData.latencyMs}ms` : 'n/a';
              const probeApi =
                typeof probeData.apiBaseUrl === 'string' ? probeData.apiBaseUrl : 'n/a';
              debugSuffix +=
                ` [probe status ${probeStatus}] [probe latency ${probeLatency}]` +
                ` [probe api ${probeApi}]`;
            }
          } catch (probeError) {
            console.error('Debug upstream probe failed', probeError);
            debugSuffix += ' [probe failed]';
          }
        }
        const full = `${message}${debugSuffix}`;
        console.error('Login failed', { status: res.status, body: data, full });
        setError(full);
        setLoading(false);
        return;
      }

      router.replace('/app/home');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  function handleGoogleSignIn() {
    window.location.href = '/api/auth/google/start?mode=login';
  }

  return (
    <div className="relative z-0 w-full max-w-[440px]">
      {/* === Ambient background effects === */}
      <div className="pointer-events-none absolute -inset-32">
        {/* Mesh gradient orbs */}
        <div className="absolute left-1/2 top-[-40px] h-64 w-64 -translate-x-1/2 rounded-full bg-sky-500/25 blur-[100px]" style={{ animation: 'aurora-drift 8s ease-in-out infinite alternate' }} />
        <div className="absolute bottom-[-20px] left-[-40px] h-48 w-48 rounded-full bg-violet-600/20 blur-[80px]" style={{ animation: 'aurora-drift-2 10s ease-in-out infinite alternate' }} />
        <div className="absolute right-[-30px] top-1/3 h-36 w-36 rounded-full bg-indigo-500/15 blur-[70px]" style={{ animation: 'aurora-drift 12s ease-in-out infinite alternate-reverse' }} />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            animation: 'login-grid-fade 8s ease-in-out infinite',
          }}
        />
      </div>

      {/* === Logo with pulse rings === */}
      <div className="relative mb-12 flex flex-col items-center overflow-hidden py-10">
        <div className="relative">
          {/* Animated rings behind logo */}
          <div className="absolute -inset-4 rounded-full border border-sky-500/20" style={{ animation: 'login-pulse-ring 3s ease-in-out infinite' }} />
          <div className="absolute -inset-8 rounded-full border border-violet-500/10" style={{ animation: 'login-pulse-ring 3s ease-in-out infinite 0.5s' }} />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl">
            <ClozeLogo size={36} />
          </div>
        </div>
        <h1 className="mt-6 bg-gradient-to-b from-white via-white to-neutral-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-neutral-500">Log in to your Cloze workspace</p>
      </div>

      {/* === Card with animated spinning border === */}
      <div className="group relative rounded-[20px] p-px">
        {/* Spinning conic gradient border */}
        <div
          className="absolute inset-0 rounded-[20px] opacity-60 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: 'conic-gradient(from var(--login-border-angle, 0deg), transparent 40%, #38bdf8 50%, #6366f1 55%, #a855f7 60%, transparent 70%)',
            animation: 'login-border-spin 4s linear infinite',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            padding: '1px',
          }}
        />

        {/* Card inner */}
        <div className="relative overflow-hidden rounded-[20px] bg-black/70 px-8 py-8 backdrop-blur-2xl">
          {/* Inner glow */}
          <div className="pointer-events-none absolute inset-0 rounded-[20px]" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(56,189,248,0.08) 0%, transparent 60%)' }} />
          {/* Noise texture overlay */}
          <div className="pointer-events-none absolute inset-0 rounded-[20px] opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

          <div className="relative">
            {/* Top nav */}
            <div className="mb-6 flex items-center justify-between">
              <Link href="/" className="group/link flex items-center gap-1.5 text-sm text-neutral-500 transition-all duration-300 hover:text-white">
                <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Home
              </Link>
              <Link href="/signup" className="text-sm font-medium text-sky-400 transition-colors duration-300 hover:text-sky-300">
                Create account
              </Link>
            </div>

            {configError && (
              <p className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-300">
                {configError}
              </p>
            )}
            {!configError && oauthError && (
              <p className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-300">
                {oauthError}
              </p>
            )}

            {/* Google button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="group/g relative mb-6 w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.06]"
            >
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/g:opacity-100">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" style={{ animation: 'login-shimmer 2s ease-in-out infinite' }} />
              </div>
              <span className="relative flex items-center justify-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-black shadow-sm">
                  G
                </span>
                Continue with Google
              </span>
            </button>

            {/* Divider */}
            <div className="mb-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
              <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">or</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="group/field">
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500 transition-colors duration-300 group-focus-within/field:text-sky-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder-neutral-600 outline-none transition-all duration-300 focus:border-sky-500/40 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(56,189,248,0.1)]"
                  placeholder="you@company.com"
                />
              </div>

              <div className="group/field">
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500 transition-colors duration-300 group-focus-within/field:text-sky-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Password
                </label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder-neutral-600 outline-none transition-all duration-300 focus:border-sky-500/40 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(56,189,248,0.1)]"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                  {error}
                </p>
              )}

              {/* Submit button with animated gradient */}
              <button
                type="submit"
                disabled={loading}
                className="group/btn relative w-full overflow-hidden rounded-2xl py-3.5 text-sm font-semibold text-white shadow-[0_8px_32px_rgba(56,189,248,0.3)] transition-all duration-300 hover:shadow-[0_8px_40px_rgba(56,189,248,0.45)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1, #a855f7)' }}
              >
                {/* Shimmer overlay */}
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{ animation: 'login-shimmer 1.5s ease-in-out infinite' }} />
                </div>
                <span className="relative">{loading ? 'Logging in…' : 'Login'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Trust badge */}
      <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-neutral-600">
        <svg className="h-3 w-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        <span>256-bit TLS encrypted</span>
        <span className="text-neutral-700">·</span>
        <span>SOC 2 compliant</span>
      </div>
    </div>
  );
}
