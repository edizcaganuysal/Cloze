'use client';

/** "Without Cloze" panel — chaotic sales metrics */
export function WithoutClozePanel() {
  return (
    <div className="flex h-full w-full flex-col bg-[#0c0c0c] p-5 font-mono text-xs">
      {/* Terminal header */}
      <div className="mb-4 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
        <span className="ml-3 text-[10px] text-neutral-600">sales-dashboard — no coaching</span>
      </div>

      <div className="space-y-3 text-neutral-500">
        <p><span className="text-red-400">ERR</span> rep_performance.analyze()</p>
        <p className="pl-4 text-red-400/70">→ No playbook detected</p>
        <p className="pl-4 text-red-400/70">→ Objection handling: <span className="text-red-300">MISSED</span></p>
        <p className="mt-2"><span className="text-yellow-500">WARN</span> call_quality.score()</p>
        <p className="pl-4 text-yellow-400/70">→ Talk ratio: <span className="text-yellow-300">78% rep / 22% prospect</span></p>
        <p className="pl-4 text-yellow-400/70">→ Discovery questions: <span className="text-yellow-300">1 of 8</span></p>

        <div className="mt-4 rounded border border-red-900/40 bg-red-950/20 p-3">
          <p className="text-red-400">{'// Q3 Sales Performance'}</p>
          <p className="mt-1 text-neutral-600">quota_attainment: <span className="text-red-300">42%</span></p>
          <p className="text-neutral-600">avg_deal_cycle: <span className="text-red-300">68 days</span></p>
          <p className="text-neutral-600">win_rate: <span className="text-red-300">14%</span></p>
          <p className="text-neutral-600">forecast_accuracy: <span className="text-red-300">31%</span></p>
          <p className="text-neutral-600">ramp_time: <span className="text-red-300">5.2 months</span></p>
        </div>

        <p className="mt-3"><span className="text-red-400">CRIT</span> pipeline.health()</p>
        <p className="pl-4 text-red-400/70">→ 73% of deals stalled &gt; 14 days</p>
        <p className="pl-4 text-red-400/70">→ Manager review coverage: <span className="text-red-300">12%</span></p>

        <p className="mt-3 text-neutral-600">status: <span className="text-red-400 animate-pulse">● UNCOACHED</span></p>
      </div>
    </div>
  );
}

/** "With Cloze" panel — optimized sales metrics */
export function WithClozePanel() {
  return (
    <div className="flex h-full w-full flex-col bg-[#0c0c0c] p-5 font-mono text-xs">
      {/* Terminal header */}
      <div className="mb-4 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
        <span className="ml-3 text-[10px] text-neutral-600">sales-dashboard — cloze active</span>
      </div>

      <div className="space-y-3 text-neutral-500">
        <p><span className="text-emerald-400">OK </span> rep_performance.analyze()</p>
        <p className="pl-4 text-emerald-400/70">→ Playbook adherence: <span className="text-emerald-300">96%</span></p>
        <p className="pl-4 text-emerald-400/70">→ Objection handling: <span className="text-emerald-300">COACHED LIVE</span></p>
        <p className="mt-2"><span className="text-emerald-400">OK </span> call_quality.score()</p>
        <p className="pl-4 text-emerald-400/70">→ Talk ratio: <span className="text-emerald-300">45% rep / 55% prospect</span></p>
        <p className="pl-4 text-emerald-400/70">→ Discovery questions: <span className="text-emerald-300">7 of 8</span></p>

        <div className="mt-4 rounded border border-emerald-900/40 bg-emerald-950/20 p-3">
          <p className="text-emerald-400">{'// Q3 Sales Performance'}</p>
          <p className="mt-1 text-neutral-600">quota_attainment: <span className="text-emerald-300">118%</span></p>
          <p className="text-neutral-600">avg_deal_cycle: <span className="text-emerald-300">34 days</span></p>
          <p className="text-neutral-600">win_rate: <span className="text-emerald-300">41%</span></p>
          <p className="text-neutral-600">forecast_accuracy: <span className="text-emerald-300">89%</span></p>
          <p className="text-neutral-600">ramp_time: <span className="text-emerald-300">2.1 months</span></p>
        </div>

        <p className="mt-3"><span className="text-emerald-400">OK </span> pipeline.health()</p>
        <p className="pl-4 text-emerald-400/70">→ 91% of deals progressing on schedule</p>
        <p className="pl-4 text-emerald-400/70">→ AI coaching coverage: <span className="text-emerald-300">100%</span></p>

        <p className="mt-3 text-neutral-600">status: <span className="text-emerald-400">● CLOZE ACTIVE</span></p>
      </div>
    </div>
  );
}
