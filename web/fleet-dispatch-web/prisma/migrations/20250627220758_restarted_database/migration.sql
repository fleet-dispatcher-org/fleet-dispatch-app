-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'REQUESTED';

-- CreateTable
CREATE TABLE "CustomerRequest" (
    "id" TEXT NOT NULL,
    "origin" VARCHAR(20) NOT NULL,
    "destination" VARCHAR(20) NOT NULL,
    "status" "Status" NOT NULL,

    CONSTRAINT "CustomerRequest_pkey" PRIMARY KEY ("id")
);
