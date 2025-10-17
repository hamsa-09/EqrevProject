// components/TrendChart.tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function TrendChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 mt-5">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Trend Analysis</h2>
        <button className="text-sm text-gray-500 border px-3 py-1 rounded-lg">Daily</button>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" label={{ value: "TOTAL REVENUE", angle: -90, position: "insideLeft" }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: "TOTAL ORDER QTY", angle: 90, position: "insideRight" }} />
          <Tooltip />
          <Line yAxisId="left" type="monotone" dataKey="totalRevenue" stroke="#4f46e5" strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey="totalOrders" stroke="#9333ea" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
