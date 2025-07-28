/*
  Warnings:

  - The values [ON_CONTRACT] on the enum `Employment_Status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "Availability_Status" ADD VALUE 'SECONDARY_DUTY';

-- AlterEnum
BEGIN;
CREATE TYPE "Employment_Status_new" AS ENUM ('HIRED', 'SUSPENDED_WITH_PAY', 'SUSPENDED_NO_PAY', 'TERMINATED', 'SECONDARY_DUTY');
ALTER TABLE "Driver" ALTER COLUMN "employment_status" DROP DEFAULT;
ALTER TABLE "Driver" ALTER COLUMN "employment_status" TYPE "Employment_Status_new" USING ("employment_status"::text::"Employment_Status_new");
ALTER TYPE "Employment_Status" RENAME TO "Employment_Status_old";
ALTER TYPE "Employment_Status_new" RENAME TO "Employment_Status";
DROP TYPE "Employment_Status_old";
ALTER TABLE "Driver" ALTER COLUMN "employment_status" SET DEFAULT 'HIRED';
COMMIT;
