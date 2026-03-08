'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Brain, Sparkles, Shield } from 'lucide-react';

const FEATURES = [
  {
    icon: Mic,
    title: 'Live Coaching',
    description: 'Real-time next-line coaching during live calls',
    color: '#0ea5e9', // sky-500
    gradient: 'from-sky-500/20 to-sky-500/0',
  },
  {
    icon: Brain,
    title: 'AI Agents',
    description: 'Configurable AI agents aligned to your company playbook',
    color: '#8b5cf6', // violet-500
    gradient: 'from-violet-500/20 to-violet-500/0',
  },
  {
    icon: Sparkles,
    title: 'Post-Call Insights',
    description: 'Post-call summaries with strengths, risks, and next actions',
    color: '#f59e0b', // amber-500
    gradient: 'from-amber-500/20 to-amber-500/0',
  },
  {
    icon: Shield,
    title: 'Team Governance',
    description: 'Team governance controls for managers and admins',
    color: '#10b981', // emerald-500
    gradient: 'from-emerald-500/20 to-emerald-500/0',
  },
];

export function InteractiveHighlights() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  // Auto-cycle through features
  useEffect(() => {
    if (isHovering) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % FEATURES.length);
    }, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovering]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const activeFeature = FEATURES[activeIndex];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="flex max-w-md flex-col justify-center lg:py-8"
    >
      <h3 className="text-2xl font-bold tracking-tight text-white">
        What teams get
      </h3>
      <p className="mt-2 text-sm text-neutral-400">
        Real-time guidance, intelligent agents, and actionable insights — all working together.
      </p>

      {/* Feature cards */}
      <div className="mt-6 space-y-3">
        {FEATURES.map((feature, i) => {
          const isActive = i === activeIndex;
          const Icon = feature.icon;

          return (
            <motion.button
              key={feature.title}
              onClick={() => setActiveIndex(i)}
              onMouseEnter={() => setActiveIndex(i)}
              className="group relative w-full overflow-hidden rounded-xl border text-left transition-all duration-500"
              style={{
                borderColor: isActive ? `${feature.color}40` : 'rgba(255,255,255,0.06)',
              }}
              animate={{
                backgroundColor: isActive ? `${feature.color}08` : 'rgba(0,0,0,0)',
              }}
              transition={{ duration: 0.4 }}
            >
              {/* Cursor glow */}
              {isActive && isHovering && (
                <div
                  className="pointer-events-none absolute -inset-px z-0 opacity-30 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y}px, ${feature.color}30, transparent 70%)`,
                  }}
                />
              )}

              {/* Active indicator line */}
              <motion.div
                className="absolute left-0 top-0 h-full w-[2px] rounded-full"
                style={{ backgroundColor: feature.color }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: isActive ? 1 : 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />

              <div className="relative z-10 flex items-center gap-3 px-4 py-3">
                {/* Icon */}
                <motion.div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: isActive ? `${feature.color}15` : 'rgba(255,255,255,0.04)',
                  }}
                  animate={{
                    scale: isActive ? 1 : 0.9,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon
                    className="h-4 w-4 transition-colors duration-300"
                    style={{ color: isActive ? feature.color : '#737373' }}
                  />
                </motion.div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium transition-colors duration-300"
                    style={{ color: isActive ? '#ffffff' : '#a3a3a3' }}
                  >
                    {feature.title}
                  </p>
                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="overflow-hidden text-xs text-neutral-400"
                      >
                        {feature.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Active pulse dot */}
                <motion.div
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: feature.color }}
                  animate={{
                    opacity: isActive ? [1, 0.4, 1] : 0,
                    scale: isActive ? [1, 1.2, 1] : 0.5,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </div>

              {/* Bottom progress bar for active item */}
              {isActive && !isHovering && (
                <motion.div
                  className="absolute bottom-0 left-0 h-[1px]"
                  style={{ backgroundColor: `${feature.color}60` }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, ease: 'linear' }}
                  key={`progress-${i}-${activeIndex}`}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Active feature detail panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
        >
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: activeFeature.color }}
            />
            <span
              className="animate-shimmer bg-[length:200%_100%] bg-clip-text text-xs font-semibold uppercase tracking-widest text-transparent"
              style={{
                backgroundImage: `linear-gradient(110deg, ${activeFeature.color}90 35%, #ffffff 50%, ${activeFeature.color}90 65%)`,
              }}
            >
              {activeFeature.title}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-neutral-300">
            {activeFeature.description}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
