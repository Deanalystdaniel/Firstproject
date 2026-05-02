import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: number;
  helper: string;
  icon: LucideIcon;
  tone?: "violet" | "emerald" | "sky";
};

const toneStyles = {
  violet: "from-violet-500/20 to-fuchsia-500/5 text-violet-200 ring-violet-400/20",
  emerald: "from-emerald-500/20 to-teal-500/5 text-emerald-200 ring-emerald-400/20",
  sky: "from-sky-500/20 to-cyan-500/5 text-sky-200 ring-sky-400/20",
};

export function StatCard({ title, value, helper, icon: Icon, tone = "violet" }: StatCardProps) {
  return (
    <Card className="overflow-hidden border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20">
      <CardContent className="relative p-5">
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-24 bg-gradient-to-br opacity-80",
            toneStyles[tone],
          )}
        />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-white">{value}</p>
            <p className="mt-2 text-sm text-slate-500">{helper}</p>
          </div>
          <div className={cn("rounded-2xl bg-white/10 p-3 ring-1", toneStyles[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
