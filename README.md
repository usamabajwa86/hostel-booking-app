# UAF Hostel Booking Portal (Improved Multi-Page Version)

A multi-page student hostel booking system for the University of Agriculture, Faisalabad (UAF). Manages **17 hostels** (10 female, 7 male) with **5,600+ bed capacity**.

## Tech Stack

- **Frontend:** React 19 + React Router v7 + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts (admin reports)
- **Backend:** Express.js + JSON file storage

## Setup

```bash
# Install dependencies
npm install

# Start backend server (port 5000)
npm run server

# Start frontend dev server (port 5173)
npm run dev
```

Open http://localhost:5173 in your browser.

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hostels.edu | admin123 |
| Student (Female) | fatima@uaf.edu | pass123 |
| Student (Male) | ahmed@uaf.edu | pass123 |

All 10 seed students use password: `pass123`

## Pages (14 Routes)

### Public (5)
- `/` — Homepage
- `/hostels` — Hostel Directory with filters
- `/hostels/:id` — Hostel Detail with bed grid
- `/procedure` — Booking Procedure
- `/contact` — Contact Us

### Auth (2)
- `/login` — Login
- `/register` — Register

### Student (3)
- `/dashboard` — Student Dashboard with eligible hostels
- `/dashboard/book/:hostelId` — Bed selection & booking
- `/dashboard/bookings` — My Bookings

### Admin (5)
- `/admin` — Admin Dashboard with stats & charts
- `/admin/requests` — Manage booking requests
- `/admin/hostels` — Hostel bed visualization
- `/admin/students` — Student registry
- `/admin/reports` — Reports & charts

## Features

- Gender-based hostel filtering (female students only see female hostels)
- Program-based room filtering (UG/PG/Scholar)
- Real-time bed status: Vacant (green), Pending (yellow), Booked (red)
- ID card image upload (drag-drop, PNG/JPG, max 5MB)
- Admin approve/reject with ID card review
- CSV export of booking requests
- Recharts-powered reports (occupancy, gender, program distribution)
- Toast notifications
- Mobile responsive
