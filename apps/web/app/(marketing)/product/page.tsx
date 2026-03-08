'use client';

import Link from 'next/link';
import { BackgroundPaths } from '@/components/ui/background-paths';
import { motion } from 'framer-motion';
import { Mic, BookOpen, ClipboardCheck, Shield } from 'lucide-react';
import { useRef, useState, useCallback } from 'react';

const BLOCKS = [
  {
    icon: Mic,
    title: 'Live guidance panel',
    body: 'During calls, reps get one clear next line, context cards, and pace nudges that update in seconds.',
    color: '#0ea5e9',
    tag: 'Real-time',
  },
  {
    icon: BookOpen,
    title: 'Team playbooks',
    body: 'Define your own stages and checklist outcomes so coaching aligns with your process, not generic scripts.',
    color: '#8b5cf6',
    tag: 'Customizable',
  },
  {
    icon: ClipboardCheck,
    title: 'Post-call QA',
    body: 'Each call ends with structured summaries, strengths, improvements, and execution risks for faster coaching follow-up.',
    color: '#f59e0b',
    tag: 'Automated',
  },
  {
    icon: Shield,
    title: 'Governance controls',
    body: 'Admins and managers control agent publishing, rep permissions, and defaults across the workspace.',
    color: '#10b981',
    tag: 'Enterprise',
  },
];

function FeatureCard({
  block,
  index,
}: {
  block: (typeof BLOCKS)[number];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [spotlightStyle, setSpotlightStyle] = useState('');

  const Icon = block.icon;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSpotlightStyle(
      `radial-gradient(400px circle at ${x}px ${y}px, ${block.color}0a, transparent 60%)`
    );
  }, [block.color]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setSpotlightStyle('')}
      className="group relative"
    >
      {/* Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-500 group-hover:border-white/[0.12] group-hover:bg-white/[0.04]">
        {/* Cursor spotlight — pure CSS, no spring physics */}
        {spotlightStyle && (
          <div
            className="pointer-events-none absolute inset-0 z-0 transition-none"
            style={{ background: spotlightStyle }}
          />
        )}

        {/* Top accent line — CSS only */}
        <div
          className="absolute left-6 right-6 top-0 h-[1px] origin-center scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
          style={{ background: `linear-gradient(90deg, transparent, ${block.color}40, transparent)` }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundColor: `${block.color}10` }}
              >
                <Icon className="h-5 w-5" style={{ color: block.color }} />
              </div>
              <h2 className="text-lg font-semibold text-white">{block.title}</h2>
            </div>

            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{ color: block.color, backgroundColor: `${block.color}10` }}
            >
              {block.tag}
            </span>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-neutral-400 transition-colors duration-500 group-hover:text-neutral-300">
            {block.body}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProductPage() {
  const titleWords = 'Product'.split('');

  return (
    <BackgroundPaths>
      <div className="mx-auto w-full max-w-6xl px-4 py-28 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="max-w-3xl"
        >
          <h1 className="text-5xl font-bold tracking-tighter sm:text-7xl">
            {titleWords.map((letter, i) => (
              <motion.span
                key={i}
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: i * 0.04,
                  type: 'spring',
                  stiffness: 150,
                  damping: 25,
                }}
                className="inline-block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
              >
                {letter}
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-5 text-lg leading-relaxed text-neutral-400"
          >
            Cloze gives reps a focused in-call assistant and gives managers a repeatable coaching system across every conversation.
          </motion.p>
        </motion.div>

        {/* Feature cards with 3D tilt */}
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {BLOCKS.map((block, i) => (
            <FeatureCard key={block.title} block={block} index={i} />
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="group relative mt-12 overflow-hidden rounded-2xl"
        >
          {/* Animated gradient border */}
          <div
            className="absolute -inset-[1px] rounded-2xl opacity-60"
            style={{
              background: 'conic-gradient(from var(--badge-angle, 0deg), transparent 60%, #0ea5e9 70%, transparent 80%)',
              animation: 'badge-spin 6s linear infinite',
            }}
          />
          <div className="relative rounded-2xl bg-black/90 p-8 backdrop-blur-xl">
            {/* Gradient mesh */}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.04]"
              style={{
                backgroundImage: 'radial-gradient(circle at 30% 50%, #0ea5e9, transparent 50%), radial-gradient(circle at 70% 50%, #8b5cf6, transparent 50%)',
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-400">Custom agents</span>
              </div>
              <h3 className="mt-3 text-xl font-bold text-white">Need a tailored coaching profile?</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-400">
                We can build a custom agent tuned to your segment, objection patterns, and qualification standards.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/book-demo?type=custom-agent"
                  className="relative overflow-hidden rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all duration-300 hover:shadow-sky-500/40 hover:brightness-110"
                >
                  Request custom agent
                </Link>
                <Link
                  href="/book-demo"
                  className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-semibold text-neutral-300 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]"
                >
                  Book demo
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </BackgroundPaths>
  );
}
