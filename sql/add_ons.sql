-------------------------------------------------------------------------------------------
-- 1) AddBooking
-------------------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE AddBooking (
    p_BookingID   IN  Booking.BookingID%TYPE,
    p_BookingDate IN  Booking.BookingDate%TYPE,
    p_FacilityID  IN  Booking.FacilityID%TYPE,
    p_StudentID   IN  Booking.StudentID%TYPE,
    p_TimeSlotID  IN  Booking.TimeSlotID%TYPE,
    p_Result      OUT VARCHAR2
) AS
    v_count NUMBER;
BEGIN
    -- Block inactive facilities
    SELECT COUNT(*) INTO v_count
    FROM Facility_Location
    WHERE FacilityID = p_FacilityID AND Status = 'Inactive';

    IF v_count > 0 THEN
        p_Result := 'Error: Cannot book an inactive facility.';
        RETURN;
    END IF;

    -- Block duplicate booking
    SELECT COUNT(*) INTO v_count
    FROM Booking
    WHERE FacilityID = p_FacilityID
      AND BookingDate = p_BookingDate
      AND TimeSlotID = p_TimeSlotID;

    IF v_count > 0 THEN
        p_Result := 'Error: This time slot is already booked for this facility.';
        RETURN;
    END IF;

    INSERT INTO Booking (BookingID, BookingDate, FacilityID, StudentID, TimeSlotID)
    VALUES (p_BookingID, p_BookingDate, p_FacilityID, p_StudentID, p_TimeSlotID);

    p_Result := 'Booking added successfully.';
END AddBooking;
/

-------------------------------------------------------------------------------------------
-- 2) DeleteBooking
-------------------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE DeleteBooking (
    p_BookingID IN  Booking.BookingID%TYPE,
    p_Result    OUT VARCHAR2
) AS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM Booking WHERE BookingID = p_BookingID;

    IF v_count = 0 THEN
        p_Result := 'Error: Booking not found.';
        RETURN;
    END IF;

    DELETE FROM Booking WHERE BookingID = p_BookingID;
    p_Result := 'Booking cancelled successfully.';
END DeleteBooking;
/

-------------------------------------------------------------------------------------------
-- 3) GetBookingsByStudent
-------------------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE GetBookingsByStudent (
    p_StudentID IN  Booking.StudentID%TYPE,
    p_Cursor    OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_Cursor FOR
        SELECT
            b.BookingID,
            b.BookingDate,
            f.FacilityName,
            ts.StartTime,
            ts.EndTime
        FROM Booking b
        JOIN Facilities f  ON b.FacilityID  = f.FacilityID
        JOIN Time_Slot ts  ON b.TimeSlotID  = ts.TimeSlotID
        WHERE b.StudentID = p_StudentID
        ORDER BY b.BookingDate, ts.StartTime;
END GetBookingsByStudent;
/

-------------------------------------------------------------------------------------------
-- 4) GetBusyReport
-------------------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE GetBusyReport (
    p_Cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_Cursor FOR
        SELECT
            f.FacilityID,
            f.FacilityName,
            COUNT(b.BookingID) AS BookingCount,
            CASE WHEN COUNT(b.BookingID) > 5 THEN 'Busy' ELSE 'Not Busy' END AS Status
        FROM Facilities f
        LEFT JOIN Booking b ON f.FacilityID = b.FacilityID
        GROUP BY f.FacilityID, f.FacilityName
        ORDER BY f.FacilityID;
END GetBusyReport;
/

-------------------------------------------------------------------------------------------
-- 5) Facility_Full_View
-------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW Facility_Full_View AS
SELECT
    f.FacilityID,
    f.FacilityName,
    l.BuildingName,
    l.Floor,
    fl.Capacity,
    fl.Status
FROM Facilities f
JOIN Facility_Location fl ON f.FacilityID = fl.FacilityID
JOIN Locations l          ON fl.LocationID = l.LocationID;
/
