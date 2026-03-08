'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClozeLogo } from '@/components/ui/cloze-logo';

type FormState = {
  name: string;
  email: string;
  company: string;
  role: string;
  notes: string;
};

export default function BookDemoPage() {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    company: '',
    role: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    const response = await fetch('/api/sales-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const message =
        typeof payload?.message === 'string'
          ? payload.message
          : 'Unable to send your request right now. Please try again.';
      setError(message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSuccess(true);
    setForm({
      name: '',
      email: '',
      company: '',
      role: '',
      notes: '',
    });
  }

  const inputClass =
    'w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-all duration-300 focus:border-sky-500/40 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(56,189,248,0.1)]';

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <div className="relative z-0 w-full max-w-[540px]">
        {/* === Ambient background effects === */}
        <div className="pointer-events-none absolute -inset-32">
          <div className="absolute left-1/2 top-[-40px] h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[100px]" style={{ animation: 'aurora-drift 8s ease-in-out infinite alternate' }} />
          <div className="absolute bottom-[-20px] right-[-40px] h-48 w-48 rounded-full bg-sky-500/20 blur-[80px]" style={{ animation: 'aurora-drift-2 10s ease-in-out infinite alternate' }} />
          <div className="absolute left-[-30px] top-1/3 h-36 w-36 rounded-full bg-violet-500/15 blur-[70px]" style={{ animation: 'aurora-drift 12s ease-in-out infinite alternate-reverse' }} />
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
            <div className="absolute -inset-4 rounded-full border border-emerald-500/20" style={{ animation: 'login-pulse-ring 3s ease-in-out infinite' }} />
            <div className="absolute -inset-8 rounded-full border border-sky-500/10" style={{ animation: 'login-pulse-ring 3s ease-in-out infinite 0.5s' }} />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl">
              <ClozeLogo size={36} />
            </div>
          </div>
          <h1 className="mt-6 bg-gradient-to-b from-white via-white to-neutral-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            Book a demo
          </h1>
          <p className="mt-2 text-center text-sm text-neutral-500">Tell us about your team and goals. We&apos;ll handle the rest.</p>
        </div>

        {/* === Card with animated spinning border === */}
        <div className="group relative rounded-[20px] p-px">
          <div
            className="absolute inset-0 rounded-[20px] opacity-60 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: 'conic-gradient(from var(--login-border-angle, 0deg), transparent 40%, #10b981 50%, #38bdf8 55%, #6366f1 60%, transparent 70%)',
              animation: 'login-border-spin 4s linear infinite',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              WebkitMaskComposite: 'xor',
              padding: '1px',
            }}
          />

          <div className="relative overflow-hidden rounded-[20px] bg-black/70 px-8 py-8 backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 rounded-[20px]" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 60%)' }} />
            <div className="pointer-events-none absolute inset-0 rounded-[20px] opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

            <div className="relative">
              <div className="mb-6 flex items-center justify-between">
                <Link href="/" className="group/link flex items-center gap-1.5 text-sm text-neutral-500 transition-all duration-300 hover:text-white">
                  <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Home
                </Link>
                <Link href="/login" className="text-sm font-medium text-sky-400 transition-colors duration-300 hover:text-sky-300">
                  Sign in
                </Link>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="group/field">
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500 transition-colors duration-300 group-focus-within/field:text-sky-400">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      Name
                    </label>
                    <input
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                      className={inputClass}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="group/field">
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500 transition-colors duration-300 group-focus-within/field:text-sky-400">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      Email
                    </label>
                    <input
                      required
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                      className={inputClass}
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="group/field">
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500 transition-colors duration-300 group-focus-within/field:text-sky-400">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      Company
                    </label>
                    <input
                      required
                      value={form.company}
                      onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
                      className={inputClass}
                      placeholder="Acme Inc."
                    />
                  </div>
                  <div className="group/field">
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500 transition-colors duration-300 group-focus-within/field:text-sky-400">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      Role
                    </label>
                    <input
                      required
                      value={form.role}
                      onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
                      className={inputClass}
                      placeholder="Sales Manager"
                    />
                  </div>
                </div>

                <div className="group/field">
                  <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500 transition-colors duration-300 group-focus-within/field:text-sky-400">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Notes
                  </label>
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                    className={inputClass + ' resize-none'}
                    placeholder="Tell us what you want to achieve..."
                  />
                </div>

                {error && (
                  <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                    {error}
                  </p>
                )}

                {success && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Request received. We&apos;ll be in touch soon.
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="group/btn relative w-full overflow-hidden rounded-2xl py-3.5 text-sm font-semibold text-white shadow-[0_8px_32px_rgba(16,185,129,0.3)] transition-all duration-300 hover:shadow-[0_8px_40px_rgba(16,185,129,0.45)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9, #6366f1)' }}
                >
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{ animation: 'login-shimmer 1.5s ease-in-out infinite' }} />
                  </div>
                  <span className="relative">{submitting ? 'Sending…' : 'Submit request'}</span>
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
          <span>Usually responds within 24h</span>
        </div>
      </div>
    </div>
  );
}
