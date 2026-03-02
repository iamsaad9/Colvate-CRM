/*
  Warnings:

  - Added the required column `serviceId` to the `Deal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Deal" ADD COLUMN     "serviceId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_LeadToService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_LeadToService_AB_unique" ON "_LeadToService"("A", "B");

-- CreateIndex
CREATE INDEX "_LeadToService_B_index" ON "_LeadToService"("B");

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LeadToService" ADD CONSTRAINT "_LeadToService_A_fkey" FOREIGN KEY ("A") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LeadToService" ADD CONSTRAINT "_LeadToService_B_fkey" FOREIGN KEY ("B") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
