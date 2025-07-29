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

- January 29, 2025: **PRODUCTION DEPLOYMENT PREPARATION** - Removed admin demo credentials for secure production deployment
  - **Admin Security Enhancement**: Removed "admin@example.com / admin123" default credentials from admin login page
  - **Production Ready Admin**: Admin login now requires proper credentials without exposed demo information
  - **Clean Admin Interface**: Streamlined admin login form without test credentials for public deployment
- January 29, 2025: **USER FLOW ENHANCEMENT COMPLETE** - Improved signup and login flow based on user requirements
  - **Signup Flow Change**: After signup, users see a beautiful success popup instead of automatic dashboard redirect
  - **Login Destination Update**: Users now redirect to games page after login instead of user dashboard
  - **Beautiful Signup Success Popup**: Created animated confirmation dialog with "Login Now" option and celebration effects
  - **Professional UX**: Popup includes user's name, animated icons, gradient backgrounds, and clear next steps
  - **Clean Separation**: Signup creates account without auto-login, requiring manual login for better security flow
- January 29, 2025: **EMAIL BRANDING ENHANCEMENT COMPLETE** - Updated all email templates with proper Hit The Road Jackpot branding
  - **Professional Sender Identity**: Changed FROM_EMAIL from "admin" to "Hit The Road Jackpot <admin@hittheroadjackpot.com>"
  - **Enhanced Email Subjects**: Updated all email subjects to be more descriptive and engaging:
    * Welcome Email: "🎉 Welcome to Hit The Road Jackpot - Start Your Gaming Adventure!"
    * Card Setup: "✅ Payment Card Successfully Added - Ready to Play!"
    * Payment Receipt: "🎯 Game Spin Receipt - Your Lucky Number Awaits!"
  - **Consistent Template Headers**: All email templates now display "Hit The Road Jackpot" prominently in headers
  - **Professional Footer Branding**: Updated all footers to show "Hit The Road Jackpot Team" consistently
  - **Enhanced Email Content**: Improved header descriptions to match email scenarios (Welcome, Payment Added, Game Receipt)
- January 29, 2025: **RESEND EMAIL SERVICE INTEGRATION COMPLETE** - Implemented comprehensive professional email notification system
  - **Professional Email Templates**: Beautiful HTML email templates with Hit The Road Jackpot branding and responsive design
  - **Welcome Email Automation**: Automatically sends branded welcome emails on user registration with account setup guidance
  - **Card Setup Confirmation**: Email notifications when users successfully add payment methods with card details
  - **Payment Receipt Emails**: Transaction receipts sent for all game spins with payment details and game numbers
  - **Spam-Resistant Design**: Professional email templates designed to avoid spam folders with proper formatting
  - **Error Handling**: Robust email error handling - application continues even if email delivery fails
  - **Production Ready**: Emails sent from admin@hittheroadjackpot.com using Resend API service
  - **Real-Time Countdown**: Added useCountdown hook and formatTimeRemaining utility for live time displays
  - **Mobile Payment Optimization**: Streamlined payment tab components for better mobile user experience
- January 29, 2025: **PRODUCTION PAYMENT SYSTEM FULLY OPERATIONAL** - Successfully deployed real-time payment processing with enhanced UI
  - **Production Square Payment Integration**: Successfully configured and tested real Square API payments with user's production Application ID
  - **Enhanced Payment UI**: Dramatically improved payment tab cards with professional glass morphism effects, gradient backgrounds, and animated elements
  - **Real-Time Card Processing**: Confirmed Square SDK initialization in production mode with actual card tokenization and verification
  - **Visual Enhancement Complete**: Payment cards now feature blue-to-cyan and purple-to-pink gradients with professional styling
  - **Environment Detection Working**: LIVE badge displays correctly, production mode active, real payment processing operational
  - **User Interface Polish**: Added gradient buttons, animated pulse indicators, enhanced shadows, and professional typography
