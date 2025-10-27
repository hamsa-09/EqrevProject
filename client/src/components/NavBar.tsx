import { useEffect, useState } from 'react';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import { fetchCategories } from '../Apis';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface NavbarProps {
    dateRange: { startDate: Date; endDate: Date };
    setDateRange: React.Dispatch<
        React.SetStateAction<{ startDate: Date; endDate: Date }>
    >;
    selectedCategory: string[];
    setSelectedCategory: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function Navbar({
    dateRange,
    setDateRange,
    selectedCategory,
    setSelectedCategory,
}: NavbarProps) {
    const [categories, setCategories] = useState<string[]>([]);
    const [showCategories, setShowCategories] = useState(false);
    const [brand] = useState('Mee Mee');
    const [showCalendar, setShowCalendar] = useState(false);
    const [customEnabled, setCustomEnabled] = useState(false);
    const [showCustomCalendar, setShowCustomCalendar] = useState(false);
    const [customDateRange, setCustomDateRange] = useState({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
    });

    // 🟢 New: temp storage for pending custom range
    const [pendingCustomRange, setPendingCustomRange] = useState<{
        startDate: Date;
        endDate: Date;
    } | null>(null);

    const [tempDateRange, setTempDateRange] = useState({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
    });
    const [compareError, setCompareError] = useState<string | null>(null);

    // Load categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await fetchCategories();
                if (response && Array.isArray(response.data)) {
                    setCategories(response.data);
                } else {
                    console.warn('Categories data is not an array', response);
                    setCategories([]);
                }
            } catch (err) {
                console.error('Failed to load categories', err);
                setCategories([]);
            }
        };
        loadCategories();
    }, []);

    const formattedRange = `${format(
        dateRange.startDate,
        'dd/MM/yyyy'
    )} - ${format(dateRange.endDate, 'dd/MM/yyyy')}`;

    // 🟡 Modified: Now only stores pending custom range — no dispatch here
    const handleCustomApply = () => {
        const currentDays =
            (dateRange.endDate.getTime() - dateRange.startDate.getTime()) /
                (1000 * 60 * 60 * 24) +
            1;
        const customDays =
            (customDateRange.endDate.getTime() -
                customDateRange.startDate.getTime()) /
                (1000 * 60 * 60 * 24) +
            1;

        if (currentDays !== customDays) {
            setCompareError(
                `Please select a range of ${currentDays} days (you selected ${customDays}).`
            );
            return;
        }

        setCompareError(null);
        setPendingCustomRange({
            startDate: customDateRange.startDate,
            endDate: customDateRange.endDate,
        });
        setShowCustomCalendar(false);
    };

    // 🟢 Modified: Apply Date now triggers both main + custom updates together
    const handleApplyMainDate = () => {
        setDateRange({
            startDate: tempDateRange.startDate,
            endDate: tempDateRange.endDate,
        });

        if (customEnabled && pendingCustomRange) {
            window.dispatchEvent(
                new CustomEvent('compareRangeSelected', {
                    detail: {
                        startDate: pendingCustomRange.startDate,
                        endDate: pendingCustomRange.endDate,
                    },
                })
            );
        } else {
            window.dispatchEvent(new CustomEvent('compareRangeCleared'));
        }

        setShowCalendar(false);
    };

    return (
        <nav className="relative flex justify-between items-center bg-gray-900 text-white px-6 py-3 shadow-lg">
            <h1 className="text-lg font-semibold">Category Analysis</h1>

            <div className="flex items-center gap-3">
                <button className="bg-yellow-400 text-black font-semibold px-3 py-1 rounded-lg">
                    Blinkit
                </button>

                {/* Category Dropdown with Checkboxes */}
                <div className="relative">
                    <button
                        onClick={() => setShowCategories(!showCategories)}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm flex items-center gap-2"
                    >
                        {selectedCategory.length > 0
                            ? selectedCategory.join(', ')
                            : 'All Categories'}
                        <span className="ml-1">&#9662;</span>
                    </button>

                    {showCategories && (
                        <div className="absolute mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-2 z-50 max-h-64 overflow-y-auto">
                            {categories.map((c) => (
                                <label
                                    key={c}
                                    className="flex items-center gap-2 text-sm px-2 py-1 rounded cursor-pointer hover:bg-gray-700"
                                >
                                    <input
                                        type="checkbox"
                                        value={c}
                                        checked={selectedCategory.includes(c)}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            if (checked) {
                                                setSelectedCategory([
                                                    ...selectedCategory,
                                                    c,
                                                ]);
                                            } else {
                                                setSelectedCategory(
                                                    selectedCategory.filter(
                                                        (cat: string) =>
                                                            cat !== c
                                                    )
                                                );
                                            }
                                        }}
                                        className="cursor-pointer"
                                    />
                                    <span>{c}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main Date Picker */}
                <div className="relative">
                    <input
                        type="text"
                        readOnly
                        value={formattedRange}
                        onClick={() => {
                            setTempDateRange({
                                startDate: dateRange.startDate,
                                endDate: dateRange.endDate,
                            });
                            setShowCalendar(!showCalendar);
                        }}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm text-gray-300 cursor-pointer"
                    />
                    {showCalendar && (
                        <div className="absolute right-0 mt-2 z-50 border border-gray-700 rounded-lg shadow-lg p-3 bg-gray-900 flex gap-3">
                            {/* 🟢 Custom Compare Calendar */}
                            {customEnabled && showCustomCalendar && (
                                <div className="border-r border-gray-700 pr-3">
                                    <DateRange
                                        editableDateInputs
                                        moveRangeOnFirstSelection={false}
                                        ranges={[
                                            {
                                                startDate:
                                                    customDateRange.startDate,
                                                endDate:
                                                    customDateRange.endDate,
                                                key: 'selection',
                                            },
                                        ]}
                                        onChange={(item) =>
                                            setCustomDateRange({
                                                startDate:
                                                    item.selection.startDate ||
                                                    customDateRange.startDate,
                                                endDate:
                                                    item.selection.endDate ||
                                                    customDateRange.endDate,
                                            })
                                        }
                                        minDate={new Date('2025-09-01')}
                                        maxDate={new Date('2025-10-05')}
                                        className="text-black"
                                    />

                                    {compareError && (
                                        <div className="text-red-500 text-sm mt-1">
                                            {compareError}
                                        </div>
                                    )}

                                    <div className="flex justify-end mt-2">
                                        <button
                                            className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm"
                                            onClick={handleCustomApply}
                                        >
                                            Apply Custom
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 🟣 Main Date Picker */}
                            <div>
                                <DateRange
                                    editableDateInputs
                                    moveRangeOnFirstSelection={false}
                                    ranges={[
                                        {
                                            startDate: tempDateRange.startDate,
                                            endDate: tempDateRange.endDate,
                                            key: 'selection',
                                        },
                                    ]}
                                    onChange={(item) =>
                                        setTempDateRange({
                                            startDate:
                                                item.selection.startDate ||
                                                tempDateRange.startDate,
                                            endDate:
                                                item.selection.endDate ||
                                                tempDateRange.endDate,
                                        })
                                    }
                                    minDate={new Date('2025-09-01')}
                                    maxDate={new Date('2025-10-05')}
                                    className="text-black"
                                />

                                <div className="mt-2 flex items-center justify-between border-t pt-2">
                                    <label className="flex items-center gap-2 text-sm text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={customEnabled}
                                            onChange={() => {
                                                setCustomEnabled(
                                                    !customEnabled
                                                );
                                                setShowCustomCalendar(
                                                    !customEnabled
                                                );
                                                if (!customEnabled) {
                                                    setCustomDateRange({
                                                        startDate:
                                                            dateRange.startDate,
                                                        endDate:
                                                            dateRange.endDate,
                                                    });
                                                } else {
                                                    window.dispatchEvent(
                                                        new CustomEvent(
                                                            'compareRangeCleared'
                                                        )
                                                    );
                                                }
                                            }}
                                            className="cursor-pointer"
                                        />
                                        <span>Custom Range</span>
                                    </label>

                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded"
                                        onClick={handleApplyMainDate}
                                    >
                                        Apply Date
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Brand */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm text-gray-300">
                    {brand}
                </div>
            </div>
        </nav>
    );
}
