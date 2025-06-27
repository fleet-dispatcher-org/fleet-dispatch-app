/*
  Warnings:

  - Changed the type of `status` on the `Load` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('TERMINATED', 'SUGGESTED', 'IN_PROGRESS', 'PENDING');

-- AlterTable
ALTER TABLE "Load" DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL;
