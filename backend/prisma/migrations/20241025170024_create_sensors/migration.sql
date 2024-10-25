INSERT INTO sensor_types (id, name)
VALUES (1, 'Temperature'),
       (2, 'Humidity'),
       (3, 'Pressure'),
       (4, 'Magnometer'),
       (5, 'Light');

INSERT INTO sensors (id, name, sensor_type_id, created_at)
VALUES ('236f02b0-ac71-4b22-b11d-94003fe3d8f5', 'TEMPERATURE 1A', 1, NOW()),
       ('19b0e0ab-264f-4b77-8064-6cd68623c08b', 'TEMPERATURE 1B', 1, NOW()),
       ('0b5c83fe-4b5b-48bb-b1a8-6e14c3f1b626', 'TEMPERATURE 2A', 1, NOW()),
       ('492167c2-619c-439e-b036-bd06c4716909', 'HUMIDITY 1A',    2, NOW()),
       ('5cec1bb9-2dd3-4a6b-9663-660b9637317b', 'HUMIDITY 1B',    2, NOW()),
       ('6bdd123c-f94b-49fc-b525-507213b4e71c', 'PRESSURE 1A',    3, NOW()),
       ('d61ab837-31df-485b-9564-4dfa87793b75', 'PRESSURE 1B',    3, NOW()),
       ('0133ad16-5188-458e-a9d5-db7182cba3d0', 'MAGNOMETER 1A',  4, NOW()),
       ('25f1537c-1284-4ec3-8faa-23ffd95d5695', 'MAGNOMETER 1B',  4, NOW()),
       ('58ccc52f-7deb-46be-a32f-7b9e33530ebc', 'LIGHT 1A',       5, NOW()),
       ('373717f3-62e3-488f-a61d-b45695b84243', 'LIGHT 1B',       5, NOW());
