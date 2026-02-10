-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "assigned_by" TEXT,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'SUGGESTED';

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
