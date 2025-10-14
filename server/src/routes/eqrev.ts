import express from "express"
import { uploadCSV,dashboardMetric } from "../controllers/eqrev";
const route=express.Router()

route.post("/uploadCSV",uploadCSV)
route.get("/OverAlldashboard",dashboardMetric)
route.get("/dashboardTable",dashboardMetric)
export default route;
