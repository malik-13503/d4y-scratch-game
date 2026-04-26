import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { AdminUser } from "@shared/schema";
import { hashPassword, comparePasswords } from "./utils";

declare module "express-session" {
  interface SessionData {
    userId?: number;
    passport?: {
      user?: any;
    };
  }
}

declare global {
  namespace Express {
    interface User extends AdminUser {}
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false, // Don't force session save if unmodified
    saveUninitialized: false, // Don't save uninitialized sessions for security
    store: storage.sessionStore,
    cookie: {
      secure: false, // Set to false for development
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for admin sessions
      sameSite: 'lax',
    },
    rolling: true, // Extend session on each request
    name: 'admin_session', // Unique session name for admin
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

          const user = await storage.getAdminUserByEmail(email);
          
          if (!user) {

            return done(null, false, { message: "Invalid credentials" });
          }
          
          if (!user.isActive) {
            console.log("User is inactive:", email);
            return done(null, false, { message: "Invalid credentials" });
          }

          const isValid = await comparePasswords(password, user.password);
          if (!isValid) {

            return done(null, false, { message: "Invalid credentials" });
          }


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

  passport.serializeUser((user, done) => {
    console.log("Serializing user:", user.id);
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log("Deserializing user ID:", id);
      const user = await storage.getAdminUser(id);
      if (user && user.isActive) {
        console.log("User found during deserialization:", user.email);
        done(null, user);
      } else {
        console.log("User not found or inactive during deserialization:", id);
        done(null, false);
      }
    } catch (error) {
      console.error("Deserialization error:", error);
      done(error, null);
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
        console.error("Login authentication error:", err);
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        console.log("Login failed - no user:", info?.message);
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      req.logIn(user, (err) => {
        if (err) {
          console.error("req.logIn error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        
        console.log("Login successful, session created:", {
          sessionID: req.sessionID,
          userID: user.id,
          isAuthenticated: req.isAuthenticated()
        });
        
        // Force save session
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            return res.status(500).json({ message: "Session save failed" });
          }
          
          // Don't return password
          const { password: _, ...userWithoutPassword } = user;
          res.json({ 
            message: "Login successful", 
            user: userWithoutPassword 
          });
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

  // Update admin profile (email, firstName, lastName)
  app.patch("/api/admin/update-profile", requireAuth, async (req, res) => {
    try {
      const { email, firstName, lastName } = req.body;
      const user = req.user!;

      // Check if email is already in use by another admin
      if (email && email !== user.email) {
        const existingUser = await storage.getAdminUserByEmail(email);
        if (existingUser && existingUser.id !== user.id) {
          return res.status(400).json({ message: "Email is already in use" });
        }
      }

      const updatedUser = await storage.updateAdminUser(user.id, {
        email: email || user.email,
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
      });

      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update profile" });
      }

      // Don't return password
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({ 
        message: "Profile updated successfully", 
        user: userWithoutPassword 
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Session debug route (for development)
  app.get("/api/admin/session-debug", (req, res) => {
    res.json({
      sessionID: req.sessionID,
      isAuthenticated: req.isAuthenticated(),
      hasUser: !!req.user,
      userID: req.user?.id,
      userEmail: req.user?.email,
      sessionExists: !!req.session,
      cookies: req.headers.cookie ? "present" : "missing",
      passport: req.session?.passport ? "present" : "missing",
      passportUser: req.session?.passport?.user,
      fullSession: req.session
    });
  });
}

// Middleware to require authentication  
export async function requireAuth(req: any, res: any, next: any) {
  
  // Check if user session exists and is valid (standard passport auth)
  if (req.isAuthenticated() && req.user && req.user.isActive) {
    req.session.touch();
    return next();
  }
  
  // Fallback check: if passport session exists but req.user is not populated
  if (req.session?.passport?.user) {
    console.log("Manual session check - user ID from session:", req.session.passport.user);
    try {
      // Try regular user first (for token purchase, game play, etc.)
      let user: any = await storage.getUser(req.session.passport.user);
      
      // If not a regular user, try admin user (for admin dashboard, etc.)
      if (!user) {
        user = await storage.getAdminUser(req.session.passport.user);
      }
      
      if (user && user.isActive) {
        req.user = user;
        console.log("Manual user population successful for user:", user.email);
        req.session.touch();
        return next();
      } else {
        console.log("Manual user population failed - user not found or inactive");
      }
    } catch (error) {
      console.error("Manual session check error:", error);
    }
  }
  
  console.log("Authentication failed - no valid session found");
  res.status(401).json({ message: "Authentication required" });
}

