/*
  Warnings:

  - The primary key for the `drivers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `attached_truck_id` on the `trailers` table. All the data in the column will be lost.
  - The primary key for the `trucks` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "drivers" DROP CONSTRAINT "drivers_assigned_truck_id_fkey";

-- DropForeignKey
ALTER TABLE "trailers" DROP CONSTRAINT "trailers_attached_truck_id_fkey";

-- AlterTable
ALTER TABLE "drivers" DROP CONSTRAINT "drivers_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "assigned_truck_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "drivers_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "drivers_id_seq";

-- AlterTable
ALTER TABLE "trailers" DROP COLUMN "attached_truck_id",
ADD COLUMN     "assigned_truck_id" TEXT;

-- AlterTable
ALTER TABLE "trucks" DROP CONSTRAINT "trucks_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "trucks_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "trucks_id_seq";

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_assigned_truck_id_fkey" FOREIGN KEY ("assigned_truck_id") REFERENCES "trucks"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trailers" ADD CONSTRAINT "trailers_assigned_truck_id_fkey" FOREIGN KEY ("assigned_truck_id") REFERENCES "trucks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
