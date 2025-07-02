/*
  Warnings:

  - The primary key for the `Trailer` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'DELIVERED';

-- DropForeignKey
ALTER TABLE "Load" DROP CONSTRAINT "Load_assigned_trailer_fkey";

-- AlterTable
ALTER TABLE "Load" ALTER COLUMN "due_by" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "assigned_trailer" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Trailer" DROP CONSTRAINT "Trailer_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Trailer_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Trailer_id_seq";

-- AddForeignKey
ALTER TABLE "Load" ADD CONSTRAINT "Load_assigned_trailer_fkey" FOREIGN KEY ("assigned_trailer") REFERENCES "Trailer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
