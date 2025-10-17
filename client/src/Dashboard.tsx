// pages/Dashboard.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./components/NavBar";
import MetricCard from "./components/MetricCard";
import TrendChart from "./components/TrendChart";
import CategoryTable from "./components/CategoryTable";

export default function Dashboard() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [filteredMetrics, setFilteredMetrics] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("totalRevenue");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [offset, setOffset] = useState(0);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const [dateRange, setDateRange] = useState({
    startDate: new Date("2025-09-27"),
    endDate: new Date("2025-10-26"),
  });

  // 🔹 Summary metrics
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    adSpends: 0,
    roas: 0,
    aov: 0,
  });

  useEffect(() => {
    fetchMetrics();
  }, [sortBy, order, offset, dateRange]);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredMetrics(metrics);
    } else {
      setFilteredMetrics(
        metrics.filter((m) =>
          m.category.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, metrics]);

  const fetchMetrics = async () => {
    try {
      const res = await axios.post("http://localhost:3000/api/dashboardSort", {
        start: dateRange.startDate,
        end: dateRange.endDate,
        limit,
        offset,
        sortBy,
        order,
      });

      if (res.data.success) {
        const data = res.data.data;
        setMetrics(data);
        setFilteredMetrics(data);
        setTotal(res.data.total);

        // 🔹 Calculate summary dynamically from the backend data
        const summaryRow = data.find((d: any) => d.category === "Summary");
        if (summaryRow) {
          setSummary({
            totalRevenue: summaryRow.totalRevenue,
            totalOrders: summaryRow.totalOrders,
            adSpends: summaryRow.adSpends,
            roas: summaryRow.roas,
            aov: summaryRow.aov,
          });
        }

        setChartData(
          data.map((d: any, idx: number) => ({
            date: `Category ${idx + 1}`,
            totalRevenue: d.totalRevenue,
            totalOrders: d.totalOrders,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  };

  const toggleSort = (key: string) => {
    if (sortBy === key) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setOrder("desc");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar dateRange={dateRange} setDateRange={setDateRange} />

      <div className="p-6">
        <TrendChart data={chartData} />

        {/* 🔹 Metrics from backend */}
        <div className="grid grid-cols-5 gap-3 mt-4">
          <MetricCard
            title="TOTAL REVENUE"
            value={`₹${summary.totalRevenue.toLocaleString()}`}
          />
          <MetricCard
            title="TOTAL ORDER QTY"
            value={summary.totalOrders.toLocaleString()}
          />
          <MetricCard
            title="AD SPENDS"
            value={`₹${summary.adSpends.toLocaleString()}`}
          />
          <MetricCard
            title="TOTAL ROAS"
            value={summary.roas.toFixed(2) + "x"}
          />
          <MetricCard title="AOV" value={summary.aov.toFixed(2)} />
        </div>

        {/* 🔹 Search Box */}
        <div className="mt-5">
          <input
            type="text"
            placeholder="Search by category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full max-w-sm text-sm"
          />
        </div>

        <div className="mt-5">
          <CategoryTable
            data={filteredMetrics}
            onSort={toggleSort}
            sortBy={sortBy}
            order={order}
          />
        </div>

        <div className="flex justify-end items-center gap-4 mt-5">
          <button
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(offset - limit, 0))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit)}
          </span>
          <button
            disabled={offset + limit >= total}
            onClick={() => setOffset(offset + limit)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
