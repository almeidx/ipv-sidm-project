-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sensors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "value_type" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_sensors" ("id", "name", "value_type") SELECT "id", "name", "value_type" FROM "sensors";
DROP TABLE "sensors";
ALTER TABLE "new_sensors" RENAME TO "sensors";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
