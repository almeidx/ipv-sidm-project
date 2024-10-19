/*
  Warnings:

  - You are about to drop the column `value_type` on the `sensors` table. All the data in the column will be lost.
  - Added the required column `sensor_type_id` to the `sensors` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "sensor_types" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sensors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sensor_type_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sensors_sensor_type_id_fkey" FOREIGN KEY ("sensor_type_id") REFERENCES "sensor_types" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_sensors" ("created_at", "id", "name") SELECT "created_at", "id", "name" FROM "sensors";
DROP TABLE "sensors";
ALTER TABLE "new_sensors" RENAME TO "sensors";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
