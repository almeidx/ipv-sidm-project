/*
  Warnings:

  - You are about to drop the column `user_id` on the `sensor_data` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sensor_data" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sensor_id" TEXT NOT NULL,
    CONSTRAINT "sensor_data_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "sensors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_sensor_data" ("created_at", "id", "sensor_id", "value") SELECT "created_at", "id", "sensor_id", "value" FROM "sensor_data";
DROP TABLE "sensor_data";
ALTER TABLE "new_sensor_data" RENAME TO "sensor_data";
CREATE INDEX "sensor_data_sensor_id_idx" ON "sensor_data"("sensor_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
