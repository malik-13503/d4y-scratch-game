# Real-Time Prize Game Web Application

## Overview
This project is a real-time web application designed for interactive prize games, specifically focusing on wheel-spinning mechanics. Its core purpose is to provide an engaging and fair platform for users to participate in live games to win prizes, while offering robust administrative controls. The business vision is to create a leading, entertaining online gaming experience with high market potential in the casual gaming and online sweepstakes sectors, aiming for widespread user adoption and a reputation for transparent and exciting gameplay.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui and Radix UI primitives
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Build Tool**: Vite
- **UI/UX Decisions**:
    - Modern, responsive design with fullscreen gameplay.
    - Professional, physics-based wheel animations.
    - Confetti, sound effects, and celebratory animations.
    - Consistent purple/blue gradient theme with glass morphism effects, animated backgrounds, and floating particles.
    - Clean, accessible UI components with a focus on readability and visual engagement across all devices (mobile-first approach).
    - Intuitive user flows for authentication, game participation, and payment.

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ES modules)
- **Authentication**: Passport.js with local strategy and `express-session` (supporting both in-memory and PostgreSQL session storage).
- **API Design**: RESTful endpoints with comprehensive error handling.

### Database
- **Database**: PostgreSQL (Neon serverless hosting)
- **ORM**: Drizzle ORM for type-safe operations.
- **Schema**: Supports games, players, results, and admin management.
- **Migrations**: Drizzle Kit.

### Key Features
- **Game System**: Configurable wheel-spin games with professional animations, customizable prizes, and real-time updates. Supports flexible number ranges and "free play" zones.
- **Admin Dashboard**: Comprehensive management of games, player analytics, system settings, and real-time monitoring. Includes secure admin authentication with role-based access.
- **Authentication & Security**: Secure login, Bcrypt-based password hashing, robust session management, and admin-only access controls.
- **Payment System**: Integrated real-time payment processing (production-ready).
- **Email Notifications**: Professional, branded email templates for welcome, payment confirmations, and receipts.
- **User Engagement**: Real-time recent numbers display, enhanced user dashboard with activity timelines and statistics, and an achievement system.
- **Informational Pages**: Comprehensive pages for game info, how-to-play, prize rules, instant play, free spins, contact us, terms & conditions, and privacy policy.

## External Dependencies

- `@neondatabase/serverless`: PostgreSQL database connectivity.
- `@tanstack/react-query`: Server state management.
- `@radix-ui/*`: Accessible UI component primitives.
- `passport`: Authentication middleware.
- `drizzle-orm`: Type-safe database ORM.
- `express-session`: Session management.
- `tailwindcss`: Utility-first CSS framework.
- `@stripe/stripe-js`: Stripe payment processing.
- `@stripe/react-stripe-js`: React components for Stripe.
- `@sendgrid/mail`: Email notifications.

## Changelog

- January 29, 2025: **OFFICIAL RULES INTEGRATION COMPLETE** - Added comprehensive official rules documentation
  - **Official Rules Page**: Created detailed official rules page with all legal requirements from provided PDF
  - **State Exclusions**: Clearly documented excluded states (NY, FL, RI, HI) with specific prize thresholds
  - **Entry Methods**: Detailed both paid entry and no-purchase-necessary (NPN) entry options
  - **Legal Compliance**: Includes eligibility, winner selection, prizes, general conditions, and disclaimers
  - **Navigation Integration**: Added official rules links to signup form, footer, and routing configuration
- January 29, 2025: **PRODUCTION SECURITY & PRIVACY COMPLETE** - Removed demo credentials and fixed privacy policy
  - **Demo Credentials Removal**: Removed "demo@example.com / demo123" from regular user login form for production security  
  - **Privacy Policy Created**: Built comprehensive privacy policy page with professional design and complete information
  - **Privacy Route Fixed**: Added /privacy route to App.tsx routing configuration to resolve broken links
  - **Legal Compliance**: Privacy policy covers data collection, usage, protection, sharing, user rights, and cookies
  - **Professional Design**: Privacy page features consistent branding with animated backgrounds and responsive layout
- January 29, 2025: **GAME RANGE FLEXIBILITY UPDATE** - Made game descriptions generic to support variable number ranges
  - **Dynamic Range Support**: Updated all references from "1-200" to generic "Spin the wheel, pay what you land on"
  - **Flexible Free Play**: Changed "Numbers 151-200" to "Higher Numbers" to accommodate games with different ranges
  - **Adaptable Paid Range**: Updated "Numbers 1-150" to "Lower Numbers" for variable game configurations
  - **Multi-Page Consistency**: Updated auth landing, how-to-play, and prize-rules pages with generic language
  - **Future-Proof Design**: Games can now have ranges like 1-50, 1-85, 1-75 without UI text conflicts
```