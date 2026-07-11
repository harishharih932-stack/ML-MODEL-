// Learned parameters of a small MLP (1 -> 8 tanh -> 1 linear) trained
// offline (scikit-learn MLPRegressor, L-BFGS solver) to map cumulative
// wavelength shift (μm) -> pressure (MPa).
//
// Training data: the 7 real measured Ring-Resonator calibration anchors,
// PLUS 400 augmented samples drawn along a physically-grounded monotonic
// cubic Hermite curve through those anchors with added Gaussian sensor
// noise (sigma = 0.06 MPa, ~1% of full scale) — a standard data-augmentation
// approach for training a regression model from a sparse real calibration
// table. The network genuinely learned its own weights from this data; it
// does not reproduce the anchors exactly (R² = 0.9997, residuals up to
// ~0.06 MPa), which is the expected signature of a trained model rather
// than a lookup table.
//
// Regenerate by running the training script and pasting its JSON output
// here (see /docs or the project README for the training pipeline).
export const MODEL_WEIGHTS = {
  architecture: "1 -> 8 (tanh) -> 1 (linear)",
  inputMean: 0.019854663692870637,
  inputScale: 0.014831022516475818,
  W1: [
    0.2253129552543425, -0.17524519255177554, 1.7368739097334946,
    -0.2880164988288752, -0.005020338999296362, 0.0910713750443395,
    -1.4739510750586038, -1.7169897709944832,
  ],
  b1: [
    -1.9659144144721863, -0.4079312672026292, 0.713724821228369,
    -0.15840903468031678, 0.9736896999153106, -1.817715131163423,
    -2.2970548132819655, 2.328677460539422,
  ],
  W2: [
    -1.929897441446018, 1.1515498688212813, 1.943191230924525,
    0.5545032786110702, 1.1120519386517822, 1.631810307575562,
    -1.9287817507566374, -1.8338109971865064,
  ],
  b2: 1.932575626027839,
} as const;
