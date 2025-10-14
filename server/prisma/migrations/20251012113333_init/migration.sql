-- CreateTable
CREATE TABLE "BlinkitData" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,

    CONSTRAINT "BlinkitData_pkey" PRIMARY KEY ("id")
);
