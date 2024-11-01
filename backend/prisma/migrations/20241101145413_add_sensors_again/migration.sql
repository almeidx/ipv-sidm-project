-- This is an empty migration.

INSERT INTO sensors (id, name, sensor_type_id, created_at)
VALUES (1,  'TEMPERATURE 1A', 1, CURRENT_TIMESTAMP),
       (2,  'TEMPERATURE 1B', 1, CURRENT_TIMESTAMP),
       (3,  'TEMPERATURE 2A', 1, CURRENT_TIMESTAMP),
       (4,  'HUMIDITY 1A',    2, CURRENT_TIMESTAMP),
       (5,  'HUMIDITY 1B',    2, CURRENT_TIMESTAMP),
       (6,  'PRESSURE 1A',    3, CURRENT_TIMESTAMP),
       (7,  'PRESSURE 1B',    3, CURRENT_TIMESTAMP),
       (8,  'MAGNOMETER 1A',  4, CURRENT_TIMESTAMP),
       (9,  'MAGNOMETER 1B',  4, CURRENT_TIMESTAMP),
       (10,  'LIGHT 1A',       5, CURRENT_TIMESTAMP),
       (11, 'LIGHT 1B',       5, CURRENT_TIMESTAMP);
