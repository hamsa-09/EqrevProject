// components/CategoryTable.tsx
interface Props {
  data: any[];
  onSort: (key: string) => void;
  sortBy: string;
  order: string;
}

export default function CategoryTable({ data, onSort, sortBy, order }: Props) {
  const headers = [
    { key: "category", label: "Category" },
    { key: "totalRevenue", label: "Total Revenue" },
    { key: "totalOrders", label: "Total Order Qty" },
    { key: "adSpends", label: "AD Spends" },
    { key: "roas", label: "Total ROAS" },
    { key: "aov", label: "AOV" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow mt-6 overflow-hidden">
      <table className="min-w-full text-sm text-gray-700">
        <thead className="bg-gray-100 text-xs uppercase text-gray-500">
          <tr>
            {headers.map((h) => (
              <th
                key={h.key}
                onClick={() => onSort(h.key)}
                className="px-4 py-3 text-left cursor-pointer select-none"
              >
                <div className="flex items-center justify-between">
                  {h.label}
                  {sortBy === h.key && (
                    <span className="ml-2 text-xs">
                      {order === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t hover:bg-gray-50 justify-center items-center">
              <td className="px-4 py-2 font-medium">{row.category}</td>
              <td className="px-4 py-2 text-right">{row.totalRevenue}</td>
              <td className="px-4 py-2 text-right">{row.totalOrders}</td>
              <td className="px-4 py-2 text-right">{row.adSpends}</td>
              <td className="px-4 py-2 text-right">{row.roas}</td>
              <td className="px-4 py-2 text-right">{row.aov}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
