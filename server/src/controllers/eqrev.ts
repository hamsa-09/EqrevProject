import { Request, Response } from "express";
import fs from "fs";
import csv from "csv-parser";
import { PrismaClient } from "../../generated/prisma";
import {
  getCategoryMetrics,
  getSummaryMetrics,
  getPreviousPeriod,
  validateDateRangeMatch,
  getDailyMetrics,
} from "../utils/eqrev";
import {
  CategoryMetric,
  DBCategoryMetric,
  LineChartResponse,
} from "../utils/types";
const prisma = new PrismaClient();

export const uploadCSV = async (req: Request, res: Response) => {
  const { filePath } = req.body;
  if (!filePath) return res.status(400).json({ error: "filePath is required" });

  try {
    //  Read CSV
    const rows: any[] = [];
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => rows.push(data))
        .on("end", resolve)
        .on("error", reject);
    });

    if (rows.length === 0)
      return res.status(400).json({ error: "CSV is empty" });

    // Normalize headers (case-insensitive, trimmed)
    const normalize = (str: string) => str?.trim().toLowerCase();

    //  Collect unique entities
    const brandSet = new Map<string, any>();
    const categorySet = new Map<string, any>();
    const clientSet = new Map<string, any>();
    const platformSet = new Map<string, any>();
    const productSet = new Map<string, any>();
    const factRows: any[] = [];

    for (const row of rows) {
      // Map headers dynamically
      const headers: any = {};
      Object.keys(row).forEach((key) => {
        headers[normalize(key)] = row[key]?.trim();
      });

      // Map CSV headers to DB fields
      const brandName = headers["brand_name"];
      const categoryName = headers["category"];
      const subcategoryName = headers["subcategory_name"];
      const clientId = headers["internal_client_id"];
      const platformName = headers["platform"];
      const productId = headers["product_id"];
      const productName = headers["product_name"];

      if (
        !brandName ||
        !categoryName ||
        !subcategoryName ||
        !clientId ||
        !platformName ||
        !productId
      )
        continue;

      brandSet.set(brandName, { name: brandName });
      categorySet.set(`${categoryName}-${subcategoryName}`, {
        name: categoryName,
        subcategory_name: subcategoryName,
      });
      clientSet.set(clientId, { client_id: clientId });
      platformSet.set(platformName, { name: platformName });

      productSet.set(productId, {
        product_id: productId,
        product_name: productName,
        internal_product_id: headers["internal_product_id"] || null,
        internal_product_name: headers["internal_product_name"] || null,
        product_type: headers["product_type"] || null,
        bundle_id: headers["bundle_id"] || null,
        product_image: headers["product_image"] || null,
        maximum_retail_price: headers["maximum_retail_price"]
          ? parseFloat(headers["maximum_retail_price"])
          : null,
        discounted_selling_price: headers["discounted_selling_price"]
          ? parseFloat(headers["discounted_selling_price"])
          : null,
        // brand_name, category_name, subcategory_name are NOT part of the Product model
        // They are only used for mapping to foreign keys
        brand_name: brandName,
        category_name: categoryName,
        subcategory_name: subcategoryName,
      });

      factRows.push({
        date: new Date(headers["date"]),
        product_id: productId,
        client_id: clientId,
        platform_name: platformName,
        total_orders: headers["total_orders"]
          ? parseInt(headers["total_orders"])
          : 0,
        total_mrp_revenue: headers["total_mrp_revenue"]
          ? parseFloat(headers["total_mrp_revenue"])
          : 0,
        total_final_revenue: headers["total_final_revenue"]
          ? parseFloat(headers["total_final_revenue"])
          : 0,
        stock_at_darkstores: headers["stock_at_darkstores"]
          ? parseInt(headers["stock_at_darkstores"])
          : 0,
        stock_at_warehouses: headers["stock_at_warehouses"]
          ? parseInt(headers["stock_at_warehouses"])
          : 0,
        ad_spend: headers["ad_spend"] ? parseFloat(headers["ad_spend"]) : 0,
        ad_impressions: headers["ad_impressions"]
          ? parseInt(headers["ad_impressions"])
          : 0,
        ad_add_to_carts: headers["ad_add_to_carts"]
          ? parseInt(headers["ad_add_to_carts"])
          : 0,
        ad_orders: headers["ad_orders"] ? parseInt(headers["ad_orders"]) : 0,
        ad_orders_othersku: headers["ad_orders_othersku"]
          ? parseInt(headers["ad_orders_othersku"])
          : 0,
        ad_orders_samesku: headers["ad_orders_samesku"]
          ? parseInt(headers["ad_orders_samesku"])
          : 0,
        ad_revenue: headers["ad_revenue"]
          ? parseFloat(headers["ad_revenue"])
          : 0,
      });
    }

    // 4️⃣ Insert entities in bulk
    await prisma.$transaction([
      prisma.brand.createMany({
        data: Array.from(brandSet.values()),
        skipDuplicates: true,
      }),
      prisma.category.createMany({
        data: Array.from(categorySet.values()),
        skipDuplicates: true,
      }),
      prisma.client.createMany({
        data: Array.from(clientSet.values()),
        skipDuplicates: true,
      }),
      prisma.platform.createMany({
        data: Array.from(platformSet.values()),
        skipDuplicates: true,
      }),
    ]);

    // 5️⃣ Fetch IDs to resolve FKs
    const [allBrands, allCategories, allClients, allPlatforms] =
      await Promise.all([
        prisma.brand.findMany(),
        prisma.category.findMany(),
        prisma.client.findMany(),
        prisma.platform.findMany(),
      ]);

    const brandMap = new Map(allBrands.map((b) => [b.name, b.id]));
    const categoryMap = new Map(
      allCategories.map((c) => [`${c.name}-${c.subcategory_name}`, c.id])
    );
    const clientMap = new Map(allClients.map((c) => [c.client_id, c.id]));
    const platformMap = new Map(allPlatforms.map((p) => [p.name, p.id]));

    // 6️⃣ Insert products
    const productsData = Array.from(productSet.values())
      .map((p) => {
        const brandId = brandMap.get(p.brand_name);
        const categoryId = categoryMap.get(
          `${p.category_name}-${p.subcategory_name}`
        );
        if (!brandId || !categoryId) return null;
        // Remove brand_name, category_name, subcategory_name before insert
        const { brand_name, category_name, subcategory_name, ...rest } = p;
        return { ...rest, brandId, categoryId };
      })
      .filter(Boolean) as any[];

    await prisma.product.createMany({
      data: productsData,
      skipDuplicates: true,
    });

    // 7️⃣ Insert facts
    const productMap = new Map(
      (
        await prisma.product.findMany({
          select: { id: true, product_id: true },
        })
      ).map((p) => [p.product_id, p.id])
    );

    const factsData = factRows
      .map((f) => {
        const productId = productMap.get(f.product_id);
        const clientId = clientMap.get(f.client_id);
        const platformId = platformMap.get(f.platform_name);
        if (!productId || !clientId || !platformId) return null;

        return {
          date: f.date,
          productId,
          clientId,
          platformId,
          total_orders: f.total_orders,
          total_mrp_revenue: f.total_mrp_revenue,
          total_final_revenue: f.total_final_revenue,
          stock_at_darkstores: f.stock_at_darkstores,
          stock_at_warehouses: f.stock_at_warehouses,
          ad_spend: f.ad_spend,
          ad_impressions: f.ad_impressions,
          ad_add_to_carts: f.ad_add_to_carts,
          ad_orders: f.ad_orders,
          ad_orders_othersku: f.ad_orders_othersku,
          ad_orders_samesku: f.ad_orders_samesku,
          ad_revenue: f.ad_revenue,
        };
      })
      .filter(Boolean) as any[];

    if (factsData.length)
      await prisma.factTable.createMany({ data: factsData });

    res.json({
      message: "✅ CSV imported successfully",
      summary: {
        brands: brandSet.size,
        categories: categorySet.size,
        clients: clientSet.size,
        platforms: platformSet.size,
        products: productsData.length,
        facts: factsData.length,
      },
    });
  } catch (err: any) {
    console.error("Error uploading CSV:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    // ✅ Fetch only unique category names
    const categories = await prisma.category.findMany({
      distinct: ["name"], // ensures no duplicate category names
      select: { name: true },
      orderBy: { name: "asc" },
    });

    const categoryList = categories.map((c) => c.name);

    return res.json({ success: true, data: categoryList });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories" });
  }
};
/**
 * Dashboard Metrics
 */
