-- =========================================================
-- Facility Booking System
-- MySQL Schema + Seed Data
-- =========================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS Facility_Location;
DROP TABLE IF EXISTS Booking;
DROP TABLE IF EXISTS Time_Slot;
DROP TABLE IF EXISTS Facilities;
DROP TABLE IF EXISTS Locations;
DROP TABLE IF EXISTS Students;

SET FOREIGN_KEY_CHECKS = 1;


-- =========================================================
-- SECTION 1: TABLES
-- =========================================================

CREATE TABLE Students (
    StudentID INT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) DEFAULT 'password123'
);


CREATE TABLE Facilities (
    FacilityID INT PRIMARY KEY,
    FacilityName VARCHAR(100) NOT NULL,
    PhotoPath VARCHAR(255)
);


CREATE TABLE Locations (
    LocationID INT PRIMARY KEY,
    BuildingName VARCHAR(100) NOT NULL,
    Floor VARCHAR(10),
    Description VARCHAR(255)
);


CREATE TABLE Time_Slot (
    TimeSlotID INT PRIMARY KEY,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,

    CONSTRAINT chk_Time
        CHECK (StartTime < EndTime)
);


CREATE TABLE Booking (
    BookingID INT PRIMARY KEY,
    BookingDate DATE NOT NULL,
    FacilityID INT,
    StudentID INT,
    TimeSlotID INT,

    CONSTRAINT FK_Booking_Student
        FOREIGN KEY (StudentID)
        REFERENCES Students (StudentID),

    CONSTRAINT FK_Booking_Facility
        FOREIGN KEY (FacilityID)
        REFERENCES Facilities (FacilityID),

    CONSTRAINT FK_Booking_TimeSlot
        FOREIGN KEY (TimeSlotID)
        REFERENCES Time_Slot (TimeSlotID)
);


CREATE TABLE Facility_Location (
    FacilityID INT,
    LocationID INT,
    Capacity INT CHECK (Capacity > 0),
    Status VARCHAR(20),

    PRIMARY KEY (FacilityID, LocationID),

    CONSTRAINT FK_FacilityLocation_Facility
        FOREIGN KEY (FacilityID)
        REFERENCES Facilities (FacilityID),

    CONSTRAINT FK_FacilityLocation_Location
        FOREIGN KEY (LocationID)
        REFERENCES Locations (LocationID)
);


-- =========================================================
-- SECTION 2: SEED DATA
-- =========================================================


-- Students

INSERT INTO Students (StudentID, Name, Email)
VALUES
(1, 'Ali Ahmed', 'ali@email.com'),
(2, 'Sara Khan', 'sara@email.com'),
(3, 'Omar Ali', 'omar@email.com'),
(4, 'Noor Hassan', 'noor@email.com'),
(5, 'Mona Saleh', 'mona@email.com'),
(6, 'Yousef Nasser', 'yousef@email.com'),
(7, 'Laila Saeed', 'laila@email.com'),
(8, 'Khalid Mohammed', 'khalid@email.com'),
(9, 'Huda Ali', 'huda@email.com'),
(10, 'Zainab Omar', 'zainab@email.com'),
(11, 'Ahmed Saleh', 'ahmed@email.com'),
(12, 'Rania Fawzi', 'rania@email.com'),
(13, 'Salim Said', 'salim@email.com'),
(14, 'Fatma Nasser', 'fatma@email.com'),
(15, 'Majid Ali', 'majid@email.com'),
(16, 'Reem Hassan', 'reem@email.com'),
(17, 'Fahad Khalid', 'fahad@email.com'),
(18, 'Aisha Omar', 'aisha@email.com'),
(19, 'Saud Ahmed', 'saud@email.com'),
(20, 'Dana Mohammed', 'dana@email.com');


-- Facilities

INSERT INTO Facilities (FacilityID, FacilityName)
VALUES
(1, 'Computer Lab A'),
(2, 'Computer Lab B'),
(3, 'Library Main'),
(4, 'Library Quiet'),
(5, 'Basketball Court 1'),
(6, 'Basketball Court 2'),
(7, 'Swimming Pool'),
(8, 'Gym A'),
(9, 'Gym B'),
(10, 'Lecture Hall 1'),
(11, 'Lecture Hall 2'),
(12, 'Study Room A'),
(13, 'Study Room B'),
(14, 'Auditorium'),
(15, 'Conference Room'),
(16, 'Science Lab'),
(17, 'Engineering Lab'),
(18, 'Music Room'),
(19, 'Art Studio'),
(20, 'Outdoor Field');


