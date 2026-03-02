-- DropForeignKey
ALTER TABLE "Deal" DROP CONSTRAINT "Deal_customerId_fkey";

-- AlterTable
ALTER TABLE "Deal" ALTER COLUMN "customerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
