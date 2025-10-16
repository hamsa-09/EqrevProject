import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const api = axios.create({
  baseURL: BASE_URL,
});

export const fetchDashboardDetails = async () => {
  const endDate = new Date();
  const startDate = new Date();

  startDate.setDate(endDate.getDate() - 14);
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  const res = await api.get(`/OverAlldashboard?start=${"2025-09-16"}&end=${"2025-09-30"}`);
  return res.data;
};

const formatDate = (date: Date) => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};
