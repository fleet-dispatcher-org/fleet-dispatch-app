-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "attributes" JSONB;

-- AlterTable
ALTER TABLE "Load" ADD COLUMN     "attributes" JSONB;

-- AlterTable
ALTER TABLE "Trailer" ADD COLUMN     "attributes" JSONB;

-- AlterTable
ALTER TABLE "Truck" ADD COLUMN     "attributes" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "attributes" JSONB;
