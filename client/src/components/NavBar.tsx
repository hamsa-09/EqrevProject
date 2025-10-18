// components/Navbar.tsx
import { useEffect, useState } from "react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { fetchCategories } from "../Apis";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface NavbarProps {
  dateRange: { startDate: Date; endDate: Date };
  setDateRange: React.Dispatch<React.SetStateAction<{ startDate: Date; endDate: Date }>>;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
}

export default function Navbar({
  dateRange,
  setDateRange,
  selectedCategory,
  setSelectedCategory,
}: NavbarProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [brand, setBrand] = useState("Mee Mee");
  const [showCalendar, setShowCalendar] = useState(false);
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [showCompareCalendar, setShowCompareCalendar] = useState(false);
  const [compareDateRange, setCompareDateRange] = useState({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });
  const [compareError, setCompareError] = useState<string | null>(null);

  // 🔹 Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchCategories();
        if (response && Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          console.warn("Categories data is not an array", response);
          setCategories([]);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  const formattedRange = `${format(dateRange.startDate, "dd/MM/yyyy")} - ${format(
    dateRange.endDate,
    "dd/MM/yyyy"
  )}`;

  const handleCompareApply = () => {
    const currentDays =
      (dateRange.endDate.getTime() - dateRange.startDate.getTime()) /
        (1000 * 60 * 60 * 24) +
      1;
    const compareDays =
      (compareDateRange.endDate.getTime() - compareDateRange.startDate.getTime()) /
        (1000 * 60 * 60 * 24) +
      1;

    if (currentDays !== compareDays) {
      setCompareError(
        `Please select a range of ${currentDays} days (you selected ${compareDays}).`
      );
      return;
    }

    setCompareError(null);
    setShowCompareCalendar(false);

    // Dispatch event only when compare mode is ON
    if (compareEnabled) {
      window.dispatchEvent(
        new CustomEvent("compareRangeSelected", {
          detail: {
            startDate: compareDateRange.startDate,
            endDate: compareDateRange.endDate,
          },
        })
      );
    }
  };

  return (
    <nav className="relative flex justify-between items-center bg-gray-900 text-white px-6 py-3 shadow-lg">
      <h1 className="text-lg font-semibold">Category Analysis</h1>

      <div className="flex items-center gap-3">
        <button className="bg-yellow-400 text-black font-semibold px-3 py-1 rounded-lg">
          Blinkit
        </button>

        {/* Category Dropdown */}
        <select
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Main Date Picker */}
        <div className="relative">
          <input
            type="text"
            readOnly
            value={formattedRange}
            onClick={() => setShowCalendar(!showCalendar)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm text-gray-300 cursor-pointer"
          />
          {showCalendar && (
            <div className="absolute right-0 mt-2 z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
              <DateRange
                editableDateInputs
                moveRangeOnFirstSelection={false}
                ranges={[
                  {
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                    key: "selection",
                  },
                ]}
                onChange={(item) =>
                  setDateRange({
                    startDate: item.selection.startDate || dateRange.startDate,
                    endDate: item.selection.endDate || dateRange.endDate,
                  })
                }
                className="text-black"
              />
            </div>
          )}
        </div>

        {/* Compare To Toggle */}
        <div className="flex items-center gap-2 relative">
          <button
            className={`px-3 py-1 rounded-lg text-sm font-semibold ${
              compareEnabled ? "bg-blue-600" : "bg-gray-600"
            }`}
            onClick={() => {
              setCompareEnabled(!compareEnabled);
              setShowCompareCalendar(false);
              if (!compareEnabled) {
                // Enable compare mode
                setShowCompareCalendar(true);
              } else {
                // Disable compare mode → clear comparison
                window.dispatchEvent(new CustomEvent("compareRangeCleared"));
              }
            }}
          >
            {compareEnabled ? "Disable Compare" : "Enable Compare"}
          </button>

          {compareEnabled && showCompareCalendar && (
            <div className="absolute right-0 top-full mt-2 z-50 border-gray-700 rounded-lg shadow-lg p-2 bg-gray-900">
              <DateRange
                editableDateInputs
                moveRangeOnFirstSelection={false}
                ranges={[
                  {
                    startDate: compareDateRange.startDate,
                    endDate: compareDateRange.endDate,
                    key: "selection",
                  },
                ]}
                onChange={(item) =>
                  setCompareDateRange({
                    startDate: item.selection.startDate || compareDateRange.startDate,
                    endDate: item.selection.endDate || compareDateRange.endDate,
                  })
                }
                className="text-black"
              />

              {compareError && (
                <div className="text-red-500 text-sm mt-1">{compareError}</div>
              )}

              <div className="flex justify-end mt-2">
                <button
                  className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm"
                  onClick={handleCompareApply}
                >
                  Apply
                </button>
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
