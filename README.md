# Personal-Finance-Tracker

# 💰 Finance API

A RESTful backend API for managing users, categories, and financial transactions, built with Node.js, Express, PostgreSQL, and Redis.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v18+ |
| Framework | Express.js |
| Database | PostgreSQL (via Docker) |
| Cache | Redis (via Docker) |
| Auth | JWT |

---

## 📋 Prerequisites

- [Node.js v18+](https://nodejs.org/)
- [Docker](https://www.docker.com/) & Docker Compose

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO/backend
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Server
PORT=5000

# PostgreSQL
DB_HOST=localhost
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_database
POSTGRES_PORT=5432

# JWT
JWT_SECRET=your_super_secret_key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

> ⚠️ The `.env` file is **not** committed to this repository. Never share or expose your secrets.

### 3. Start Services (Docker)

```bash
docker compose up -d
```

This will spin up:
- **PostgreSQL** on port `5432`
- **Redis** on port `6379`

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Development Server

```bash
npm run dev
```

The server will be available at **http://localhost:5000**

---

## 📂 Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── routes/          # API route definitions
│   ├── models/          # Database models
│   ├── middleware/       # Auth, validation, error handling
│   ├── validations/     # Input validation schemas
│   └── app.js           # Express app entry point
├── .env                 # Environment variables (not committed)
├── docker-compose.yml
└── package.json
```

---

## 🐳 Docker Commands

| Command | Description |
|---|---|
| `docker compose up -d` | Start PostgreSQL and Redis in the background |
| `docker compose down` | Stop all services |
| `docker compose down -v` | Stop all services and remove volumes (resets database) |

---

## 🔐 Authentication

This API uses **JWT (JSON Web Tokens)** for authentication. Include the token in the `Authorization` header for protected routes:

```
Authorization: Bearer <your_token>
```

---

## 📡 API Overview

| Resource | Base Path |
|---|---|
| Users | `/api/users` |
| Categories | `/api/categories` |
| Transactions | `/api/transactions` |

---

## 🧪 Development Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start server with hot-reload |
| `npm start` | Start server in production mode |

---