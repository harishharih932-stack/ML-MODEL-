import {
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Scatter,
  ComposedChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Point {
  benchmark: number;
  predicted: number;
  label: string;
}

export function ValidationChart({ data }: { data: Point[] }) {
  const ideal = [
    { benchmark: 0, ideal: 0 },
    { benchmark: 6, ideal: 6 },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <ComposedChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="benchmark"
            domain={[0, 6]}
            stroke="#64748b"
            label={{ value: "Reference (MPa)", position: "insideBottom", offset: -8, fill: "#64748b", fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="predicted"
            domain={[0, 6]}
            stroke="#64748b"
            label={{ value: "Predicted (MPa)", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
            formatter={(v: number) => v.toFixed(2)}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            data={ideal}
            type="linear"
            dataKey="ideal"
            stroke="#94a3b8"
            strokeDasharray="6 4"
            dot={false}
            name="Ideal Mapping"
            isAnimationActive={false}
          />
          <Scatter data={data} dataKey="predicted" fill="#0891b2" name="Predicted" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
