/*
  Warnings:

  - You are about to drop the column `user_id` on the `Driver` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Driver" DROP CONSTRAINT "Driver_user_id_fkey";

-- DropIndex
DROP INDEX "Driver_user_id_key";

-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "user_id";

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
