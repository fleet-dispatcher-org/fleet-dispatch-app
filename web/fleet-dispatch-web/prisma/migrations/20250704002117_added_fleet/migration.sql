-- AlterTable
ALTER TABLE "Load" ADD COLUMN     "assigned_fleet" TEXT NOT NULL DEFAULT 'No fleet Assigned';

-- AlterTable
ALTER TABLE "Trailer" ADD COLUMN     "assigned_fleet" TEXT NOT NULL DEFAULT 'No fleet Assigned';

-- AlterTable
ALTER TABLE "Truck" ADD COLUMN     "assigned_fleet_id" TEXT NOT NULL DEFAULT 'No fleet Assigned';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "assigned_fleet" TEXT NOT NULL DEFAULT 'No fleet Assigned';

-- CreateTable
CREATE TABLE "Fleet" (
    "id" TEXT NOT NULL,
    "fleet_name" TEXT,
    "fleet_homebase" TEXT,

    CONSTRAINT "Fleet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Trailer" ADD CONSTRAINT "Trailer_assigned_fleet_fkey" FOREIGN KEY ("assigned_fleet") REFERENCES "Fleet"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Load" ADD CONSTRAINT "Load_assigned_fleet_fkey" FOREIGN KEY ("assigned_fleet") REFERENCES "Fleet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Truck" ADD CONSTRAINT "Truck_assigned_fleet_id_fkey" FOREIGN KEY ("assigned_fleet_id") REFERENCES "Fleet"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_assigned_fleet_fkey" FOREIGN KEY ("assigned_fleet") REFERENCES "Fleet"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
