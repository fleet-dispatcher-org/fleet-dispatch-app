/*
  Warnings:

  - You are about to drop the column `requested_time_off` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."Time_Off_Status" AS ENUM ('APPROVED', 'DENIED', 'POSTPONE');

-- AlterTable
ALTER TABLE "public"."Load" ADD COLUMN     "assigned_by" TEXT;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "requested_time_off",
ADD COLUMN     "timeOffEnd" TIMESTAMP(3),
ADD COLUMN     "timeOffStart" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."TimeOffRequest" (
    "id" TEXT NOT NULL,
    "timeOffStart" TIMESTAMP(3),
    "timeOffEnd" TIMESTAMP(3),
    "requestingUser" TEXT NOT NULL,
    "status" "public"."Time_Off_Status",
    "reason" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "TimeOffRequest_id_key" ON "public"."TimeOffRequest"("id");

-- AddForeignKey
ALTER TABLE "public"."Load" ADD CONSTRAINT "Load_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."TimeOffRequest" ADD CONSTRAINT "TimeOffRequest_requestingUser_fkey" FOREIGN KEY ("requestingUser") REFERENCES "public"."User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
