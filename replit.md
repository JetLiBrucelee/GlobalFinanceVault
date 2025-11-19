# Fundamental Financial Credit - Banking Application

## Overview

Fundamental Financial Credit is a modern, multi-region online banking platform serving customers across Australia, USA, and New Zealand. The application provides comprehensive banking features including account management, card services, transfers (domestic and international), bill payments, PayID integration, and administrative controls. Built with a focus on security, trust, and professional user experience, it mirrors the design patterns of established financial institutions.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (November 2025)

### Access Code System Update
- **Format Change**: Access codes changed from 8-character alphanumeric to 12-digit numeric for better usability
- **Security Enhancement**: All access codes and transaction verification codes now use cryptographically secure random number generation (crypto.randomBytes)
- **Admin Code**: Special admin access code is `000000000001` (12 zeros followed by 1)
- **Database Cleanup**: Old 8-character codes removed from database to maintain consistency

### Card Brand Detection & Design
- **BIN Detection**: Implemented industry-standard BIN (Bank Identification Number) prefix detection to automatically identify card brands
  - Visa: Starts with 4
  - Mastercard: Starts with 51-55 or 2221-2720
  - American Express: Starts with 34 or 37
  - Discover: Starts with 6011, 622126-622925, 644-649, or 65
- **Card Generation**: Card numbers now generated with specific brand prefixes for realistic card distribution
- **Database Field**: Added `cardBrand` field to cards table to persist brand information
- **Professional Card UI**: Complete redesign matching professional banking card aesthetics (inspired by bibank reference):
  - **Bank Logo**: "Fundamental Financial Credit" wordmark positioned at top-left (industry standard)
  - **Brand Logos**: Visa/Mastercard/Amex/Discover logos positioned at bottom-right (professional banking standard)
  - **Color Gradients**: Brand-specific gradients matching real bank cards:
    - **Visa**: Blue gradient (`from-[#2E3192] via-[#1A237E] to-[#0D47A1]` for debit, darker blue for credit)
    - **Mastercard**: Dark navy/black gradient (`from-[#1a1a2e] via-[#16213e] to-[#0f1419]`) for both debit and credit
    - **Amex**: Blue gradient (lighter blue for credit, teal for debit)
    - **Discover**: Orange gradient
  - **Chip Graphic**: Subtle gold chip overlay for authentic card appearance
  - **Typography**: Prominent card number with refined hierarchy for cardholder/expiry/CVV details
  - **Card Type**: Subtle DEBIT/CREDIT indicator below bank logo
  - **Region Indicator**: Discrete region display (Australia/United States/New Zealand)
  - **Number Formatting**: 4-4-4-4 for most cards, 4-6-5 for American Express
- **Card Brand Distribution**: Database contains mix of Visa credit cards (BIN 4xxx) and Mastercard debit cards (BIN 5xxx) for realistic banking experience

### Transfer Methods Enhancement
- **Method Types**: Support for three transfer types:
  - **Internal**: Standard account-to-account transfers within the platform
  - **External/Domestic**: Transfers to external banks requiring routing number (US), BSB (AU), or branch code (NZ)
  - **Wire/International**: International transfers requiring SWIFT/BIC codes, IBAN, and beneficiary bank details
- **Transfer Details Storage**: JSONB field in transactions table stores method-specific details:
  - External transfers: routing number, BSB, beneficiary name, beneficiary address
  - Wire transfers: SWIFT/BIC code, IBAN, beneficiary bank name, beneficiary bank address, intermediary bank details (optional), transfer purpose
- **Database Schema**: Added `transferMethod` and `transferDetails` fields to transactions table

### User Dashboard Improvements
- **Personalized Greetings**: Dashboard now displays user's actual name instead of generic "Welcome back!"
  - Example: "Welcome back, Don Pablo Administrative!" for admin users
  - Example: "Welcome back, [FirstName] [LastName]!" for regular users
- **Admin Bypass**: Admin users (like Don Pablo Administrative) bypass access code verification on login

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing without React Router overhead

**UI Component System**
- shadcn/ui component library (New York variant) with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Design system inspired by financial platforms (Stripe, PayPal, Chase, Commonwealth Bank)
- Inter font family for typography with specific weights for headings, body text, and financial data
- Custom CSS variables for theming with light/dark mode support
- Responsive design with mobile-first breakpoints (768px mobile threshold)

