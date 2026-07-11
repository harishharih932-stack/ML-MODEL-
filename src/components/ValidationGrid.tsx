import { Card } from "@/components/ui/card";
import { predictPressure, CALIBRATION } from "@/lib/predictionEngine";
import { ValidationChart } from "./ValidationChart";

export function ValidationGrid() {
  // Validate the continuous cubic fit at every calibration anchor AND at
  // midpoint shifts between them — proves the model produces fractional
  // pressures (e.g. 3.5 MPa), not just integer rows.
  const anchors = CALIBRATION.map((c) => ({
    label: `${c.pressure} MPa (measured)`,
    shift: c.shift,
    benchmark: c.pressure,
  }));
  const midpoints = [];
  for (let i = 0; i < CALIBRATION.length - 1; i++) {
    const a = CALIBRATION[i];
    const b = CALIBRATION[i + 1];
    midpoints.push({
      label: `midpoint ${a.pressure}–${b.pressure} MPa`,
      shift: (a.shift + b.shift) / 2,
      benchmark: (a.pressure + b.pressure) / 2,
    });
  }
  const all = [...anchors, ...midpoints].sort((x, y) => x.shift - y.shift);

  const rows = all.map((r) => {
    const { pressure } = predictPressure({ shift: r.shift });
    const err =
      r.benchmark === 0
        ? Math.abs(pressure)
        : Math.abs((pressure - r.benchmark) / r.benchmark) * 100;
    return { ...r, predicted: pressure, error: err };
  });

  return (
    <Card className="flex flex-col gap-4 rounded-2xl border-slate-200 bg-white p-6 shadow-md">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Model Validation Grid</h2>
        <p className="text-xs text-slate-500">
          Predicted vs. measured pressure across calibration and interpolated test points.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-100">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-2 text-left">Point</th>
              <th className="px-4 py-2 text-right">Shift (μm)</th>
              <th className="px-4 py-2 text-right">Predicted (MPa)</th>
              <th className="px-4 py-2 text-right">Reference (MPa)</th>
              <th className="px-4 py-2 text-right">Abs Error %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.label} className="tabular-nums">
                <td className="px-4 py-2 font-medium text-slate-800">{r.label}</td>
                <td className="px-4 py-2 text-right font-mono text-slate-600">{r.shift.toFixed(6)}</td>
                <td className="px-4 py-2 text-right font-mono text-cyan-700">{r.predicted.toFixed(2)}</td>
                <td className="px-4 py-2 text-right font-mono text-slate-700">{r.benchmark.toFixed(2)}</td>
                <td className="px-4 py-2 text-right font-mono text-slate-600">{r.error.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ValidationChart data={rows.map((r) => ({ benchmark: r.benchmark, predicted: r.predicted, label: r.label }))} />
    </Card>
  );
}
