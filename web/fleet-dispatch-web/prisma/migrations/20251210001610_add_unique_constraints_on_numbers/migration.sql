/*
  Warnings:

  - The `truck_number` column on the `Truck` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[trailer_number]` on the table `Trailer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[truck_number]` on the table `Truck` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Load" ALTER COLUMN "weight" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Trailer" ALTER COLUMN "make" DROP NOT NULL,
ALTER COLUMN "model" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Truck" ALTER COLUMN "license_plate" DROP NOT NULL,
ALTER COLUMN "make" DROP NOT NULL,
ALTER COLUMN "model" DROP NOT NULL,
DROP COLUMN "truck_number",
ADD COLUMN     "truck_number" BIGINT;

-- CreateIndex
CREATE UNIQUE INDEX "Trailer_trailer_number_key" ON "Trailer"("trailer_number");

-- CreateIndex
CREATE UNIQUE INDEX "Truck_truck_number_key" ON "Truck"("truck_number");
