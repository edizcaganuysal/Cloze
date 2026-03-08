'use client';

import Link from 'next/link';
import { Waves } from '@/components/ui/wave-background';
import { Spotlight } from '@/components/ui/spotlight';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import { CursorDrivenParticleTypography } from '@/components/ui/cursor-driven-particles-typography';
import { Compare } from '@/components/ui/compare';
import { WithoutClozePanel, WithClozePanel } from '@/components/ui/compare-panels';
import DisplayCards from '@/components/ui/display-cards';
import { InteractiveHighlights } from '@/components/ui/interactive-highlights';
import { AuroraSectionHeader } from '@/components/ui/aurora-section-header';
import { CinematicSectionHeader } from '@/components/ui/cinematic-section-header';
import { AcademicCredentials } from '@/components/ui/academic-credentials';
import { Sparkles, Mic, Brain } from 'lucide-react';


export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero — full-bleed spiral background */}
      <section className="relative min-h-[100vh] overflow-hidden">
        {/* Wave animation as full background */}
        <div className="absolute inset-0">
          <Waves className="h-full w-full" />
        </div>
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

        {/* Dark radial overlay for text readability */}
        <div className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.7)_0%,rgba(0,0,0,0.3)_60%,transparent_100%)]" />

        {/* Text content centered over the waves */}
        <div className="relative z-10 mx-auto flex min-h-[100vh] w-full max-w-6xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
          <p className="inline-flex w-fit rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-400">
            AI sales coaching platform
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-300">
            Coach every rep live, without adding manager overhead.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-300">
            Sales AI listens to sales conversations in real time and gives clean, contextual
            guidance so reps stay sharp and consistent.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/book-demo"
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-neutral-200"
            >
              Book demo
            </Link>
            <Link
              href="/book-demo?type=custom-agent"
              className="rounded-lg border border-neutral-600 px-5 py-2.5 text-sm font-semibold text-neutral-300 transition-colors hover:bg-white/10"
            >
              Request custom agent
            </Link>
          </div>
        </div>
      </section>

      {/* Scroll animation — product preview */}
      <section className="-mt-[60vh] flex flex-col overflow-hidden">
        <ContainerScroll
          titleComponent={<div />}
        >
          <div className="mx-auto flex h-full w-full flex-col items-center justify-center rounded-2xl bg-black px-6">
            <p
              className="animate-shimmer bg-[length:200%_100%] bg-clip-text text-center text-sm font-semibold uppercase tracking-[0.35em] text-transparent sm:text-base md:text-lg"
              style={{
                backgroundImage:
                  'linear-gradient(110deg, #737373 35%, #e5e5e5 50%, #737373 65%)',
              }}
            >
              Meet your AI coaching engine
            </p>
            <div className="my-2 h-[50%] w-full">
              <CursorDrivenParticleTypography
                text="Cloze"
                fontSize={180}
                particleDensity={5}
                dispersionStrength={20}
                color="#ffffff"
              />
            </div>
            <p
              className="animate-shimmer bg-[length:200%_100%] bg-clip-text text-center text-base font-medium tracking-[0.15em] text-transparent sm:text-lg md:text-xl"
              style={{
                backgroundImage:
                  'linear-gradient(110deg, #a3a3a3 35%, #ffffff 50%, #a3a3a3 65%)',
                animationDelay: '1s',
              }}
            >
              Next-Generation Sales Call
            </p>
          </div>
        </ContainerScroll>
      </section>

      {/* Display Cards — feature highlights */}
      <section className="-mt-24 mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
          <AuroraSectionHeader
            badge="Platform"
            title="Everything you need to coach at scale"
            subtitle="Real-time guidance, intelligent agents, and actionable insights — all working together."
          />
          <DisplayCards
            cards={[
              {
                icon: <Mic className="size-4 text-blue-300" />,
                title: 'Live Coaching',
                description: 'Real-time suggestions on every call',
                date: 'Always on',
                iconClassName: 'text-blue-500',
                titleClassName: 'text-blue-500',
                className:
                  '[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[\'\'] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0',
              },
              {
                icon: <Brain className="size-4 text-blue-300" />,
                title: 'AI Agents',
                description: 'Custom agents for your playbook',
                date: 'Configurable',
                iconClassName: 'text-blue-500',
                titleClassName: 'text-blue-500',
                className:
                  '[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[\'\'] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0',
              },
              {
                icon: <Sparkles className="size-4 text-blue-300" />,
                title: 'Insights',
                description: 'Post-call summaries & analytics',
                date: 'After every call',
                iconClassName: 'text-blue-500',
                titleClassName: 'text-blue-500',
                className:
                  '[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10',
              },
            ]}
          />
        </div>
      </section>

      {/* Before / After — Compare + What teams get */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <CinematicSectionHeader
          badge="See the difference"
          titleBefore="Before & after"
          titleHighlight="Cloze"
          titleAfter=""
          subtitle="Hover to compare how AI coaching transforms sales performance metrics."
        />

        <div className="mt-12 flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:justify-center lg:gap-16">
          {/* Compare slider with code panels */}
          <div className="flex-shrink-0 rounded-3xl border border-neutral-800 bg-neutral-900/50 p-3">
            <Compare
              firstContent={<WithClozePanel />}
              secondContent={<WithoutClozePanel />}
              className="h-[400px] w-[320px] sm:h-[480px] sm:w-[420px] md:h-[520px] md:w-[500px] rounded-2xl"
              slideMode="hover"
              autoplay
              autoplayDuration={4000}
            />
            <div className="mt-3 flex items-center justify-between px-2 text-xs text-neutral-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
                With Cloze
              </span>
              <span className="flex items-center gap-1.5">
                Without Cloze
                <span className="h-2 w-2 rounded-full bg-red-500/80" />
              </span>
            </div>
          </div>

          {/* What teams get — interactive highlights */}
          <InteractiveHighlights />
        </div>
      </section>

      {/* Academic credentials */}
      <AcademicCredentials />

      {/* Navigation cards */}
      <section className="border-y border-neutral-800">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/product"
              className="rounded-xl border border-neutral-800 p-5 transition-colors hover:bg-white/5"
            >
              <h2 className="text-base font-semibold text-white">Product</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Explore live coaching, playbooks, and manager controls.
              </p>
            </Link>
            <Link
              href="/how-it-works"
              className="rounded-xl border border-neutral-800 p-5 transition-colors hover:bg-white/5"
            >
              <h2 className="text-base font-semibold text-white">How it works</h2>
              <p className="mt-2 text-sm text-neutral-400">
                See how reps, managers, and AI work together in one loop.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
