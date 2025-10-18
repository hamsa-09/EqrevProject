// pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './components/NavBar';
import MetricCard from './components/MetricCard';
import TrendChart from './components/TrendChart';
import CategoryTable from './components/CategoryTable';

export default function Dashboard() {
    const [metrics, setMetrics] = useState<any[]>([]);
    const [filteredMetrics, setFilteredMetrics] = useState<any[]>([]);
    const [sortBy, setSortBy] = useState('totalRevenue');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [offset, setOffset] = useState(0);
    const [limit] = useState(5);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    const [selectedCategory, setSelectedCategory] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: sevenDaysAgo,
        endDate: today,
    });

    const [cusDateRange, setCusDateRange] = useState<{
        startDate: Date | null;
        endDate: Date | null;
    }>({
        startDate: null,
        endDate: null,
    });

    const [compareEnabled, setCompareEnabled] = useState(false);

    const [summary, setSummary] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        adSpends: 0,
        roas: 0,
        aov: 0,
    });
    const formatRounded = (num: number | string): string => {
        if (num === null || num === undefined || isNaN(Number(num))) return '-';
        return Math.round(Number(num)).toLocaleString('en-IN');
    };

    useEffect(() => {
        fetchMetrics();
    }, [sortBy, order, offset, dateRange, cusDateRange, compareEnabled]);

    const fetchMetrics = async () => {
        try {
            let compareStart: Date | null = null;
            let compareEnd: Date | null = null;

            if (
                compareEnabled &&
                cusDateRange.startDate &&
                cusDateRange.endDate
            ) {
                // ✅ If Compare Mode is ON — use custom range
                compareStart = cusDateRange.startDate;
                compareEnd = cusDateRange.endDate;
            } else {
                // ✅ Compare Mode OFF — use immediate previous 7-day range
                const prevStart = new Date(dateRange.startDate);
                const prevEnd = new Date(dateRange.endDate);
                prevStart.setDate(prevStart.getDate() - 7);
                prevEnd.setDate(prevEnd.getDate() - 7);
                compareStart = prevStart;
                compareEnd = prevEnd;
            }

            const body = {
                start: dateRange.startDate.toISOString().split('T')[0],
                end: dateRange.endDate.toISOString().split('T')[0],
                customStart: compareEnabled
                    ? compareStart.toISOString().split('T')[0]
                    : null,
                customEnd: compareEnabled
                    ? compareEnd.toISOString().split('T')[0]
                    : null,
                limit,
                offset,
                sortBy,
                order,
            };

            console.log('📤 Sending body:', body);

            const res = await axios.post(
                'http://localhost:3000/api/OverAlldashboard',
                body
            );

            if (res.data.success) {
                const data = res.data.data;
                setMetrics(data);
                setFilteredMetrics(data);
                setTotal(res.data.total);

                const summaryRow = data.find(
                    (d: any) => d.category === 'Summary'
                );
                if (summaryRow) {
                    setSummary({
                        totalRevenue: summaryRow.totalRevenue,
                        totalOrders: summaryRow.totalOrders,
                        adSpends: summaryRow.adSpends,
                        roas: summaryRow.roas,
                        aov: summaryRow.aov,
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching metrics:', error);
        }
    };
    // 🔹 Filter metrics by search input
    useEffect(() => {
        if (search.trim() === '') {
            setFilteredMetrics(metrics);
        } else {
            const filtered = metrics.filter((m: any) =>
                m.category.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredMetrics(filtered);
        }
    }, [search, metrics]);

    // 🔹 Listen for compare toggles
    useEffect(() => {
        const handleCompare = (e: any) => {
            const { startDate, endDate } = e.detail;
            setCompareEnabled(true);
            setCusDateRange({ startDate, endDate });
        };

        const handleCompareClear = () => {
            setCompareEnabled(false);
            setCusDateRange({ startDate: null, endDate: null });
        };

        window.addEventListener('compareRangeSelected', handleCompare);
        window.addEventListener('compareRangeCleared', handleCompareClear);

        return () => {
            window.removeEventListener('compareRangeSelected', handleCompare);
            window.removeEventListener(
                'compareRangeCleared',
                handleCompareClear
            );
        };
    }, []);

    // 🔹 Sorting
    const toggleSort = (key: string) => {
        if (sortBy === key) {
            setOrder(order === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setOrder('desc');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar
                dateRange={dateRange}
                setDateRange={setDateRange}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
            />

            <div className="p-6">
                <TrendChart />

                <div className="grid grid-cols-5 gap-3 mt-4">
                    <MetricCard
                        title="TOTAL REVENUE"
                        value={`₹${formatRounded(summary.totalRevenue)}`}
                    />
                    <MetricCard
                        title="TOTAL ORDER QTY"
                        value={formatRounded(summary.totalOrders)}
                    />
                    <MetricCard
                        title="AD SPENDS"
                        value={`₹${formatRounded(summary.adSpends)}`}
                    />
                    <MetricCard
                        title="TOTAL ROAS"
                        value={`${formatRounded(summary.roas)}x`}
                    />
                    <MetricCard
                        title="AOV"
                        value={formatRounded(summary.aov)}
                    />
                </div>

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

                {/* 🔹 Pagination restored here */}
                {total > 0 && (
                    <div className="flex justify-end items-center gap-4 mt-5">
                        <button
                            disabled={offset === 0}
                            onClick={() =>
                                setOffset(Math.max(offset - limit, 0))
                            }
                            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100 transition"
                        >
                            Prev
                        </button>

                        <span className="text-sm text-gray-600">
                            Page {Math.floor(offset / limit) + 1} of{' '}
                            {Math.ceil(total / limit)}
                        </span>

                        <button
                            disabled={offset + limit >= total}
                            onClick={() => setOffset(offset + limit)}
                            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100 transition"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
