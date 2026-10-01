# EventForce – Centralized Event Management System

> **A Full-Stack Enterprise Web Application for Academic and Naan Mudhalvan Project Submission**
>
> **Developed by**: **AI Warriors**

EventForce is a professional, stable, and responsive web platform engineered to replace manual event-handling workflows with an integrated digital management system. Built with the **MERN** technology stack (MongoDB, Express.js, React, Node.js), it empowers event management organizations to coordinate client celebrations, manage venue capacity reservations without double-booking, schedule multi-supplier vendor services, handle cancellation workflows, and aggregate dynamic dashboard analytics.

---

## Table of Contents
1. [Key Features](#key-features)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [User Roles & Permissions](#user-roles--permissions)
5. [Database Schema & Collections](#database-schema--collections)
6. [Business Logic & Validation Rules](#business-logic--validation-rules)
7. [Installation & Setup Guide](#installation--setup-guide)
8. [Demo Credentials](#demo-credentials)
9. [API Overview](#api-overview)
10. [Academic Presentation Flow](#academic-presentation-flow)

---

## Key Features

- **Dynamic Analytics Dashboard**: Live metrics for total events, clients, vendors, venues, cumulative budget, and average client score using **Recharts** (Monthly schedules, Event types, Status breakdown, Vendor availability, and Rating distribution).
- **Backend Venue Double-Booking Prevention**: Mathematical time-overlap checking (`startTime < existingEndTime && endTime > existingStartTime`) on the same venue and calendar day. Rejects conflicting bookings at the API layer.
- **Venue Availability Synchronization**: Automatically switches venue state to `Reserved` when events are confirmed, and releases back to `Available` upon event completion or cancellation.
- **Vendor Assignment Junction**: Prevents duplicate vendor assignments via compound MongoDB unique indices (`{ event: 1, vendor: 1 }`).
- **Cancellation Review Workflow**: Event coordinators/staff submit structured cancellation requests; administrators review and formally approve or reject with comments. Approval automatically releases reserved venues.
- **Client Feedback & Rating System**: Post-event evaluation mechanism with a 5-star interactive rating UI and testimonial comments.
- **Multi-Category Reports with CSV Export**: Filter, search, and export upcoming events, status breakdowns, category distributions, vendor allocations, client feedback, and budget summaries.
- **Role-Based Access Control (RBAC)**: Distinct permissions for **Admin**, **Event Coordinator**, and **Staff**.

---

## Technology Stack

### Frontend
- **Framework**: React.js (v18) initialized with **Vite**
- **Styling**: Tailwind CSS with custom theme extensions
- **Routing**: React Router DOM (v6) with protected layout routes
- **HTTP Client**: Axios with JWT request interceptors & automatic error extraction
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Area, Bar, and Pie Charts)

### Backend
- **Runtime Environment**: Node.js
- **Web Framework**: Express.js (v4)
- **Database**: MongoDB with Mongoose ODM (v8)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs password hashing
- **Environment Management**: dotenv
- **HTTP Logger**: Morgan & CORS enabled

---

## System Architecture

```
Event Force Management/
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI (Modals, Badges, Spinners, Toasts)
│   │   ├── layouts/            # DashboardLayout (Sidebar, Topbar)
│   │   ├── pages/              # Dashboard, Events, Clients, Venues, Vendors, Reports, Users
│   │   ├── services/           # Axios API Client instance
│   │   ├── hooks/              # useAuth Context & useToast
│   │   ├── App.jsx             # Main Router & Providers
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── config/                 # MongoDB connection logic (db.js)
│   ├── controllers/            # Route controllers for all 8 collections
│   ├── models/                 # Mongoose Schemas (User, Client, Venue, Vendor, Event, etc.)
│   ├── routes/                 # REST Express routes with auth/role middleware
│   ├── middleware/             # authMiddleware, roleMiddleware, errorMiddleware
│   ├── utils/                  # Seed script & test verification suites
│   ├── server.js               # Main Express listener
│   └── package.json
│
├── README.md
└── DOCUMENTATION.md
```

---

## User Roles & Permissions

| Role | Dashboard | View Data | Schedule Events | Manage Clients & Venues | Assign Vendors | Review Cancellations | User Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Event Coordinator** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Staff** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ (Submit only) | ❌ |

---

## Database Schema & Collections

1. **User**: `name`, `email` (unique), `password` (hashed with bcrypt), `role` (`admin` | `coordinator` | `staff`).
2. **Client**: `name`, `email` (unique), `phone`, `address`, `city`.
3. **Venue**: `name`, `location`, `address`, `capacity` (> 0), `availabilityStatus` (`Available` | `Reserved` | `Unavailable`).
4. **Vendor**: `name`, `email`, `phone`, `serviceType` (Catering, Decoration, Photography, etc.), `status` (`Available` | `Booked` | `Cancelled`).
5. **Event**: `eventName`, `eventType` (Wedding, Corporate, Birthday, etc.), `eventDate`, `startTime`, `endTime`, `status` (`Planned`, `Confirmed`, `Completed`, `Pending Cancellation`, `Cancelled`, `Rejected`), `client` (Ref: Client), `venue` (Ref: Venue), `budget` (>= 0), `description`, `createdBy`.
6. **EventVendor**: `event` (Ref: Event), `vendor` (Ref: Vendor), `assignedDate`, `status` (`Assigned` | `Completed` | `Cancelled`). *Unique Compound Index: `{ event: 1, vendor: 1 }`*.
7. **Feedback**: `event` (Ref: Event), `client` (Ref: Client), `rating` (1–5), `comments`.
8. **CancellationRequest**: `event` (Ref: Event), `requestedBy` (Ref: User), `reason`, `status` (`Pending` | `Approved` | `Rejected`), `reviewedBy`, `reviewComment`.

---

## Business Logic & Validation Rules

### 1. Venue Double-Booking Check (Backend Rule 19)
Prior to saving any new or updated event, the backend checks for overlapping active events:
```javascript
// Time overlap condition:
// newEvent.startTime < existingEvent.endTime && newEvent.endTime > existingEvent.startTime
```
If an overlap exists on the same venue and calendar day for any non-cancelled event, the backend aborts the operation with HTTP 400: `"Venue is already booked for the selected date and time."`

### 2. Duplicate Vendor Assignment Prevention
The MongoDB compound unique index `{ event: 1, vendor: 1 }` guarantees that no single vendor can be assigned twice to the same celebration.

---

## Installation & Setup Guide

### Prerequisites
- Node.js (v18+ or v20+)
- MongoDB Community Server running locally on `mongodb://127.0.0.1:27017`

### Step 1: Clone or Navigate to the Project
```bash
cd "Event Force Management"
```

### Step 2: Backend Setup
```bash
cd backend
npm install
node utils/seed.js    # Seeds demo users, clients, venues, vendors, events & feedback
node server.js        # Starts API server on http://localhost:5000
```

### Step 3: Frontend Setup (in a separate terminal)
```bash
cd ../frontend
npm install
npm run dev           # Starts Vite dev server on http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser.

---

## Demo Credentials

All test accounts come pre-configured with password: `Admin@123`

| User Role | Email Address | Password |
| :--- | :--- | :--- |
| **System Administrator** | `admin@eventforce.com` | `Admin@123` |
| **Event Coordinator** | `coordinator@eventforce.com` | `Admin@123` |
| **Operations Staff** | `staff@eventforce.com` | `Admin@123` |

> *Tip: The login page includes 1-click **Quick Demo Fill** buttons for immediate sign-in during project evaluations.*

---

## API Overview

### Authentication
- `POST /api/auth/login` – Authenticate user and receive JWT.
- `POST /api/auth/register` – Create user account (Admin only).
- `GET /api/auth/me` – Retrieve authenticated session profile.
- `GET /api/auth/users` – List all system accounts (Admin only).

### Clients
- `GET /api/clients` – Search and list clients.
- `POST /api/clients` – Register new client.
- `GET /api/clients/:id` – View client details and booking history.
- `PUT /api/clients/:id` – Update client profile.
- `DELETE /api/clients/:id` – Delete client record.

### Venues
- `GET /api/venues` – Filter and list venues.
- `POST /api/venues` – Register venue with seating capacity.
- `GET /api/venues/:id` – Venue schedule and reservations.
- `PUT /api/venues/:id` – Update venue info.
- `DELETE /api/venues/:id` – Remove venue record.

### Vendors
- `GET /api/vendors` – List vendors filtered by category/status.
- `POST /api/vendors` – Register vendor agency.
- `GET /api/vendors/:id` – View vendor assignments.

### Events & Operations
- `GET /api/events` – Multi-filter events list.
- `POST /api/events` – Schedule event with double-booking check.
- `GET /api/events/:id` – Event details, vendor suppliers, feedback, timeline.
- `PUT /api/events/:id` – Update event schedule or status.
- `DELETE /api/events/:id` – Delete event.
- `POST /api/event-vendors` – Assign vendor to celebration.
- `POST /api/cancellations` – Submit cancellation request.
- `PUT /api/cancellations/:id/approve` – Approve cancellation & release venue.
- `PUT /api/cancellations/:id/reject` – Reject cancellation request.
- `POST /api/feedback` – Record 1–5 star rating for completed event.
- `GET /api/dashboard/stats` – Dynamic aggregated analytics for charts & KPI cards.

---

## Academic Presentation Flow

During your project viva or Naan Mudhalvan presentation, follow this 5-minute flow:
1. **Login & Role Switcher**: Demonstrate the login screen, explaining JWT authentication and 1-click demo login buttons.
2. **Dashboard Analytics**: Show live KPI cards (Budgets, Events, Venues) and Recharts dynamic data visualization.
3. **Double-Booking Demonstration**: Try creating an event on the same venue, date, and overlapping time to show backend conflict rejection.
4. **Vendor Assignment**: Open an event, assign a new catering/photo supplier, and show duplicate prevention.
5. **Cancellation Workflow**: Submit a cancellation request, approve it with reviewer remarks, and show that the venue availability status automatically resets to `Available`.
6. **Reports & CSV Export**: Show the Reports page and download a live CSV file.
