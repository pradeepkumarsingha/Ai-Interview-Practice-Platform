import React from "react";
import {
  LineChart,
  Line,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function MiniChart({ values = [] }) {
  const data = values.map((v, i) => ({
    interview: i + 1,
    score: Number(v)
  }));

  if (!data.length) {
    return <p>No performance data yet</p>;
  }

  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          
          {/* subtle grid */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          {/* interactive tooltip */}
          <Tooltip
            formatter={(value) => [`${value}`, "Score"]}
            labelFormatter={(label) => `Interview ${label}`}
          />

          {/* smooth animated line */}
          <Line
            type="monotone"
            dataKey="score"
            stroke="#6a11cb"
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
