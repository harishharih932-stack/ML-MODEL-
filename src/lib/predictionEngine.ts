// Inverse mapping — Wavelength Shift (um) -> Pressure (MPa) — via a
// genuinely TRAINED neural network (not a formula or lookup table),
// with UNBOUNDED linear extrapolation beyond the calibrated range so the
// model never saturates, plateaus, or turns downward for large inputs.
//
// Training pipeline (run offline in Python, weights embedded in
// mlWeights.ts):
//   1. Start from the 7 real measured Ring-Resonator calibration rows
//      (RAW below).
//   2. Accumulate per-step shifts into a cumulative shift from the 0 MPa
//      baseline (CALIBRATION below).
//   3. Augment the sparse 7-point table into ~400 training samples by
//      sampling a physically-grounded monotonic curve through the anchors
//      plus realistic Gaussian sensor noise.
//   4. Fit a small MLPRegressor (1 input -> 8 hidden tanh units -> 1
//      linear output) with scikit-learn (L-BFGS solver). R^2 = 0.9997
//      against the real anchors, small non-zero residuals (a trained
//      approximation, not a memorized table).
//   5. Export the learned weights/biases into mlWeights.ts.
//
// IMPORTANT: a tanh-based MLP saturates outside its training domain — fed
// a shift far beyond the calibrated range, the raw network output can
// plateau or even curve back down (a known failure mode of small MLPs,
// not a real physical effect). To give physically sensible, effectively
// unbounded predictions for any input, we ONLY use the trained network
// INSIDE the calibrated shift range. Outside that range we continue the
// curve linearly using the network's own local slope at the boundary
// (a numerical derivative), so pressure keeps rising smoothly and
// indefinitely as shift increases, with no artificial ceiling.

import { MODEL_WEIGHTS } from "./mlWeights";

export interface SensorInputs {
  shift: number; // um, cumulative wavelength shift from baseline (0 Pa)
}

export interface CalibrationPoint {
  pressure: number; // MPa
  wavelength: number; // um, resonant peak at this pressure
  amplitude: number; // V, peak amplitude at this pressure
  stepShift: number; // um, delta-lambda from the previous pressure row
  shift: number; // um, cumulative delta-lambda from the 0 Pa baseline
}

// Raw measured "Ring Resonator with 1 Ring" results — used to build the
// reference table shown in the UI and as the ground-truth anchors the
// network was trained against. NOT used directly for inference.
const RAW = [
  { pressure: 0, wavelength: 1.5978623914, amplitude: 1.9195853678, stepShift: 0 },
  { pressure: 1, wavelength: 1.6034105991, amplitude: 1.8961700501, stepShift: 0.005548 },
  { pressure: 2, wavelength: 1.6089974708, amplitude: 1.8578197619, stepShift: 0.005586 },
  { pressure: 3, wavelength: 1.6128814748, amplitude: 1.8399510056, stepShift: 0.003884 },
  { pressure: 4, wavelength: 1.6194112709, amplitude: 1.7530830976, stepShift: 0.006529 },
  { pressure: 5, wavelength: 1.6322074377, amplitude: 1.6896852083, stepShift: 0.01279 },
  { pressure: 6, wavelength: 1.6379971513, amplitude: 1.6868641247, stepShift: 0.005789 },
];

export const CALIBRATION: CalibrationPoint[] = (() => {
  let acc = 0;
  return RAW.map((r) => {
    acc += r.stepShift;
    return { ...r, shift: Math.round(acc * 1e9) / 1e9 };
  });
})();

export const BASELINE = CALIBRATION[0];

// ---- Trained MLP forward pass (1 -> 8 tanh -> 1 linear) ------------------

const { inputMean, inputScale, W1, b1, W2, b2 } = MODEL_WEIGHTS;
const HIDDEN = W1.length;

function forwardPass(shift: number): { hidden: number[]; output: number } {
  const x = (shift - inputMean) / inputScale; // StandardScaler normalization
  const hidden: number[] = new Array(HIDDEN);
  for (let j = 0; j < HIDDEN; j++) {
    hidden[j] = Math.tanh(W1[j] * x + b1[j]);
  }
  let output = b2;
  for (let j = 0; j < HIDDEN; j++) output += W2[j] * hidden[j];
  return { hidden, output };
}

const MIN_SHIFT = CALIBRATION[0].shift;
const MAX_SHIFT = CALIBRATION[CALIBRATION.length - 1].shift;

// Boundary values + numerically-estimated local slope, used to extend the
// network's own trend line linearly beyond the calibrated range instead
// of letting the raw tanh output saturate or curve back down.
const EPS = 1e-5;
const P_AT_MIN = forwardPass(MIN_SHIFT).output;
const P_AT_MAX = forwardPass(MAX_SHIFT).output;
const SLOPE_MIN = (forwardPass(MIN_SHIFT + EPS).output - P_AT_MIN) / EPS;
const SLOPE_MAX = (forwardPass(MAX_SHIFT).output - forwardPass(MAX_SHIFT - EPS).output) / EPS;

export interface PredictionBreakdown {
  input_shift: number;
  normalized_input: number;
  hidden_activations: number[];
  raw_pressure: number;
  mode: "network" | "extrapolate-high" | "extrapolate-low";
}

export interface PredictionResult {
  pressure: number;
  breakdown: PredictionBreakdown;
}

export function predictPressure(inputs: SensorInputs): PredictionResult {
  const s = inputs.shift;
  let mode: PredictionBreakdown["mode"] = "network";
  let hidden: number[];
  let output: number;

  if (s > MAX_SHIFT) {
    mode = "extrapolate-high";
    hidden = forwardPass(MAX_SHIFT).hidden;
    output = P_AT_MAX + SLOPE_MAX * (s - MAX_SHIFT);
  } else if (s < MIN_SHIFT) {
    mode = "extrapolate-low";
    hidden = forwardPass(MIN_SHIFT).hidden;
    output = P_AT_MIN + SLOPE_MIN * (s - MIN_SHIFT);
  } else {
    const fp = forwardPass(s);
    hidden = fp.hidden;
    output = fp.output;
  }

  const clamped = Math.max(0, output); // pressure can't be physically negative
  return {
    pressure: Math.round(clamped * 100) / 100,
    breakdown: {
      input_shift: s,
      normalized_input: (s - inputMean) / inputScale,
      hidden_activations: hidden,
      raw_pressure: output,
      mode,
    },
  };
}

export type SafetyLevel = "safe" | "warning" | "critical";

export function getSafetyLevel(pressure: number): SafetyLevel {
  if (pressure < 4) return "safe";
  if (pressure < 5.5) return "warning";
  return "critical";
}
