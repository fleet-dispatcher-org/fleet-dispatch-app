-- AlterTable
ALTER TABLE "Truck" ADD COLUMN     "next_maintenance_date" TIMESTAMP(3),
ADD COLUMN     "required_certs" TEXT[];
