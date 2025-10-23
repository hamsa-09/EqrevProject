// components/TrendChart.tsx
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { fetchLineChartMetrics } from "../Apis";
import { format } from "date-fns";

const availableMetrics = [
  { key: "totalRevenue", label: "Total Revenue", color: "#4f46e5" },
  { key: "totalOrders", label: "Total Orders", color: "#9333ea" },
];

interface TrendChartProps {
  dateRange: { startDate: Date; endDate: Date };
}

export default function TrendChart({ dateRange }: TrendChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "totalRevenue",
    "totalOrders",
  ]);
  const [metricLabels, setMetricLabels] = useState<{ metric1: string; metric2: string }>({
    metric1: "Total Revenue",
    metric2: "Total Orders",
  });

  useEffect(() => {
    loadChartData();
  }, [dateRange, selectedMetrics]);

  const loadChartData = async () => {
    try {
      const res = await fetchLineChartMetrics({
        start: format(dateRange.startDate, "yyyy-MM-dd"),
        end: format(dateRange.endDate, "yyyy-MM-dd"),
        metrics: selectedMetrics,
      });

      console.log("API Response:", res);

      if (res.success && res.data) {
        // Assume backend returns data like:
        // [{ date: "2025-10-20", totalRevenue: 1200, totalOrders: 50 }, ...]
        setChartData(res.data);

        // Set labels for the selected metrics
        setMetricLabels({
          metric1: availableMetrics.find((m) => m.key === selectedMetrics[0])?.label || selectedMetrics[0],
          metric2: availableMetrics.find((m) => m.key === selectedMetrics[1])?.label || selectedMetrics[1],
        });
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const handleMetricToggle = (metricKey: string) => {
    setSelectedMetrics((prev) => {
      if (prev.includes(metricKey)) {
        if (prev.length === 1) return prev; // always keep at least 1 metric
        return prev.filter((m) => m !== metricKey);
      } else {
        if (prev.length >= 2) return prev; // max 2 metrics
        return [...prev, metricKey];
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow p-5 mt-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Trend Analysis</h2>

        <div className="flex gap-2">
          {availableMetrics.map((metric) => (
            <button
              key={metric.key}
              onClick={() => handleMetricToggle(metric.key)}
              disabled={!selectedMetrics.includes(metric.key) && selectedMetrics.length >= 2}
              className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                selectedMetrics.includes(metric.key)
                  ? "text-white border-transparent"
                  : "text-gray-600 border-gray-300 hover:bg-gray-100"
              }`}
              style={{
                backgroundColor: selectedMetrics.includes(metric.key) ? metric.color : "transparent",
              }}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => format(new Date(value), "dd MMM")}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            label={{
              value: metricLabels.metric1,
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle", fontSize: 12 },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            label={{
              value: metricLabels.metric2,
              angle: 90,
              position: "insideRight",
              style: { textAnchor: "middle", fontSize: 12 },
            }}
          />
          <Tooltip
            labelFormatter={(value) => format(new Date(value), "dd MMM yyyy")}
            formatter={(value: any) => [typeof value === "number" ? value.toLocaleString() : value]}
          />
          <Legend />
          {selectedMetrics.map((metricKey, idx) => {
            const metric = availableMetrics.find((m) => m.key === metricKey);
            return (
              <Line
                key={metricKey}
                yAxisId={idx === 0 ? "left" : "right"}
                type="monotone"
                dataKey={metricKey}
                name={metric?.label}
                stroke={metric?.color}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
