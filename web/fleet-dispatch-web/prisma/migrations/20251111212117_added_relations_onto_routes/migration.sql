-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "assigned_driver" TEXT,
ADD COLUMN     "assigned_fleet" TEXT,
ADD COLUMN     "assigned_trailer" TEXT,
ADD COLUMN     "assigned_truck" TEXT;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_assigned_truck_fkey" FOREIGN KEY ("assigned_truck") REFERENCES "Truck"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_assigned_driver_fkey" FOREIGN KEY ("assigned_driver") REFERENCES "Driver"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_assigned_trailer_fkey" FOREIGN KEY ("assigned_trailer") REFERENCES "Trailer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_assigned_fleet_fkey" FOREIGN KEY ("assigned_fleet") REFERENCES "Fleet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
