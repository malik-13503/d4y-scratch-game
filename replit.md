# Real-Time Prize Game Web Application

## Overview
This project is a real-time web application for interactive prize games, primarily focusing on wheel-spinning mechanics. Its purpose is to provide an engaging and fair platform for live game participation and prize winning, supported by robust administrative controls. The business vision is to create a leading, entertaining online gaming experience with high market potential in casual gaming and online sweepstakes, aiming for widespread user adoption and a reputation for transparent, exciting gameplay.

### Recent Updates (January 2025)
- **Production Mode Enabled**: System now processes real payments instead of simulated transactions - actual card charges occur on spin
- **React Object Error Fixed**: Resolved critical rendering error in professional wheel component that prevented proper number display
- **Payment Environment Updated**: Forced production mode to ensure Square SDK processes real transactions instead of sandbox simulations
- **Data Integrity Implemented**: Removed all demo/placeholder data - system now displays only real data from database
- **Payment Processing Enhanced**: Now properly charges users' actual payment cards via Square SDK integration
- **Clean Database**: Sample games, default admin accounts, and mock data sources completely removed
- **Real-time Analytics**: Admin dashboard shows authentic metrics calculated from actual user interactions
- **Production Ready**: All endpoints return real data only - no fallback to fake or sample content
- **Winners Tab Complete**: Added comprehensive Winners list in admin dashboard showing all completed games with winner details
- **Email Templates Active**: Professional winner notification and game completion emails fully operational via Resend service

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui and Radix UI primitives
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Build Tool**: Vite
- **UI/UX Decisions**: Modern, responsive design with fullscreen gameplay, professional physics-based wheel animations, confetti, sound effects, and celebratory animations. Features a consistent purple/blue gradient theme with glass morphism effects, animated backgrounds, and floating particles. Emphasizes clean, accessible UI components with a focus on readability and visual engagement across all devices (mobile-first approach), and intuitive user flows.

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
- **Game System**: Configurable wheel-spin games with professional animations, customizable prizes, and real-time updates. Supports flexible number ranges and "free play" zones. Includes age verification and a 50-segment wheel limit.
- **Admin Dashboard**: Comprehensive management of games, player analytics, system settings, and real-time monitoring. Includes secure admin authentication with role-based access, image upload for prizes, and game deletion.
- **Authentication & Security**: Secure login, Bcrypt-based password hashing, robust session management, and admin-only access controls.
- **Payment System**: Integrated real-time payment processing with advanced card management features.
- **Email Notifications**: Professional, branded email templates.
- **User Engagement**: Real-time recent numbers display, enhanced user dashboard with activity timelines and statistics, and an achievement system.
- **Informational Pages**: Comprehensive pages for game info, how-to-play (with in-game instructions and "no purchase necessary" emphasis), prize rules, instant play, free spins, contact us, terms & conditions, and privacy policy. Includes detailed official rules documentation and generic game descriptions to support variable number ranges.
- **Free Play System**: One-time free play system per game tracked by IP, with dedicated API endpoints and guest player support.

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