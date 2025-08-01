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
```