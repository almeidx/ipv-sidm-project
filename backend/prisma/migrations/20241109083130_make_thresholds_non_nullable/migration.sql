/*
  Warnings:

  - Made the column `max_threshold` on table `sensors` required. This step will fail if there are existing NULL values in that column.
  - Made the column `min_threshold` on table `sensors` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sensors" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "sensor_type_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "max_threshold" REAL NOT NULL,
    "min_threshold" REAL NOT NULL,
    CONSTRAINT "sensors_sensor_type_id_fkey" FOREIGN KEY ("sensor_type_id") REFERENCES "sensor_types" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_sensors" ("created_at", "id", "max_threshold", "min_threshold", "name", "sensor_type_id") SELECT "created_at", "id", "max_threshold", "min_threshold", "name", "sensor_type_id" FROM "sensors";
DROP TABLE "sensors";
ALTER TABLE "new_sensors" RENAME TO "sensors";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
