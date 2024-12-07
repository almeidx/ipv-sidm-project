/*
  Warnings:

  - You are about to drop the `keys` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "keys" DROP CONSTRAINT "keys_user_id_fkey";

-- DropTable
DROP TABLE "keys";
