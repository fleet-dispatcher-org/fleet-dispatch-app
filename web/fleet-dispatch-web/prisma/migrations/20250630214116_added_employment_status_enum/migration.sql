/*
  Warnings:

  - The `employment_status` column on the `Driver` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Employment_Status" AS ENUM ('HIRED', 'SUSPENDED_WITH_PAY', 'SUSPENDED_NO_PAY', 'TERMINATED', 'ON_CONTRACT');

-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "employment_status",
ADD COLUMN     "employment_status" "Employment_Status" NOT NULL DEFAULT 'HIRED';
