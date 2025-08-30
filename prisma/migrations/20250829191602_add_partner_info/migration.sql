-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "partnerId" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "paymentDetail" TEXT,
ADD COLUMN     "paymentMethod" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
