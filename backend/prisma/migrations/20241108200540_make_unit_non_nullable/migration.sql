/*
  Warnings:

  - Made the column `unit` on table `sensor_types` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sensor_types" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL
);
INSERT INTO "new_sensor_types" ("id", "name", "unit") SELECT "id", "name", "unit" FROM "sensor_types";
DROP TABLE "sensor_types";
ALTER TABLE "new_sensor_types" RENAME TO "sensor_types";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
