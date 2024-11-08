-- This is an empty migration.

UPDATE sensors SET name = 'FLOW 1A' WHERE id = 10;
UPDATE sensors SET name = 'FLOW 1B' WHERE id = 11;

UPDATE sensor_types SET name = 'Flow Rate' WHERE id = 5;
