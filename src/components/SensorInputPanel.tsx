import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { CALIBRATION, type SensorInputs } from "@/lib/predictionEngine";

export const DEFAULTS: SensorInputs = { shift: 0.018 };

interface Props {
  values: SensorInputs;
  onChange: (v: SensorInputs) => void;
}

const REFERENCE = CALIBRATION.filter((c) => c.pressure > 0);

export function SensorInputPanel({ values, onChange }: Props) {
  return (
    <Card className="sticky top-24 flex flex-col gap-5 rounded-2xl border-slate-200 bg-white p-6 shadow-md">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Sensor Input</h2>
        <p className="text-xs text-slate-500">
          Enter the <span className="font-medium">cumulative Wavelength Shift</span>
          {" "}from the 0 MPa baseline. Any value works — the model returns a
          continuous pressure (e.g. 3.47 MPa), not just table rows.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-xs font-medium text-slate-700">
          Wavelength Shift (μm)
        </Label>
        <Input
          type="number"
          value={values.shift}
          step={0.000001}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!Number.isNaN(n)) onChange({ shift: n });
          }}
          className="text-right tabular-nums"
        />
      </div>

      <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
        <div className="mb-2 text-xs font-semibold text-slate-600">
          Calibration anchors — cumulative shift → pressure
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-xs tabular-nums text-slate-700">
          {REFERENCE.map((r) => {
            const active = Math.abs(values.shift - r.shift) < 1e-6;
            return (
              <button
                key={r.pressure}
                onClick={() => onChange({ shift: r.shift })}
                className={`flex items-center justify-between rounded px-2 py-1 text-left transition-colors ${
                  active
                    ? "bg-cyan-100 text-cyan-900"
                    : "hover:bg-white hover:text-slate-900"
                }`}
              >
                <span>{r.shift.toFixed(6)}</span>
                <span className="font-sans">{r.pressure} MPa</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" className="flex-1" onClick={() => onChange(DEFAULTS)}>
          <RotateCcw className="mr-1 h-4 w-4" /> Reset
        </Button>
      </div>
    </Card>
  );
}
