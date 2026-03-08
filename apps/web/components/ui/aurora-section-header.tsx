'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useMotionValue, useTransform, useSpring } from 'framer-motion';

/** Soft aurora blobs that drift behind the text */
function AuroraBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Primary blob */}
      <div
        className="absolute left-1/2 top-1/2 h-[500px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.07] blur-[120px]"
        style={{
          background: 'conic-gradient(from 180deg, #0ea5e9, #8b5cf6, #ec4899, #0ea5e9)',
          animation: 'aurora-drift 12s ease-in-out infinite alternate',
        }}
      />
      {/* Secondary blob */}
      <div
        className="absolute left-[30%] top-[40%] h-[300px] w-[400px] rounded-full opacity-[0.05] blur-[100px]"
        style={{
          background: 'radial-gradient(circle, #3b82f6, transparent)',
          animation: 'aurora-drift-2 10s ease-in-out infinite alternate-reverse',
        }}
      />
    </div>
  );
}

/** Floating micro-dots that drift upward */
function FloatingDots() {
  const dots = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${10 + Math.random() * 80}%`,
    delay: Math.random() * 5,
    duration: 4 + Math.random() * 4,
    size: 1 + Math.random() * 2,
    opacity: 0.15 + Math.random() * 0.25,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="absolute rounded-full bg-sky-400"
          style={{
            left: dot.left,
            bottom: '-4px',
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            opacity: dot.opacity,
            animation: `float-up ${dot.duration}s ease-in-out ${dot.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

interface AuroraSectionHeaderProps {
  badge?: string;
  title: string;
  subtitle: string;
}

export function AuroraSectionHeader({ badge, title, subtitle }: AuroraSectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: '-100px' });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  // Subtle parallax on the glow
  const glowX = useTransform(smoothX, [-200, 200], [-30, 30]);
  const glowY = useTransform(smoothY, [-200, 200], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mouseX.set(e.clientX - cx);
    mouseY.set(e.clientY - cy);
  };

  // Split title into words for staggered reveal
  const words = title.split(' ');

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className="relative max-w-md"
    >
      <AuroraBlobs />
      <FloatingDots />

      {/* Interactive cursor spotlight */}
      <motion.div
        className="pointer-events-none absolute -z-10 h-[300px] w-[300px] rounded-full opacity-[0.04] blur-[80px]"
        style={{
          background: 'radial-gradient(circle, #0ea5e9, transparent 70%)',
          x: glowX,
          y: glowY,
          left: '50%',
          top: '50%',
          translateX: '-50%',
          translateY: '-50%',
        }}
      />

      {/* Badge */}
      {badge && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5 }}
          className="mb-4 inline-flex rounded-full border border-sky-500/20 bg-sky-500/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-400"
        >
          {badge}
        </motion.p>
      )}

      {/* Title — word-by-word staggered reveal with gradient */}
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={
              isInView
                ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                : { opacity: 0, y: 20, filter: 'blur(8px)' }
            }
            transition={{
              duration: 0.6,
              delay: 0.1 + i * 0.08,
              ease: [0.25, 0.4, 0.25, 1],
            }}
            className="inline-block bg-gradient-to-b from-white via-white to-neutral-400 bg-clip-text text-transparent"
          >
            {word}
            {i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        ))}
      </h2>

      {/* Subtitle with fade-in */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
        className="mt-3 text-base text-neutral-400"
      >
        {subtitle}
      </motion.p>

      {/* Animated underline accent */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        className="mt-5 h-[1px] w-24 origin-left"
        style={{
          background: 'linear-gradient(90deg, #0ea5e9, #8b5cf6, transparent)',
        }}
      />
    </div>
  );
}
