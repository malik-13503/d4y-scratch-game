import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { AdminUser } from "@shared/schema";
import { hashPassword, comparePasswords } from "./utils";

declare global {
  namespace Express {
    interface User extends AdminUser {}
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: false, // Set to false for development
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for persistent sessions
      sameSite: 'lax',
    },
    rolling: true, // Extend session on each request
    name: 'hit_the_road_session', // Custom session name
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          console.log("Attempting login for email:", email);
          const user = await storage.getAdminUserByEmail(email);
          
          if (!user) {
            console.log("User not found:", email);
            return done(null, false, { message: "Invalid credentials" });
          }
          
          if (!user.isActive) {
            console.log("User is inactive:", email);
            return done(null, false, { message: "Invalid credentials" });
          }

          const isValid = await comparePasswords(password, user.password);
          if (!isValid) {
            console.log("Invalid password for user:", email);
            return done(null, false, { message: "Invalid credentials" });
          }

          console.log("Login successful for user:", email);
          // Update last login time
          await storage.updateAdminUser(user.id, { lastLoginAt: new Date() });
          
          return done(null, user);
        } catch (error) {
          console.error("Authentication error:", error);
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getAdminUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Admin registration route (protected - only for existing admins)
  app.post("/api/admin/register", requireAuth, async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      const existingUser = await storage.getAdminUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createAdminUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      // Don't return password
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Admin login route
  app.post("/api/admin/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: AdminUser | false, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        
        // Don't return password
        const { password: _, ...userWithoutPassword } = user;
        res.json({ 
          message: "Login successful", 
          user: userWithoutPassword 
        });
      });
    })(req, res, next);
  });

  // Admin logout route
  app.post("/api/admin/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Get current admin user
  app.get("/api/admin/me", requireAuth, (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Don't return password
    const { password: _, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // Alternative endpoint for dashboard compatibility
  app.get("/api/admin/user", requireAuth, (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Don't return password
    const { password: _, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // Change password
  app.patch("/api/admin/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = req.user!;

      const isValid = await comparePasswords(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateAdminUser(user.id, { password: hashedPassword });

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });
}

// Middleware to require authentication
export function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}

