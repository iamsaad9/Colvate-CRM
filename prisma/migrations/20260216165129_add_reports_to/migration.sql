-- AlterTable
ALTER TABLE "User" ADD COLUMN     "reportsToId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_reportsToId_fkey" FOREIGN KEY ("reportsToId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
