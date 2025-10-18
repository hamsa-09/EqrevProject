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
import { format, subDays } from "date-fns";

const availableMetrics = [
  { key: "totalRevenue", label: "Total Revenue", color: "#4f46e5" },
  { key: "totalOrders", label: "Total Orders", color: "#9333ea" },
];

export default function TrendChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "totalRevenue",
    "totalOrders",
  ]);
  const [metricLabels, setMetricLabels] = useState<{
    metric1: string;
    metric2: string;
  }>({ metric1: "Total Revenue", metric2: "Total Orders" });
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 15),
    endDate: new Date(),
  });
  const [days, setDays] = useState(15);

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

      if (res.success) {
        // Transform the data to use actual metric keys instead of metric1Value/metric2Value
        const transformedData = (res.data || []).map((item: any) => ({
          date: item.date,
          [res.metrics.metric1]: item.metric1Value,
          [res.metrics.metric2]: item.metric2Value,
        }));

        // Debugging: log metric keys and transformed data
        console.log("Selected metrics:", selectedMetrics);
        console.log("Backend metric keys:", res.metrics);
        console.log("Transformed chart data:", transformedData);

        setChartData(transformedData);

        // Set labels for Y-axes
        const metric1Label =
          availableMetrics.find((m) => m.key === res.metrics.metric1)?.label ||
          res.metrics.metric1;
        const metric2Label =
          availableMetrics.find((m) => m.key === res.metrics.metric2)?.label ||
          res.metrics.metric2;
        setMetricLabels({ metric1: metric1Label, metric2: metric2Label });
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const handleMetricToggle = (metricKey: string) => {
    setSelectedMetrics((prev) => {
      if (prev.includes(metricKey)) {
        // Don't allow deselecting if only one metric is selected
        if (prev.length === 1) return prev;
        return prev.filter((m) => m !== metricKey);
      } else {
        // Don't allow more than 2 metrics
        if (prev.length >= 2) return prev;
        return [...prev, metricKey];
      }
    });
  };

  const handleDaysChange = (numDays: number) => {
    setDays(numDays);
    setDateRange({
      startDate: subDays(new Date(), numDays),
      endDate: new Date(),
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow p-5 mt-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Trend Analysis</h2>

        <div className="flex items-center gap-3">
          {/* Days selector */}
          <div className="flex gap-2">
            {[30].map((d) => (
              <button
                key={d}
                onClick={() => handleDaysChange(d)}
                className={`text-sm px-3 py-1 rounded-lg border transition-colors ${
                  days === d
                    ? "bg-blue-600 text-white border-blue-600"
                    : "text-gray-600 border-gray-300 hover:bg-gray-100"
                }`}
              >
                Recent Days
              </button>
            ))}
          </div>

          {/* Metric selector */}
          <div className="flex gap-2">
            {availableMetrics.map((metric) => (
              <button
                key={metric.key}
                onClick={() => handleMetricToggle(metric.key)}
                disabled={
                  !selectedMetrics.includes(metric.key) &&
                  selectedMetrics.length >= 2
                }
                className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                  selectedMetrics.includes(metric.key)
                    ? "text-white border-transparent"
                    : "text-gray-600 border-gray-300 hover:bg-gray-100"
                }`}
                style={{
                  backgroundColor: selectedMetrics.includes(metric.key)
                    ? metric.color
                    : "transparent",
                }}
              >
                {metric.label}
              </button>
            ))}
          </div>
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
            formatter={(value: any) => [
              typeof value === "number" ? value.toLocaleString() : value,
            ]}
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
