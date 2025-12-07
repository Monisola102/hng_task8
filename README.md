# Mini Authentication + API Key System

## Description
This project implements a backend authentication system that supports:

- User registration and login via JWT.
- Service-to-service access using API keys.
- Role-based access control and protected routes.
- API key creation, expiration, and revocation.

Built with **NestJS**, **Prisma** (PostgreSQL), and **JWT**.

---

## Tech Stack
- **Backend Framework:** NestJS
- **Database:** PostgreSQL (via Prisma ORM)
- **Authentication:** JWT for users, API keys for services
- **Other Tools:** bcrypt for password hashing, uuid for generating API keys, class-validator for input validation

---

## API Endpoints

## Authentication Routes

| Method | Endpoint        | Description                  | Request Body                | Response                         |
|--------|----------------|-----------------------------|----------------------------|---------------------------------|
| POST   | `/auth/signup`  | Register a new user           | `{ email, password, name? }` | `{ user_id, email, name, token }` |
| POST   | `/auth/login`   | Login user and issue JWT      | `{ email, password }`       | `{ user_id, email, token }`     |

## API Key Routes

| Method | Endpoint             | Description                  | Request Body | Response                                           |
|--------|--------------------|-----------------------------|--------------|--------------------------------------------------|
| POST   | `/keys/create`      | Generate a new API key       | `{ "expiresAt": "2025-12-30T23:59:59.000Z" } `|   `{ key_id, api_key, created_at }`|
| GET    | `/keys/list`        | List all active API keys     | N/A          | [ { "id", "prefix", "expiresAt", "revokedAt", "createdAt" } ]   |
| POST   | `/keys/revoke/:id`  | Revoke an API key            | N/A          |  { "id", "revokedAt" } |

## Protected Routes

| Method | Endpoint           | Description                         | Request Body | Response                                      |
|--------|------------------|------------------------------------|--------------|----------------------------------------------|
| GET    | `/profile`        | Get currently logged-in user info   | N/A          | `{ id, email, name }`                         |
| GET    | `/service/ping`   | Service-to-service access ping      | N/A          | `{ ok: true, serviceOwner, keyPrefix }`      |

---

## Authentication & Authorization
- **User Auth:** JWT tokens for registered users (`Authorization: Bearer <token>` header).  
- **Service Auth:** API keys for service-to-service access (`x-api-key` header).  
- **Middleware:** Automatically detects Bearer token or API key and grants access based on route type.

---

## Database Schema

### User Table
- `id`: UUID, primary key  
- `email`: string, unique  
- `password`: string (hashed)  
- `name`: string, optional  
- `created_at`: timestamp  

### ApiKey Table
- `id`: UUID, primary key  
- `key`: string, unique  
- `name`: string  
- `user_id`: UUID (optional, owner of the key)  
- `revoked`: boolean, default false  
- `created_at`: timestamp  
- `expires_at`: timestamp, optional  

---

## Security Considerations
- Passwords hashed with **bcrypt**.  
- JWT secrets stored in `.env`.  
- API keys are generated securely and can be revoked or expired.  
- Middleware ensures protected routes are accessed only by valid users or services.

---

## Running the Project

1. Clone the repo:

```bash
git clone <your-repo-url>
cd <your-repo-folder>
