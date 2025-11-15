/*
  Warnings:

  - You are about to drop the column `route_id` on the `Load` table. All the data in the column will be lost.
  - You are about to drop the `_LoadToRoute` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_LoadToRoute" DROP CONSTRAINT "_LoadToRoute_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_LoadToRoute" DROP CONSTRAINT "_LoadToRoute_B_fkey";

-- AlterTable
ALTER TABLE "Load" DROP COLUMN "route_id";

-- DropTable
DROP TABLE "public"."_LoadToRoute";

-- CreateTable
CREATE TABLE "RouteLoad" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "loadId" TEXT NOT NULL,
    "order" INTEGER,

    CONSTRAINT "RouteLoad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RouteLoad_routeId_idx" ON "RouteLoad"("routeId");

-- CreateIndex
CREATE INDEX "RouteLoad_loadId_idx" ON "RouteLoad"("loadId");

-- CreateIndex
CREATE UNIQUE INDEX "RouteLoad_routeId_loadId_key" ON "RouteLoad"("routeId", "loadId");

-- AddForeignKey
ALTER TABLE "RouteLoad" ADD CONSTRAINT "RouteLoad_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteLoad" ADD CONSTRAINT "RouteLoad_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE CASCADE ON UPDATE CASCADE;
