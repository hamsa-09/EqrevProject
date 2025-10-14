/*
  Warnings:

  - You are about to drop the column `name` on the `BlinkitData` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `BlinkitData` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `BlinkitData` table. All the data in the column will be lost.
  - Added the required column `Internal_Client_ID` to the `BlinkitData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ad_add_to_carts` to the `BlinkitData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ad_clicks` to the `BlinkitData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ad_impressions` to the `BlinkitData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ad_orders` to the `BlinkitData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ad_orders_othersku` to the `BlinkitData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ad_orders_samesku` to the `BlinkitData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ad_revenue` to the `BlinkitData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ad_spend` to the `BlinkitData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brand_name` to the `BlinkitData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `BlinkitData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `BlinkitData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_name` to the `BlinkitData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stock_at_darkstores` to the `BlinkitData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stock_at_warehouses` to the `BlinkitData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_final_revenue` to the `BlinkitData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_mrp_revenue` to the `BlinkitData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_net_revenue` to the `BlinkitData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_orders` to the `BlinkitData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BlinkitData" DROP COLUMN "name",
DROP COLUMN "price",
DROP COLUMN "stock",
ADD COLUMN     "Internal_Client_ID" TEXT NOT NULL,
ADD COLUMN     "OOS_darkstores" INTEGER,
ADD COLUMN     "ad_add_to_carts" INTEGER NOT NULL,
ADD COLUMN     "ad_clicks" INTEGER NOT NULL,
ADD COLUMN     "ad_impressions" INTEGER NOT NULL,
ADD COLUMN     "ad_orders" INTEGER NOT NULL,
ADD COLUMN     "ad_orders_othersku" INTEGER NOT NULL,
ADD COLUMN     "ad_orders_samesku" INTEGER NOT NULL,
ADD COLUMN     "ad_revenue" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "ad_spend" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "brand_name" TEXT NOT NULL,
ADD COLUMN     "bundle_id" TEXT,
ADD COLUMN     "cutsize_darkstores" INTEGER,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "discounted_selling_price" DOUBLE PRECISION,
ADD COLUMN     "fullsize_darkstores" INTEGER,
ADD COLUMN     "inactive_darkstores" INTEGER,
ADD COLUMN     "internal_product_id" TEXT,
ADD COLUMN     "internal_product_name" TEXT,
ADD COLUMN     "maximum_retail_price" DOUBLE PRECISION,
ADD COLUMN     "platform" TEXT,
ADD COLUMN     "product_id" TEXT NOT NULL,
ADD COLUMN     "product_image" TEXT,
ADD COLUMN     "product_name" TEXT NOT NULL,
ADD COLUMN     "product_type" TEXT,
ADD COLUMN     "stock_at_darkstores" INTEGER NOT NULL,
ADD COLUMN     "stock_at_warehouses" INTEGER NOT NULL,
ADD COLUMN     "subcategory_name" TEXT,
ADD COLUMN     "total_darkstores" INTEGER,
ADD COLUMN     "total_final_revenue" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "total_mrp_revenue" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "total_net_revenue" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "total_orders" INTEGER NOT NULL,
ALTER COLUMN "category" DROP NOT NULL;
