/*
  Warnings:

  - Added the required column `origin` to the `Load` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Load" ADD COLUMN     "origin" VARCHAR(20) NOT NULL;
