# The Peoples Finance - Design Guidelines

## Design Approach

**Selected Approach:** Design System + Financial Industry Standards

Drawing inspiration from established financial platforms (Stripe Dashboard, PayPal, Chase Bank, Commonwealth Bank) with emphasis on trust, clarity, and professional polish. Using clean, data-focused layouts with strong information hierarchy.

---

## Core Design Elements

### A. Typography

**Font Family:** Inter (via Google Fonts CDN)
- **Headings:** Inter Bold (font-weight: 700)
  - H1: text-4xl to text-5xl
  - H2: text-3xl
  - H3: text-2xl
  - H4: text-xl
- **Body Text:** Inter Regular (font-weight: 400)
  - Primary: text-base
  - Secondary: text-sm
  - Caption/Meta: text-xs
- **Numbers/Financial Data:** Inter Medium (font-weight: 500)
  - Account numbers: text-lg tracking-wider
  - Balances: text-2xl to text-4xl
  - Transaction amounts: text-base

### B. Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-6 to p-8
- Section spacing: space-y-6 to space-y-8
- Card gaps: gap-4 to gap-6
- Container padding: px-4 md:px-6 lg:px-8

**Grid Structure:**
- Dashboard: 12-column grid (grid-cols-12)
- Cards: 1 column mobile, 2-3 columns desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Admin tables: Full-width responsive tables

**Container Widths:**
- Max content: max-w-7xl
- Forms: max-w-md to max-w-lg
- Dashboards: w-full with inner max-w-7xl

---

## C. Component Library

### Navigation & Headers

**Public Site Header:**
- Logo left, navigation center, Login/Register buttons right
- Sticky positioning with subtle shadow on scroll
- Height: h-16 to h-20
- Navigation items with text-sm font-medium

**Dashboard Sidebar:**
- Width: w-64 (desktop), full-width drawer (mobile)
- Fixed positioning on desktop
- Logo at top (h-16)
- Navigation items with icons (Heroicons) + labels
- Active state with subtle background treatment
- User profile section at bottom

**Dashboard Top Bar:**
- Height: h-16
- User avatar + name + dropdown (right)
- Search functionality (optional, center)
- Breadcrumb navigation (left)

### Authentication Components

**Login/Register Forms:**
- Centered card layout: max-w-md mx-auto
- Card padding: p-8
- Form inputs with consistent spacing: space-y-4
- Input fields: h-12 with rounded-lg borders
- Submit buttons: w-full h-12
- Access code input: Large, centered, tracking-widest

**Access Code Interface:**
- Prominent single-input field design
- Large text size: text-2xl
- Letter-spaced display (tracking-widest)
- Helper text below: text-sm

### Dashboard Components

**Account Overview Cards:**
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Card height: min-h-32
- Padding: p-6
- Icon + Label + Large Number format
- Rounded: rounded-xl

**Virtual Card Display:**
- Card aspect ratio: 1.586:1 (standard credit card)
- Width: w-full max-w-md
- Padding: p-6 to p-8
- Rounded corners: rounded-2xl
- Display elements positioned absolutely:
  - Card number: Center, text-lg, tracking-wider
  - Cardholder name: Bottom left, text-sm uppercase
  - Expiry: Bottom center, text-sm
  - CVV: Bottom right, text-sm (with reveal toggle)
  - Card type logo: Top right

**Transaction List:**
- Table layout on desktop
- Card layout on mobile (stack)
- Row height: h-16
- Columns: Date | Description | Amount | Status
- Status badges: px-3 py-1 rounded-full text-xs
- Hover state on rows

**Quick Actions Panel:**
- Grid of action buttons: grid-cols-2 gap-4
- Each button: aspect-square or h-24
- Icon (size-8) + Label below
- Actions: Transfer, Pay Bill, PayID, Statements

### Admin Components

**User Management Table:**
- Full-width responsive table
- Sortable columns
- Search/filter bar above: h-12
- Action buttons per row: Edit | Lock | Block | Delete
- Pagination controls below
- Row actions in dropdown menu (mobile)

**Transaction Approval Interface:**
- Split view: Pending (left) | Approved/Declined (right)
- Card-based pending items with Approve/Decline buttons
- Transaction details expandable
- Bulk action controls at top

**Access Code Management:**
- List view of generated codes
- Code display: monospace font, text-lg, tracking-wider
- Status indicator: Active | Used | Expired
- Generate new code button (prominent)
- Send code functionality with user selector

### Forms & Inputs

**Standard Input Fields:**
- Height: h-12
- Padding: px-4
- Rounded: rounded-lg
- Border width: border
- Focus ring: ring-2

**Select Dropdowns:**
- Same sizing as inputs
- Chevron icon right-aligned

**Buttons:**
- Primary: h-12 px-6 rounded-lg font-medium
- Secondary: h-10 px-4 rounded-lg
- Icon buttons: w-10 h-10 rounded-lg
- Disabled state with reduced opacity

**Account Number Display:**
- Monospace font presentation
- Format: XXXX XXXX XXXX (with spacing)
- Copy to clipboard button adjacent
- BSB/Routing/SWIFT displayed separately with labels

---

## Images

**Public Landing Page:**
- Large hero image showcasing modern banking/financial security theme
- Hero height: min-h-screen on desktop, min-h-96 on mobile
- Overlay with semi-transparent treatment for text readability
- Buttons on hero: backdrop-blur treatment on button backgrounds

**Dashboard:**
- User profile avatar: w-10 h-10 rounded-full
- Placeholder for users without photos
- Bank logo in sidebar and header
- No decorative images in functional dashboard areas

---

## Accessibility & Interactions

- All interactive elements minimum 44x44px touch target
- Keyboard navigation support throughout
- Focus indicators on all interactive elements (ring-2)
- ARIA labels on icon-only buttons
- Form validation with inline error messages (text-sm below inputs)
- Loading states for async operations (spinner + disabled state)

**Animations:** Minimal and purposeful only
- Page transitions: fade-in only
- Modal/dropdown appearances: subtle slide-fade
- NO animations on critical actions (transfers, approvals)
- NO hover animations on data tables

---

## Regional Variations

**Account Information Display:**
- Australia: BSB (6 digits) + Account Number
- USA: Routing Number (9 digits) + Account Number
- New Zealand: Bank Code + Branch + Account + Suffix OR SWIFT/BIC

Display format:
```
Region: [Flag Icon] Australia
BSB: XXX-XXX
Account: XXXX XXXX XXXX
```

---

## Professional Banking Standards

- All financial amounts right-aligned in tables
- Consistent decimal precision (2 places for currency)
- Clear positive/negative indicators (+ / -)
- Transaction dates in consistent format: DD/MM/YYYY or MM/DD/YYYY based on region
- Status indicators use badges, not just text
- Critical actions require confirmation modals
- Sensitive data (CVV) behind reveal toggle