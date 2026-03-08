'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BackgroundPaths } from '@/components/ui/background-paths';
import { FeaturesHowItWorks } from '@/components/ui/features-how-it-works';

export default function HowItWorksPage() {
  const titleWords = 'How it works'.split('');

  return (
    <BackgroundPaths>
      <div className="mx-auto w-full max-w-6xl px-4 py-28 sm:px-6 lg:px-8">
        {/* Hero */}
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
                {letter === ' ' ? '\u00A0' : letter}
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-5 text-lg leading-relaxed text-neutral-400"
          >
            A simple loop: set standards, coach live, measure outcomes.
          </motion.p>
        </motion.div>

        {/* Features Section */}
        <FeaturesHowItWorks />

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="flex flex-wrap gap-3"
        >
          <Link
            href="/book-demo"
            className="relative overflow-hidden rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all duration-300 hover:shadow-sky-500/40 hover:brightness-110"
          >
            Book demo
          </Link>
          <Link
            href="/product"
            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-semibold text-neutral-300 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]"
          >
            See product
          </Link>
        </motion.div>
      </div>
    </BackgroundPaths>
  );
}
