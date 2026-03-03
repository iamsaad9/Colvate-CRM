/*
  Warnings:

  - You are about to drop the column `serviceId` on the `Deal` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Deal" DROP CONSTRAINT "Deal_serviceId_fkey";

-- AlterTable
ALTER TABLE "Deal" DROP COLUMN "serviceId";

-- CreateTable
CREATE TABLE "_DealToService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DealToService_AB_unique" ON "_DealToService"("A", "B");

-- CreateIndex
CREATE INDEX "_DealToService_B_index" ON "_DealToService"("B");

-- AddForeignKey
ALTER TABLE "_DealToService" ADD CONSTRAINT "_DealToService_A_fkey" FOREIGN KEY ("A") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DealToService" ADD CONSTRAINT "_DealToService_B_fkey" FOREIGN KEY ("B") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
