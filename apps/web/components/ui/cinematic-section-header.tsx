'use client';

import { useRef, useEffect, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';

/** Animated grid lines that pulse outward from center */
function PulsingGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const t = Date.now() * 0.001;

    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const spacing = 40;
    const maxDist = Math.sqrt(cx * cx + cy * cy);

    // Horizontal lines
    for (let y = spacing; y < h; y += spacing) {
      const dist = Math.abs(y - cy) / maxDist;
      const wave = Math.sin(t * 2 - dist * 6) * 0.5 + 0.5;
      const alpha = (1 - dist) * wave * 0.12;
      ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Vertical lines
    for (let x = spacing; x < w; x += spacing) {
      const dist = Math.abs(x - cx) / maxDist;
      const wave = Math.sin(t * 2 - dist * 6 + 1) * 0.5 + 0.5;
      const alpha = (1 - dist) * wave * 0.12;
      ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Center glow pulse
    const pulseRadius = 60 + Math.sin(t * 1.5) * 20;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseRadius);
    gradient.addColorStop(0, 'rgba(129, 140, 248, 0.08)');
    gradient.addColorStop(1, 'rgba(129, 140, 248, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 -z-10"
    />
  );
}

/** Morphing border badge */
function MorphBadge({ text }: { text: string }) {
  return (
    <div className="relative inline-flex">
      {/* Animated border */}
      <div
        className="absolute -inset-[1px] rounded-full opacity-60"
        style={{
          background: 'conic-gradient(from var(--badge-angle, 0deg), transparent 40%, #818cf8 50%, transparent 60%)',
          animation: 'badge-spin 4s linear infinite',
        }}
      />
      <div className="relative rounded-full bg-black px-4 py-1.5">
        <span className="relative z-10 text-[11px] font-semibold uppercase tracking-[0.25em] text-indigo-300">
          {text}
        </span>
      </div>
    </div>
  );
}

interface CinematicSectionHeaderProps {
  badge: string;
  titleBefore: string;
  titleHighlight: string;
  titleAfter: string;
  subtitle: string;
}

export function CinematicSectionHeader({
  badge,
  titleBefore,
  titleHighlight,
  titleAfter,
  subtitle,
}: CinematicSectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: '-80px' });

  return (
    <div ref={ref} className="relative text-center">
      <PulsingGrid />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
      >
        <MorphBadge text={badge} />
      </motion.div>

      {/* Title with highlighted word */}
      <div className="mt-5 overflow-hidden">
        <motion.h2
          className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {/* Before text */}
          <motion.span
            className="inline-block text-white"
            initial={{ y: 40, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.4, 0.25, 1] }}
          >
            {titleBefore}
          </motion.span>{' '}

          {/* Highlighted word — gradient + glow */}
          <motion.span
            className="relative inline-block"
            initial={{ y: 40, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <span
              className="relative z-10 bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)',
              }}
            >
              {titleHighlight}
            </span>
            {/* Glow behind highlighted word */}
            <span
              className="pointer-events-none absolute inset-0 -z-10 blur-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(129,140,248,0.3), rgba(192,132,252,0.2), rgba(244,114,182,0.15))',
              }}
            />
          </motion.span>{' '}

          {/* After text */}
          <motion.span
            className="inline-block text-white"
            initial={{ y: 40, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
          >
            {titleAfter}
          </motion.span>
        </motion.h2>
      </div>

      {/* Subtitle with typewriter-like char reveal */}
      <motion.p
        className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-neutral-400"
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.7, delay: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      >
        {subtitle}
      </motion.p>

      {/* Decorative side lines */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-4">
        <motion.div
          className="h-[1px] bg-gradient-to-l from-indigo-500/40 to-transparent"
          initial={{ width: 0 }}
          animate={isInView ? { width: 120 } : { width: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />
        <motion.div
          className="h-2 w-2 rounded-full bg-indigo-500/50"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: [0, 1.4, 1] } : { scale: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        />
        <motion.div
          className="h-[1px] bg-gradient-to-r from-indigo-500/40 to-transparent"
          initial={{ width: 0 }}
          animate={isInView ? { width: 120 } : { width: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />
      </div>
    </div>
  );
}
