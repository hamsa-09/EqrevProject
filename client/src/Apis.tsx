import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const api = axios.create({
  baseURL: BASE_URL,
});


// ✅ Fetch all categories (for dropdown)
export const fetchCategories = async () => {
  const res = await api.get("/categories"); // adjust route if your backend differs
  return res.data;
};

export const fetchDashboardMetrics = async ({
  start,
  end,
  customStart,
  customEnd,
  limit,
  offset,
}: {
  start: string;
  end: string;
  customStart?: string | null;
  customEnd?: string | null;
  limit?: number;
  offset?: number;
}) => {
  const body = { start, end, customStart, customEnd, limit, offset };
  const res = await api.post("/OverAlldashboard", body);
  return res.data;
};

// ---------------------------
// 3️⃣ Fetch Sorted Dashboard Metrics
// ---------------------------
export const fetchDashboardSorted = async ({
  start,
  end,
  limit,
  offset,
  sortBy,
  order,
}: {
  start: string;
  end: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  order?: "desc";
}) => {
  const body = { start, end, limit, offset, sortBy, order };
  const res = await api.post("/dashboardSort", body);
  return res.data;
};
