'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import SearchComponent from '@/components/ui/animated-glowing-search-bar';

const NAV = [
  { href: '/product', label: 'Product' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/security', label: 'Security' },
];

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-6 right-6 z-50 group flex h-12 w-12 items-center justify-center rounded-full transition-all duration-500 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      {/* Glow effect */}
      <span className="pointer-events-none absolute -inset-1 rounded-full bg-sky-500/20 blur-xl transition-all duration-500 group-hover:bg-purple-500/30 group-hover:blur-2xl" />

      {/* Gradient border ring */}
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from var(--scroll-btn-angle, 0deg), #0ea5e9, #a855f7, #ec4899, #0ea5e9)',
          animation: 'scroll-btn-spin 3s linear infinite',
          mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #fff calc(100% - 2px))',
          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #fff calc(100% - 2px))',
        }}
      />

      {/* Dark fill */}
      <span className="absolute inset-[2px] rounded-full bg-black/80 backdrop-blur-xl" />

      {/* Arrow icon */}
      <svg
        className="relative z-10 h-5 w-5 text-white transition-transform duration-300 group-hover:-translate-y-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Transparent header — integrated with background */}
      <header className="absolute top-0 left-0 right-0 z-40">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="relative flex h-16 items-center justify-between">
              {/* Logo */}
              <Link href="/" className="group flex items-center gap-2.5">
                <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-xs font-bold text-white shadow-lg shadow-sky-500/25 transition-shadow duration-300 group-hover:shadow-sky-500/40">
                  S
                  <span className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/20" />
                </span>
                <span className="bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-sm font-semibold tracking-tight text-transparent transition-all duration-300 group-hover:from-white group-hover:to-white">
                  Sales AI
                </span>
              </Link>

              {/* Nav links */}
              <nav className="hidden items-center gap-1 md:flex">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-400 transition-all duration-300 hover:bg-white/[0.06] hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Search */}
              <div className="hidden lg:block">
                <SearchComponent />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-400 transition-all duration-300 hover:bg-white/[0.06] hover:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="hidden rounded-lg border border-white/10 px-3 py-1.5 text-sm font-medium text-neutral-300 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white sm:inline-flex"
                >
                  Sign up
                </Link>
                <Link
                  href="/book-demo"
                  className="relative overflow-hidden rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-300 hover:shadow-sky-500/40 hover:brightness-110"
                >
                  Book demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="bg-gradient-to-r from-neutral-400 to-neutral-600 bg-clip-text text-transparent">Sales AI</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/product" className="transition-colors duration-300 hover:text-white">Product</Link>
            <Link href="/security" className="transition-colors duration-300 hover:text-white">Security</Link>
            <Link href="/book-demo" className="transition-colors duration-300 hover:text-white">Book demo</Link>
          </div>
        </div>
      </footer>

      <ScrollToTopButton />
    </div>
  );
}
