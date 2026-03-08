'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Settings, Mic, BarChart3, Shield, type LucideIcon } from 'lucide-react';
import { type ReactNode, useState, useRef, useCallback } from 'react';

export function FeaturesHowItWorks() {
    return (
        <section className="py-16 md:py-28">
            <div className="mx-auto max-w-2xl px-6 lg:max-w-5xl">
                <div className="mx-auto grid gap-4 lg:grid-cols-2">
                    {/* Step 1 */}
                    <FeatureCard>
                        <CardHeader className="pb-3">
                            <CardHeading
                                icon={Settings}
                                title="Step 1 · Connect your workflow"
                                description="Set coaching defaults, rep permissions, and approved agents so every call starts from the same standard."
                                color="#0ea5e9"
                            />
                        </CardHeader>
                        <div className="relative mb-6 border-t border-dashed border-white/10 sm:mb-0">
                            <div className="absolute inset-0 [background:radial-gradient(125%_125%_at_50%_0%,transparent_40%,hsl(var(--muted)),black_125%)]" />
                            <div className="aspect-[76/59] p-4 px-6">
                                <WorkflowIllustration />
                            </div>
                        </div>
                    </FeatureCard>

                    {/* Step 2 */}
                    <FeatureCard>
                        <CardHeader className="pb-3">
                            <CardHeading
                                icon={Mic}
                                title="Step 2 · Coach calls in real time"
                                description="As reps talk, the assistant surfaces suggestions and context cards so they adapt instantly."
                                color="#8b5cf6"
                            />
                        </CardHeader>
                        <CardContent>
                            <div className="relative mb-4 sm:mb-0 h-[280px] border border-white/10 rounded-lg overflow-hidden">
                                <LiveCoachIllustration />
                            </div>
                        </CardContent>
                    </FeatureCard>

                    {/* Step 3 */}
                    <FeatureCard>
                        <CardHeader className="pb-3">
                            <CardHeading
                                icon={BarChart3}
                                title="Step 3 · Review and improve"
                                description="After each call, managers get structured QA signals and reps get clear next actions."
                                color="#f59e0b"
                            />
                        </CardHeader>
                        <CardContent>
                            <div className="relative mb-6 sm:mb-0">
                                <div className="absolute -inset-6 [background:radial-gradient(50%_50%_at_25%_50%,transparent,hsl(var(--background))_100%)]" />
                                <div className="aspect-[76/59] border border-white/10 rounded-lg overflow-hidden">
                                    <ReviewIllustration />
                                </div>
                            </div>
                        </CardContent>
                    </FeatureCard>

                    {/* Step 4 */}
                    <FeatureCard>
                        <CardHeader className="pb-3">
                            <CardHeading
                                icon={Shield}
                                title="Step 4 · Scale with controls"
                                description="Admins govern agent publishing, rep permissions, and coaching defaults across the entire workspace."
                                color="#10b981"
                            />
                        </CardHeader>
                        <div className="relative mb-6 border-t border-dashed border-white/10 sm:mb-0">
                            <div className="absolute inset-0 [background:radial-gradient(125%_125%_at_50%_0%,transparent_40%,hsl(var(--muted)),black_125%)]" />
                            <div className="aspect-[76/59] p-4 px-6">
                                <GovernanceIllustration />
                            </div>
                        </div>
                    </FeatureCard>

                    {/* Full-width process card */}
                    <FeatureCard className="p-6 lg:col-span-2">
                        <p className="mx-auto my-6 max-w-lg text-balance text-center text-2xl font-semibold text-white">
                            A continuous loop that compounds coaching quality.
                        </p>
                        <div className="flex justify-center gap-4 sm:gap-6 overflow-hidden pb-4">
                            <ProcessNode
                                label="Capture"
                                icon="mic"
                                color="#0ea5e9"
                                description="Record every call automatically"
                            />
                            <ProcessArrow />
                            <ProcessNode
                                label="Analyze"
                                icon="brain"
                                color="#8b5cf6"
                                description="AI scores and extracts signals"
                            />
                            <ProcessArrow />
                            <ProcessNode
                                label="Coach"
                                icon="target"
                                color="#f59e0b"
                                description="Deliver real-time guidance"
                            />
                            <ProcessArrow />
                            <ProcessNode
                                label="Improve"
                                icon="trending"
                                color="#10b981"
                                description="Track progress over time"
                            />
                        </div>
                    </FeatureCard>
                </div>
            </div>
        </section>
    );
}

