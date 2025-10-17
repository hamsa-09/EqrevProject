import { PrismaClient } from "../../generated/prisma";
import { DBCategoryMetric } from "./types";

const prisma = new PrismaClient();

// 🔹 Aggregate by category (optimized SQL)
export const getCategoryMetrics = async (
  startDate: Date,
  endDate: Date
): Promise<DBCategoryMetric[]> => {
  return await prisma.$queryRawUnsafe<DBCategoryMetric[]>(`
    SELECT
      c.id AS "categoryId",
      c.name AS "categoryName",
      c.subcategory_name AS "subcategoryName",
      SUM(f."total_final_revenue") AS "totalRevenue",
      SUM(f."total_orders") AS "totalOrders",
      SUM(f."ad_spend") AS "adSpends",
      SUM(f."ad_revenue") AS "adRevenue",
      CASE
        WHEN SUM(f."ad_spend") > 0 THEN SUM(f."ad_revenue") / SUM(f."ad_spend")
        ELSE 0
      END AS "roas",
      CASE
        WHEN SUM(f."total_orders") > 0 THEN SUM(f."total_final_revenue") / SUM(f."total_orders")
        ELSE 0
      END AS "aov"
    FROM "Category" c
    JOIN "Product" p ON c.id = p."categoryId"
    JOIN "FactTable" f ON p.id = f."productId"
    WHERE f."date" BETWEEN $1 AND $2
    GROUP BY c.id, c.name, c.subcategory_name
    ORDER BY SUM(f."total_final_revenue") DESC;  -- ✅ sort by total revenue highest first
  `, startDate, endDate);
};


// 🔹 Get total summary
export const getSummaryMetrics = (data: DBCategoryMetric[]) => {
  const totalRevenue = data.reduce((acc, d) => acc + (Number(d.totalRevenue) || 0), 0);
  const totalOrders = data.reduce((acc, d) => acc + (Number(d.totalOrders) || 0), 0);
  const adSpends = data.reduce((acc, d) => acc + (Number(d.adSpends) || 0), 0);
  const adRevenue = data.reduce((acc, d) => acc + (Number(d.adRevenue) || 0), 0);

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
): { valid: boolean; message?: string; expectedDays: number; actualDays: number } => {
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
