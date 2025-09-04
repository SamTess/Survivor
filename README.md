# README

This project uses Next.js for routing and client-side rendering, as well as an onion architecture to organize business logic and services.

## Folder Structure

- **public/** : Contains publicly accessible static files (images, icons, etc.).
- **src/app/** : Main folder for Next.js front-end routing. Each subfolder represents a route or page (e.g., `/about`, `/admin`, `/profile/[id]`, etc.).
	- **api/** : Contains Next.js API routes (lightweight backend, e.g., `info.ts`).
- **src/application/services/** : Contains business logic and services (e.g., user management).
- **src/domain/** : Defines domain entities and interfaces (e.g., `User.ts`, `IUserRepository.ts`).
- **src/infrastructure/** : Implements repositories and data access (e.g., `UserRepository.ts`).
- **src/persistence/** : Manages persistence and database contexts (e.g., `dbContext.ts`).
- **src/ui/** : Contains all user interface components, layout, and shared elements.
	- **components/** : Reusable components.
	- **layout/** : Layout components.
	- **shared/** : Shared components or utilities.

## Architecture Principles

- **Next.js Routing** : Pages and APIs are organized according to Next.js convention for automatic routing.
- **Onion Architecture** : Clear separation between domain, application, infrastructure, and presentation layers for better maintainability and scalability.
- **Centralized UI** : All visual components are grouped in `src/ui/` to facilitate reuse and interface consistency.

## Getting Started

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`

---

For any questions about the structure or architecture, consult this README or the Next.js documentation.

## Authentication

Basic authentication has been added with signed JWT (HMAC SHA-256) stored in an httpOnly `auth` cookie.

Public pages: `/login`, `/signup`, `/api/auth/*` routes.
Any other page redirects to `/login` if the user is not connected.

### Environment Variables

Add to `.env`:

```
AUTH_SECRET="change_me_in_prod"
```

### API Routes

- POST `/api/auth/signup` `{ name, email, password }`
- POST `/api/auth/login` `{ email, password }`
- POST `/api/auth/logout`

### Security

- Password hash: scrypt (Node.js crypto).
- Change `AUTH_SECRET` in production to a long and random value.
- For advanced features (OAuth, MFA, password reset), integrate a dedicated solution.

