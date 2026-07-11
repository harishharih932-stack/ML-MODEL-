// Optional AI Insight layer. Key stays client-side; never used for the
// prediction itself, only for plain-English commentary.
import type { SensorInputs } from "./predictionEngine";

export async function fetchGroqInsight(
  apiKey: string,
  inputs: SensorInputs,
  pressure: number,
  status: string,
): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a hydrogen tank safety analyst. Given a ring-resonator photonic sensor reading and its interpolated pressure, write a 2-3 sentence plain-English safety note. Never invent a different pressure number than the one given.",
        },
        {
          role: "user",
          content: `wavelength_shift=${inputs.shift} μm, predicted_pressure=${pressure} MPa, status=${status}`,
        },
      ],
      temperature: 0.3,
    }),
  });
  if (!res.ok) throw new Error(`Groq API error ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "No insight returned.";
}
