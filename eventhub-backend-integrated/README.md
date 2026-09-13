# 🎓 EventHub Backend — Spring Boot REST API

Campus Event Management System backend built with Spring Boot 3.x, Java 21, MySQL.

---

## 🚀 Quick Start

### Prerequisites
- Java 21
- MySQL 8.x
- Maven 3.9+

### 1. Configure Database
```sql
CREATE DATABASE eventhub;
```

### 2. Update `application.properties`
```properties
spring.datasource.username=root
spring.datasource.password=your_password
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
cloudinary.cloud-name=your-cloud-name
cloudinary.api-key=your-api-key
cloudinary.api-secret=your-api-secret
razorpay.key.id=rzp_test_...
razorpay.key.secret=...
```

### 3. Run
```bash
mvn spring-boot:run
```

### 4. Default Admin Credentials
```
Email:    admin@eventhub.com
Password: Admin@1234
```

### 5. Swagger UI
```
http://localhost:8080/swagger-ui.html
```

---

## 📁 Package Structure

```
com.eventhub/
├── config/          # Security, CORS, Swagger, Cloudinary, WebSocket, DataSeeder
├── controller/      # REST controllers (12 controllers)
├── dto/
│   ├── request/     # 12 request DTOs
│   └── response/    # 15 response DTOs
├── entity/          # 13 JPA entities
├── enums/           # 8 enums
├── exception/       # Global exception handler + custom exceptions
├── repository/      # 12 Spring Data JPA repositories
├── security/        # JWT filter, JwtUtil, UserDetailsService
├── service/         # 15 service interfaces
│   └── impl/        # 15 service implementations
└── util/            # QRCodeUtil, PdfUtil, EmailUtil, SecurityUtil, PageUtil
```

---

## 🔌 API Endpoints Summary

### Auth — `/api/auth`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login & get JWT |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Invalidate tokens |
| GET | `/me` | Current user info |
| POST | `/forgot-password` | Send reset email |
| POST | `/reset-password` | Reset with token |
| GET | `/verify-email` | Verify email token |

### Events — `/api/events`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | All events (paginated) |
| GET | `/search` | Search & filter |
| GET | `/featured` | Featured events |
| GET | `/trending` | Trending events |
| GET | `/{id}` | Event detail |
| POST | `/` | Create event (ORGANIZER) |
| PUT | `/{id}` | Update event |
| DELETE | `/{id}` | Delete event |
| POST | `/{id}/image` | Upload cover image |

### Registrations — `/api/registrations`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/events/{eventId}` | Register for event |
| DELETE | `/events/{eventId}` | Cancel registration |
| GET | `/my` | My registrations |
| GET | `/events/{eventId}` | Event registrations |
| GET | `/events/{eventId}/check` | Is registered? |

### Tickets — `/api/tickets`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/my` | My tickets |
| GET | `/{code}` | Ticket by code |
| GET | `/{code}/qr` | QR code (Base64) |
| GET | `/{code}/download` | Download PDF |

### Payments — `/api/payments`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/create-order/{registrationId}` | Create Razorpay order |
| POST | `/verify` | Verify payment |
| GET | `/my` | Payment history |

### Attendance — `/api/attendance`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/scan` | Scan QR & check-in |
| GET | `/events/{id}` | Event attendance |
| GET | `/events/{id}/stats` | Attendance stats |

### Admin — `/api/admin` *(ADMIN only)*
All user, event, review, coupon, payment, notification, certificate management.

### Organizer — `/api/organizer` *(ORGANIZER/ADMIN)*
Dashboard, event management, attendance, certificates.

---

## 🔐 Security

- **JWT** — Access token (24h) + Refresh token (7d)
- **BCrypt** password hashing
- **Role-based access** — USER, ORGANIZER, ADMIN
- **Method-level security** — `@PreAuthorize`

---

## 📡 WebSocket

Real-time notifications via STOMP over SockJS:
```
ws://localhost:8080/ws
Subscribe: /user/{userId}/queue/notifications
Broadcast: /topic/notifications
```

---

## 🗄️ Database Tables

`users`, `categories`, `events`, `registrations`, `tickets`,
`reviews`, `attendance`, `payments`, `notifications`,
`coupons`, `certificates`, `wishlist`

---

## 🌐 Frontend Integration

Configure in `application.properties`:
```properties
app.frontend.url=http://localhost:3000
```

All APIs return:
```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00"
}
```
