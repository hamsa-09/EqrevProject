/*
  Warnings:

  - A unique constraint covering the columns `[name,subcategory_name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Category_name_subcategory_name_key" ON "Category"("name", "subcategory_name");
