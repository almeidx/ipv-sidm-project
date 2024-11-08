-- This is an empty migration.

UPDATE sensor_types SET unit = '°C' WHERE id = 1;
UPDATE sensor_types SET unit = '%' WHERE id = 2;
UPDATE sensor_types SET unit = 'bar' WHERE id = 3;
UPDATE sensor_types SET unit = 'µT' WHERE id = 4;
UPDATE sensor_types SET unit = 'cm3/s' WHERE id = 5;
