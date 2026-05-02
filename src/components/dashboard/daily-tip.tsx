import { Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";

const tips = [
  "Start with the smallest meaningful task and let momentum do the rest.",
  "Protect one focused block today before the day fills itself.",
  "A clear next action beats a perfect plan.",
  "Review your priorities before opening new tabs.",
  "Finish one thread completely before pulling on another.",
  "Make progress visible: capture, sort, and close the loop.",
  "Choose the task that makes every later task easier.",
];

function getDayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

export function DailyTip() {
  const tip = tips[getDayOfYear(new Date()) % tips.length];

  return (
    <Card className="relative overflow-hidden border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20">
      <div className="absolute -right-12 -top-16 h-36 w-36 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-200 ring-1 ring-violet-300/20">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-violet-100">Daily focus</p>
          <p className="mt-1 text-sm leading-6 text-slate-300">{tip}</p>
        </div>
      </div>
    </Card>
  );
}
