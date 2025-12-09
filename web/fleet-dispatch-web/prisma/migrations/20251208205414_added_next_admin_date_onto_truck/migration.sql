/*
  Warnings:

  - You are about to drop the column `next_inspection_due` on the `Trailer` table. All the data in the column will be lost.
  - You are about to drop the column `trailer_status` on the `Trailer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Trailer" DROP COLUMN "next_inspection_due",
DROP COLUMN "trailer_status",
ADD COLUMN     "next_admin_date" DATE,
ADD COLUMN     "next_inspection_date" DATE,
ADD COLUMN     "specialized_equipment_list" TEXT[],
ADD COLUMN     "specialized_equipment_quantity" INTEGER,
ADD COLUMN     "trailer_admin_designator" BIGINT,
ADD COLUMN     "trailer_door_type" VARCHAR(20),
ADD COLUMN     "trailer_loaded_status" BIGINT,
ADD COLUMN     "trailer_vessel_type" VARCHAR(20);

-- AlterTable
ALTER TABLE "Truck" ADD COLUMN     "next_admin_date" TIMESTAMP(3),
ADD COLUMN     "truck_admin_designator" BIGINT;

-- AlterTable
ALTER TABLE "Week" ADD COLUMN     "current_70_total" INTEGER DEFAULT 70;
