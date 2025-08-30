/*
  Warnings:

  - You are about to drop the column `selectedServiceJson` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `serviceName` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `servicePrice` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Booking" DROP COLUMN "selectedServiceJson",
DROP COLUMN "serviceName",
DROP COLUMN "servicePrice",
ADD COLUMN     "serviceId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
