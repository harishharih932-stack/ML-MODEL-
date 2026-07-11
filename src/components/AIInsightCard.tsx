import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { fetchGroqInsight } from "@/lib/groqClient";
import type { SensorInputs } from "@/lib/predictionEngine";

interface Props {
  enabled: boolean;
  apiKey: string;
  inputs: SensorInputs;
  pressure: number;
  status: string;
}

export function AIInsightCard({ enabled, apiKey, inputs, pressure, status }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled || !apiKey) return;
    let cancel = false;
    const t = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const out = await fetchGroqInsight(apiKey, inputs, pressure, status);
        if (!cancel) setText(out);
      } catch {
        if (!cancel) setError("AI insight unavailable — check your Groq API key in Settings.");
      } finally {
        if (!cancel) setLoading(false);
      }
    }, 600);
    return () => {
      cancel = true;
      clearTimeout(t);
    };
  }, [enabled, apiKey, inputs, pressure, status]);

  if (!enabled || !apiKey) {
    return (
      <Card className="rounded-2xl border-dashed border-slate-200 bg-slate-50/50 p-4 text-xs text-slate-500">
        Add a Groq API key in Settings to enable AI-written insights (optional).
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-2 rounded-2xl border-slate-200 bg-white p-6 shadow-md">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-cyan-600" />
        <h2 className="text-base font-semibold text-slate-900">AI Insight</h2>
      </div>
      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Generating commentary…
        </div>
      )}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && text && (
        <p className="text-sm leading-relaxed text-slate-700">{text}</p>
      )}
    </Card>
  );
}
