BEGIN TRANSACTION;

DELETE FROM aircraft;

INSERT INTO aircraft (
    tail_num,
    model,
    capacity,
    max_speed,
    current_airport_id,
    flight_hours,
    hours_since_maint,
    status
) VALUES
('B737-600-1000', 'Boeing 737-600', 130, 850, 4, 0, 0, 'Available'),
('B737-600-1001', 'Boeing 737-600', 130, 850, 4, 0, 0, 'Available'),
('B737-600-1002', 'Boeing 737-600', 130, 850, 4, 0, 0, 'Available'),
('B737-600-1003', 'Boeing 737-600', 130, 850, 4, 0, 0, 'Available'),
('B737-600-1004', 'Boeing 737-600', 130, 850, 4, 0, 0, 'Available'),
('B737-600-1005', 'Boeing 737-600', 130, 850, 4, 0, 0, 'Available'),
('B737-600-1006', 'Boeing 737-600', 130, 850, 4, 0, 0, 'Available'),
('A220-100-1025', 'Airbus A220-100', 135, 829, 4, 0, 0, 'Available'),
('A220-100-1026', 'Airbus A220-100', 135, 829, 4, 0, 0, 'Available'),
('A220-300-1040', 'Airbus A220-300', 130, 871, 4, 0, 0, 'Available'),

('B737-800-1007', 'Boeing 737-800', 189, 876, 5, 0, 0, 'Available'),
('B737-800-1008', 'Boeing 737-800', 189, 876, 5, 0, 0, 'Available'),
('B737-800-1009', 'Boeing 737-800', 189, 876, 5, 0, 0, 'Available'),
('B737-800-1010', 'Boeing 737-800', 189, 876, 5, 0, 0, 'Available'),
('B737-800-1011', 'Boeing 737-800', 189, 876, 5, 0, 0, 'Available'),
('B737-800-1012', 'Boeing 737-800', 189, 876, 5, 0, 0, 'Available'),
('B737-800-1013', 'Boeing 737-800', 189, 876, 5, 0, 0, 'Available'),
('A220-300-1039', 'Airbus A220-300', 130, 871, 5, 0, 0, 'Available'),

('B737-600-1014', 'Boeing 737-600', 130, 850, 1, 0, 0, 'Available'),
('A220-100-1027', 'Airbus A220-100', 135, 829, 1, 0, 0, 'Available'),
('A220-300-1041', 'Airbus A220-300', 130, 871, 1, 0, 0, 'Available'),

('B737-600-1015', 'Boeing 737-600', 130, 850, 12, 0, 0, 'Available'),
('A220-100-1034', 'Airbus A220-100', 135, 829, 12, 0, 0, 'Available'),
('A220-300-1046', 'Airbus A220-300', 130, 871, 12, 0, 0, 'Available'),

('B737-600-1016', 'Boeing 737-600', 130, 850, 13, 0, 0, 'Available'),
('A220-100-1033', 'Airbus A220-100', 135, 829, 13, 0, 0, 'Available'),
('A220-300-1044', 'Airbus A220-300', 130, 871, 13, 0, 0, 'Available'),

('B737-800-1017', 'Boeing 737-800', 189, 876, 14, 0, 0, 'Available'),
('A220-100-1028', 'Airbus A220-100', 135, 829, 14, 0, 0, 'Available'),
('A220-300-1042', 'Airbus A220-300', 130, 871, 14, 0, 0, 'Available'),

('B737-800-1018', 'Boeing 737-800', 189, 876, 10, 0, 0, 'Available'),
('A220-100-1032', 'Airbus A220-100', 135, 829, 10, 0, 0, 'Available'),
('A220-300-1043', 'Airbus A220-300', 130, 871, 10, 0, 0, 'Available'),

('B737-800-1019', 'Boeing 737-800', 189, 876, 11, 0, 0, 'Available'),
('A220-100-1031', 'Airbus A220-100', 135, 829, 11, 0, 0, 'Available'),
('A220-300-1045', 'Airbus A220-300', 130, 871, 11, 0, 0, 'Available'),

('B737-800-1020', 'Boeing 737-800', 189, 876, 3, 0, 0, 'Available'),
('A220-300-1047', 'Airbus A220-300', 130, 871, 3, 0, 0, 'Available'),

('B737-800-1021', 'Boeing 737-800', 189, 876, 8, 0, 0, 'Available'),
('A220-300-1048', 'Airbus A220-300', 130, 871, 8, 0, 0, 'Available'),

('B737-800-1022', 'Boeing 737-800', 189, 876, 27, 0, 0, 'Available'),
('A220-300-1049', 'Airbus A220-300', 130, 871, 27, 0, 0, 'Available'),

('B737-800-1023', 'Boeing 737-800', 189, 876, 23, 0, 0, 'Available'),
('B737-800-1024', 'Boeing 737-800', 189, 876, 17, 0, 0, 'Available'),

('A220-100-1029', 'Airbus A220-100', 135, 829, 19, 0, 0, 'Available'),
('A220-100-1030', 'Airbus A220-100', 135, 829, 15, 0, 0, 'Available'),
('A220-100-1035', 'Airbus A220-100', 135, 829, 16, 0, 0, 'Available'),
('A220-100-1036', 'Airbus A220-100', 135, 829, 21, 0, 0, 'Available'),

('A220-300-1037', 'Airbus A220-300', 130, 871, 2, 0, 0, 'Available'),
('A220-300-1038', 'Airbus A220-300', 130, 871, 6, 0, 0, 'Available'),

('A350-1000-1050', 'Airbus A350-1000', 350, 950, 6, 0, 0, 'Available');

COMMIT;