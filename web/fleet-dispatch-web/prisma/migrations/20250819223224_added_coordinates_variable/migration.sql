-- AlterTable
ALTER TABLE "public"."Driver" ADD COLUMN     "current_coordinates" JSONB;

-- AlterTable
ALTER TABLE "public"."Load" ADD COLUMN     "current_coordinates" JSONB;

-- AlterTable
ALTER TABLE "public"."Trailer" ADD COLUMN     "current_coordinates" JSONB;

-- AlterTable
ALTER TABLE "public"."Truck" ADD COLUMN     "current_coordinates" JSONB;
