/*
  Warnings:

  - You are about to drop the column `serviceId` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `selectedServiceJson` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceName` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `servicePrice` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_serviceId_fkey";

-- AlterTable
ALTER TABLE "public"."Booking" DROP COLUMN "serviceId",
ADD COLUMN     "selectedServiceJson" JSONB NOT NULL,
ADD COLUMN     "serviceName" TEXT NOT NULL,
ADD COLUMN     "servicePrice" TEXT NOT NULL;
