/*
  Warnings:

  - You are about to drop the column `title` on the `Service` table. All the data in the column will be lost.
  - Added the required column `name` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ServiceType" AS ENUM ('TIERED', 'PER_HEAD');

-- AlterTable
ALTER TABLE "public"."Service" DROP COLUMN "title",
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "minGuests" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "options" JSONB,
ADD COLUMN     "price" TEXT,
ADD COLUMN     "type" "public"."ServiceType" NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;