/* ── Process Node with hover tooltip ── */

function ProcessNode({
    label,
    icon,
    color,
    description,
}: {
    label: string;
    icon: 'mic' | 'brain' | 'target' | 'trending';
    color: string;
    description: string;
}) {
    const [hovered, setHovered] = useState(false);

    const iconPaths: Record<string, ReactNode> = {
        mic: (
            <>
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
            </>
        ),
        brain: (
            <>
                <path d="M12 2a4 4 0 0 1 4 4c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2a4 4 0 0 1 4-4Z" />
                <path d="M8 8v2c0 2.2 1.8 4 4 4s4-1.8 4-4V8" />
                <path d="M12 14v4" />
                <path d="M8 18h8" />
                <circle cx="9" cy="6" r="0.5" fill="currentColor" />
                <circle cx="15" cy="6" r="0.5" fill="currentColor" />
            </>
        ),
        target: (
            <>
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
            </>
        ),
        trending: (
            <>
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
            </>
        ),
    };

    return (
        <div
            className="relative flex flex-col items-center gap-2 group/node cursor-pointer"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Hover tooltip */}
            <div
                className={cn(
                    'absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs transition-all duration-300 z-20',
                    hovered
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
                )}
                style={{
                    borderColor: `${color}30`,
                    backgroundColor: `${color}10`,
                    color: color,
                }}
            >
                {description}
                <div
                    className="absolute left-1/2 -bottom-1 h-2 w-2 -translate-x-1/2 rotate-45"
                    style={{ backgroundColor: `${color}10`, borderRight: `1px solid ${color}30`, borderBottom: `1px solid ${color}30` }}
                />
            </div>

            {/* Circle */}
            <div
                className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl transition-all duration-500"
                style={{
                    border: `1px solid ${hovered ? color + '40' : 'rgba(255,255,255,0.08)'}`,
                    backgroundColor: hovered ? `${color}15` : 'rgba(255,255,255,0.02)',
                    boxShadow: hovered ? `0 0 30px ${color}20, 0 0 60px ${color}10` : 'none',
                    transform: hovered ? 'scale(1.1) translateY(-4px)' : 'scale(1) translateY(0)',
                }}
            >
                {/* Glow ring on hover */}
                <div
                    className="absolute inset-0 rounded-2xl transition-opacity duration-500"
                    style={{
                        opacity: hovered ? 1 : 0,
                        background: `conic-gradient(from 0deg, transparent, ${color}30, transparent 40%)`,
                        animation: hovered ? 'process-spin 3s linear infinite' : 'none',
                    }}
                />
                <div
                    className="absolute inset-[1px] rounded-2xl transition-colors duration-500"
                    style={{ backgroundColor: hovered ? `${color}15` : 'rgba(255,255,255,0.02)' }}
                />
                <svg
                    className="relative z-10 h-5 w-5 sm:h-6 sm:w-6 transition-all duration-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        color: hovered ? color : 'rgba(255,255,255,0.5)',
                        filter: hovered ? `drop-shadow(0 0 6px ${color}60)` : 'none',
                    }}
                >
                    {iconPaths[icon]}
                </svg>
            </div>

            {/* Label */}
            <span
                className="text-xs sm:text-sm font-medium transition-colors duration-300"
                style={{ color: hovered ? color : 'rgba(255,255,255,0.4)' }}
            >
                {label}
            </span>
        </div>
    );
}

function ProcessArrow() {
    return (
        <div className="flex items-center self-center -mb-6">
            <svg width="32" height="12" viewBox="0 0 32 12" className="text-white/15">
                <line x1="0" y1="6" x2="26" y2="6" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
                <path d="M24 2 L30 6 L24 10" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
        </div>
    );
}

/* ── Illustrations ── */