export const dashboardMetric = async (req: Request, res: Response) => {
   try {
    const { start, end, customStart, customEnd, limit, offset, sortBy, order } = req.body;

    // 1️⃣ Validate required dates
    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: "Start and end dates are required.",
      });
    }

    const startDate = new Date(start);
const endDate = new Date(end);

// ✅ Adjust endDate to include the full day (for single-day selection)
const endDatePlus1 = new Date(endDate);
endDatePlus1.setDate(endDate.getDate() + 1);

const pageLimit = limit ? parseInt(limit as string, 10) : 5;
const pageOffset = offset ? parseInt(offset as string, 10) : 0;

    // 2️⃣ Determine comparison range
    let compareStartDate: Date;
    let compareEndDate: Date;

    if (customStart && customEnd) {
      const cs = new Date(customStart);
      const ce = new Date(customEnd);

      // Validate same duration
      const { valid, message } = validateDateRangeMatch(startDate, endDate, cs, ce);
      if (!valid) {
        return res.status(400).json({ success: false, message });
      }

      compareStartDate = cs;
      compareEndDate = ce;
    } else {
      // Automatic previous period
      const { prevStartDate, prevEndDate } = getPreviousPeriod(startDate, endDate);
      compareStartDate = prevStartDate;
      compareEndDate = prevEndDate;
    }

    // 3️⃣ Fetch metrics for current and comparison periods in parallel
    const [currentData, compareData] = await Promise.all([
      getCategoryMetrics(startDate, endDatePlus1),
      getCategoryMetrics(compareStartDate, compareEndDate),
    ]);

    // 4️⃣ Compare metrics category-wise
    const result: CategoryMetric[] = currentData.map((current: DBCategoryMetric) => {
      const compare = compareData.find((c) => c.categoryId === current.categoryId);
      return {
        categoryId: current.categoryId,
        category: current.categoryName,
        subcategory: current.subcategoryName,
        totalRevenue: Number(current.totalRevenue) || 0,
        totalRevenueDiff: (Number(current.totalRevenue) || 0) - (Number(compare?.totalRevenue) || 0),
        totalOrders: Number(current.totalOrders) || 0,
        totalOrdersDiff: (Number(current.totalOrders) || 0) - (Number(compare?.totalOrders) || 0),
        adSpends: Number(current.adSpends) || 0,
        adSpendsDiff: (Number(current.adSpends) || 0) - (Number(compare?.adSpends) || 0),
        adRevenue: Number(current.adRevenue) || 0,
        adRevenueDiff: (Number(current.adRevenue) || 0) - (Number(compare?.adRevenue) || 0),
        roas: Number(current.roas) || 0,
        roasDiff: (Number(current.roas) || 0) - (Number(compare?.roas) || 0),
        aov: Number(current.aov) || 0,
        aovDiff: (Number(current.aov) || 0) - (Number(compare?.aov) || 0),
      };
    });

    // 5️⃣ Apply sorting (default: totalRevenue desc)
    const sortKey = typeof sortBy === "string" ? sortBy : "totalRevenue";
    const sortOrder = order === "asc" ? "asc" : "desc";

    const allowedSortKeys = new Set(["totalRevenue", "totalOrders", "adSpends", "adRevenue", "roas", "aov"]);

    if (allowedSortKeys.has(sortKey)) {
      const dir = sortOrder === "asc" ? 1 : -1;
      result.sort((a, b) => {
        const va = Number((a as any)[sortKey]) || 0;
        const vb = Number((b as any)[sortKey]) || 0;
        if (va === vb) return 0;
        return (va - vb) * dir;
      });
    }

    // 6️⃣ Add summary row at the top
    const summary = getSummaryMetrics(currentData);

    // 7️⃣ Slice for pagination
    const paginated = result.slice(pageOffset, pageOffset + pageLimit);
    paginated.unshift(summary);

    // 8️⃣ Return response
    return res.status(200).json({
      success: true,
      message: "Dashboard metrics fetched successfully",
      limit: pageLimit,
      offset: pageOffset,
      total: result.length,
      currentRange: { startDate, endDate },
      comparisonRange: { compareStartDate, compareEndDate },
      data: paginated,
    });
  } catch (error) {
    console.error("Error in dashboardMetricUnified:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching metrics.",
      error,
    });
  }
};



