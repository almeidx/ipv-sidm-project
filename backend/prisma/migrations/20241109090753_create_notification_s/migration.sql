-- CreateTable
CREATE TABLE "notifications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" REAL NOT NULL,
    "threshold_surpassed" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sensor_id" INTEGER NOT NULL,
    "deleted_at" DATETIME,
    CONSTRAINT "notifications_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "sensors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "notifications_sensor_id_idx" ON "notifications"("sensor_id");
