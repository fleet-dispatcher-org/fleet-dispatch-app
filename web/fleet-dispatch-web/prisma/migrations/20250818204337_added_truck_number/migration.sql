/*
  Warnings:

  - The `required_certs` column on the `Truck` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Truck" ADD COLUMN     "truck_number" TEXT,
DROP COLUMN "required_certs",
ADD COLUMN     "required_certs" JSONB;
