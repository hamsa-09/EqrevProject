/*
  Warnings:

  - You are about to drop the `BlinkitData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."BlinkitData";

-- CreateTable
CREATE TABLE "Brand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "subcategory_name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "client_id" TEXT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Platform" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Platform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "product_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "internal_product_id" TEXT,
    "internal_product_name" TEXT,
    "product_type" TEXT,
    "bundle_id" TEXT,
    "product_image" TEXT,
    "maximum_retail_price" DOUBLE PRECISION,
    "discounted_selling_price" DOUBLE PRECISION,
    "brandId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactTable" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "productId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "platformId" INTEGER NOT NULL,
    "total_orders" INTEGER NOT NULL,
    "total_mrp_revenue" DOUBLE PRECISION NOT NULL,
    "total_final_revenue" DOUBLE PRECISION NOT NULL,
    "stock_at_darkstores" INTEGER NOT NULL,
    "stock_at_warehouses" INTEGER NOT NULL,
    "ad_spend" DOUBLE PRECISION NOT NULL,
    "ad_impressions" INTEGER NOT NULL,
    "ad_add_to_carts" INTEGER NOT NULL,
    "ad_orders" INTEGER NOT NULL,
    "ad_orders_othersku" INTEGER NOT NULL,
    "ad_orders_samesku" INTEGER NOT NULL,
    "ad_revenue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FactTable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Client_client_id_key" ON "Client"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "Platform_name_key" ON "Platform"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_product_id_key" ON "Product"("product_id");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactTable" ADD CONSTRAINT "FactTable_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactTable" ADD CONSTRAINT "FactTable_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactTable" ADD CONSTRAINT "FactTable_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