function WorkflowIllustration() {
    const configs = [
        { label: 'Discovery playbook', status: 'Active', color: '#0ea5e9' },
        { label: 'Objection handler', status: 'Active', color: '#8b5cf6' },
        { label: 'Closing agent', status: 'Draft', color: '#f59e0b' },
    ];

    return (
        <div className="flex h-full w-full flex-col gap-2 p-4">
            {/* Setup header */}
            <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                <div className="flex items-center gap-2">
                    <svg className="h-3 w-3 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider">Workspace setup</span>
                </div>
                <span className="rounded-full bg-sky-500/15 px-1.5 py-0.5 text-[8px] font-medium text-sky-300">3 agents</span>
            </div>

            {/* Agent list */}
            <div className="flex-1 rounded-lg border border-white/[0.06] bg-white/[0.015] overflow-hidden">
                {configs.map((cfg, i) => (
                    <div
                        key={cfg.label}
                        className={cn(
                            'group/cfg flex items-center justify-between px-3 py-2.5 transition-all duration-300 hover:bg-white/[0.04] cursor-pointer',
                            i < configs.length - 1 && 'border-b border-white/[0.04]'
                        )}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color + '70' }} />
                            <span className="text-[11px] text-neutral-300 transition-colors group-hover/cfg:text-white">{cfg.label}</span>
                        </div>
                        <span
                            className="rounded-full px-1.5 py-0.5 text-[8px] font-medium"
                            style={{
                                color: cfg.status === 'Active' ? '#10b981' : '#f59e0b',
                                backgroundColor: cfg.status === 'Active' ? '#10b98115' : '#f59e0b15',
                            }}
                        >
                            {cfg.status}
                        </span>
                    </div>
                ))}
            </div>

            {/* Quick settings */}
            <div className="grid grid-cols-3 gap-2">
                {[
                    { label: 'Auto-record', enabled: true },
                    { label: 'QA scoring', enabled: true },
                    { label: 'Slack alerts', enabled: false },
                ].map((s) => (
                    <div key={s.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-center">
                        <div className={cn('mx-auto mb-1 h-3 w-6 rounded-full', s.enabled ? 'bg-sky-500/40' : 'bg-white/10')}>
                            <div className={cn('h-3 w-3 rounded-full border-2 border-black/30 transition-all', s.enabled ? 'translate-x-3 bg-sky-400' : 'bg-neutral-600')} />
                        </div>
                        <span className="text-[8px] text-neutral-500">{s.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

const TRANSCRIPT_MESSAGES = [
    { role: 'rep' as const, text: "Hi Sarah, thanks for taking the time today." },
    { role: 'prospect' as const, text: "Of course, we've been looking at solutions for our team." },
    { role: 'rep' as const, text: "Great — can you walk me through how your reps handle objections today?" },
    { role: 'prospect' as const, text: "Honestly, each rep does their own thing. It's pretty inconsistent." },
    { role: 'rep' as const, text: "So there's no shared playbook across the team?" },
    { role: 'prospect' as const, text: "No, and it's showing in our close rates. Down 15% last quarter." },
    { role: 'rep' as const, text: "That's a common challenge. How many reps are on the team?" },
    { role: 'prospect' as const, text: "About 30, split across enterprise and mid-market." },
    { role: 'rep' as const, text: "And who handles coaching and QA currently?" },
    { role: 'prospect' as const, text: "Our managers try, but they can only listen to a few calls per week." },
    { role: 'rep' as const, text: "So you're missing most of the coaching moments." },
    { role: 'prospect' as const, text: "Exactly — we just don't have visibility into what's happening on calls." },
];

function LiveCoachIllustration() {
    return (
        <div className="flex h-full w-full flex-col">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.03] px-3 py-2 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500/80 animate-pulse" />
                    <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">Live</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-neutral-500">02:34</span>
                    <div className="flex items-end gap-[2px]">
                        {[0.3, 0.6, 1, 0.7, 0.4, 0.8, 0.5].map((h, i) => (
                            <div
                                key={i}
                                className="w-[2px] rounded-full bg-violet-400/60"
                                style={{
                                    height: `${h * 10}px`,
                                    animation: `waveform-bar 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Scrolling transcript */}
            <div className="flex-1 relative overflow-hidden">
                {/* Fade masks */}
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-black/80 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-black/80 to-transparent" />

                <div className="animate-transcript-slide space-y-3 px-3 py-3">
                    {/* Duplicate messages for seamless loop */}
                    {[...TRANSCRIPT_MESSAGES, ...TRANSCRIPT_MESSAGES].map((msg, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <div
                                className={cn(
                                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold mt-0.5',
                                    msg.role === 'rep'
                                        ? 'bg-sky-500/20 text-sky-400'
                                        : 'bg-neutral-700 text-neutral-300'
                                )}
                            >
                                {msg.role === 'rep' ? 'R' : 'P'}
                            </div>
                            <div className="min-w-0">
                                <span className={cn('text-[9px] font-medium', msg.role === 'rep' ? 'text-sky-400/70' : 'text-neutral-500')}>
                                    {msg.role === 'rep' ? 'Rep' : 'Prospect'}
                                </span>
                                <p className="text-[11px] leading-relaxed text-neutral-400">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI suggestion — pinned at bottom */}
            <div className="shrink-0 border-t border-violet-500/20 bg-gradient-to-r from-violet-500/[0.08] to-purple-500/[0.03] px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                    <span className="text-[9px] font-semibold text-violet-400 uppercase tracking-wider">Suggested next line</span>
                    <span className="ml-auto rounded-full bg-violet-500/15 px-1.5 py-0.5 text-[8px] font-medium text-violet-300">92%</span>
                </div>
                <p className="text-[10px] leading-relaxed text-violet-200/70">
                    {'"That\'s exactly the gap we solve — would a standardized playbook save your team time?"'}
                </p>
            </div>
        </div>
    );
}

function ReviewIllustration() {
    const metrics = [
        { label: 'Discovery questions', score: 92, color: '#10b981' },
        { label: 'Objection handling', score: 78, color: '#f59e0b' },
        { label: 'Next steps clarity', score: 85, color: '#0ea5e9' },
        { label: 'Talk-to-listen ratio', score: 64, color: '#8b5cf6' },
    ];

    return (
        <div className="flex h-full w-full flex-col gap-2 p-4">
            {/* Score header */}
            <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Post-call QA</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-white">85</span>
                    <span className="text-[10px] text-neutral-500">/100</span>
                </div>
            </div>

            {/* Metric bars */}
            <div className="flex-1 space-y-2.5 rounded-lg border border-white/[0.06] bg-white/[0.015] p-3">
                {metrics.map((m) => (
                    <div key={m.label} className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-neutral-400">{m.label}</span>
                            <span className="text-[10px] font-semibold" style={{ color: m.color }}>{m.score}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                            <div
                                className="h-full rounded-full"
                                style={{
                                    width: `${m.score}%`,
                                    background: `linear-gradient(90deg, ${m.color}50, ${m.color}90)`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Strengths & improvements */}
            <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.04] p-2.5">
                    <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider">Strengths</span>
                    <ul className="mt-1.5 space-y-1">
                        <li className="flex items-center gap-1.5">
                            <span className="text-emerald-400 text-[10px]">+</span>
                            <span className="text-[10px] text-neutral-400">Open-ended questions</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                            <span className="text-emerald-400 text-[10px]">+</span>
                            <span className="text-[10px] text-neutral-400">Active listening</span>
                        </li>
                    </ul>
                </div>
                <div className="rounded-lg border border-amber-500/15 bg-amber-500/[0.04] p-2.5">
                    <span className="text-[9px] font-semibold text-amber-400 uppercase tracking-wider">Improve</span>
                    <ul className="mt-1.5 space-y-1">
                        <li className="flex items-center gap-1.5">
                            <span className="text-amber-400 text-[10px]">!</span>
                            <span className="text-[10px] text-neutral-400">Talk ratio too high</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                            <span className="text-amber-400 text-[10px]">!</span>
                            <span className="text-[10px] text-neutral-400">Set firmer next steps</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

function GovernanceIllustration() {
    const roles = [
        { label: 'Admin', color: '#10b981', perms: [true, true, true, true] },
        { label: 'Manager', color: '#0ea5e9', perms: [true, true, true, false] },
        { label: 'Rep', color: '#8b5cf6', perms: [true, false, false, false] },
    ];
    const headers = ['View', 'Edit', 'Publish', 'Admin'];

    return (
        <div className="flex h-full w-full flex-col gap-2 p-4">
            {/* Top bar */}
            <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                <div className="flex items-center gap-2">
                    <svg className="h-3 w-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Access controls</span>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[8px] font-medium text-emerald-300">3 roles</span>
            </div>

            {/* Permissions table */}
            <div className="flex-1 rounded-lg border border-white/[0.06] bg-white/[0.015] overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[80px_repeat(4,1fr)] border-b border-white/[0.06] bg-white/[0.02] px-3 py-2">
                    <span className="text-[9px] font-medium text-neutral-500 uppercase tracking-wider">Role</span>
                    {headers.map((h) => (
                        <span key={h} className="text-center text-[9px] font-medium text-neutral-500 uppercase tracking-wider">{h}</span>
                    ))}
                </div>
                {/* Rows */}
                {roles.map((role, idx) => (
                    <div
                        key={role.label}
                        className={cn(
                            'group/row grid grid-cols-[80px_repeat(4,1fr)] items-center px-3 py-2.5 transition-all duration-300 hover:bg-white/[0.04] cursor-pointer',
                            idx < roles.length - 1 && 'border-b border-white/[0.04]'
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: role.color + '60' }} />
                            <span className="text-[11px] font-medium transition-colors group-hover/row:text-white" style={{ color: role.color }}>
                                {role.label}
                            </span>
                        </div>
                        {role.perms.map((enabled, j) => (
                            <div key={j} className="flex justify-center">
                                <div
                                    className="flex h-4 w-4 items-center justify-center rounded border transition-all duration-300 group-hover/row:scale-110"
                                    style={{
                                        borderColor: enabled ? role.color + '50' : 'rgba(255,255,255,0.08)',
                                        backgroundColor: enabled ? role.color + '15' : 'transparent',
                                    }}
                                >
                                    {enabled && (
                                        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" style={{ color: role.color }}>
                                            <path d="M3 6l2 2 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Bottom info */}
            <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                    <span className="text-[9px] font-medium text-neutral-500 uppercase tracking-wider">Active agents</span>
                    <p className="mt-1 text-sm font-bold text-white">12 <span className="text-[10px] font-normal text-emerald-400">published</span></p>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                    <span className="text-[9px] font-medium text-neutral-500 uppercase tracking-wider">Team members</span>
                    <p className="mt-1 text-sm font-bold text-white">48 <span className="text-[10px] font-normal text-sky-400">active</span></p>
                </div>
            </div>
        </div>
    );
}

/* ── Sub-components ── */

interface FeatureCardProps {
    children: ReactNode;
    className?: string;
}

const FeatureCard = ({ children, className }: FeatureCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [spotlight, setSpotlight] = useState('');

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setSpotlight(`radial-gradient(600px circle at ${x}px ${y}px, rgba(255,255,255,0.03), transparent 40%)`);
    }, []);

    return (
        <Card
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setSpotlight('')}
            className={cn('group relative rounded-none shadow-zinc-950/5 bg-black/50 border-white/[0.08] overflow-hidden', className)}
        >
            {spotlight && (
                <div className="pointer-events-none absolute inset-0 z-0" style={{ background: spotlight }} />
            )}
            <CardDecorator />
            {children}
        </Card>
    );
};

const CardDecorator = () => (
    <>
        <span className="border-primary absolute -left-px -top-px block size-2 border-l-2 border-t-2" />
        <span className="border-primary absolute -right-px -top-px block size-2 border-r-2 border-t-2" />
        <span className="border-primary absolute -bottom-px -left-px block size-2 border-b-2 border-l-2" />
        <span className="border-primary absolute -bottom-px -right-px block size-2 border-b-2 border-r-2" />
    </>
);

interface CardHeadingProps {
    icon: LucideIcon;
    title: string;
    description: string;
    color: string;
}

const CardHeading = ({ icon: Icon, title, description, color }: CardHeadingProps) => (
    <div className="p-6">
        <span className="flex items-center gap-2">
            <span
                className="flex h-6 w-6 items-center justify-center rounded-md"
                style={{ backgroundColor: `${color}15` }}
            >
                <Icon className="size-3.5" style={{ color }} />
            </span>
            <span className="text-sm font-medium text-neutral-400">{title}</span>
        </span>
        <p className="mt-6 text-xl font-semibold text-white sm:text-2xl">{description}</p>
    </div>
);
