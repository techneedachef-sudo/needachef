/*
  Warnings:

  - A unique constraint covering the columns `[userId,courseId]` on the table `UserCourseProgress` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserCourseProgress_userId_courseId_key" ON "public"."UserCourseProgress"("userId", "courseId");
