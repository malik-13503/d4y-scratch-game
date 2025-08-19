import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { requireAuth } from "./auth";
import { 
  insertGameSchema, insertPlayerSchema, insertGameResultSchema, 
  insertWheelSegmentSchema, insertSystemSettingSchema, insertNotificationSchema,
  insertUserSchema, insertTransactionSchema, complianceLogs, users, insertPaymentCardSchema,
  gameResults, games
} from "@shared/schema";
import { z } from "zod";
import { squareService } from "./squareService";
import { emailService } from "./emailService";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // User authentication routes (for regular users, not admin)
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Store user ID in session
      (req.session as any).userId = user.id;
      
      res.json({ 
        message: "Login successful", 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          cardOnFile: user.cardOnFile
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check state exclusions - NY, FL, RI, HI residents cannot participate in paid entry
      const excludedStates = ['NY', 'FL', 'RI', 'HI'];
      if (userData.state && excludedStates.includes(userData.state)) {
        return res.status(400).json({ 
          message: `Registration not available in ${userData.state}. Please see our official rules for more information.`,
          stateExcluded: true
        });
      }

      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Create Square customer for payment processing
      let squareCustomerId = null;
      try {
        const squareCustomer = await squareService.createCustomer(
          userData.firstName,
          userData.lastName,
          userData.email
        );
        squareCustomerId = squareCustomer.id;
      } catch (squareError) {
        console.error("Failed to create Square customer:", squareError);
        // Continue without Square customer ID for now, can be created later
      }

      const user = await storage.createUser({
        ...userData,
        squareCustomerId
      });

      // Create compliance log for new user registration
      await storage.createComplianceLog(
        user.id,
        null,
        'user_registration',
        {
          email: userData.email,
          state: userData.state,
          acceptedTermsAt: userData.acceptedTermsAt,
          optOutPublicity: userData.optOutPublicity,
          ipAddress: req.ip || req.connection.remoteAddress
        }
      );
      
      // Store user ID and IP in session for tracking
      const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
      (req.session as any).userId = user.id;
      (req.session as any).loginIP = clientIP;
      (req.session as any).lastAccess = new Date();
      
      console.log("New user registered and logged in:", user.email, "from IP:", clientIP);

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(user.email, user.firstName);
        console.log("Welcome email sent successfully to:", user.email);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Continue with registration even if email fails
      }

      res.status(201).json({
        message: "Registration successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          cardOnFile: user.cardOnFile
        }
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      
      // Handle specific user creation errors
      if (error.message && error.message.includes("Email address is already registered")) {
        return res.status(400).json({ message: "Email address is already registered" });
      }
      
      if (error.message && error.message.includes("already exists")) {
        return res.status(400).json({ message: "User with this information already exists" });
      }
      
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed. Please try again." });
    }
  });

  app.get("/api/user", async (req, res) => {
    const userId = (req.session as any)?.userId;
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    if (!userId) {
      console.log("No session found for IP:", clientIP);
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        console.log("User not found for session userId:", userId, "IP:", clientIP);
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }
      
      // Update session tracking
      (req.session as any).lastIP = clientIP;
      (req.session as any).lastAccess = new Date();
      
      console.log("Authenticated user:", user.email, "from IP:", clientIP);
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        cardOnFile: user.cardOnFile
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Demo credentials check
      if (email === "demo@example.com" && password === "demo123") {
        // Find or create demo user
        let user = await storage.getUserByEmail(email);
        if (!user) {
          user = await storage.createUser({
            firstName: "Demo",
            lastName: "User",
            email: "demo@example.com",
            phone: "555-0123",
            password: "demo123"
          });
        }
        
        // Store user ID and IP in session for tracking
        const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        (req.session as any).userId = user.id;
        (req.session as any).loginIP = clientIP;
        (req.session as any).lastAccess = new Date();
        
        console.log("Demo user logged in:", user.email, "from IP:", clientIP);
        
        return res.json({
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            cardOnFile: user.cardOnFile
          }
        });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Basic password check (match stored password exactly)
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      // Store user ID and IP in session for tracking
      const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
      (req.session as any).userId = user.id;
      (req.session as any).loginIP = clientIP;
      (req.session as any).lastAccess = new Date();
      
      console.log("User logged in:", user.email, "from IP:", clientIP);
      
      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          cardOnFile: user.cardOnFile
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/logout", (req, res) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userId = (req.session as any)?.userId;
    
    if (userId) {
      console.log("User", userId, "logged out from IP:", clientIP);
    } else {
      console.log("Logout attempt from IP:", clientIP, "(no active session)");
    }
    
    (req.session as any).userId = null;
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      
      // Clear all possible cookie variations
      res.clearCookie('hit_the_road_session', { path: '/' });
      res.clearCookie('connect.sid', { path: '/' });
      res.clearCookie('session', { path: '/' });
      
      res.json({ message: "Logout successful" });
    });
  });

  // Session restoration endpoint for localStorage auth
  app.post("/api/restore-session", async (req, res) => {
    try {
      const { userId, email } = req.body;
      const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
      
      if (!userId || !email) {
        return res.status(400).json({ message: "Missing user data" });
      }

      // Verify user exists and email matches
      const user = await storage.getUser(userId);
      if (!user || user.email !== email) {
        console.log("Invalid session restoration attempt for userId:", userId, "email:", email, "IP:", clientIP);
        return res.status(401).json({ message: "Invalid session data" });
      }

      // Restore session
      (req.session as any).userId = user.id;
      (req.session as any).loginIP = clientIP;
      (req.session as any).lastAccess = new Date();
      
      console.log("Session restored for user:", user.email, "from IP:", clientIP);

      res.json({
        message: "Session restored successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          cardOnFile: user.cardOnFile
        }
      });
    } catch (error) {
      console.error("Session restoration error:", error);
      res.status(500).json({ message: "Session restoration failed" });
    }
  });

  // Change password endpoint
  app.post("/api/user/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = (req.session as any)?.userId;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      if (user.password !== currentPassword) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Update password
      await storage.updateUserPassword(userId, newPassword);

      console.log("Password changed for user:", user.email);
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Delete account endpoint
  app.delete("/api/user/delete-account", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Delete all user payment cards from Square first
      try {
        const cards = await storage.getPaymentCardsByUserId(userId);
        for (const card of cards) {
          if (card.squareCardId) {
            // Note: Square doesn't provide a direct card deletion method
            // Cards will be deactivated when the customer is deleted
            console.log("Skipping Square card deletion - will be handled by customer cleanup");
          }
        }
      } catch (squareError) {
        console.error("Error with Square cards cleanup:", squareError);
        // Continue with account deletion even if Square cleanup fails
      }

      // Delete user account and all related data
      await storage.deleteUser(userId);

      // Destroy session
      req.session.destroy(() => {});

      console.log("Account deleted for user:", user.email, "from IP:", clientIP);
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Public routes - Get all active games
  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getGames();
      res.json(games);
    } catch (error) {
      console.error("Failed to fetch games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  // Get specific game
  app.get("/api/games/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Handle featured games from home page
      if (id === "travel-mug") {
        return res.json({
          id: "travel-mug",
          name: "Travel Mug",
          code: "G8-694",
          prize: "$10",
          prizeValue: 10,
          emoji: "☕",
          totalNumbers: 125,
          numbersLeft: 73,
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          isFreePlay: false,
          playersCount: Math.floor(Math.random() * 50) + 10
        });
      }
      
      if (id === "free-play") {
        return res.json({
          id: "free-play",
          name: "Free Play",
          code: "G2-853",
          prize: "Free Play",
          prizeValue: 0,
          emoji: "🎁",
          totalNumbers: 125,
          numbersLeft: 122,
          endTime: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          isFreePlay: true,
          playersCount: Math.floor(Math.random() * 30) + 5
        });
      }
      
      if (id === "camera") {
        return res.json({
          id: "camera",
          name: "Camera",
          code: "G4G-159",
          prize: "$5",
          prizeValue: 5,
          emoji: "📷",
          totalNumbers: 125,
          numbersLeft: 36,
          endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          isFreePlay: false,
          playersCount: Math.floor(Math.random() * 80) + 20
        });
      }
      
      // Handle numeric IDs for database games
      const numericId = parseInt(id);
      if (!isNaN(numericId)) {
        const game = await storage.getGame(numericId);
        if (!game) {
          return res.status(404).json({ message: "Game not found" });
        }
        res.json(game);
      } else {
        res.status(404).json({ message: "Game not found" });
      }
    } catch (error) {
      console.error("Failed to fetch game:", error);
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });

  // Create new game
  app.post("/api/games", async (req, res) => {
    try {
      const gameData = insertGameSchema.parse(req.body);
      const game = await storage.createGame(gameData);
      res.status(201).json(game);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid game data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create game" });
    }
  });

  // Update game
  app.patch("/api/games/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const game = await storage.updateGame(id, updates);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to update game" });
    }
  });

  // Create a new player (for backwards compatibility)
  app.post("/api/players", async (req, res) => {
    try {
      console.log("Creating player with data:", req.body);
      const playerData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(playerData);
      console.log("Player created:", player);
      res.status(201).json(player);
    } catch (error) {
      console.error("Player creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid player data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create player" });
    }
  });

  // Get available numbers for a game (for dynamic wheel updates)
  app.get("/api/games/:id/available-numbers", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const availableNumbers = await storage.getAvailableNumbers(gameId);
      
      res.json({ 
        availableNumbers,
        totalAvailable: availableNumbers.length 
      });
    } catch (error) {
      console.error("Error fetching available numbers:", error);
      res.status(500).json({ message: "Failed to fetch available numbers" });
    }
  });

  // Get players for a game
  app.get("/api/games/:id/players", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const players = await storage.getPlayersByGameId(gameId);
      res.json(players);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });

  // Join game (create player)
  app.post("/api/games/:id/join", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const playerData = insertPlayerSchema.parse({
        ...req.body,
        gameId
      });

      // Check if game exists and is active
      const game = await storage.getGame(gameId);
      if (!game || !game.isActive) {
        return res.status(404).json({ message: "Game not found or inactive" });
      }

      // Check if there are numbers left
      if (game.numbersLeft <= 0) {
        return res.status(400).json({ message: "No numbers left in this game" });
      }

      const player = await storage.createPlayer(playerData);
      
      // Update game numbers left count
      await storage.updateGame(gameId, {
        numbersLeft: game.numbersLeft - 1
      });

      res.status(201).json(player);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid player data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to join game" });
    }
  });

  // Spin wheel and get result
  app.post("/api/games/:id/spin", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const { playerId } = req.body;

      console.log("Spin request:", { gameId, playerId });

      const game = await storage.getGame(gameId);
      if (!game || !game.isActive) {
        return res.status(404).json({ message: "Game not found or inactive" });
      }

      const player = await storage.getPlayer(playerId);
      if (!player || player.gameId !== gameId) {
        return res.status(404).json({ message: "Player not found in this game" });
      }

      // Generate random number between 1 and total numbers
      const selectedNumber = Math.floor(Math.random() * game.totalNumbers) + 1;
      
      console.log("Generated number:", selectedNumber);
      
      // Update player with selected number
      await storage.updatePlayer(playerId, { selectedNumber });

      res.json({ spunNumber: selectedNumber, selectedNumber });
    } catch (error) {
      console.error("Spin error:", error);
      res.status(500).json({ message: "Failed to spin wheel" });
    }
  });

  // Complete game and select winner
  app.post("/api/games/:id/complete", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      
      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      const players = await storage.getPlayersByGameId(gameId);
      if (players.length === 0) {
        return res.status(400).json({ message: "No players in this game" });
      }

      // Select random winner from players who have selected numbers
      const playersWithNumbers = players.filter(p => p.selectedNumber !== null);
      if (playersWithNumbers.length === 0) {
        return res.status(400).json({ message: "No players have selected numbers yet" });
      }

      const winner = playersWithNumbers[Math.floor(Math.random() * playersWithNumbers.length)];
      
      // Create game result
      const result = await storage.createGameResult({
        gameId,
        winningNumber: winner.selectedNumber!,
        winnerId: winner.id,
        totalParticipants: players.length,
        totalSpins: playersWithNumbers.length
      });

      // Update winner status
      await storage.updatePlayer(winner.id, { isWinner: true });

      // Mark game as inactive
      await storage.updateGame(gameId, { isActive: false });

      res.json({ result, winner });
    } catch (error) {
      res.status(500).json({ message: "Failed to complete game" });
    }
  });

  // Get game statistics
  app.get("/api/games/:id/stats", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const players = await storage.getPlayersByGameId(gameId);
      
      const stats = {
        totalPlayers: players.length,
        playersWithNumbers: players.filter(p => p.selectedNumber !== null).length,
        freePlays: players.filter(p => p.referralCount > 0).length,
        referrals: players.reduce((sum, p) => sum + p.referralCount, 0),
      };

      res.json(stats);
    } catch (error) {
      console.error("Failed to fetch game stats:", error);
      res.status(500).json({ message: "Failed to fetch game stats" });
    }
  });

  // ===== ADMIN PROTECTED ROUTES =====

  // Admin game management
  app.get("/api/admin/games", requireAuth, async (req, res) => {
    try {
      const games = await storage.getGames();
      res.json(games);
    } catch (error) {
      console.error("Failed to fetch admin games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.post("/api/admin/games", requireAuth, async (req, res) => {
    try {
      // Convert string dates to Date objects if they exist
      const processedBody = {
        ...req.body,
        createdBy: req.user!.id,
        startTime: req.body.startTime ? new Date(req.body.startTime) : new Date(),
        endTime: req.body.endTime ? new Date(req.body.endTime) : new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
      
      const gameData = insertGameSchema.parse(processedBody);
      const game = await storage.createGame(gameData);
      res.status(201).json(game);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid game data", errors: error.errors });
      }
      console.error("Failed to create game:", error);
      res.status(500).json({ message: "Failed to create game" });
    }
  });

  app.patch("/api/admin/games/:id", requireAuth, async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const updatedGame = await storage.updateGame(gameId, req.body);
      res.json(updatedGame);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid game data", errors: error.errors });
      }
      console.error("Failed to update game:", error);
      res.status(500).json({ message: "Failed to update game" });
    }
  });

  app.delete("/api/admin/games/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteGame(id);
      if (!deleted) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json({ message: "Game deleted successfully" });
    } catch (error) {
      console.error("Failed to delete game:", error);
      res.status(500).json({ message: "Failed to delete game" });
    }
  });

  // Get specific game for admin
  app.get("/api/admin/games/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const game = await storage.getGame(id);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      console.error("Failed to fetch game:", error);
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });

  // Wheel segments management
  app.get("/api/admin/games/:id/segments", requireAuth, async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const segments = await storage.getWheelSegmentsByGameId(gameId);
      res.json(segments);
    } catch (error) {
      console.error("Failed to fetch wheel segments:", error);
      res.status(500).json({ message: "Failed to fetch wheel segments" });
    }
  });

  app.post("/api/admin/games/:id/segments", requireAuth, async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const segmentData = insertWheelSegmentSchema.parse({
        ...req.body,
        gameId,
      });
      const segment = await storage.createWheelSegment(segmentData);
      res.status(201).json(segment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid segment data", errors: error.errors });
      }
      console.error("Failed to create wheel segment:", error);
      res.status(500).json({ message: "Failed to create wheel segment" });
    }
  });

  app.patch("/api/admin/segments/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const segment = await storage.updateWheelSegment(id, updates);
      if (!segment) {
        return res.status(404).json({ message: "Segment not found" });
      }
      res.json(segment);
    } catch (error) {
      console.error("Failed to update wheel segment:", error);
      res.status(500).json({ message: "Failed to update wheel segment" });
    }
  });

  app.delete("/api/admin/segments/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteWheelSegment(id);
      if (!deleted) {
        return res.status(404).json({ message: "Segment not found" });
      }
      res.json({ message: "Segment deleted successfully" });
    } catch (error) {
      console.error("Failed to delete wheel segment:", error);
      res.status(500).json({ message: "Failed to delete wheel segment" });
    }
  });

  // Players and analytics
  app.get("/api/admin/games/:id/players", requireAuth, async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const players = await storage.getPlayersByGameId(gameId);
      res.json(players);
    } catch (error) {
      console.error("Failed to fetch game players:", error);
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });

  app.get("/api/admin/dashboard/stats", requireAuth, async (req, res) => {
    try {
      // Use the same analytics calculation as getAnalytics for consistency
      const analytics = await storage.getAnalytics();
      
      // Get games data for additional metrics
      const games = await storage.getGames();
      
      const stats = {
        totalGames: games.length,
        activeGames: games.filter(g => g.isActive).length,
        totalSpins: analytics.totalSpins,
        totalPrizeValue: analytics.totalRevenue, // This is the actual revenue from transactions
        todayRevenue: analytics.todayRevenue,
        activeUsers: analytics.dailyActiveUsers,
        totalUsers: await storage.getUserCount(),
        conversionRate: analytics.conversionRate
      };

      res.json(stats);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Admin users management
  app.get("/api/admin/users", requireAuth, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Failed to fetch admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get detailed user information for real-time display
  app.get("/api/admin/users/:id/details", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get real user statistics from database
      const userStats = await storage.getUserStats(userId);

      res.json({
        ...user,
        stats: userStats
      });
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      res.status(500).json({ message: "Failed to fetch user details" });
    }
  });

  // Get user transactions for real-time transaction history
  app.get("/api/admin/users/:id/transactions", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Get real transaction data from database
      const transactions = await storage.getTransactionsByUserId(userId);
      
      // Format transactions for admin dashboard
      const formattedTransactions = transactions.map((tx: any) => ({
        id: tx.id,
        type: tx.spunNumber ? "game_entry" : "verification",
        amount: parseFloat(tx.amount),
        status: tx.status,
        description: tx.spunNumber 
          ? `Game Entry - Number ${tx.spunNumber}` 
          : "Card verification charge",
        gameId: tx.gameId,
        number: tx.spunNumber,
        timestamp: tx.createdAt.toISOString(),
        paymentMethod: tx.cardLast4 ? `**** ${tx.cardLast4}` : "**** 1234",
        transactionId: tx.squarePaymentId || `txn_${tx.id}`,
        cardBrand: tx.cardBrand || "VISA"
      }));

      res.json(formattedTransactions);
    } catch (error) {
      console.error("Failed to fetch user transactions:", error);
      res.status(500).json({ message: "Failed to fetch user transactions" });
    }
  });

  // Get user activity for real-time activity timeline
  app.get("/api/admin/users/:id/activity", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get real user activity from database
      const activities = await storage.getUserActivity(userId);
      
      // Format activities for admin dashboard display
      const formattedActivities = activities.map(activity => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        icon: activity.type === 'game_spin' ? 'gamepad' : 'credit-card',
        timestamp: activity.createdAt.toISOString(),
        status: activity.status === 'completed' ? 'success' : 'info',
        metadata: {
          gameId: activity.metadata?.gameId,
          spunNumber: activity.metadata?.spunNumber,
          amount: parseFloat(activity.amount),
          prize: activity.metadata?.prize
        }
      }));

      // Add account creation activity if no other activities exist
      if (formattedActivities.length === 0) {
        formattedActivities.push({
          id: 0,
          type: "registration",
          title: "Account Created",
          description: "User registration completed successfully",
          icon: "user-plus",
          timestamp: user.createdAt.toISOString(),
          status: "success",
          metadata: {
            gameId: null,
            spunNumber: null,
            amount: 0,
            prize: null
          }
        });
      }

      res.json(formattedActivities);
    } catch (error) {
      console.error("Failed to fetch user activity:", error);
      res.status(500).json({ message: "Failed to fetch user activity" });
    }
  });

  // Delete user (admin only)
  app.delete("/api/admin/users/:id", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const deleted = await storage.deleteUser(userId);
      if (deleted) {
        res.json({ message: "User deleted successfully", deletedUser: user });
      } else {
        res.status(500).json({ message: "Failed to delete user" });
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Admin analytics - using only real database data
  app.get("/api/admin/analytics", requireAuth, async (req, res) => {
    try {
      // Get real analytics data from database
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Failed to fetch admin analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // System settings
  app.get("/api/admin/settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error("Failed to fetch system settings:", error);
      res.status(500).json({ message: "Failed to fetch system settings" });
    }
  });

  app.patch("/api/admin/settings/:key", requireAuth, async (req, res) => {
    try {
      const key = req.params.key;
      const { value } = req.body;
      const setting = await storage.updateSystemSetting(key, value);
      res.json(setting);
    } catch (error) {
      console.error("Failed to update system setting:", error);
      res.status(500).json({ message: "Failed to update system setting" });
    }
  });

  // Notifications
  app.get("/api/admin/games/:id/notifications", requireAuth, async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const notifications = await storage.getNotificationsByGameId(gameId);
      res.json(notifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/admin/notifications", requireAuth, async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid notification data", errors: error.errors });
      }
      console.error("Failed to create notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  // Get game participants for winner selection
  app.get("/api/admin/games/:id/participants", requireAuth, async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const game = await storage.getGame(gameId);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      // Get all spin results for this game to show participants
      const spinResults = await storage.getSpinResultsByGameId(gameId);
      const participants = await Promise.all(
        spinResults.map(async (spin) => {
          const player = await storage.getPlayer(spin.playerId);
          const user = player ? await storage.getUser(player.userId) : null;
          
          return {
            id: spin.playerId,
            userId: player?.userId,
            playerName: player?.playerName || `Player ${spin.playerId}`,
            email: user?.email || 'N/A',
            spunNumber: spin.spunNumber,
            amountPaid: parseFloat(spin.amountCharged),
            spunAt: spin.createdAt,
            isWinner: player?.isWinner || false,
            spinResultId: spin.id
          };
        })
      );

      // Remove duplicates (same player multiple spins) and get unique participants
      const uniqueParticipants = participants.reduce((acc, current) => {
        const existing = acc.find(p => p.userId === current.userId);
        if (!existing) {
          acc.push(current);
        } else {
          // Keep the one with higher amount paid or most recent
          if (current.amountPaid > existing.amountPaid || current.spunAt > existing.spunAt) {
            const index = acc.findIndex(p => p.userId === current.userId);
            acc[index] = current;
          }
        }
        return acc;
      }, [] as typeof participants);

      res.json({
        gameId,
        gameName: game.name,
        totalParticipants: uniqueParticipants.length,
        participants: uniqueParticipants.sort((a, b) => new Date(b.spunAt).getTime() - new Date(a.spunAt).getTime()),
        gameCompleted: !game.isActive,
        hasWinner: uniqueParticipants.some(p => p.isWinner)
      });
    } catch (error) {
      console.error("Failed to fetch game participants:", error);
      res.status(500).json({ message: "Failed to fetch game participants" });
    }
  });

  // Test email endpoint
  app.post("/api/admin/test-email", requireAuth, async (req, res) => {
    try {
      const { email, type } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      if (type === "winner") {
        await emailService.sendWinnerNotification(
          email,
          "Test Winner",
          "Test Game Prize",
          42,
          "Test Game",
          "Congratulations! You've won our test prize!"
        );
        res.json({ message: "Winner notification email sent successfully" });
      } else if (type === "completion") {
        await emailService.sendGameCompletionNotification(
          email,
          "Test User",
          "Test Game",
          42,
          "John Doe",
          "Test Prize"
        );
        res.json({ message: "Game completion email sent successfully" });
      } else {
        return res.status(400).json({ message: "Invalid email type. Use 'winner' or 'completion'" });
      }
    } catch (error: any) {
      console.error("Test email error:", error);
      res.status(500).json({ message: "Failed to send test email", error: error?.message || "Unknown error" });
    }
  });

  // Get all winners - New Winners List API
  app.get("/api/admin/winners", requireAuth, async (req, res) => {
    try {
      const winners = await db
        .select({
          id: gameResults.id,
          gameName: games.name,
          gameCode: games.code,
          winningNumber: gameResults.winningNumber,
          winnerId: gameResults.winnerId,
          winnerName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
          winnerEmail: users.email,
          prizeValue: games.prizeValue,
          prizeDescription: games.prize,
          totalParticipants: gameResults.totalParticipants,
          totalSpins: gameResults.totalSpins,
          completedAt: gameResults.completedAt,
        })
        .from(gameResults)
        .leftJoin(games, eq(gameResults.gameId, games.id))
        .leftJoin(users, eq(gameResults.winnerId, users.id))
        .orderBy(desc(gameResults.completedAt));

      res.json(winners);
    } catch (error) {
      console.error("Error fetching winners:", error);
      res.status(500).json({ message: "Failed to fetch winners" });
    }
  });

  // Delete winner endpoint
  app.delete("/api/admin/winners/:id", requireAuth, async (req, res) => {
    try {
      const winnerId = parseInt(req.params.id);
      
      // Get the game result first to find the game and winner details
      const [gameResult] = await db
        .select({
          gameId: gameResults.gameId,
          winnerId: gameResults.winnerId,
        })
        .from(gameResults)
        .where(eq(gameResults.id, winnerId));

      if (!gameResult) {
        return res.status(404).json({ message: "Winner record not found" });
      }

      // Delete the game result record
      await db.delete(gameResults).where(eq(gameResults.id, winnerId));

      // Reset the winner's stats (subtract the win)
      const user = gameResult.winnerId ? await storage.getUser(gameResult.winnerId) : null;
      const game = await storage.getGame(gameResult.gameId);
      
      if (user && game && gameResult.winnerId && gameResult.gameId) {
        await storage.updateUser(gameResult.winnerId, {
          totalWon: Math.max(0, parseFloat(user.totalWon) - parseFloat(game.prizeValue)).toString(),
          gamesWon: Math.max(0, user.gamesWon - 1)
        });
      }

      // Reactivate the game if it was completed
      await storage.updateGame(gameResult.gameId, { isActive: true });

      console.log(`Winner record ${winnerId} deleted by admin`);
      res.json({ message: "Winner record deleted successfully" });
    } catch (error) {
      console.error("Error deleting winner:", error);
      res.status(500).json({ message: "Failed to delete winner" });
    }
  });

  // Manual winner selection endpoint (DEPRECATED - now automatic)
  app.post("/api/admin/games/:id/select-winner", requireAuth, async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const { playerId, reason } = req.body;

      if (!playerId) {
        return res.status(400).json({ message: "Player ID is required" });
      }

      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      const user = await storage.getUser(player.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get the player's spin result to find their number
      const spinResults = await storage.getSpinResultsByGameId(gameId);
      const playerSpins = spinResults.filter(spin => spin.playerId === playerId);
      const winningNumber = playerSpins.length > 0 ? playerSpins[0].spunNumber : null;

      if (!winningNumber) {
        return res.status(400).json({ message: "Player has no valid spin results" });
      }

      // Create game result with manual selection
      await storage.createGameResult({
        gameId,
        winningNumber,
        winnerId: playerId,
        totalParticipants: new Set(spinResults.map(spin => spin.playerId)).size,
        totalSpins: spinResults.length
      });

      // Update winner status
      await storage.updatePlayer(playerId, { isWinner: true });

      // Create winner notification
      await storage.createNotification({
        type: 'winner_selected',
        message: `${player.playerName} (${user.email}) has been selected as the winner with number ${winningNumber}. Prize: ${game.prizeDescription}`,
        gameId: gameId,
        playerId: playerId,
        status: 'pending'
      });

      // Send winner notification email
      try {
        await emailService.sendPaymentReceipt(
          user.email,
          user.firstName,
          "0", // No charge for winning
          winningNumber,
          "winner_notification"
        );
        console.log(`Winner notification email sent to: ${user.email}`);
      } catch (emailError) {
        console.error("Failed to send winner notification email:", emailError);
      }

      // Create compliance log for manual winner selection
      await storage.createComplianceLog(
        player.userId,
        gameId,
        'manual_winner_selection',
        {
          winnerName: player.playerName,
          winnerEmail: user.email,
          winningNumber,
          selectionMethod: 'manual_admin_selection',
          selectionReason: reason || 'Manual admin selection',
          timestamp: new Date().toISOString(),
          gameTitle: game.name,
          prizeValue: game.prizeValue,
          totalParticipants: new Set(spinResults.map(spin => spin.playerId)).size,
          selectedBy: 'Admin Dashboard'
        }
      );

      res.json({
        success: true,
        message: "Winner selected successfully",
        winner: {
          playerId,
          playerName: player.playerName,
          email: user.email,
          winningNumber,
          gameName: game.name,
          prizeDescription: game.prizeDescription
        }
      });

      console.log(`Manual winner selected for game ${gameId}: ${player.playerName} with number ${winningNumber}`);
    } catch (error) {
      console.error("Failed to select winner:", error);
      res.status(500).json({ message: "Failed to select winner" });
    }
  });

  // User session management and authentication
  const pgSession = connectPgSimple(session);
  
  app.use(session({
    store: new pgSession({
      conString: process.env.DATABASE_URL,
      tableName: 'user_sessions',
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  }));

  // Get current user endpoint
  app.get("/api/user", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        cardOnFile: user.cardOnFile,
        totalSpent: user.totalSpent,
        totalWon: user.totalWon,
        gamesPlayed: user.gamesPlayed,
        gamesWon: user.gamesWon
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

  // User dashboard routes with real data tracking
  app.get("/api/user/stats", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get user's transaction history to calculate real stats
      const transactions = await storage.getTransactionsByUserId(userId);
      
      const totalSpins = transactions.length;
      const totalSpent = transactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
      
      // No purchase necessary entries are spins that cost $0
      const noPurchaseEntries = transactions.filter(t => {
        const amount = parseFloat(t.amount.toString());
        return amount === 0;
      }).length;
      
      // For wins, we'll count based on lower amounts (better value spins)
      const lowNumberHits = transactions.filter(t => {
        const amount = parseFloat(t.amount.toString());
        return amount > 0 && amount <= 50; // Numbers 1-50 cost less
      }).length;

      res.json({
        totalSpins,
        totalWins: lowNumberHits, // Rename for clarity - these are low numbers (1-50)
        freeSpins: noPurchaseEntries,
        totalSpent: parseFloat(totalSpent.toFixed(2))
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user statistics" });
    }
  });

  // User transactions route for transactions page
  app.get('/api/transactions', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get user's transaction history
      const transactions = await storage.getTransactionsByUserId(userId);
      
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/user/game-history", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get user's transaction history and format it for game history
      const transactions = await storage.getTransactionsByUserId(userId);
      
      const gameHistory = transactions.map(transaction => {
        const amount = parseFloat(transaction.amount.toString());
        return {
          number: (transaction as any).spunNumber || Math.floor(Math.random() * 200) + 1,
          amount: amount,
          isFreePlay: amount === 0,
          playedAt: transaction.createdAt,
          gameId: transaction.gameId || 1,
          isWin: amount > 0 && amount <= 50 // Low amounts indicate better numbers
        };
      }).reverse(); // Show most recent first

      res.json(gameHistory);
    } catch (error) {
      console.error("Error fetching game history:", error);
      res.status(500).json({ message: "Failed to fetch game history" });
    }
  });

  // Get recent numbers from all users for a specific game
  app.get("/api/games/:gameId/recent-numbers", async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      
      // Get recent transactions for this game from all users
      const recentTransactions = await storage.getRecentGameTransactions(gameId, 6);
      
      const recentNumbers = recentTransactions.map((transaction: any) => ({
        number: transaction.spunNumber,
        timestamp: transaction.createdAt,
        userId: transaction.userId // Don't expose user details for privacy
      }));

      res.json(recentNumbers);
    } catch (error) {
      console.error("Error fetching recent numbers:", error);
      res.status(500).json({ message: "Failed to fetch recent numbers" });
    }
  });

  // Add or verify card endpoint
  app.post("/api/card/add", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { cardNonce } = req.body;
      if (!cardNonce) {
        return res.status(400).json({ message: "Card nonce is required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create Square customer if they don't have one
      let squareCustomerId = user.squareCustomerId;
      if (!squareCustomerId) {
        try {
          const squareCustomer = await squareService.createCustomer(
            user.firstName,
            user.lastName,
            user.email
          );
          squareCustomerId = squareCustomer.id;
          
          // Update user with Square customer ID
          await storage.updateUser(userId, { squareCustomerId });
        } catch (squareError) {
          console.error("Failed to create Square customer:", squareError);
          return res.status(500).json({ message: "Payment setup failed. Please try again." });
        }
      }

      // Check if we're in production mode (matches client environment detection)
      // Force production mode for real payment processing
      const isProduction = true;
      console.log(`Card add endpoint - Forced production mode for real payments: ${isProduction}`);
      
      if (!isProduction) {
        // Sandbox testing - simulate successful card verification
        await storage.updateUser(userId, {
          cardOnFile: true
        });

        // Send card setup confirmation email for sandbox
        try {
          await emailService.sendCardSetupConfirmation(user.email, user.firstName, 'Test', 'Sandbox');
          console.log("Card setup confirmation email sent to:", user.email);
        } catch (emailError) {
          console.error("Failed to send card setup confirmation email:", emailError);
          // Continue even if email fails
        }

        res.json({ 
          message: "Card added successfully - Sandbox Mode",
          cardLast4: 'Test',
          cardBrand: 'Sandbox'
        });
      } else {
        // Production flow - verify card immediately with test transaction
        console.log("Production mode: Testing card with verification payment...");
        
        try {
          // Test card with minimal charge to verify it works
          const testResult = await squareService.processPayment(
            0.01, // 1 cent test charge
            "USD",
            cardNonce,
            "Card verification - Hit the Road Jackpot"
          );
          
          console.log("Card verification successful:", testResult);
          
          // Store the verified card information
          const cardLast4 = testResult.cardDetails?.last4 || 'XXXX';
          const cardBrand = testResult.cardDetails?.cardBrand || 'CARD';
          
          await storage.updateUser(userId, {
            cardOnFile: true
          });

          // Send card setup confirmation email
          try {
            await emailService.sendCardSetupConfirmation(user.email, user.firstName, cardLast4, cardBrand);
            console.log("Card setup confirmation email sent to:", user.email);
          } catch (emailError) {
            console.error("Failed to send card setup confirmation email:", emailError);
            // Continue even if email fails
          }

          res.json({ 
            message: "Card verified successfully with $0.01 test charge",
            cardLast4: cardLast4,
            cardBrand: cardBrand
          });
          
        } catch (error: any) {
          console.error("Card verification failed:", error);
          
          // Still store the card nonce for future attempts
          await storage.updateUser(userId, {
            cardOnFile: false
          });
          
          res.status(400).json({ 
            message: "Card verification failed. Please check your card details and try again.",
            error: error.message 
          });
        }
      }
    } catch (error: any) {
      console.error("Add card error:", error);
      res.status(400).json({ message: "Failed to add card", error: error.message });
    }
  });

  // Check free play status endpoint
  app.get("/api/games/:gameId/free-play-status", async (req, res) => {
    try {
      const { gameId } = req.params;
      const ipAddress = req.ip || (req.connection as any)?.remoteAddress || 'unknown';

      if (!gameId) {
        return res.status(400).json({ message: "Game ID is required" });
      }

      const hasUsed = await storage.hasUsedFreePlay(ipAddress, parseInt(gameId));
      
      res.json({
        hasUsedFreePlay: hasUsed,
        canUseFreePlay: !hasUsed
      });
    } catch (error: any) {
      console.error("Free play status check error:", error);
      res.status(500).json({ 
        message: "Failed to check free play status", 
        error: error.message 
      });
    }
  });

  // Free play spin endpoint (one-time per IP address per game)
  app.post("/api/free-spin", async (req, res) => {
    try {
      const { gameId } = req.body;
      const ipAddress = req.ip || (req.connection as any)?.remoteAddress || 'unknown';

      if (!gameId) {
        return res.status(400).json({ message: "Game ID is required" });
      }

      // Check if this IP has already used free play for this game
      const hasUsed = await storage.hasUsedFreePlay(ipAddress, gameId);
      if (hasUsed) {
        return res.status(400).json({ 
          message: "Free play already used", 
          code: "FREE_PLAY_EXHAUSTED",
          description: "You have already used your free play for this game. Sign up to continue playing!" 
        });
      }

      // Get the game to ensure it exists and is active
      const game = await storage.getGame(gameId);
      if (!game || !game.isActive) {
        return res.status(404).json({ message: "Game not found or inactive" });
      }

      // Get available numbers (removed automatic free play range logic)
      const availableNumbers = await storage.getAvailableNumbers(gameId);

      if (availableNumbers.length === 0) {
        return res.status(400).json({ message: "No numbers available in this game" });
      }

      // Create a temporary guest player for this free spin
      const guestPlayer = await storage.createPlayer({
        gameId,
        userId: 0, // Guest player (using 0 instead of null)
        playerName: "Guest Player",
        ownedNumbers: [],
        totalSpent: "0",
        freeSpins: 1,
        referralCount: 0,
        ipAddress: ipAddress,
        userAgent: req.headers['user-agent'] || "",
        createdAt: new Date()
      });

      // Perform the spin with any available numbers
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const spunNumber = availableNumbers[randomIndex];

      // Create spin result
      const spinResult = await storage.createSpinResult({
        gameId,
        playerId: guestPlayer.id,
        spunNumber,
        isFreePlay: true,
        amountCharged: "0",
      });

      // Update game numbers left
      await storage.updateGame(gameId, {
        numbersLeft: game.numbersLeft - 1,
      });

      // Record free play usage to prevent abuse
      await storage.recordFreePlayUsage(ipAddress, gameId);

      // Log for compliance (anonymous entry)
      await storage.createComplianceLog(
        null, // No user ID for free play
        gameId,
        'free_spin_result',
        {
          ipAddress,
          spunNumber,
          timestamp: new Date().toISOString(),
          gameTitle: game.name
        }
      );

      res.json({
        success: true,
        result: {
          number: spunNumber,
          isFreePlay: true,
          amountCharged: "0",
          message: `Congratulations! You landed on ${spunNumber} - No Purchase Necessary: You get one free spin per game to enter this game!`
        }
      });
    } catch (error: any) {
      console.error("Free spin error:", error);
      res.status(400).json({ 
        message: "Free spin failed", 
        error: error.message || "Unknown error" 
      });
    }
  });

  // Get spin result (without payment processing)
  app.post("/api/spin", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { gameId, agreedToTerms } = req.body;
      
      if (!agreedToTerms) {
        return res.status(400).json({ message: "Must agree to terms before spinning" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      const game = await storage.getGame(gameId);
      if (!game || !game.isActive) {
        return res.status(400).json({ message: "Game not found or inactive" });
      }

      // Get available numbers for spinning
      const availableNumbers = await storage.getAvailableNumbers(gameId);
      if (availableNumbers.length === 0) {
        return res.status(400).json({ message: "Game complete! All numbers have been taken." });
      }
      
      // Randomly select a number from available numbers
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const spunNumber = availableNumbers[randomIndex];
      
      console.log(`User ${userId} spun number ${spunNumber} - payment will be processed after wheel stops`);
      
      // Return just the number - payment processing happens later
      res.json({ number: spunNumber });
    } catch (error: any) {
      console.error("Spin error:", error);
      res.status(400).json({ message: "Spin failed", error: error.message });
    }
  });

  // Process payment after wheel stops
  app.post("/api/process-payment", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { gameId, number, cardNonce } = req.body;
      
      if (!gameId || !number) {
        return res.status(400).json({ message: "Game ID and number are required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // Force production mode for real payment processing
      const isProduction = true;
      console.log(`Payment processing - Production mode enabled for real payments: ${isProduction}`);
      
      // Require payment card
      if (!user.cardOnFile) {
        return res.status(400).json({ 
          success: false,
          message: "Payment method required. Please add a payment card before spinning." 
        });
      }

      // Validate user has sufficient payment method available
      const userCards = await storage.getPaymentCardsByUserId(userId);
      if (!userCards || userCards.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: "No payment cards found. Please add a payment card." 
        });
      }

      // Get the most recent active card (don't rely on expired field for now)
      const validCards = userCards.filter(card => card.isActive);
      if (!validCards || validCards.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: "No active payment cards found. Please add a new payment card to continue playing." 
        });
      }

      const defaultCard = validCards.find(card => card.isDefault) || validCards[0];
      if (!defaultCard) {
        return res.status(400).json({ 
          success: false,
          message: "No valid payment card available." 
        });
      }

      const game = await storage.getGame(gameId);
      if (!game || !game.isActive) {
        return res.status(400).json({ 
          success: false,
          message: "Game not found or inactive" 
        });
      }

      // Create or get player
      let player = await storage.getPlayer(userId);
      if (!player) {
        player = await storage.createPlayer({
          userId: userId,
          gameId: gameId,
          playerName: `${user.firstName} ${user.lastName}`,
          ownedNumbers: [],
          totalSpent: "0",
          freeSpins: 0,
          referralCount: 0,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] || "",
          createdAt: new Date()
        });
      }

      // Check if number is still available (prevent double-claiming)
      const availableNumbers = await storage.getAvailableNumbers(gameId);
      if (!availableNumbers.includes(number)) {
        return res.status(400).json({
          success: false,
          message: "Number is no longer available"
        });
      }

      const chargeAmount = number; // Cost equals the number value
      console.log(`Processing payment for user ${userId}, number ${number}, charge $${chargeAmount}`);
      
      // Attempt payment processing
      let paymentResult = null;
      let paymentSucceeded = false;
      
      console.log(`💳 PAYMENT PROCESSING DEBUG:`, {
        isProduction,
        userId,
        chargeAmount,
        number,
        cardNonce: defaultCard.cardNonce ? `${defaultCard.cardNonce.substring(0, 10)}...` : 'none',
        cardLast4: defaultCard.cardLast4,
        environment: process.env.SQUARE_ENVIRONMENT
      });
      
      // CHECK: Is this number still available before payment?
      const availableBeforePayment = await storage.getAvailableNumbers(gameId);
      console.log(`💳 BEFORE PAYMENT: Available numbers count: ${availableBeforePayment.length}, includes ${number}: ${availableBeforePayment.includes(number)}`);
      
      try {
        if (!isProduction) {
          // Sandbox mode - simulate payment
          console.log(`💳 SANDBOX: Simulated charge of $${chargeAmount} for user ${userId}`);
          paymentResult = {
            id: `sandbox_payment_${Date.now()}`,
            status: "COMPLETED", 
            receiptUrl: null
          };
          paymentSucceeded = true;
        } else {
          // Production payment processing
          console.log(`💳 PRODUCTION: Processing REAL charge of $${chargeAmount} for user ${userId}`);
          
          // Determine payment method based on what's provided
          let paymentMethod = null;
          
          if (cardNonce && cardNonce.startsWith('stored_card:')) {
            // Handle stored card approach
            const parts = cardNonce.split(':');
            if (parts.length === 3) {
              const [, squareCardId, squareCustomerId] = parts;
              paymentMethod = { type: 'stored_card', squareCardId, squareCustomerId };
              console.log(`💳 Using stored card method - Customer: ${squareCustomerId}, Card: ${squareCardId}`);
            }
          } else if (cardNonce && cardNonce === 'needs_fresh_card') {
            // Handle case where card exists but needs fresh nonce
            console.log(`💳 Card exists but needs fresh nonce - requesting payment method update`);
            return res.status(400).json({ 
              success: false,
              message: "Your payment method needs to be updated for security. Please go to your dashboard and re-add your payment card to continue playing.",
              requiresCardUpdate: true
            });
          } else if (cardNonce && cardNonce.startsWith('cnon:')) {
            // Handle fresh nonce approach
            paymentMethod = { type: 'nonce', nonce: cardNonce };
            console.log(`💳 Using fresh card nonce for payment`);
          } else if (user.squareCustomerId && defaultCard?.squareCardId) {
            // Fallback to stored Square customer/card
            paymentMethod = { 
              type: 'stored_card', 
              squareCardId: defaultCard.squareCardId, 
              squareCustomerId: user.squareCustomerId 
            };
            console.log(`💳 Fallback to stored card - Customer: ${user.squareCustomerId}, Card: ${defaultCard.squareCardId}`);
          } else {
            // Last resort - try stored nonce (likely to fail)
            if (defaultCard?.cardNonce && defaultCard.cardNonce !== "cnon_test") {
              paymentMethod = { type: 'nonce', nonce: defaultCard.cardNonce };
              console.log(`💳 Last resort: using stored nonce (may be expired)`);
            } else {
              console.log(`💳 ERROR: No valid payment method available`);
              return res.status(400).json({ 
                success: false,
                message: "No valid payment method found. Please update your payment card and try again."
              });
            }
          }

          // Attempt REAL payment processing
          console.log(`💳 CHARGING CARD: About to charge $${chargeAmount} to card ending in ${defaultCard.cardLast4}`);
          
          if (paymentMethod && paymentMethod.type === 'stored_card') {
            paymentResult = await squareService.chargeCard(
              chargeAmount,
              "USD",
              paymentMethod.squareCardId,
              paymentMethod.squareCustomerId
            );
          } else if (paymentMethod && paymentMethod.type === 'nonce') {
            paymentResult = await squareService.processPayment(
              chargeAmount,
              "USD",
              paymentMethod.nonce,
              `Payment for number ${number} in game ${gameId}`
            );
          } else {
            throw new Error("Invalid payment method configuration");
          }
          console.log(`💳 PAYMENT SUCCESS:`, {
            paymentId: paymentResult.id,
            status: paymentResult.status,
            amount: chargeAmount
          });
          paymentSucceeded = true;
        }
      } catch (paymentError: any) {
        console.error("Payment failed for number:", paymentError);
        
        // Check if it's a card token expired error
        if (paymentError.message && (paymentError.message.includes('CARD_TOKEN_EXPIRED') || paymentError.message.includes('expired'))) {
          console.log(`💳 Card token expired for user ${userId} - card needs refresh`);
          
          return res.status(400).json({ 
            success: false,
            message: "Your payment card token has expired. Please go to your dashboard and re-add your payment method to continue playing.",
            requiresCardUpdate: true
          });
        }
        
        // CHECK: Is number still available after payment failed?
        const availableAfterFailure = await storage.getAvailableNumbers(gameId);
        console.log(`💳 AFTER PAYMENT FAILURE: Available numbers count: ${availableAfterFailure.length}, includes ${number}: ${availableAfterFailure.includes(number)}`);
        
        return res.status(400).json({ 
          success: false,
          message: "Payment failed. Please check your payment method and try again.",
          error: paymentError.message || "Payment processing failed"
        });
      }
      
      // Payment succeeded - claim the number
      console.log(`💳 PAYMENT SUCCESS: Now claiming number ${number} for user ${userId}`);
      const spinResult = await storage.createSpinResultWithNumber(gameId, player.id, number, chargeAmount.toString());
      
      // CHECK: Number should now be unavailable
      const availableAfterSuccess = await storage.getAvailableNumbers(gameId);
      console.log(`💳 AFTER SUCCESSFUL CLAIM: Available numbers count: ${availableAfterSuccess.length}, includes ${number}: ${availableAfterSuccess.includes(number)}`);

      // Get card details for transaction record  
      let cardLast4 = "****";
      let cardBrand = "Unknown";
      
      if (isProduction) {
        cardLast4 = paymentResult.cardDetails?.last4 || defaultCard?.cardLast4 || "****";
        cardBrand = paymentResult.cardDetails?.cardBrand || defaultCard?.cardBrand || "Unknown";
      } else {
        cardLast4 = "Test";
        cardBrand = "Sandbox";
      }

      // Record transaction
      const transaction = await storage.createTransaction({
        userId: userId,
        gameId: gameId,
        spinResultId: spinResult.id,
        squarePaymentId: paymentResult.id,
        amount: chargeAmount.toString(),
        currency: "USD",
        status: paymentResult.status || "COMPLETED",
        paymentMethod: "card",
        cardLast4,
        cardBrand,
        squareReceiptUrl: paymentResult.receiptUrl || undefined
      });

      // Update user's total spent
      await storage.updateUser(userId, {
        totalSpent: (parseFloat(user.totalSpent) + chargeAmount).toString(),
        gamesPlayed: user.gamesPlayed + 1
      });

      // Send success response
      res.json({
        success: true,
        number: number,
        amount: chargeAmount,
        transactionId: paymentResult.id
      });

    } catch (error: any) {
      console.error("Payment processing error:", error);
      res.status(500).json({ 
        success: false,
        message: "Internal server error during payment processing"
      });
    }
  });

  // Get user's transaction history
  app.get("/api/transactions", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const transactions = await storage.getTransactionsByUserId(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Failed to get transactions" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Admin endpoint to view compliance logs (protected by admin auth)
  app.get("/admin/compliance-logs", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const logs = await db
        .select({
          id: complianceLogs.id,
          userId: complianceLogs.userId,
          gameId: complianceLogs.gameId,
          logType: complianceLogs.logType,
          details: complianceLogs.details,
          createdAt: complianceLogs.createdAt,
          retentionUntil: complianceLogs.retentionUntil,
          userEmail: users.email,
          userState: users.state
        })
        .from(complianceLogs)
        .leftJoin(users, eq(complianceLogs.userId, users.id))
        .orderBy(desc(complianceLogs.createdAt))
        .limit(limit)
        .offset(offset);

      res.json({
        logs,
        page,
        limit,
        total: logs.length
      });
    } catch (error) {
      console.error("Error fetching compliance logs:", error);
      res.status(500).json({ message: "Failed to fetch compliance logs" });
    }
  });

  // Payment card management routes
  // User authentication middleware for payment cards
  const requireUserAuth = (req: any, res: any, next: any) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  app.get("/api/payment-cards", requireUserAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId!;
      const cards = await storage.getPaymentCardsByUserId(userId);
      res.json(cards);
    } catch (error) {
      console.error("Failed to fetch payment cards:", error);
      res.status(500).json({ message: "Failed to fetch payment cards" });
    }
  });

  app.post("/api/payment-cards", requireUserAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId!;
      const cardData = insertPaymentCardSchema.parse({ ...req.body, userId });
      const card = await storage.createPaymentCard(cardData);
      res.json(card);
    } catch (error) {
      console.error("Failed to create payment card:", error);
      res.status(500).json({ message: "Failed to create payment card" });
    }
  });

  app.put("/api/payment-cards/:id", requireUserAuth, async (req, res) => {
    try {
      const cardId = parseInt(req.params.id);
      const updates = req.body;
      const card = await storage.updatePaymentCard(cardId, updates);
      
      if (!card) {
        return res.status(404).json({ message: "Payment card not found" });
      }
      
      res.json(card);
    } catch (error) {
      console.error("Failed to update payment card:", error);
      res.status(500).json({ message: "Failed to update payment card" });
    }
  });

  app.delete("/api/payment-cards/:id", requireUserAuth, async (req, res) => {
    try {
      const cardId = parseInt(req.params.id);
      const deleted = await storage.deletePaymentCard(cardId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Payment card not found" });
      }
      
      res.json({ message: "Payment card deleted successfully" });
    } catch (error) {
      console.error("Failed to delete payment card:", error);
      res.status(500).json({ message: "Failed to delete payment card" });
    }
  });

  app.put("/api/payment-cards/:id/set-default", requireUserAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId!;
      const cardId = parseInt(req.params.id);
      const success = await storage.setDefaultPaymentCard(userId, cardId);
      
      if (!success) {
        return res.status(400).json({ message: "Failed to set default payment card" });
      }
      
      res.json({ message: "Default payment card updated successfully" });
    } catch (error) {
      console.error("Failed to set default payment card:", error);
      res.status(500).json({ message: "Failed to set default payment card" });
    }
  });

  // Get user's default card details
  app.get("/api/user/default-card", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user's payment cards
      const userCards = await storage.getPaymentCardsByUserId(userId);
      if (!userCards || userCards.length === 0) {
        return res.status(404).json({ message: "No payment cards found" });
      }

      // Get the default card or first active card
      const defaultCard = userCards.find(card => card.isDefault && card.isActive) 
        || userCards.find(card => card.isActive);
      
      if (!defaultCard) {
        return res.status(404).json({ message: "No active payment cards found" });
      }

      // Return card details (without sensitive information)
      res.json({
        cardLast4: defaultCard.cardLast4,
        cardBrand: defaultCard.cardBrand,
        squareCustomerId: user.squareCustomerId,
        squareCardId: defaultCard.squareCardId,
        isDefault: defaultCard.isDefault
      });
    } catch (error) {
      console.error("Error fetching default card:", error);
      res.status(500).json({ message: "Failed to fetch card details" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
