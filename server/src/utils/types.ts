export interface CategoryMetric {
  categoryId: number;
  category: string;
  subcategory: string;
  totalRevenue: number;
  totalRevenueDiff: number;
  totalOrders: number;
  totalOrdersDiff: number;
  adSpends: number;
  adSpendsDiff: number;
  adRevenue: number;
  adRevenueDiff: number;
  roas: number;
  roasDiff: number;
  aov: number;
  aovDiff: number;
}

export interface DBCategoryMetric {
  categoryId: number;
  categoryName: string;
  subcategoryName: string;
  totalRevenue: number;
  totalOrders: number;
  adSpends: number;
  adRevenue: number;
  roas: number;
  aov: number;
}
export interface DailyMetricData {
  date: string;
  metric1Value: number;
  metric2Value: number;
}

export interface LineChartResponse {
  success: boolean;
  message: string;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  metrics: {
    metric1: string;
    metric2: string;
  };
  data: DailyMetricData[];
}
