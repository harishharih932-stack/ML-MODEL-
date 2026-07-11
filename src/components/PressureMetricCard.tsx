import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { SafetyBadge } from "./SafetyBadge";
import { getSafetyLevel } from "@/lib/predictionEngine";

export function PressureMetricCard({ pressure }: { pressure: number }) {
  const [display, setDisplay] = useState(pressure);
  const prev = useRef(pressure);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const from = prev.current;
    const to = pressure;
    const start = performance.now();
    const duration = 400;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    prev.current = pressure;
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [pressure]);

  const level = getSafetyLevel(pressure);

  return (
    <Card className="flex flex-col gap-4 rounded-2xl border-slate-200 bg-white p-6 shadow-md md:flex-row md:items-center md:justify-between">
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Current Predicted Pressure
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-6xl font-bold tabular-nums text-slate-900">
            {display.toFixed(2)}
          </span>
          <span className="text-2xl font-semibold text-cyan-600">MPa</span>
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Formula-Based Inverse Estimation Engine
        </div>
      </div>
      <SafetyBadge level={level} />
    </Card>
  );
}
