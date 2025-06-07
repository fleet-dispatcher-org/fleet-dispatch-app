-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'DISPATCHER', 'DRIVER');

-- CreateTable
CREATE TABLE "drivers" (
    "id" SERIAL NOT NULL,
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
    "assigned_truck_id" INTEGER,
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

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trailers" (
    "id" SERIAL NOT NULL,
    "attached_truck_id" INTEGER,
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

    CONSTRAINT "trailers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trucks" (
    "id" SERIAL NOT NULL,
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

    CONSTRAINT "trucks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trucks_license_plate_key" ON "trucks"("license_plate");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_assigned_truck_id_fkey" FOREIGN KEY ("assigned_truck_id") REFERENCES "trucks"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trailers" ADD CONSTRAINT "trailers_attached_truck_id_fkey" FOREIGN KEY ("attached_truck_id") REFERENCES "trucks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
