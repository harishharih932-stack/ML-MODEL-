import type { SafetyLevel } from "@/lib/predictionEngine";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

export function SafetyBadge({ level }: { level: SafetyLevel }) {
  if (level === "safe") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm">
        <CheckCircle2 className="h-4 w-4" /> SAFE
      </span>
    );
  }
  if (level === "warning") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm animate-pulse">
        <AlertTriangle className="h-4 w-4" /> WARNING
      </span>
    );
  }
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm animate-pulse">
        <ShieldAlert className="h-4 w-4" /> CRITICAL ALARM
      </span>
      <span className="text-xs text-red-600">
        Risk of hydrogen structural embrittlement
      </span>
    </div>
  );
}