**State Management**
- TanStack Query (React Query v5) for server state management and caching
- Query client configured with infinite stale time and disabled refetching for stable financial data
- Custom hooks for authentication (`useAuth`) and mobile detection (`useIsMobile`)
- Form state handled by React Hook Form with Zod validation via `@hookform/resolvers`

**Route Protection & User Flow**
1. Unauthenticated users see landing page only
2. Authenticated users without accounts are redirected to access code verification
3. Authenticated users with accounts access full dashboard and features
4. Admin users have additional routes for user management, transactions, and access code administration

### Backend Architecture

**Server Framework**
- Express.js as the HTTP server with custom middleware for logging and request handling
- Session-based authentication using express-session with PostgreSQL storage (connect-pg-simple)
- Replit Auth integration via OpenID Connect (OIDC) for user authentication
- Passport.js with openid-client strategy for OAuth flows

**API Design**
- RESTful API structure with `/api` prefix for all backend routes
- Route protection middleware (`isAuthenticated`, `isAdmin`) for role-based access control
- JSON request/response format with comprehensive error handling
- Raw body capture for webhook verification support

**Authentication Flow**
1. Users authenticate via Replit Auth (OpenID Connect)
2. Session established with user claims stored server-side
3. New users must verify with an access code to activate their account
4. Access codes are single-use and have expiration dates
5. Admin status controlled via database flag

**Business Logic Separation**
- Storage layer abstraction through `IStorage` interface for data operations
- Utility functions for generating financial identifiers (account numbers, BSB, routing numbers, SWIFT codes, card numbers, CVV, expiry dates)
- Region-specific account number generation for AU/US/NZ compliance

### Data Storage Solutions

**Database System**
- PostgreSQL via Neon serverless with WebSocket connections
- Drizzle ORM for type-safe database operations and schema management
- Schema-first approach with migrations in `/migrations` directory
- Connection pooling via @neondatabase/serverless

**Database Schema**
- `sessions`: Express session storage (required for Replit Auth)
- `users`: User profiles with email, names, profile images, admin/blocked/locked status
- `accounts`: Bank accounts with region-specific identifiers (account number, BSB, routing number, SWIFT code), balances, and currency
- `cards`: Credit/debit cards linked to accounts with card numbers, CVV, expiry, cardBrand (visa/mastercard/amex/discover), and status
- `transactions`: Financial transactions with from/to accounts, amounts, types (transfer/bill/payid), transferMethod (internal/external/wire), transferDetails (JSONB for method-specific data), status tracking, and descriptions
- `accessCodes`: Single-use 12-digit numeric activation codes with expiration and user assignment (cryptographically secure generation)
- `payIds`: PayID aliases (email/phone/ABN) linked to accounts for instant payments

**Data Relationships**
- Users → Accounts (one-to-many, cascade delete)
- Accounts → Cards (one-to-many, cascade delete)
- Accounts → PayIDs (one-to-many, cascade delete)
- Transactions reference accounts via foreign keys (nullable for external transfers)

### External Dependencies

**Authentication & Sessions**
- Replit Auth (OpenID Connect provider) for user authentication
- express-session with connect-pg-simple for PostgreSQL session storage
- passport.js with openid-client strategy for OAuth 2.0 flows
- Session secrets managed via environment variables

**Database**
- Neon PostgreSQL serverless database
- Database URL provided via `DATABASE_URL` environment variable
- WebSocket support via `ws` package for serverless connections
- Drizzle Kit for schema migrations and database push operations

**UI Libraries**
- Radix UI for accessible, unstyled component primitives (dialogs, dropdowns, tooltips, etc.)
- Tailwind CSS for utility-first styling
- class-variance-authority (CVA) for component variant management
- clsx and tailwind-merge for conditional class composition
- Lucide React for consistent iconography

**Development Tools**
- Vite plugins for Replit integration (runtime error overlay, cartographer, dev banner)
- TypeScript with strict mode for type safety
- ESBuild for production server bundling
- tsx for development server execution

**Utilities**
- date-fns for date formatting and manipulation
- nanoid for generating unique identifiers
- memoizee for caching expensive operations (OIDC config)
- zod for runtime schema validation
- drizzle-zod for generating Zod schemas from Drizzle tables

**API Clients**
- Native fetch API for all HTTP requests with credential inclusion
- Custom `apiRequest` wrapper for consistent error handling
- Query client with custom query functions for 401 handling