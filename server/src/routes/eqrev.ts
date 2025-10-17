import express from "express"
import { uploadCSV,dashboardMetric,  dashboardMetricSorted, getAllCategories} from "../controllers/eqrev";
const route=express.Router()

route.post("/uploadCSV",uploadCSV)
route.get("/categories", getAllCategories);
route.post("/OverAlldashboard",dashboardMetric)
route.post("/dashboardSort",dashboardMetricSorted)

export default route;
