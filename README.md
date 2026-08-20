# Facility Booking UI

A minimal Node.js + HTML/CSS/JS UI on top of your `FacilityBookingDB` SQL Server database.

## Setup steps (in VS Code)

1. **Unzip / open this folder** in VS Code (`File > Open Folder`).

2. **Run your original `SQLproject.sql` script** in SSMS (or Azure Data Studio) to create the database and tables, if you haven't already.

3. **Run `sql/add_ons.sql`** in the same database — it adds a few procedures/views the UI needs (delete booking, my-bookings lookup, busy report, an `AddBooking` that returns a real status).

4. **Install dependencies.** Open the VS Code terminal (`` Ctrl+` ``) in this folder and run:
   ```
   npm install
   ```

5. **Configure your DB connection.** Copy `.env.example` to `.env`:
   ```
   copy .env.example .env
   ```
   Then edit `.env` with your real SQL Server username, password, and server name.

6. **Start the server:**
   ```
   npm start
   ```
   You should see:
   ```
   Connected to SQL Server
   Server running at http://localhost:3000
   ```

7. **Open the UI.** Go to `http://localhost:3000` in your browser.

## What's in the UI

- **Browse Facilities** — lists all facilities with building, floor, capacity, and Active/Inactive status.
- **Book a Slot** — pick a facility + date, see open time slots (and the longest free block), click a slot to book. Duplicate/inactive-facility bookings are rejected with a clear message.
- **My Bookings** — enter a Student ID to see and cancel their bookings.
- **Admin** — Busy/Not Busy report (facilities with more than 5 bookings).

## Project structure

```
facility-booking-ui/
  sql/add_ons.sql        <- extra SQL procedures/views (run once)
  server/
    db.js                <- SQL Server connection pool
    server.js             <- Express app entry point
    routes/
      students.js
      facilities.js
      bookings.js
      admin.js
  public/
    index.html
    css/style.css
    js/app.js
  package.json
  .env.example
```

## Next steps you could add

- Simple login (currently Student ID is typed in manually — fine for a class project, not for production)
- Admin CRUD screens for Facilities/Locations
- Form validation on the "Register Student" flow