- January 29, 2025: **PRODUCTION PAYMENT SYSTEM READY** - Configured real-time payment processing for production deployment
  - **Production Square API Integration**: Updated Square service to automatically switch between sandbox and production modes
  - **Environment Detection**: Added intelligent environment detection (NODE_ENV=production or SQUARE_ENVIRONMENT=production)
  - **Secure Credential Management**: Production keys stored securely in Replit Secrets (SQUARE_ACCESS_TOKEN_PRODUCTION, SQUARE_APPLICATION_ID_PRODUCTION)
  - **Production Payment Processing**: Real Square API calls for customer creation, card verification, and payment processing
  - **Deployment Ready**: Application now supports both sandbox testing and production real-money transactions
  - **Security Enhancements**: Production mode enforces card verification and real payment processing
  - **Eye-catching Delete Confirmation**: Replaced simple alerts with professional animated modal dialogs for game deletion
  - **TypeScript Fixes**: Resolved all LSP diagnostics and compilation errors for clean deployment
- January 24, 2025: **EDIT GAME DIALOG WITH LIVE PREVIEW COMPLETE** - Created comprehensive edit game dialog with exact admin games tab card preview
  - **Exact Admin Card Preview**: Edit dialog now shows exactly the same game card design as appears in the admin games tab
  - **Real-time Live Updates**: All form fields instantly update the preview card as user types
  - **Comprehensive Form**: Complete editing capability for name, emoji, description, prize value, and total numbers
  - **Scrollable Layout**: Both form section and preview section are independently scrollable for large content
  - **Professional Styling**: Consistent purple/blue gradient theme with proper spacing and responsive design
  - **Game Configuration Details**: Additional panel showing calculated free play ranges and game settings
  - **Authentic Data Integration**: Preview uses real form data and calculates actual game parameters
  - **Enhanced User Experience**: Split-screen layout with live preview eliminates guesswork in game creation
- January 24, 2025: **REAL DATABASE INTEGRATION COMPLETE** - Replaced all mock data with authentic database queries
  - **Fixed Mock Data Issue**: Eliminated all dummy/fake transaction data from admin user profiles
  - **Real Transaction Data**: User profile dialogs now display actual payment amounts, dates, and spin results from database
  - **Authentic Activity Timeline**: Activity tabs show real user transactions and game participation history
  - **Database-Driven Statistics**: User stats calculated from actual transaction records (total spent, spins, account age)
  - **Enhanced Email Validation**: Improved duplicate email prevention with better error handling at database and application levels
  - **TypeScript Fixes**: Resolved all compilation errors with proper type casting for database query results
  - **Storage Layer Enhancement**: Added getUserActivity() and getUserStats() methods for real-time admin dashboard data
  - **API Endpoint Updates**: Connected all admin endpoints to authentic database queries instead of mock data generation
  - **Error Handling Improvements**: Added PostgreSQL constraint violation handling with user-friendly error messages
- January 23, 2025: **ENHANCED EDIT GAME FUNCTIONALITY** - Created comprehensive edit game dialog with exact game card preview
  - **Interactive Edit Dialog**: Built complete edit functionality with real-time live preview showing exact game card appearance
  - **Authentic Game Card Preview**: Edit dialog displays exact same design that appears on games page for perfect accuracy
  - **Real-time Updates**: All form fields instantly update the preview (name, emoji, description, prize value, total numbers)
  - **Session Persistence Improvements**: Enhanced authentication middleware with better session handling and debug logging
  - **Accessibility Fixes**: Added proper DialogDescription components to fix accessibility warnings
  - **Form Validation**: Complete form handling with proper error states and loading indicators
  - **Update Mutation**: Full backend integration with PATCH endpoints for game updates
  - **Professional Styling**: Consistent purple/blue gradient theme with responsive grid layout
  - **Live Preview Features**: Shows game progress, free play ranges, paid ranges, and expected performance metrics
  - **Enhanced UX**: Scrollable dialog sections with proper form submission and error handling
