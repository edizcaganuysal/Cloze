'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Server, KeyRound } from 'lucide-react';
import { BackgroundPaths } from '@/components/ui/background-paths';
import RadialOrbitalTimeline from '@/components/ui/radial-orbital-timeline';

const SECURITY_NODES = [
  {
    id: 1,
    title: 'Access Control',
    date: 'Always on',
    content:
      'Role-based permissions enforced across admin, manager, and rep workflows. Granular controls prevent unintended access to sensitive coaching data.',
    category: 'Auth',
    icon: KeyRound,
    relatedIds: [2, 6],
    status: 'completed' as const,
    energy: 100,
  },
  {
    id: 2,
    title: 'Encryption',
    date: 'TLS 1.3',
    content:
      'All traffic encrypted in transit via TLS 1.3. Data at rest protected with AES-256 encryption across all storage layers.',
    category: 'Transport',
    icon: Lock,
    relatedIds: [1, 3],
    status: 'completed' as const,
    energy: 100,
  },
  {
    id: 3,
    title: 'Monitoring',
    date: '24/7',
    content:
      'Real-time health checks, structured logging, and anomaly detection for proactive incident response and system observability.',
    category: 'Ops',
    icon: Eye,
    relatedIds: [2, 4],
    status: 'completed' as const,
    energy: 95,
  },
  {
    id: 4,
    title: 'Data Minimization',
    date: 'By design',
    content:
      'Only required call metadata and coaching signals are stored. No raw audio persisted beyond processing. Retention policies enforced automatically.',
    category: 'Privacy',
    icon: Database,
    relatedIds: [3, 5],
    status: 'completed' as const,
    energy: 90,
  },
  {
    id: 5,
    title: 'Infrastructure',
    date: 'SOC 2',
    content:
      'Deployed on SOC 2 compliant cloud infrastructure with network isolation, automated patching, and immutable deployments.',
    category: 'Infra',
    icon: Server,
    relatedIds: [4, 6],
    status: 'completed' as const,
    energy: 95,
  },
  {
    id: 6,
    title: 'Governance',
    date: 'Enterprise',
    content:
      'Audit logs for all admin actions, SSO integration support, and workspace-level policies for agent publishing and data access.',
    category: 'Compliance',
    icon: Shield,
    relatedIds: [5, 1],
    status: 'in-progress' as const,
    energy: 80,
  },
];

export default function SecurityPage() {
  const titleWords = 'Security'.split('');

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
            Security and reliability built into every layer. Click any node to explore our defense-in-depth approach.
          </motion.p>
        </motion.div>

        {/* Orbital Timeline */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-8"
        >
          <RadialOrbitalTimeline timelineData={SECURITY_NODES} />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="group relative mt-4 overflow-hidden rounded-2xl"
        >
          <div
            className="absolute -inset-[1px] rounded-2xl opacity-60"
            style={{
              background:
                'conic-gradient(from var(--badge-angle, 0deg), transparent 60%, #8b5cf6 70%, transparent 80%)',
              animation: 'badge-spin 6s linear infinite',
            }}
          />
          <div className="relative rounded-2xl bg-black/90 p-8 backdrop-blur-xl">
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.04]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 30% 50%, #8b5cf6, transparent 50%), radial-gradient(circle at 70% 50%, #0ea5e9, transparent 50%)',
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                  Enterprise security
                </span>
              </div>
              <h3 className="mt-3 text-xl font-bold text-white">
                Need a security review package?
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-400">
                We can walk through architecture, controls, and deployment posture with your security or procurement team.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/book-demo?type=security-review"
                  className="relative overflow-hidden rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all duration-300 hover:shadow-violet-500/40 hover:brightness-110"
                >
                  Request review
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
