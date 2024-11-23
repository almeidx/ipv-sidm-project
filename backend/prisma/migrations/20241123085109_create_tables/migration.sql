-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keys" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "source_type" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensor_data" (
    "id" SERIAL NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sensor_id" INTEGER NOT NULL,

    CONSTRAINT "sensor_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sensor_type_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "max_threshold" DOUBLE PRECISION NOT NULL,
    "min_threshold" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "sensors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensor_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "sensor_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "threshold_surpassed" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sensor_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "keys_key_key" ON "keys"("key");

-- CreateIndex
CREATE INDEX "keys_user_id_idx" ON "keys"("user_id");

-- CreateIndex
CREATE INDEX "sensor_data_sensor_id_idx" ON "sensor_data"("sensor_id");

-- CreateIndex
CREATE INDEX "notifications_sensor_id_idx" ON "notifications"("sensor_id");

-- AddForeignKey
ALTER TABLE "keys" ADD CONSTRAINT "keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensor_data" ADD CONSTRAINT "sensor_data_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "sensors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensors" ADD CONSTRAINT "sensors_sensor_type_id_fkey" FOREIGN KEY ("sensor_type_id") REFERENCES "sensor_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "sensors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
