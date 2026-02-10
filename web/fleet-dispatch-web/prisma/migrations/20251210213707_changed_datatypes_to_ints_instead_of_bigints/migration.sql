/*
  Warnings:

  - You are about to alter the column `trailer_admin_designator` on the `Trailer` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `trailer_loaded_status` on the `Trailer` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `trailer_number` on the `Trailer` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `truck_admin_designator` on the `Truck` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `truck_number` on the `Truck` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Trailer" ALTER COLUMN "trailer_admin_designator" SET DATA TYPE INTEGER,
ALTER COLUMN "trailer_loaded_status" SET DATA TYPE INTEGER,
ALTER COLUMN "trailer_number" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Truck" ALTER COLUMN "truck_admin_designator" SET DATA TYPE INTEGER,
ALTER COLUMN "truck_number" SET DATA TYPE INTEGER;
