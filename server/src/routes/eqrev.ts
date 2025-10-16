import express from "express"
import { uploadCSV,dashboardMetric, dashboardMetric2, dashboardMetricSorted,dashboardMetricCompare } from "../controllers/eqrev";
const route=express.Router()

route.post("/uploadCSV",uploadCSV)
route.post("/OverAlldashboard",dashboardMetric)
route.post("/dashboardTable",dashboardMetric2)
route.post("/dashboardSort",dashboardMetricSorted)
route.post("/getCustomDashboard",dashboardMetricCompare)
export default route;
