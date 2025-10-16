import { useEffect, useState } from "react";
import { fetchDashboardDetails } from "./Apis";

interface TableRow {
  Categories: string;
  TotalRevenue: number;
  TotalRevenueDiff: number;
  TotalOrderQty: number;
  TotalOrderQtyDiff: number;
  AdSpends: number;
  AdSpendsDiff: number;
  TotalRoas: number;
  TotalRoasDiff: number;
  AOV: number;
  AOVDiff: number;
}

type SortKey = keyof TableRow;
type SortOrder = "asc" | "desc";

const getPL = (diff: number) => {
  if (diff > 0) return <span className="text-green-600 font-bold ml-2">P</span>;
  if (diff < 0) return <span className="text-red-600 font-bold ml-2">L</span>;
  return <span className="text-gray-400 font-bold ml-2">-</span>;
};

const TableComponent = () => {
  const [data, setData] = useState<TableRow[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("Categories");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  useEffect(() => {
    const fetchDashboard = async () => {
      const res = await fetchDashboardDetails();
      const mapped = res.data.map((item: any) => ({
        Categories: item.category,
        TotalRevenue: item.totalRevenue,
        TotalRevenueDiff: item.totalRevenueDiff,
        TotalOrderQty: item.totalOrders,
        TotalOrderQtyDiff: item.totalOrdersDiff,
        AdSpends: item.adSpends,
        AdSpendsDiff: item.adSpendsDiff,
        TotalRoas: item.roas,
        TotalRoasDiff: item.roasDiff,
        AOV: item.aov,
        AOVDiff: item.aovDiff,
      }));
      setData(mapped);
    };
    fetchDashboard();
  }, []);

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];

    // Numeric sort for numbers, string sort for strings
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }
    return sortOrder === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const thClass = "px-4 py-2 bg-gray-100 text-gray-700 font-semibold text-sm";

  // Always-visible sort buttons for each metric
  const SortButtons = ({ metric }: { metric: SortKey }) => (
    <span className="ml-2 inline-flex flex-col align-middle">
      <button
        className={`text-xs leading-none ${
          sortKey === metric && sortOrder === "asc"
            ? "text-blue-600"
            : "text-gray-400"
        }`}
        onClick={() => {
          setSortKey(metric);
          setSortOrder("asc");
        }}
        aria-label="Sort ascending"
        type="button"
      >
        ▲
      </button>
      <button
        className={`text-xs leading-none ${
          sortKey === metric && sortOrder === "desc"
            ? "text-blue-600"
            : "text-gray-400"
        }`}
        onClick={() => {
          setSortKey(metric);
          setSortOrder("desc");
        }}
        aria-label="Sort descending"
        type="button"
      >
        ▼
      </button>
    </span>
  );

  return (
    <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg overflow-hidden">
      <thead className="bg-gray-100 text-gray-700">
        <tr>
          <th className={thClass}>
            Categories
            <SortButtons metric="Categories" />
          </th>
          <th className={thClass}>
            Total Revenue
            <SortButtons metric="TotalRevenue" />
          </th>
          <th className={thClass}>
            Total Order QTY
            <SortButtons metric="TotalOrderQty" />
          </th>
          <th className={thClass}>
            Ad Spends
            <SortButtons metric="AdSpends" />
          </th>
          <th className={thClass}>
            Total Roas
            <SortButtons metric="TotalRoas" />
          </th>
          <th className={thClass}>
            AOV
            <SortButtons metric="AOV" />
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {sortedData
          .filter((row) => row.Categories !== "Summary")
          .map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-4 py-2">{row.Categories}</td>
              <td className="px-4 py-2">
                {Array.isArray(row.TotalRevenue)
                  ? row.TotalRevenue.join(", ")
                  : row.TotalRevenue}
                {getPL(row.TotalRevenueDiff)}
              </td>
              <td className="px-4 py-2">
                {row.TotalOrderQty}
                {getPL(row.TotalOrderQtyDiff)}
              </td>
              <td className="px-4 py-2">
                {row.AdSpends}
                {getPL(row.AdSpendsDiff)}
              </td>
              <td className="px-4 py-2">
                {row.TotalRoas}
                {getPL(row.TotalRoasDiff)}
              </td>
              <td className="px-4 py-2">
                {row.AOV}
                {getPL(row.AOVDiff)}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default TableComponent;
