
interface Fact {
    total_final_revenue: number;
    total_orders: number;
    ad_spend: number;
    ad_revenue: number;
}

interface Product {
    facts: Fact[];
}

export function aggregateCategoryMetrics(category: { products: Product[] }) {
  let totalRevenue = 0, totalOrders = 0, adSpends = 0, adRevenue = 0;
category.products.forEach((product: Product) => {
    product.facts.forEach((fact: Fact) => {
        totalRevenue += fact.total_final_revenue;
        totalOrders += fact.total_orders;
        adSpends += fact.ad_spend;
        adRevenue += fact.ad_revenue;
    });
});

  const roas = adSpends ? adRevenue / adSpends : 0;
  const aov = totalOrders ? totalRevenue / totalOrders : 0;

  return { totalRevenue, totalOrders, adSpends, adRevenue, roas, aov };
}
// -------------------------------------------------------------------------
interface CategoryMetrics {
    totalRevenue: number;
    totalOrders: number;
    adSpends: number;
    adRevenue: number;
    roas: number;
    aov: number;
}

interface SummaryMetricInput {
    totalRevenue: number;
    totalOrders: number;
    adSpends: number;
    adRevenue: number;
}

interface SummaryMetrics extends CategoryMetrics {
    category: string;
}

export function aggregateSummaryMetrics(results: any[]): any {
    let totalRevenue = 0, totalRevenueDiff = 0;
    let totalOrders = 0, totalOrdersDiff = 0;
    let adSpends = 0, adSpendsDiff = 0;
    let adRevenue = 0, adRevenueDiff = 0;
    let roas = 0, roasDiff = 0;
    let aov = 0, aovDiff = 0;

    results.forEach(r => {
        totalRevenue += r.totalRevenue;
        totalRevenueDiff += r.totalRevenueDiff || 0;
        totalOrders += r.totalOrders;
        totalOrdersDiff += r.totalOrdersDiff || 0;
        adSpends += r.adSpends;
        adSpendsDiff += r.adSpendsDiff || 0;
        adRevenue += r.adRevenue;
        adRevenueDiff += r.adRevenueDiff || 0;
        roas += r.roas;
        roasDiff += r.roasDiff || 0;
        aov += r.aov;
        aovDiff += r.aovDiff || 0;
    });

    // Optionally, for summary, you might want to recalculate roas and aov differently (totals/ratios)
    return {
        category: "Summary",
        totalRevenue,
        totalRevenueDiff,
        totalOrders,
        totalOrdersDiff,
        adSpends,
        adSpendsDiff,
        adRevenue,
        adRevenueDiff,
        roas: adSpends ? adRevenue / adSpends : 0,
        roasDiff,
        aov: totalOrders ? totalRevenue / totalOrders : 0,
        aovDiff,
    };
}
export function getPreviousPeriod(startDate: Date, endDate: Date) {
    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const prevEndDate = new Date(startDate);
    prevEndDate.setDate(startDate.getDate() - 1);
    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevEndDate.getDate() - (diffDays - 1));
    return { prevStartDate, prevEndDate };
}
