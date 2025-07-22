/*
  Warnings:

  - The `driver_status` column on the `Driver` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Availability_Status" AS ENUM ('AVAILABLE', 'ASSIGNED', 'HAS_EMERGENCY', 'UNAVAILABLE', 'SUGGESTED');

-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "driver_status",
ADD COLUMN     "driver_status" "Availability_Status" NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE "Trailer" ADD COLUMN     "trailer_status" "Availability_Status" NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE "Truck" ADD COLUMN     "truck_status" "Availability_Status" NOT NULL DEFAULT 'AVAILABLE';

-- DropEnum
DROP TYPE "Driver_Status";