-- Locations

INSERT INTO Locations
    (LocationID, BuildingName, Floor, Description)
VALUES
(1, 'Main Block', '1', 'Floor 1'),
(2, 'Main Block', '2', 'Floor 2'),
(3, 'Main Block', '3', 'Floor 3'),
(4, 'Library Wing', '1', 'Silent area'),
(5, 'Sports Complex', '0', 'Outdoor'),
(6, 'Sports Complex', '1', 'Indoor'),
(7, 'Engineering Block', '2', 'Labs'),
(8, 'Engineering Block', '3', 'Workshops'),
(9, 'Science Block', '1', 'Physics labs'),
(10, 'Science Block', '2', 'Chemistry labs'),
(11, 'Arts Block', '1', 'Studios'),
(12, 'Arts Block', '2', 'Music rooms'),
(13, 'Admin Block', '1', 'Offices'),
(14, 'Admin Block', '2', 'Meeting rooms'),
(15, 'Tech Block', '1', 'Computer labs'),
(16, 'Tech Block', '2', 'Servers'),
(17, 'Hall Block', '1', 'Lecture halls'),
(18, 'Hall Block', '2', 'Auditorium'),
(19, 'Outdoor Area', '0', 'Fields'),
(20, 'Outdoor Area', '0', 'Courts');


-- Time Slots
-- Oracle TO_DATE('08:00','HH24:MI')
-- becomes MySQL TIME '08:00:00'

INSERT INTO Time_Slot
    (TimeSlotID, StartTime, EndTime)
VALUES
(1, '08:00:00', '09:00:00'),
(2, '09:00:00', '10:00:00'),
(3, '10:00:00', '11:00:00'),
(4, '11:00:00', '12:00:00'),
(5, '12:00:00', '13:00:00'),
(6, '13:00:00', '14:00:00'),
(7, '14:00:00', '15:00:00'),
(8, '15:00:00', '16:00:00'),
(9, '16:00:00', '17:00:00'),
(10, '17:00:00', '18:00:00');


-- Bookings

INSERT INTO Booking
    (BookingID, BookingDate, FacilityID, StudentID, TimeSlotID)
VALUES
(1, '2026-05-01', 1, 1, 1),
(2, '2026-05-01', 1, 2, 2),
(3, '2026-05-01', 1, 3, 3),
(4, '2026-05-01', 1, 4, 4),
(5, '2026-05-01', 2, 5, 1),
(6, '2026-05-01', 2, 6, 2),
(7, '2026-05-01', 2, 7, 3),
(8, '2026-05-01', 3, 8, 4),
(9, '2026-05-01', 3, 9, 5),
(10, '2026-05-02', 1, 10, 6),
(11, '2026-05-02', 1, 11, 7),
(12, '2026-05-02', 2, 12, 8),
(13, '2026-05-02', 3, 13, 9),
(14, '2026-05-02', 3, 14, 10),
(15, '2026-05-02', 4, 15, 1),
(16, '2026-05-02', 4, 16, 2),
(17, '2026-05-03', 5, 17, 3),
(18, '2026-05-03', 5, 18, 4),
(19, '2026-05-03', 6, 19, 5),
(20, '2026-05-03', 6, 20, 6),
(21, '2026-05-04', 1, 1, 1),
(22, '2026-05-04', 1, 2, 2),
(23, '2026-05-04', 1, 3, 3);


-- Facility Locations

INSERT INTO Facility_Location
    (FacilityID, LocationID, Capacity, Status)
VALUES
(1, 1, 100, 'Active'),
(2, 2, 80, 'Active'),
(3, 3, 60, 'Active'),
(4, 4, 70, 'Active'),
(5, 5, 200, 'Active'),
(6, 6, 150, 'Inactive'),
(7, 7, 90, 'Active'),
(8, 8, 120, 'Active'),
(9, 9, 110, 'Inactive'),
(10, 10, 300, 'Active'),
(11, 11, 250, 'Active'),
(12, 12, 40, 'Active'),
(13, 13, 35, 'Inactive'),
(14, 14, 500, 'Active'),
(15, 15, 60, 'Active'),
(16, 16, 70, 'Active'),
(17, 17, 80, 'Active'),
(18, 18, 200, 'Active'),
(19, 19, 400, 'Inactive'),
(20, 20, 500, 'Active');