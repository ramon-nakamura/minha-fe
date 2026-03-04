# Minha Fé - Digital Faith App

## Overview
A digital faith app built in Portuguese with React/TypeScript frontend and Express/PostgreSQL backend. Users post prayer requests, graces received, and anonymous confessions as cards.

## Architecture
- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js + Drizzle ORM + PostgreSQL
- **Auth**: Custom email/password authentication with bcryptjs + express-session (sessions stored in PostgreSQL via connect-pg-simple)
- **Routing**: wouter (frontend), Express (backend)
- **State**: TanStack Query v5

## Key Files
- `shared/schema.ts` - Data models (messages, notifications) + re-exports auth models
- `shared/models/auth.ts` - User schema with `password` and `role` fields
- `shared/routes.ts` - API route definitions with Zod validation
- `server/routes.ts` - Express route handlers
- `server/storage.ts` - Database CRUD operations (IStorage interface)
- `server/seed.ts` - Database seeding with sample data
- `server/replit_integrations/auth/replitAuth.ts` - Custom auth setup (register, login, logout, password change, isAuthenticated middleware)
- `server/replit_integrations/auth/storage.ts` - Auth storage (getUser, getUserByEmail, upsertUser, etc.)
- `server/replit_integrations/auth/routes.ts` - Auth routes and admin endpoints
- `client/src/App.tsx` - Frontend routing (Dashboard, Profile, Admin)
- `client/src/pages/LandingPage.tsx` - Login/Register forms with tab switching
- `client/src/pages/Dashboard.tsx` - Main feed with masonry grid of cards
- `client/src/pages/Profile.tsx` - User profile, avatar upload, message management, password change
- `client/src/pages/Admin.tsx` - Admin panel for user management
- `client/src/components/FloatingBubble.tsx` - Message card component with admin edit/delete
- `client/src/components/CreateMessageModal.tsx` - Message creation modal
- `client/src/hooks/use-auth.ts` - Auth hook (exposes isAdmin, logout via POST)
- `client/src/hooks/use-messages.ts` - Messages CRUD hooks

## Database Schema
- **users**: id (varchar UUID), email (unique, not null), password (text, bcrypt hash), firstName, lastName, profileImageUrl, role (user/admin), consentAcceptedAt, createdAt, updatedAt
- **sessions**: sid, sess, expire (for express-session)
- **messages**: id, type (prayer/grace/sin), content, authorId, likesCount, isPardoned, isSpecial, isPrivate, createdAt
- **notifications**: id, userId, messageId, type, content, isRead, createdAt

## Auth System
- Custom email/password auth (no external OAuth)
- Registration: full name, email, password (min 6 chars)
- Login: email, password
- Password change: current password + new password (from Profile edit view)
- Session-based auth stored in PostgreSQL
- User ID stored in session as `req.session.userId`
- Passwords hashed with bcryptjs (10 rounds)
- API never returns password field in responses

## Admin System
- Users have a `role` field: "user" (default) or "admin"
- Admin API routes: GET/POST /api/admin/users, PATCH /api/admin/users/:id/role, DELETE /api/admin/users/:id, PATCH /api/admin/messages/:id
- Admin page at /admin: user management (add, delete, change roles)
- Admin users see edit/delete buttons on all feed cards
- Admin can delete any message (not restricted to own messages)
- Admin-created users get default password "changeme123"

## Stripe Payment (Vela Especial)
- **Price**: R$1,99 (199 centavos BRL)
- **Flow**: User creates prayer → opts for "Vela Especial" → POST `/api/payments/create-checkout` with messageId → redirect to Stripe Checkout → on success, message marked `isSpecial = true`
- **Routes**: `POST /api/payments/create-checkout` (authenticated), `GET /api/payments/success` (redirect handler), `POST /api/payments/webhook` (Stripe webhook), `GET /api/payments/config` (publishable key)
- **Files**: `server/stripe.ts` (Stripe client + price constants), payment routes in `server/routes.ts`
- **DB Table**: `payments` (id, userId, messageId, stripeSessionId unique, status pending/completed, amount, createdAt)
- **Secrets**: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` (set as Replit env vars)
- **Webhook**: Uses `rawBody` from `express.json({ verify })` for signature verification; falls back to parsed body if no webhook secret set

## LGPD Compliance
- **Registration consent**: Mandatory checkbox linking to Terms/Privacy; backend validates `consent: true` via Zod and stores `consentAcceptedAt` timestamp in users table
- **Account deletion**: `DELETE /api/auth/account` route anonymizes messages (sets authorId=null), deletes user, destroys session. UI in Profile page "Zona de Perigo" section with two-step confirmation
- **Cookie banner**: `CookieBanner` component in App.tsx, stores consent in localStorage key `minhafe_cookie_consent`, shows once per browser
- **Legal pages**: `/termos` (Terms of Use), `/privacidade` (Privacy Policy) — behind ProtectedRoute

## Features
- Prayer requests, graces received, anonymous confessions
- Special prayer cards (isSpecial flag) via Stripe payment (R$1,99)
- Like/pray for messages, pardon confessions
- Real-time notifications
- Profile with avatar upload (base64), message management
- Password change in profile edit view
- Self-service account deletion with message anonymization
- Admin panel for user/message management
- Glass-panel UI with masonry grid layout
- Cookie consent banner (LGPD)

## User Preferences
- App language: Portuguese (pt-BR)
- Currency: R$ (BRL)
- Anonymous sins: authorId always null, never show author info

## Technical Notes
- `cn` utility must be locally defined in each component (not from shared util)
- `[isEditing, setIsSpecial]` naming collision in Profile.tsx — do not rename
- `FaithMessage` interface includes `isPrivate: boolean`
