/*
  Warnings:

  - Added the required column `status` to the `Load` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `Load` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Load" ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "weight" DECIMAL(65,30) NOT NULL;
