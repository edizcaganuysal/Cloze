'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';

export function AcademicCredentials() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: '-60px' });

  return (
    <section ref={ref} className="relative overflow-hidden border-y border-white/[0.04]">
      {/* Subtle gradient mesh background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #818cf8 0%, transparent 50%), radial-gradient(circle at 80% 50%, #c084fc 0%, transparent 50%)',
          }}
        />
        {/* Animated scan line */}
        <motion.div
          className="absolute top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent"
          animate={{ left: ['0%', '100%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between">
          {/* Text side */}
          <div className="max-w-lg">
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em]"
            >
              <span className="h-[1px] w-6 bg-gradient-to-r from-indigo-500 to-transparent" />
              <span
                className="animate-shimmer bg-[length:200%_100%] bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(110deg, #818cf8 35%, #e0e7ff 50%, #818cf8 65%)',
                }}
              >
                Built on research
              </span>
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-4 text-base leading-relaxed text-neutral-400"
            >
              Cloze is developed by researchers and engineers from{' '}
              <span className="text-white font-medium">University of Toronto</span> and{' '}
              <span className="text-white font-medium">Johns Hopkins University</span>,
              {' '}bringing world-class AI expertise to every sales conversation.
            </motion.p>
          </div>

          {/* Logos */}
          <div className="flex items-center gap-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="group"
            >
              <Image
                src="/logos/uoft.png"
                alt="University of Toronto"
                width={240}
                height={240}
                style={{ filter: 'invert(1)' }}
                className="h-24 w-auto opacity-80 transition-all duration-500 group-hover:opacity-100"
              />
            </motion.div>

            <motion.div
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="hidden h-16 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent lg:block"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="group"
            >
              <Image
                src="/logos/jhu.png"
                alt="Johns Hopkins University"
                width={240}
                height={240}
                style={{ filter: 'invert(1) grayscale(1)' }}
                className="h-28 w-auto mix-blend-lighten opacity-70 transition-all duration-500 group-hover:opacity-100"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
