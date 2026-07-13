# Corvenza Capital Finance - Banking Application

## Overview
Corvenza Capital Finance is a modern, USA-only online banking platform. It offers comprehensive banking services including account management, card services, transfers, bill payments, PayID integration, and administrative controls. The platform prioritizes security and a professional user experience, mimicking established financial institutions. Key capabilities include:
- Secure access code systems
- Advanced card brand detection and design
- Versatile transfer methods
- Personalized user dashboards
- Professional banking features (security alerts, contact information, regulatory compliance badges, mobile app promotion)
- **Smart address autocomplete** with automatic city/state lookup via ZIP code (USA only)

## User Preferences
Preferred communication style: Simple, everyday language.
- Brand name: "Corvenza Capital Finance" (renamed from "Fundamental Financial Credit").
- Primary theme color: red (was blue).
- Platform scope: USA only. All Australia/New Zealand region logic, account fields, and references were removed.

## System Architecture

### Frontend Architecture
- **Frameworks**: React 18 with TypeScript, Vite for bundling.
- **UI/UX**: shadcn/ui (New York variant) with Radix UI primitives, Tailwind CSS for styling, Inter font family. Design is inspired by leading financial platforms with custom theming, responsive design, and light/dark mode support. Features professional card UI with brand-specific gradients and logos, 3D realistic icons for landing page elements, and a banking background image for authenticated views.
- **State Management**: TanStack Query (React Query v5) for server state and caching.
- **Routing**: Wouter for client-side routing.
- **Smart Address Input**: Reusable `AddressInput` component with automatic city/state lookup via Zippopotam.us free API (no API key required). Features:
  - Real-time ZIP code validation
  - Auto-fills city and state within 500ms
  - USA only
  - Debounced API calls for efficiency
  - Error handling for invalid codes
  - Integrated in: Admin user management, user registration, and profile settings
- **User Flow**: Unauthenticated users see a landing page; authenticated users without accounts go through access code verification; authenticated users with accounts access full features; admin users have additional management routes.

### Backend Architecture
- **Server**: Express.js with custom middleware.
- **Authentication**: Session-based authentication using `express-session` and PostgreSQL storage. Replit Auth (OpenID Connect) for user authentication via Passport.js with `openid-client` strategy. New users require access code verification.
- **API**: RESTful API with `/api` prefix, JSON format, route protection (`isAuthenticated`, `isAdmin`), and comprehensive error handling.
- **Business Logic**: Abstracted storage layer, utility functions for generating financial identifiers (account numbers, SWIFT codes, card details), and region-specific account number generation.
- **Deployment**: Configured for Replit Autoscale deployment. Server binds to `0.0.0.0:5000` with enhanced error handling and startup logging. Production build uses Vite for frontend and ESBuild for backend bundling.

### Data Storage Solutions
- **Database**: PostgreSQL via Neon serverless, using Drizzle ORM for type-safe operations and schema management. Schema-first approach with migrations.
- **Schema**:
    - `sessions`: Express session storage.
    - `users`: User profiles with authentication details and roles.
    - `accounts`: Bank accounts with US routing number, SWIFT code, balances, and currency.
    - `cards`: Credit/debit cards linked to accounts, including brand, number, CVV, expiry, and status.
    - `transactions`: Financial transactions with sender/receiver accounts, amounts, types (transfer, bill, PayID), `transferMethod` (internal, external, wire), and `transferDetails` (JSONB for method-specific data).
    - `accessCodes`: Single-use, 12-digit numeric activation codes with expiration.
    - `payIds`: PayID aliases linked to accounts.
- **Relationships**: Users to Accounts (one-to-many), Accounts to Cards (one-to-many), Accounts to PayIDs (one-to-many), Transactions referencing accounts.

## External Dependencies

### Authentication & Sessions
- Replit Auth (OpenID Connect provider)
- `express-session`
- `connect-pg-simple`
- `passport.js`
- `openid-client`

### Database
- Neon PostgreSQL serverless database
- `@neondatabase/serverless`
- Drizzle ORM
- Drizzle Kit

### UI Libraries
- Radix UI
- Tailwind CSS
- `class-variance-authority` (CVA)
- `clsx`
- `tailwind-merge`
- Lucide React (iconography)

### Development Tools
- Vite plugins (for Replit integration)
- TypeScript
- ESBuild
- `tsx`

### Utilities
- `date-fns`
- `nanoid`
- `memoizee`
- `zod`
- `drizzle-zod`

### API Clients
- Native Fetch API