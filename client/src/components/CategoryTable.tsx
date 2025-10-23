interface Props {
    data: any[];
    onSort: (key: string) => void;
    sortBy: string;
    order: string;
}

// ✅ Helper component for displaying value with diff indicator and label
const ValueWithDiff = ({ value, diff }: { value: any; diff?: number }) => {
    if (diff === undefined || diff === 0) {
        return <div className="flex justify-end">{value}</div>;
    }

    const isPositive = diff > 0;

    // ✅ Round off diff (no decimals, no ".00")
    const absDiff = Math.abs(diff);
    let displayDiff = '';
    if (absDiff >= 1000) {
        displayDiff = `${Math.round(absDiff / 1000)}k`;
    } else {
        displayDiff = Math.round(absDiff).toString();
    }

    return (
        <div className="flex items-center justify-end gap-2">
            <span>{value}</span>
            <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                    isPositive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                }`}
            >
                {isPositive ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-trending-up"
                    >
                        <path d="M16 7h6v6" />
                        <path d="m22 7-8.5 8.5-5-5L2 17" />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-trending-down"
                    >
                        <path d="M16 17h6v-6" />
                        <path d="m22 17-8.5-8.5-5 5L2 7" />
                    </svg>
                )}
                <span>{isPositive ? `${displayDiff}`: `-${displayDiff}`}</span>
            </span>
        </div>
    );
};

export default function CategoryTable({ data, onSort, sortBy, order }: Props) {
    const headers = [
        { key: 'category', label: 'Category' },
        { key: 'totalRevenue', label: 'Total Revenue' },
        { key: 'totalOrders', label: 'Total Order Qty' },
        { key: 'adSpends', label: 'AD Spends' },
        { key: 'roas', label: 'Total ROAS' },
        { key: 'aov', label: 'AOV' },
    ];

    // ✅ Round and format values cleanly
    const formatValue = (key: string, value: number | undefined) => {
        if (value === undefined || value === null || isNaN(value)) return '-';

        const rounded = Math.round(value); // 💥 ensure all decimals are removed

        switch (key) {
            case 'totalRevenue':
            case 'adSpends':
            case 'aov':
                return `₹${rounded.toLocaleString('en-IN')}`;
            case 'roas':
                return `${rounded}x`;
            case 'totalOrders':
                return `${rounded.toLocaleString('en-IN')} pcs`;
            default:
                return rounded.toLocaleString('en-IN');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow mt-6 overflow-hidden">
            <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-100 text-xs uppercase text-gray-500">
                    <tr>
                        {headers.map((h) => (
                            <th
                                key={h.key}
                                onClick={() => onSort(h.key)}
                                className="px-4 py-3 text-center cursor-pointer select-none border-r border-gray-300 last:border-r-0"
                            >
                                <div className="flex items-center justify-between">
                                    {h.label}
                                    {sortBy === h.key && (
                                        <span className="ml-2 text-xs">
                                            {order === 'asc' ? '▲' : '▼'}
                                        </span>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data.map((row, i) => (
                        <tr key={i} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium border-r border-gray-300 last:border-r-0">
                                {row.category}
                            </td>

                            {headers
                                .filter((h) => h.key !== 'category')
                                .map((h) => (
                                    <td
                                        key={h.key}
                                        className="px-4 py-2 text-center border-r border-gray-300 last:border-r-0"
                                    >
                                        <ValueWithDiff
                                            value={formatValue(
                                                h.key,
                                                row[h.key]
                                            )}
                                            diff={row[`${h.key}Diff`]}
                                        />
                                    </td>
                                ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
