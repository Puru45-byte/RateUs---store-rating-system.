<div align="center">

# 🌟 TrustRate
### *A Full-Stack Store Rating & Review Platform*

[![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

> A modern, production-ready platform where users discover and rate stores, store owners track their reputation, and administrators manage the entire ecosystem — all behind a clean role-based access control system.

</div>

---

## 📸 Screenshots

> **Note for Reviewer:** Run the project locally or use the test credentials below to explore the live experience.

| Role | Dashboard Preview |
|------|------------------|
| 🧑 **User** | Browse stores, submit & edit ratings, manage profile |
| 🏪 **Store Owner** | View all customer reviews and average rating for their store |
| 🛡️ **Admin** | Full control — manage all users, stores, and platform data |

---

## ✨ Key Features

### 🔐 Authentication & Security
- JWT-based authentication with secure token storage
- bcrypt password hashing (10 salt rounds)
- Role-based access control: `USER` · `STORE_OWNER` · `ADMIN`
- Route guards on both frontend (React) and backend (NestJS)
- Automatic redirect to `/login` on token expiry (401 interceptor)

### 👤 User Features
- Register with name, email, address, and password (min 8 chars, 1 uppercase, 1 number, 1 special char)
- Browse all registered stores
- Submit a star rating (1–5) with optional comment per store
- Edit or update existing ratings (one rating per store, editable)
- View personal rating history
- Update profile & change password

### 🏪 Store Owner Features
- Dedicated dashboard showing all customer reviews
- See overall average rating for their store
- View individual customer feedback with timestamps

### 🛡️ Admin Features
- Dashboard with platform-wide statistics (total users, stores, ratings)
- View, search, and manage all users
- View, search, and manage all stores
- Register new store owners with store details in one step

### 🏗️ Technical Highlights
- **Monorepo** structure (frontend + backend in one repo)
- **Global validation pipe** with class-validator DTOs
- **Global exception filter** for consistent error responses
- **Swagger API documentation** at `/api/docs`
- **Prisma ORM** with PostgreSQL (Supabase cloud)
- **Connection pooling** via PgBouncer adapter
- **CORS** configured for production and local development

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, React Router v7, Axios, Tailwind CSS, Lucide Icons |
| **Backend** | NestJS 11, TypeScript, Passport.js, JWT, bcrypt, Swagger |
| **Database** | PostgreSQL via Supabase (cloud) |
| **ORM** | Prisma 7 with PgBouncer adapter |
| **Deployment** | Vercel (frontend) · Railway (backend) · Supabase (DB) |

---

## 🗄️ Database Schema

```
User ──────────────── Rating ─────────────── Store
 │                      │                      │
 │ id (uuid)            │ id (uuid)             │ id (uuid)
 │ name                 │ value (1-5)           │ name
 │ email (unique)       │ comment (optional)    │ email (unique)
 │ password (hashed)    │ userId (FK)           │ address
 │ address              │ storeId (FK)          │ ownerId (FK, unique)
 │ role (enum)          │ createdAt             │ createdAt
 │ createdAt            │ updatedAt             └──────────────
 └──────────────                    
                   @@unique([userId, storeId])
                   → One rating per user per store (editable)
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+
- PostgreSQL (local) or Supabase account

### 1. Clone the repository
```bash
git clone https://github.com/Puru45-byte/RateUs---store-rating-system..git
cd RateUs---store-rating-system.
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trustrate"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/trustrate"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="1d"
```

Run migrations and seed the database:
```bash
npx prisma migrate deploy
npx prisma db seed
```

Start the backend:
```bash
npm run start:dev
```
> Backend runs at: `http://localhost:3000`
> Swagger docs at: `http://localhost:3000/api/docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` folder:
```env
VITE_API_URL="http://localhost:3000"
```

Start the frontend:
```bash
npm run dev
```
> Frontend runs at: `http://localhost:5173`

---

## 🔑 Test Credentials

All accounts use the same password: **`Password123!`**

### 🛡️ Administrator
| Field | Value |
|-------|-------|
| Email | `admin@trustrate.com` |
| Password | `Password123!` |
| Access | Full platform management |

### 👤 Normal Users (5 available)
| Email | Password |
|-------|----------|
| `user1@trustrate.com` | `Password123!` |
| `user2@trustrate.com` | `Password123!` |
| `user3@trustrate.com` | `Password123!` |
| `user4@trustrate.com` | `Password123!` |
| `user5@trustrate.com` | `Password123!` |

### 🏪 Store Owners (6 available)
| Email | Password | Store |
|-------|----------|-------|
| `owner1@trustrate.com` | `Password123!` | SuperMart Grocery |
| `owner2@trustrate.com` | `Password123!` | TechWorld Electronics |
| `owner3@trustrate.com` | `Password123!` | Cafe Delight |
| `owner4@trustrate.com` | `Password123!` | Active Life Sports |
| `owner5@trustrate.com` | `Password123!` | Fashion Hub Boutique |
| `owner6@trustrate.com` | `Password123!` | Green & Fresh Florals |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/auth/register` | Public | Register new user |
| `POST` | `/auth/login` | Public | Login & get JWT |
| `POST` | `/auth/change-password` | 🔒 Auth | Change password |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/users/me` | 🔒 Auth | Get current user profile |
| `PATCH` | `/users/me` | 🔒 Auth | Update profile |

### Stores
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/stores` | 🔒 Auth | List all stores with avg ratings |
| `GET` | `/stores/:id` | 🔒 Auth | Get store details |

### Ratings
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/ratings` | 🔒 User | Submit a rating |
| `PATCH` | `/ratings/:id` | 🔒 User | Update own rating |
| `GET` | `/ratings/my` | 🔒 User | Get my ratings |
| `GET` | `/ratings/store/:storeId` | 🔒 Owner | Get store reviews |

### Admin
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/admin/dashboard` | 🔒 Admin | Platform statistics |
| `GET` | `/admin/users` | 🔒 Admin | All users |
| `GET` | `/admin/stores` | 🔒 Admin | All stores |
| `POST` | `/admin/store-owners` | 🔒 Admin | Register store owner |
| `DELETE` | `/admin/users/:id` | 🔒 Admin | Delete user |

> 📖 **Full interactive docs:** `http://localhost:3000/api/docs` (Swagger UI)

---

## 📁 Project Structure

```
TrustRate/
├── frontend/                   # React + Vite frontend
│   └── src/
│       ├── components/         # Reusable UI components
│       │   └── guards/         # Route protection (ProtectedRoute, PublicRoute)
│       ├── context/            # AuthContext (global auth state)
│       ├── pages/              # Page components per route
│       └── utils/api.ts        # Axios instance with interceptors
│
└── backend/                    # NestJS backend
    ├── prisma/
    │   ├── schema.prisma       # Database models
    │   └── seed.ts             # Database seeder
    └── src/
        ├── admin/              # Admin-only endpoints
        ├── auth/               # JWT auth, login, register
        ├── common/
        │   ├── decorators/     # @Roles(), password validator
        │   ├── dto/            # Validation DTOs
        │   ├── filters/        # Global HTTP exception filter
        │   └── guards/         # JwtAuthGuard, RolesGuard
        ├── ratings/            # Rating CRUD
        ├── stores/             # Store listing
        └── users/              # User profile management
```

---

## 🔒 Security Implementation

- **Passwords** hashed with `bcrypt` (10 rounds) — never stored in plain text
- **JWT tokens** signed with a 128-bit secret, expire in 24 hours
- **Role guards** enforce access at the API level — not just the UI
- **Input validation** via `class-validator` DTOs on every endpoint
- **Password rules**: minimum 8 characters, at least 1 uppercase, 1 number, 1 special character
- **Email uniqueness** enforced at both DB and application level

---

<div align="center">

**Built with ❤️ as a Full-Stack Internship Challenge**

*NestJS · React · TypeScript · Prisma · PostgreSQL · JWT*

</div>
