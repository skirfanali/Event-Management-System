# 🎓 Campus Event Management System

A production-quality **Next.js 15** frontend for a full-stack Campus Event Management platform.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | JavaScript (no TypeScript) |
| Styling | Tailwind CSS + Custom CSS Variables |
| UI Components | Custom UI + Radix UI primitives |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| HTTP Client | Axios |
| Notifications | react-hot-toast |
| QR Code | qrcode + html5-qrcode |
| PDF | jsPDF |
| Real-time | socket.io-client (ready) |
| Theming | next-themes (dark/light) |
| Backend (future) | Spring Boot + MySQL + JWT |

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Login, Register, Forgot Password, Verify
│   ├── events/             # Events listing, detail, create
│   ├── tickets/            # Ticket listing and detail
│   ├── dashboard/          # User dashboard (8 sub-pages)
│   ├── organizer/          # Organizer dashboard (7 sub-pages)
│   ├── admin/              # Admin panel (12 sub-pages)
│   ├── profile/            # User profile
│   ├── wishlist/           # Saved events
│   └── notifications/      # Notifications center
├── components/
│   ├── common/             # Navbar, Footer, SearchBar, etc.
│   ├── ui/                 # Button, Card, Modal, Input, Badge, etc.
│   ├── event/              # EventCard, EventBanner, ReviewCard, etc.
│   ├── ticket/             # TicketCard, QRGenerator, PDFDownload
│   ├── attendance/         # QRScanner, AttendanceTable, Stats
│   ├── charts/             # Revenue, Growth, Registration, Category, Attendance
│   ├── dashboard/          # Sidebar, StatsCard, ActivityCard
│   ├── organizer/          # OrganizerSidebar, AnalyticsCard, EventManager
│   └── admin/              # AdminSidebar, UserTable, EventTable, etc.
├── context/                # AuthContext, ThemeContext, EventContext, etc.
├── hooks/                  # useAuth, useEvents, useTickets, etc.
├── services/               # Spring Boot ready API services (Axios)
├── lib/                    # axios, endpoints, token, validators, helpers, etc.
├── data/                   # Mock data for development
└── styles/                 # globals.css (Tailwind + CSS variables)
```

---

## ⚡ Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_API_URL to point to your Spring Boot backend

# 3. Run development server
npm run dev

# 4. Open browser
# http://localhost:3000
```

---

## 🌐 Pages Overview

### Public
- `/` — Landing page (Hero, Categories, Featured Events, Features, Testimonials, FAQ, Newsletter)
- `/events` — Browse & filter all events
- `/events/[id]` — Event detail with registration
- `/login` — JWT-ready login
- `/register` — Role-based registration (User / Organizer)
- `/forgot-password` — Password reset flow
- `/verify-email` — Email verification

### User (Authenticated)
- `/dashboard` — Overview with stats and activity
- `/dashboard/my-events` — Registered events
- `/dashboard/certificates` — Downloadable certificates
- `/dashboard/attendance` — Attendance history
- `/dashboard/wishlist` — Saved events
- `/dashboard/notifications` — Notification center
- `/dashboard/reviews` — My reviews
- `/dashboard/settings` — Account settings
- `/profile` — Edit profile
- `/tickets` — All QR tickets
- `/tickets/[ticketId]` — Single ticket with QR + PDF download
- `/wishlist` — Public wishlist page
- `/notifications` — Full notifications page

### Organizer
- `/organizer` — Dashboard with analytics
- `/organizer/events` — Manage own events
- `/organizer/analytics` — Charts and insights
- `/organizer/attendees` — Attendee list
- `/organizer/tickets` — QR Scanner for check-in
- `/organizer/reviews` — Event reviews
- `/organizer/settings` — Settings

### Admin
- `/admin` — Full analytics dashboard
- `/admin/users` — Manage all users
- `/admin/events` — Manage all events
- `/admin/organizers` — Approve organizers
- `/admin/reviews` — Moderate reviews
- `/admin/categories` — Manage categories
- `/admin/coupons` — Discount coupons
- `/admin/payments` — Payment records
- `/admin/attendance` — Attendance tracking
- `/admin/notifications` — Broadcast notifications
- `/admin/reports` — Reports & exports
- `/admin/settings` — System settings

---

## 🔌 Spring Boot Integration

All services in `src/services/` are ready for Spring Boot:

```js
// src/lib/axios.js — auto-attaches JWT token
// src/lib/endpoints.js — all API endpoints defined
// src/services/authService.js — login, register, verify, refresh
// src/services/eventService.js — CRUD, register, reviews
// src/services/ticketService.js — list, download, QR
// src/services/paymentService.js — Razorpay + Stripe ready
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8080/api` in `.env.local`.

---

## 💳 Payment Integration

**Razorpay** and **Stripe** UI flows are ready in `src/context/PaymentContext.jsx`.  
Backend just needs to return `razorpayOrderId` / Stripe `clientSecret`.

---

## 🎨 Design System

- **Dark / Light mode** via CSS variables (`var(--bg-primary)`, `var(--text-primary)`, etc.)
- **Glassmorphism** via `.glass` utility class
- **Brand gradient** via `.gradient-bg` and `.gradient-text`
- **Framer Motion** animations on every card, modal, and page transition
- **Mobile-first** responsive layout throughout

---

## 📦 Build

```bash
npm run build
npm start
```

---

## 🙏 Credits

Built with ❤️ using Next.js 15, Tailwind CSS, Framer Motion, and Recharts.  
Backend integration ready for Spring Boot + MySQL + JWT.
