-- AlterTable
ALTER TABLE "Load" ALTER COLUMN "assigned_fleet" DROP NOT NULL,
ALTER COLUMN "assigned_fleet" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Trailer" ALTER COLUMN "assigned_fleet" DROP NOT NULL,
ALTER COLUMN "assigned_fleet" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Truck" ALTER COLUMN "assigned_fleet_id" DROP NOT NULL,
ALTER COLUMN "assigned_fleet_id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "assigned_fleet" DROP NOT NULL,
ALTER COLUMN "assigned_fleet" DROP DEFAULT;