- January 22, 2025: **RESPONSIVE FORMS OVERHAUL** - Created completely new responsive signup and login forms
  - **New ImprovedSignupForm Component**: Built from scratch with responsive grid layout (1 column mobile, 2 desktop)
  - **New ImprovedLoginForm Component**: Streamlined design with enhanced UX and proper responsive scaling
  - **Enhanced Field Design**: All inputs feature gradient backgrounds, proper icons, and smooth animations
  - **Password Visibility Toggles**: Eye/EyeOff icons for all password fields with proper accessibility
  - **Real-time Validation**: Immediate error clearing when users type, comprehensive field validation
  - **Professional Styling**: Consistent purple/blue gradient theme with backdrop blur effects
  - **Mobile-First Approach**: Forms scale perfectly from 320px mobile to ultra-wide desktop screens
  - **Better Error Handling**: Enhanced error messages with proper styling and user feedback
  - **Demo Credentials Display**: Built-in testing credentials for easier development workflow
  - **TypeScript Fixes**: Resolved all user type casting issues across auth components
  - **Responsive Tab Navigation**: Enhanced tab design with proper mobile and desktop layouts
- January 21, 2025: **CRITICAL FIXES** - Implemented real-time recent numbers and enhanced desktop responsiveness
  - **Real-Time Recent Numbers**: Recent numbers section now displays actual user spin results from live game data
  - **Live Data Integration**: Added `/api/games/:gameId/recent-numbers` endpoint with 5-second refresh intervals
  - **Desktop Prize Card Enhancement**: Significantly improved prize card scaling for large desktop screens (xl, 2xl breakpoints)
  - **Multi-Tier Responsive System**: Complete header redesign with 6-tier breakpoints for seamless cross-device experience
  - **Enhanced Typography Scaling**: Prize text scales from text-base to text-3xl for optimal desktop visibility
  - **Professional Spacing System**: Increased padding and spacing ratios for desktop screens with proper visual hierarchy
  - **Adaptive Component Sizing**: Icons, buttons, and containers scale proportionally across all screen sizes
  - **Text Overflow Protection**: Smart text handling prevents layout breaks with long game names and content
  - **Session Persistence**: localStorage authentication prioritized over server errors for seamless user experience
  - **Wheel Mechanics**: Fixed rotation reset timing for perfect consecutive spins with 8-second duration
  - **Cross-Device Optimization**: Headers scale perfectly from mobile (320px) to ultra-wide desktop (2560px+) screens
  - **Database Integration**: Connected recent numbers to actual transaction history with spun number tracking
- January 19, 2025: Enhanced games page header with professional eye-catching design and fixed authentication persistence
  - **Games Header Transformation**: Completely redesigned the main games page (/games) header with ultra-professional layout
  - **Eye-catching Visual Elements**: Added animated gradient backgrounds, floating orbs, and dynamic glow effects
  - **Mobile-First Responsive Design**: Multi-tier layout that scales perfectly from mobile to desktop
  - **Hero Section**: Large gradient title "HIT THE ROAD JACKPOT" with professional typography and visual effects
  - **Live Status Cards**: Three beautiful status cards (Live Games, Players Online, Win Big) with individual color themes
  - **Enhanced Branding**: Logo with animated glow effects and hover transformations
  - **Authentication Persistence Fixed**: Extended session duration from 24 hours to 7 days with rolling renewal
  - **Improved Error Handling**: Users stay logged in during temporary server issues with 5-minute grace period
  - **localStorage Integration**: Better sync between server sessions and local storage for seamless user experience
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
  - **My Numbers Page**: Created comprehensive page showing all user's played numbers with wins, charges, and free spins
  - **Navigation Enhancement**: Added "My Numbers" card to dashboard navigation and updated routing system
  - **Authentication Fix**: Implemented missing user authentication endpoints (/api/user, /api/login, /api/register, /api/logout)
  - **Session Management**: Added proper server-side session management for regular users (not just admin)
  - **localStorage Integration**: Fixed authentication persistence to work with server-side sessions
  - **Mobile Header Responsiveness**: Made dashboard header and user profile section fully responsive with proper mobile layout
  - **Eye-catching Design**: Enhanced user info badges with gradients, shadows, and proper mobile text sizes
  - **Cross-device Compatibility**: Optimized header layout to work perfectly on mobile, tablet, and desktop screens
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