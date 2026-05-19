-- CreateTable
CREATE TABLE "ProductSectionIndex" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "handle" TEXT,
    "imageUrl" TEXT,
    "sectionCount" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ProductSectionIndex_shop_idx" ON "ProductSectionIndex"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSectionIndex_shop_productId_key" ON "ProductSectionIndex"("shop", "productId");
