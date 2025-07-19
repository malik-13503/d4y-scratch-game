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

- January 19, 2025: Enhanced user dashboard and created comprehensive user sections  
  - **Dashboard Improvements**: Fixed text visibility issues with white text colors and drop shadows for all stats
  - **Real-time Data**: Implemented real-time data updates every 5 seconds for live dashboard experience  
  - **Backend Integration**: Connected routes to track actual spin data from user transactions
  - **UI Enhancements**: Added refresh button, quick action cards, and live activity feed section
  - **Visual Design**: Enhanced with vibrant gradients, glow effects, and darker card backgrounds matching logo style
  - **Data Handling**: Fixed data type handling for transaction amounts (string to number conversion)
  - **Transactions Page**: Created comprehensive transaction history page showing payment details and spin results
  - **Achievements System**: Built complete achievement system with 9 achievements across 4 categories
  - **Navigation**: Added working navigation between Dashboard, Transactions, and Achievements pages
  - **Button Improvements**: Fixed button text visibility and enabled achievement tracking functionality
  - **Session Persistence**: Added localStorage authentication system to maintain login state after page refresh
  - **Text Visibility**: Fixed achievement text colors to white with drop shadows for better readability on dark backgrounds
- January 15, 2025: Implemented comprehensive authentication-first user experience
  - Created new branded authentication landing page as default homepage (/)
  - Moved games listing to /games route for authenticated users
  - Built complete user onboarding flow with Square payment integration
  - Added eye-catching branding with logo, gradients, and animated effects
  - Implemented user flow: Landing → Auth → Payment Setup → Games
  - Connected wheel spinning with payment processing and authentication checks
  - Updated routing to ensure users must authenticate before accessing games
- January 15, 2025: Fixed color schemes and readability across all informational pages
  - Applied consistent dark slate card backgrounds (bg-slate-800/90) for excellent contrast
  - Enhanced text visibility with improved gray color schemes (text-gray-200)
  - Fixed all inner card backgrounds from transparent black to solid slate with proper borders
  - Updated all button styles for consistent hover effects and proper colors
  - Added comprehensive CSS overrides for better text contrast and edge cases
  - Resolved all color scheme inconsistencies across 8 informational pages
  - Fixed professional button hover effects on game info page
  - Updated contact page containers to match consistent slate styling
  - All pages now have excellent readability while maintaining engaging design
- January 15, 2025: Enhanced all pages with better readability and created new informational pages
  - Fixed readability issues by using consistent dark theme across all pages
  - Added vibrant, eye-catching colors and interesting design elements
  - Created four new comprehensive pages with professional content and styling:
    * "Game Info" - Detailed information about how the game works and features
    * "Instant Play" - Information about no-download gaming and device compatibility
    * "Real Prizes" - Comprehensive prize information, categories, and delivery process
    * "Free Spins" - Details about free spin program, rules, and how to earn them
  - All pages feature unique color schemes while maintaining excellent readability
  - Enhanced animations, floating elements, and interactive visual effects
  - Updated footer navigation to link to all new pages
  - Consistent brand styling across all seven informational pages
- January 15, 2025: Created comprehensive legal and informational pages
  - Added "How to Play" page with step-by-step game instructions and pro tips
  - Created "Prize Rules" page with detailed pricing structure and policies
  - Built "Contact Us" page with contact form and support information
  - Developed "Terms & Conditions" page with complete legal terms
  - Added proper routing and navigation links in footer and throughout app
  - All pages feature professional design with consistent brand styling
  - Comprehensive content covering game rules, payment policies, and legal information
- January 8, 2025: Enhanced wheel with professional pointer and fixed rotating numbers
  - Created custom SVG wheel pointer with gradient colors and glow effects
  - Replaced basic CSS triangle pointer with professional PNG-style design
  - Fixed rotating numbers animation by using static number generation
  - Numbers now remain stationary on wheel segments during gameplay
  - Added proper pointer positioning and visual effects
  - Maintained wheel spinning animation while keeping numbers readable
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