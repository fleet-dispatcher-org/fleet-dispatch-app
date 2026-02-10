/*
  Warnings:

  - You are about to drop the column `length` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `loads` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Route` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('START', 'PICKUP', 'DELIVERY', 'END');

-- DropForeignKey
ALTER TABLE "public"."Load" DROP CONSTRAINT "Load_route_id_fkey";

-- AlterTable
ALTER TABLE "Route" DROP COLUMN "length",
DROP COLUMN "loads",
DROP COLUMN "name",
ADD COLUMN     "feasibilityScore" DOUBLE PRECISION,
ADD COLUMN     "isValid" BOOLEAN,
ADD COLUMN     "totalCost" DOUBLE PRECISION,
ADD COLUMN     "totalDistance" DOUBLE PRECISION,
ADD COLUMN     "totalDuration" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "_LoadToRoute" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LoadToRoute_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_LoadToRoute_B_index" ON "_LoadToRoute"("B");

-- AddForeignKey
ALTER TABLE "_LoadToRoute" ADD CONSTRAINT "_LoadToRoute_A_fkey" FOREIGN KEY ("A") REFERENCES "Load"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LoadToRoute" ADD CONSTRAINT "_LoadToRoute_B_fkey" FOREIGN KEY ("B") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;
