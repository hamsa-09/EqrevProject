// components/Navbar.tsx
import { useEffect, useState } from "react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { fetchCategories } from "../Apis";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface NavbarProps {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  setDateRange: React.Dispatch<
    React.SetStateAction<{ startDate: Date; endDate: Date }>
  >;
}

export default function Navbar({ dateRange, setDateRange }: NavbarProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [brand, setBrand] = useState("Mee Mee");
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    load();
  }, []);

  const formattedRange = `${format(
    dateRange.startDate,
    "dd/MM/yyyy"
  )} - ${format(dateRange.endDate, "dd/MM/yyyy")}`;

  return (
    <nav className="relative flex justify-between items-center bg-gray-900 text-white px-6 py-3 shadow-lg">
      <h1 className="text-lg font-semibold">Category Analysis</h1>

      <div className="flex items-center gap-3">
        <button className="bg-yellow-400 text-black font-semibold px-3 py-1 rounded-lg">
          Blinkit
        </button>

        <select
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Date Picker */}
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
                editableDateInputs={true}
                moveRangeOnFirstSelection={false}
                ranges={[
                  {
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                    key: "selection",
                  },
                ]}
                onChange={(item) => {
                  setDateRange({
                    startDate: item.selection.startDate || dateRange.startDate,
                    endDate: item.selection.endDate || dateRange.endDate,
                  });
                }}
                className="text-black"
              />
            </div>
          )}
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm text-gray-300">
          {brand}
        </div>
      </div>
    </nav>
  );
}