/**
 * 🔹 Get daily metrics for line chart
 * @route POST /api/lineChartMetrics
 * @param {string} start - Optional start date (defaults to 15 days before current date)
 * @param {string} end - Optional end date (defaults to current date)
 * @param {string} metric1 - First metric name (defaults to 'totalRevenue')
 * @param {string} metric2 - Second metric name (defaults to 'totalOrders')
 */
export const getLineChartMetrics = async (req: Request, res: Response) => {
  try {
    const { start, end, metric1, metric2 } = req.body;

    // 🗓 Default: 15 days before today → today
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    fifteenDaysAgo.setHours(0, 0, 0, 0);

    const startDate = start ? new Date(start) : fifteenDaysAgo;
    const endDate = end ? new Date(end) : today;

    // Ensure time boundaries
    if (start) startDate.setHours(0, 0, 0, 0);
    if (end) endDate.setHours(23, 59, 59, 999);

    // Default metrics
    const firstMetric = metric1 || "totalRevenue";
    const secondMetric = metric2 || "totalOrders";

    // 🔎 Validation
    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date.",
      });
    }

    // 📊 Fetch daily metrics
    const rawData = await getDailyMetrics(startDate, endDate, firstMetric, secondMetric);

    // 🧩 Transform response → use dynamic keys like totalRevenue / totalOrders
    const formattedData = rawData.map((item: any) => ({
      date: item.date,
      [firstMetric]: item.metric1Value,
      [secondMetric]: item.metric2Value,
    }));

    // ✅ Final Response (convert to strings for JSON compatibility)
    const response: LineChartResponse = {
      success: true,
      message: "Daily metrics fetched successfully",
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      metrics: { metric1: firstMetric, metric2: secondMetric },
      data: formattedData,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    console.error("❌ Error in getLineChartMetrics:", error);
    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Something went wrong while fetching line chart metrics.",
      error,
    });
  }
};

