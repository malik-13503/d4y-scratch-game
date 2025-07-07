# Real-Time Prize Game Web Application

## Overview

This is a real-time prize game web application that allows users to participate in live wheel-spinning games to win prizes. The application features a modern, responsive design with fullscreen gameplay, real-time updates, and comprehensive admin management capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds
- **Component Library**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and express-session
- **Session Storage**: In-memory store with PostgreSQL option
- **API Design**: RESTful endpoints with proper error handling

### Database Architecture
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Comprehensive schema supporting games, players, results, and admin management
- **Migrations**: Drizzle Kit for database schema migrations

## Key Components

### Game System
- **Wheel Mechanics**: Professional spinning wheel with physics-based animations
- **Number System**: Configurable number ranges (1-200) with free play zones
- **Game Types**: Wheel-spin based games with customizable prizes
- **Real-time Updates**: Live player counts and game status updates

### User Interface
- **Responsive Design**: Fullscreen experience that scales across all devices
- **Professional Animations**: Smooth wheel spinning with easing and physics
- **Visual Effects**: Confetti, sound effects, and celebratory animations
- **Modern Components**: Clean, accessible UI components with consistent styling

### Admin Dashboard
- **Game Management**: Create, edit, and manage active games
- **Player Analytics**: Track participation and engagement metrics
- **System Settings**: Configure game parameters and application settings
- **Real-time Monitoring**: Live dashboard with game status and player activity

### Authentication & Security
- **Admin Authentication**: Secure login system with session management
- **Password Security**: Bcrypt-based password hashing
- **Session Management**: Secure session handling with configurable expiration
- **Role-based Access**: Admin-only areas with proper authorization

## Data Flow

1. **Game Creation**: Admins create games through the dashboard with prize configuration
2. **Player Participation**: Users browse active games and join by spinning the wheel
3. **Wheel Interaction**: Professional wheel component handles spin mechanics and result determination
4. **Result Processing**: Server validates results and determines winners
5. **Real-time Updates**: Game status and player counts update in real-time
6. **Prize Distribution**: Winners are notified and results are stored

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **passport**: Authentication middleware
- **drizzle-orm**: Type-safe database ORM
- **express-session**: Session management
- **tailwindcss**: Utility-first CSS framework

### Payment Integration (Planned)
- **@stripe/stripe-js**: Stripe payment processing
- **@stripe/react-stripe-js**: React Stripe components

### Communication (Planned)
- **@sendgrid/mail**: Email notifications

## Deployment Strategy

### Development Environment
- **Development Server**: Vite dev server with hot module replacement
- **Database**: Neon PostgreSQL database
- **Session Storage**: In-memory store for development

### Production Build
- **Frontend**: Vite build with static asset optimization
- **Backend**: esbuild bundling for Node.js deployment
- **Database**: Production PostgreSQL with connection pooling
- **Session Storage**: PostgreSQL-backed session store

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Secure session encryption key
- **NODE_ENV**: Environment mode (development/production)

## Changelog

- January 7, 2025: Enhanced homepage with professional casino-style design and responsive improvements
  - Transformed background with animated gradients, grid patterns, and floating particles
  - Enhanced header with glowing logo effects and animated status badges
  - Added hero section with large gradient title and feature highlights
  - Implemented responsive card grid layout (1/2/3 columns) for better content display
  - Redesigned game cards with dark theme, glow effects, and sparkle animations
  - Added live player counts and status indicators for engagement
  - Enhanced prize display with responsive sizing and proper mobile layout
  - Implemented professional progress bars and enhanced action buttons
  - Added comprehensive footer with company information and navigation
  - Created custom CSS animations for shimmer, glow, and gradient effects
  - Fixed prize value responsiveness with proper mobile truncation and sizing
- January 7, 2025: Replaced text logo with custom brand logo
  - Updated homepage header to display brand logo image
  - Added logo to admin dashboard header maintaining professional appearance
  - Integrated logo into game page header (hidden on mobile for space)
  - Enhanced brand consistency across all application pages
  - Logo displays at optimal sizes for different screen contexts
- January 2, 2025: Enhanced admin dashboard with eye-catching overview section
  - Removed live users and total spins from header
  - Added hero stats section with gradient animations
  - Created quick action cards for instant game management
  - Added comprehensive system status panel with health monitoring
  - Implemented advanced management features grid
  - Enhanced UI with professional color schemes and hover effects
- July 02, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.