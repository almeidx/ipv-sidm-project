/*
  Warnings:

  - You are about to alter the column `sensor_id` on the `sensor_data` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `sensors` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `sensors` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sensor_data" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sensor_id" INTEGER NOT NULL,
    CONSTRAINT "sensor_data_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "sensors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
-- INSERT INTO "new_sensor_data" ("created_at", "id", "sensor_id", "value") SELECT "created_at", "id", "sensor_id", "value" FROM "sensor_data";
DROP TABLE "sensor_data";
ALTER TABLE "new_sensor_data" RENAME TO "sensor_data";
CREATE INDEX "sensor_data_sensor_id_idx" ON "sensor_data"("sensor_id");
CREATE TABLE "new_sensors" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "sensor_type_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sensors_sensor_type_id_fkey" FOREIGN KEY ("sensor_type_id") REFERENCES "sensor_types" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
-- INSERT INTO "new_sensors" ("created_at", "id", "name", "sensor_type_id") SELECT "created_at", "id", "name", "sensor_type_id" FROM "sensors";
DROP TABLE "sensors";
ALTER TABLE "new_sensors" RENAME TO "sensors";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
