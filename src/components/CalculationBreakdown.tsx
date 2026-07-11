import { Card } from "@/components/ui/card";
import type { PredictionResult } from "@/lib/predictionEngine";

export function CalculationBreakdown({ result }: { result: PredictionResult }) {
  const { breakdown, pressure } = result;
  const { input_shift, normalized_input, hidden_activations, raw_pressure } = breakdown;

  const rows = [
    { label: "Input shift  δλ", value: `${input_shift.toFixed(6)} μm` },
    { label: "Normalized input (z-score)", value: normalized_input.toFixed(4) },
    { label: "Raw network output", value: `${raw_pressure.toFixed(4)} MPa` },
  ];

  return (
    <Card className="flex flex-col gap-3 rounded-2xl border-slate-200 bg-white p-6 shadow-md">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Calculation Breakdown</h2>
        <p className="text-xs text-slate-500">
          Trained neural network forward pass — 1 input to 8 hidden units (tanh) to 1
          linear output. Weights were learned offline (scikit-learn MLPRegressor) from
          the real calibration data and are embedded read-only in the app.
        </p>
      </div>
      <div className="divide-y divide-slate-100 rounded-lg border border-slate-100 bg-slate-50/50">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-slate-600">{r.label}</span>
            <span className="font-mono font-medium tabular-nums text-slate-900">{r.value}</span>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold text-slate-600">
          Hidden layer activations (tanh, 8 units)
        </div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {hidden_activations.map((a, i) => {
            const intensity = (a + 1) / 2;
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-1 rounded-lg border border-slate-100 bg-white p-2"
                title={`h${i}: ${a.toFixed(4)}`}
              >
                <div className="h-10 w-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="w-full bg-cyan-500"
                    style={{ height: `${intensity * 100}%`, marginTop: `${(1 - intensity) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] text-slate-500">{a.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-cyan-50 px-4 py-3 text-sm">
        <span className="font-semibold text-cyan-900">Final Pressure (clamped &ge; 0)</span>
        <span className="font-mono text-lg font-bold tabular-nums text-cyan-700">
          {pressure.toFixed(2)} MPa
        </span>
      </div>
    </Card>
  );
}
