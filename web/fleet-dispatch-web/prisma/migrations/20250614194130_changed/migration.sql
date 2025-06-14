/*
  Warnings:

  - You are about to drop the `drivers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trailers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trucks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "drivers" DROP CONSTRAINT "drivers_assigned_truck_id_fkey";

-- DropForeignKey
ALTER TABLE "trailers" DROP CONSTRAINT "trailers_assigned_truck_id_fkey";

-- DropTable
DROP TABLE "drivers";

-- DropTable
DROP TABLE "trailers";

-- DropTable
DROP TABLE "trucks";

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "first_name" VARCHAR(20),
    "last_name" VARCHAR(20),
    "license_number" VARCHAR(20),
    "license_expiration" VARCHAR(20),
    "license_class" VARCHAR(1),
    "current_location" VARCHAR(20),
    "in_range" BOOLEAN DEFAULT false,
    "is_available" BOOLEAN DEFAULT true,
    "driver_reports_ready" BOOLEAN DEFAULT false,
    "has_home_need" BOOLEAN DEFAULT false,
    "assigned_truck_id" TEXT,
    "phone_number" VARCHAR(15),
    "emergency_contact" VARCHAR(20) NOT NULL,
    "emergency_contact_phone" VARCHAR(15) NOT NULL,
    "hours_driven_today" INTEGER,
    "hours_driven_week" INTEGER,
    "last_rest_period" INTEGER,
    "certifications" TEXT[],
    "drug_test_current" BOOLEAN,
    "employment_status" VARCHAR(20),
    "hire_date" DATE,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trailer" (
    "id" SERIAL NOT NULL,
    "assigned_truck_id" TEXT,
    "current_location" VARCHAR(20),
    "has_registration" BOOLEAN DEFAULT true,
    "bureaucratically_sound" BOOLEAN DEFAULT true,
    "correct_equipment_working" BOOLEAN DEFAULT true,
    "in_range_first_stop" BOOLEAN DEFAULT false,
    "make" VARCHAR(20) NOT NULL,
    "model" VARCHAR(20) NOT NULL,
    "year" INTEGER,
    "max_cargo_capacity" DECIMAL(7,2),
    "current_cargo_weight" DECIMAL(7,2),
    "license_plate" VARCHAR(20),
    "registration_expiry" DATE,
    "last_inspection_date" DATE,
    "next_inspection_due" DATE,
    "required_permits" TEXT[],
    "insurance_valid" BOOLEAN,

    CONSTRAINT "Trailer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Truck" (
    "id" TEXT NOT NULL,
    "license_plate" VARCHAR(20) NOT NULL,
    "make" VARCHAR(20) NOT NULL,
    "model" VARCHAR(20) NOT NULL,
    "year" INTEGER,
    "capacity_tons" DECIMAL(5,2),
    "mileage" INTEGER,
    "is_active" BOOLEAN DEFAULT true,
    "current_location" VARCHAR(20),
    "assigned_driver" BOOLEAN DEFAULT false,
    "driver_id" INTEGER,
    "assigned_trailer" BOOLEAN DEFAULT false,
    "trailer_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Truck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Truck_license_plate_key" ON "Truck"("license_plate");

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_assigned_truck_id_fkey" FOREIGN KEY ("assigned_truck_id") REFERENCES "Truck"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Trailer" ADD CONSTRAINT "Trailer_assigned_truck_id_fkey" FOREIGN KEY ("assigned_truck_id") REFERENCES "Truck"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
