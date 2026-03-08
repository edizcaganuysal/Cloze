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
            Cloze listens to sales conversations in real time and gives clean, contextual
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
            subtitle="Real-time guidance, intelligent agents, and actionable insights. All working together."
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
      <section className="relative overflow-hidden border-y border-white/[0.04]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-sky-500/[0.04] blur-[100px]" />
          <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-violet-500/[0.04] blur-[100px]" />
        </div>
        <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Link
              href="/product"
              className="group/card relative rounded-2xl p-px transition-all duration-500"
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
                style={{
                  background: 'conic-gradient(from 180deg, transparent 50%, #0ea5e9 65%, #6366f1 75%, transparent 85%)',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                  WebkitMaskComposite: 'xor',
                  padding: '1px',
                }}
              />
              <div className="absolute inset-0 rounded-2xl border border-white/[0.06] transition-colors duration-500 group-hover/card:border-transparent" />
              <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-500 group-hover/card:bg-white/[0.04]">
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(14,165,233,0.06) 0%, transparent 60%)' }} />
                <div className="relative flex items-start justify-between">
                  <div>
                    <div className="mb-3 inline-flex rounded-lg bg-sky-500/10 p-2">
                      <svg className="h-5 w-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
                    </div>
                    <h2 className="text-lg font-semibold text-white">Product</h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">
                      Explore live coaching, playbooks, and manager controls.
                    </p>
                  </div>
                  <svg className="mt-1 h-5 w-5 flex-shrink-0 text-neutral-600 transition-all duration-300 group-hover/card:translate-x-1 group-hover/card:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </div>
            </Link>

            <Link
              href="/how-it-works"
              className="group/card relative rounded-2xl p-px transition-all duration-500"
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 50%, #a855f7 65%, #ec4899 75%, transparent 85%)',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                  WebkitMaskComposite: 'xor',
                  padding: '1px',
                }}
              />
              <div className="absolute inset-0 rounded-2xl border border-white/[0.06] transition-colors duration-500 group-hover/card:border-transparent" />
              <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-500 group-hover/card:bg-white/[0.04]">
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(168,85,247,0.06) 0%, transparent 60%)' }} />
                <div className="relative flex items-start justify-between">
                  <div>
                    <div className="mb-3 inline-flex rounded-lg bg-violet-500/10 p-2">
                      <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" /></svg>
                    </div>
                    <h2 className="text-lg font-semibold text-white">How it works</h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">
                      See how reps, managers, and AI work together in one loop.
                    </p>
                  </div>
                  <svg className="mt-1 h-5 w-5 flex-shrink-0 text-neutral-600 transition-all duration-300 group-hover/card:translate-x-1 group-hover/card:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
