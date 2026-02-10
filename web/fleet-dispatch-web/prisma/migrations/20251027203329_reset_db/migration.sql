-- AlterTable
ALTER TABLE "public"."Load" ADD COLUMN     "route_id" TEXT;

-- CreateTable
CREATE TABLE "public"."Route" (
    "id" TEXT NOT NULL,
    "loads" TEXT[],
    "length" INTEGER,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Load" ADD CONSTRAINT "Load_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "public"."Route"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
