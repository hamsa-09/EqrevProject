import express from "express"
import { uploadCSV,dashboardMetric, getAllCategories,getLineChartMetrics} from "../controllers/eqrev";
const route=express.Router()

route.post("/uploadCSV",uploadCSV)
route.get("/categories", getAllCategories);
route.post("/OverAlldashboard",dashboardMetric)

route.post("/lineChartMetrics", getLineChartMetrics);

export default route;
