-- CreateTable
CREATE TABLE "Week" (
    "id" TEXT NOT NULL,
    "week_start" TIMESTAMP(3) NOT NULL,
    "week_end" TIMESTAMP(3) NOT NULL,
    "day_1_hours" TEXT,
    "day_2_hours" TEXT,
    "day_3_hours" TEXT,
    "day_4_hours" TEXT,
    "day_5_hours" TEXT,
    "day_6_hours" TEXT,
    "day_7_hours" TEXT,
    "day_1_stop" TEXT,
    "day_2_stop" TEXT,
    "day_3_stop" TEXT,
    "day_4_stop" TEXT,
    "day_5_stop" TEXT,
    "day_6_stop" TEXT,
    "day_7_stop" TEXT,

    CONSTRAINT "Week_pkey" PRIMARY KEY ("id")
);
