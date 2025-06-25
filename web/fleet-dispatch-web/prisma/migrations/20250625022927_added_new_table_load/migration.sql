-- CreateTable
CREATE TABLE "Load" (
    "id" TEXT NOT NULL,
    "destination" VARCHAR(20) NOT NULL,
    "due_by" TIMESTAMP(3) NOT NULL,
    "started_at" TIMESTAMP(3),
    "assigned_driver" TEXT,
    "assigned_trailer" INTEGER,
    "assigned_truck" TEXT,
    "percent_complete" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Load_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Load_assigned_trailer_key" ON "Load"("assigned_trailer");

-- AddForeignKey
ALTER TABLE "Load" ADD CONSTRAINT "Load_assigned_truck_fkey" FOREIGN KEY ("assigned_truck") REFERENCES "Truck"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Load" ADD CONSTRAINT "Load_assigned_driver_fkey" FOREIGN KEY ("assigned_driver") REFERENCES "Driver"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Load" ADD CONSTRAINT "Load_assigned_trailer_fkey" FOREIGN KEY ("assigned_trailer") REFERENCES "Trailer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
