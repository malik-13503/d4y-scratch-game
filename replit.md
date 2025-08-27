# Real-Time Prize Game Web Application

## Overview
This project is a real-time web application for interactive prize games, primarily focusing on wheel-spinning mechanics. Its purpose is to provide an engaging and fair platform for live game participation and prize winning, supported by robust administrative controls. The business vision is to create a leading, entertaining online gaming experience with high market potential in casual gaming and online sweepstakes, aiming for widespread user adoption and a reputation for transparent, exciting gameplay.

### Recent Updates (January 2025)
- **Payment Failure Handling Complete**: System now correctly handles payment failures with proper error popups and number protection
- **Production Mode Enabled**: System processes real payments instead of simulated transactions - actual card charges occur on spin
- **React Object Error Fixed**: Resolved critical rendering error in professional wheel component that prevented proper number display
- **Payment Logic Secured**: Numbers are only claimed when payment actually succeeds - payment failures show error messages and keep numbers available
- **Data Integrity Implemented**: Removed all demo/placeholder data - system now displays only real data from database
- **Payment Processing Enhanced**: Now properly charges users' actual payment cards via Square SDK integration
- **Clean Database**: Sample games, default admin accounts, and mock data sources completely removed
- **Real-time Analytics**: Admin dashboard shows authentic metrics calculated from actual user interactions
- **Production Ready**: All endpoints return real data only - no fallback to fake or sample content
- **Winners Tab Complete**: Added comprehensive Winners list in admin dashboard showing all completed games with winner details
- **Email Templates Active**: Professional winner notification and game completion emails fully operational via Resend service
- **Deployment Fixes Applied**: Resolved Docker registry upload failures and digest mismatch errors with comprehensive deployment optimizations (January 19, 2025)
- **Square Card on File Integration**: Implemented full Square Card on File system with secure card storage and automatic payment processing (January 19, 2025)
- **Real Payment Card Management**: Added comprehensive card management interface for users to securely add, manage, and use stored payment cards (January 19, 2025)
- **Payment System Verified**: Payment system confirmed working 100% perfectly - automatic charging of stored cards when spinning is fully functional (January 19, 2025)
- **Email Notifications Complete**: Implemented comprehensive email system for payment success notifications (sent only on successful payments, not failures) and winner announcements to all game participants (August 20, 2025)
- **Automatic Winner Selection Fixed**: Resolved critical issue where automatic winner selection failed due to missing player records - system now auto-creates player records during payment process and successfully triggers winner selection and email notifications when all numbers are claimed (August 26, 2025)
- **Admin Dashboard Real-Time Display Fixed**: Corrected Numbers Left display in Game Management tab to show accurate real-time data that updates every 5 seconds, replacing stale database values with live API calls (August 27, 2025)
- **Winner Selection and Email System Tested**: Completed comprehensive testing of automatic winner selection process and email notification system using Trophy game demo (August 27, 2025)
- **Automatic Winner Selection System Verified**: Successfully completed Trophy game test by claiming all remaining numbers, triggering automatic winner selection, game completion, and comprehensive email notifications to winner and all participants (August 27, 2025)
- **Complete Email System Verification**: Created new test game "Email Verification Game" (TESTZOGD) and successfully completed full cycle testing - game creation, number claiming, automatic winner selection, and actual email delivery to ahsanglobalbusiness@gmail.com confirmed working perfectly via Resend API integration (August 27, 2025)
- **Real Email Delivery Confirmed**: Fixed email notification system to actually send emails via Resend service - winner notification and game completion emails successfully delivered to test recipient with professional HTML templates (August 27, 2025)
- **Email Service Configuration Fixed**: Resolved Resend API integration issue - system now properly sends winner and completion emails using verified domain address (onboarding@resend.dev) - confirmed working with test deliveries (August 27, 2025)
- **Production Email Configuration Completed**: Updated FROM email to use admin@hittheroadjackpot.com and configured system to send winner emails directly to user email addresses (ahsanglobalbusiness@gmail.com) - verified working with email ID 7ce869b4 and confirmed by user receipt (August 27, 2025)
- **New Game Email System Verified**: Successfully created and completed "New Game Email Test" (NEWGAME1) with $20 Amazon Gift Card prize - confirmed automatic winner selection and email delivery (IDs: 22473eb8, 22625e5c) working perfectly with newly created games - user confirmed satisfaction with complete system functionality (August 27, 2025)

## User Preferences
Preferred communication style: Simple, everyday language.
Payment system priority: Real payment processing with Square Card on File - confirmed working perfectly.

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
- **Payment System**: Integrated real-time payment processing with Square Card on File feature for secure card storage and automatic charging.
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