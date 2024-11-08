/*
  Warnings:

  - You are about to alter the column `value` on the `sensor_data` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sensor_data" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sensor_id" INTEGER NOT NULL,
    CONSTRAINT "sensor_data_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "sensors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_sensor_data" ("created_at", "id", "sensor_id", "value") SELECT "created_at", "id", "sensor_id", "value" FROM "sensor_data";
DROP TABLE "sensor_data";
ALTER TABLE "new_sensor_data" RENAME TO "sensor_data";
CREATE INDEX "sensor_data_sensor_id_idx" ON "sensor_data"("sensor_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
