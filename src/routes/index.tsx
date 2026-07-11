import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { SensorInputPanel, DEFAULTS } from "@/components/SensorInputPanel";
import { PressureMetricCard } from "@/components/PressureMetricCard";
import { CalculationBreakdown } from "@/components/CalculationBreakdown";
import { ValidationGrid } from "@/components/ValidationGrid";
import { AIInsightCard } from "@/components/AIInsightCard";
import { predictPressure, getSafetyLevel, type SensorInputs } from "@/lib/predictionEngine";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AuraPhC — AI-Assisted Inverse Pressure Prediction" },
      {
        name: "description",
        content:
          "Formula-calibrated inverse mapping for photonic crystal pressure sensors used in hydrogen storage monitoring.",
      },
      { property: "og:title", content: "AuraPhC — Inverse Pressure Prediction Dashboard" },
      {
        property: "og:description",
        content: "Convert optical sensor readings into predicted pressure (MPa), fully client-side.",
      },
    ],
  }),
  component: Dashboard,
});

const STORAGE_KEY = "auraphc.groq.key";
const STORAGE_ENABLED = "auraphc.groq.enabled";

function Dashboard() {
  const [inputs, setInputs] = useState<SensorInputs>(DEFAULTS);
  const [apiKey, setApiKey] = useState("");
  const [aiEnabled, setAiEnabled] = useState(false);

  // Client-only load of stored settings.
  useEffect(() => {
    try {
      const k = localStorage.getItem(STORAGE_KEY);
      const e = localStorage.getItem(STORAGE_ENABLED);
      if (k) setApiKey(k);
      if (e) setAiEnabled(e === "1");
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, apiKey);
      localStorage.setItem(STORAGE_ENABLED, aiEnabled ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [apiKey, aiEnabled]);

  const result = useMemo(() => predictPressure(inputs), [inputs]);
  const level = getSafetyLevel(result.pressure);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header
        apiKey={apiKey}
        setApiKey={setApiKey}
        aiEnabled={aiEnabled}
        setAiEnabled={setAiEnabled}
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            AI-Assisted Inverse Pressure Prediction
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Formula-Calibrated Inverse Mapping for Photonic Crystal Pressure Sensors
            (Hydrogen Storage Monitoring)
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SensorInputPanel values={inputs} onChange={setInputs} />
          </div>

          <div className="flex flex-col gap-6 lg:col-span-8">
            <PressureMetricCard pressure={result.pressure} />
            <CalculationBreakdown result={result} />
            <AIInsightCard
              enabled={aiEnabled}
              apiKey={apiKey}
              inputs={inputs}
              pressure={result.pressure}
              status={level}
            />
            <ValidationGrid />
          </div>
        </div>

        <footer className="mt-10 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
          Formula-Based Inverse Estimation Engine · Not a trained neural network ·
          Physics-calibrated least-squares fit through simulation anchor points.
        </footer>
      </main>
    </div>
  );
}
