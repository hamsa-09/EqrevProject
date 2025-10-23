import { PrismaClient } from "../../generated/prisma";
import { DBCategoryMetric, DailyMetricData } from "./types";

const prisma = new PrismaClient();

// 🔹 Aggregate by category (optimized SQL)
export const getCategoryMetrics = async (
  startDate: Date,
  endDate: Date
): Promise<DBCategoryMetric[]> => {
  return await prisma.$queryRawUnsafe<DBCategoryMetric[]>(
    `
    SELECT
  c.id AS "categoryId",
  c.name AS "categoryName",
  c.subcategory_name AS "subcategoryName",
  SUM(COALESCE(f."total_final_revenue",0)) AS "totalRevenue",
  SUM(COALESCE(f."total_orders",0)) AS "totalOrders",
  SUM(COALESCE(f."ad_spend",0)) AS "adSpends",
  SUM(COALESCE(f."ad_revenue",0)) AS "adRevenue",
  CASE WHEN SUM(COALESCE(f."ad_spend",0))>0 THEN SUM(COALESCE(f."ad_revenue",0))/SUM(COALESCE(f."ad_spend",0)) ELSE 0 END AS "roas",
  CASE WHEN SUM(COALESCE(f."total_orders",0))>0 THEN SUM(COALESCE(f."total_final_revenue",0))/SUM(COALESCE(f."total_orders",0)) ELSE 0 END AS "aov"
FROM "Category" c
LEFT JOIN "Product" p ON c.id = p."categoryId"
LEFT JOIN "FactTable" f ON p.id = f."productId" AND f."date" BETWEEN $1 AND $2
GROUP BY c.id, c.name, c.subcategory_name
ORDER BY SUM(COALESCE(f."total_final_revenue",0)) DESC;
  `,
    startDate,
    endDate
  );
};

// 🔹 Get total summary
export const getSummaryMetrics = (data: DBCategoryMetric[]) => {
  const totalRevenue = data.reduce(
    (acc, d) => acc + (Number(d.totalRevenue) || 0),
    0
  );
  const totalOrders = data.reduce(
    (acc, d) => acc + (Number(d.totalOrders) || 0),
    0
  );
  const adSpends = data.reduce((acc, d) => acc + (Number(d.adSpends) || 0), 0);
  const adRevenue = data.reduce(
    (acc, d) => acc + (Number(d.adRevenue) || 0),
    0
  );

  const roas = adSpends ? adRevenue / adSpends : 0;
  const aov = totalOrders ? totalRevenue / totalOrders : 0;

  return {
    categoryId: 0,
    category: "Summary",
    subcategory: "-",
    totalRevenue,
    totalRevenueDiff: 0,
    totalOrders,
    totalOrdersDiff: 0,
    adSpends,
    adSpendsDiff: 0,
    adRevenue,
    adRevenueDiff: 0,
    roas,
    roasDiff: 0,
    aov,
    aovDiff: 0,
  };
};

/**
 * 🔹 Calculate previous period (same duration before current)
 */
export const getPreviousPeriod = (startDate: Date, endDate: Date) => {
  const diffDays = getDateDiffInDays(startDate, endDate);
  const prevEndDate = new Date(startDate);
  prevEndDate.setDate(startDate.getDate() - 1);
  const prevStartDate = new Date(prevEndDate);
  prevStartDate.setDate(prevEndDate.getDate() - (diffDays - 1));
  return { prevStartDate, prevEndDate };
};

/**
 * 🆕 Helper: Get inclusive difference between two dates in days
 */
export const getDateDiffInDays = (startDate: Date, endDate: Date): number => {
  const msDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(msDiff / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * 🆕 Helper: Validate that two ranges are equal in duration
 */
export const validateDateRangeMatch = (
  currentStart: Date,
  currentEnd: Date,
  customStart: Date,
  customEnd: Date
): {
  valid: boolean;
  message?: string;
  expectedDays: number;
  actualDays: number;
} => {
  const expectedDays = getDateDiffInDays(currentStart, currentEnd);
  const actualDays = getDateDiffInDays(customStart, customEnd);

  if (expectedDays !== actualDays) {
    return {
      valid: false,
      expectedDays,
      actualDays,
      message: `Please select a valid comparison range of ${expectedDays} days (you selected ${actualDays} days).`,
    };
  }

  return { valid: true, expectedDays, actualDays };
};



const METRIC_FIELD_MAP: Record<string, string> = {
  totalRevenue: "total_final_revenue",
  totalOrders: "total_orders",
  totalMrpRevenue: "total_mrp_revenue",
  adSpend: "ad_spend",
  adRevenue: "ad_revenue",
  adImpressions: "ad_impressions",
  adAddToCarts: "ad_add_to_carts",
  adOrders: "ad_orders",
  stockAtDarkstores: "stock_at_darkstores",
  stockAtWarehouses: "stock_at_warehouses",
};

/**
 * 🔹 Get daily metrics for all products (for line chart)
 */
export const getDailyMetrics = async (
  startDate: Date,
  endDate: Date,
  metric1: string = "totalRevenue",
  metric2: string = "totalOrders"
): Promise<DailyMetricData[]> => {
  const metric1Field = METRIC_FIELD_MAP[metric1];
  const metric2Field = METRIC_FIELD_MAP[metric2];

  if (!metric1Field || !metric2Field) {
    throw new Error(
      `Invalid metric names. Available metrics: ${Object.keys(METRIC_FIELD_MAP).join(", ")}`
    );
  }

  const result = await prisma.$queryRawUnsafe<
    { date: string; metric1value: string | number; metric2value: string | number }[]
  >(
    `
    SELECT
      DATE(f."date") AS "date",
      SUM(f."${metric1Field}") AS "metric1value",
      SUM(f."${metric2Field}") AS "metric2value"
    FROM "FactTable" f
    WHERE DATE(f."date") BETWEEN DATE($1) AND DATE($2)
    GROUP BY DATE(f."date")
    ORDER BY DATE(f."date") ASC;
  `,
    startDate,
    endDate
  );

  return result.map((row) => ({
    date: row.date, // already YYYY-MM-DD
    metric1Value: Number(row.metric1value) || 0,
    metric2Value: Number(row.metric2value) || 0,
  }));
};
