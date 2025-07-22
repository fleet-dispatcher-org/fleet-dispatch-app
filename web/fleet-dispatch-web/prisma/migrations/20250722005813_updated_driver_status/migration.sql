/*
  Warnings:

  - You are about to drop the column `has_home_need` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `hours_driven_today` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `hours_driven_week` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `last_rest_period` on the `Driver` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Driver_Status" AS ENUM ('AVAILABLE', 'ASSIGNED', 'HAS_EMERGENCY', 'UNAVAILABLE', 'SUGGESTED');

-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'UNASSIGNED';

-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "has_home_need",
DROP COLUMN "hours_driven_today",
DROP COLUMN "hours_driven_week",
DROP COLUMN "last_rest_period",
ADD COLUMN     "driver_status" "Driver_Status" NOT NULL DEFAULT 'AVAILABLE';
