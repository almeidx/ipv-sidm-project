-- This is an empty migration.

INSERT INTO sensor_types (id, name, unit)
VALUES (1, 'Temperature', '°C'),
       (2, 'Humidity', '%'),
       (3, 'Pressure', 'bar'),
       (4, 'Magnometer', 'µT'),
       (5, 'Flow Rate', 'cm3/s');

INSERT INTO sensors (id, name, sensor_type_id, created_at, max_threshold, min_threshold)
VALUES (1,  'TEMPERATURE 1A', 1, CURRENT_TIMESTAMP, 438, 82),
			 (2,  'TEMPERATURE 1B', 1, CURRENT_TIMESTAMP, 434, 72),
			 (3,  'TEMPERATURE 2A', 1, CURRENT_TIMESTAMP, 427, 62),
			 (4,  'HUMIDITY 1A',    2, CURRENT_TIMESTAMP, 0.95, 0.09),
			 (5,  'HUMIDITY 1B',    2, CURRENT_TIMESTAMP, 0.73, 0.09),
			 (6,  'PRESSURE 1A',    3, CURRENT_TIMESTAMP, 5.6, 0.9),
			 (7,  'PRESSURE 1B',    3, CURRENT_TIMESTAMP, 5.5, 0.7),
			 (8,  'MAGNOMETER 1A',  4, CURRENT_TIMESTAMP, 89.22, 15.02),
			 (9,  'MAGNOMETER 1B',  4, CURRENT_TIMESTAMP, 87.72, 10.84),
			 (10, 'FLOW 1A',        5, CURRENT_TIMESTAMP, 535.32, 90.12),
			 (11, 'FLOW 1B',        5, CURRENT_TIMESTAMP, 526.32, 65.04);
