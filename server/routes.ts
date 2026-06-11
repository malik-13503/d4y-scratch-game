import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { requireAuth } from "./auth";
import { 
  insertGameSchema, insertPlayerSchema, insertGameResultSchema, 
  insertWheelSegmentSchema, insertSystemSettingSchema, insertNotificationSchema,
  insertUserSchema, insertTransactionSchema, complianceLogs, users,
  gameResults, games, transactions, spinResults, players
} from "@shared/schema";
import { z } from "zod";
import { emailService } from "./emailService";
import { chargeCreditCard } from "./authorizeNetService";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return diffInSeconds <= 1 ? "just now" : `${diffInSeconds} seconds ago`;
  } else if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? "1 minute ago" : `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  } else {
    return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  }
}

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

      const user = await storage.createUser({
        ...userData,
      });

      // Grant 3 free welcome tokens to new users
      try {
        await storage.createTokenTransaction({
          userId: user.id,
          transactionType: 'bonus',
          amount: 3,
          description: 'Welcome bonus: 3 free tokens for new user',
          status: 'completed'
        });
        await storage.updateUserTokenBalance(user.id, 3);
        console.log(`✅ Granted 3 free welcome tokens to: ${user.email}`);
      } catch (tokenErr) {
        console.error("Failed to grant welcome tokens:", tokenErr);
      }

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
          endTime: new Date(Date.now() + 240 * 60 * 60 * 1000).toISOString(),
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
      const game = await storage.getGame(gameId);
      const availableNumbers = await storage.getAvailableNumbers(gameId);
      const totalNumbers = game?.totalNumbers || 0;
      const takenCount = totalNumbers - availableNumbers.length;
      const tokenCostPerEntry = game?.tokenCostPerEntry || 0;
      const tokensCollectedActual = takenCount * tokenCostPerEntry;
      
      res.json({ 
        availableNumbers,
        totalAvailable: availableNumbers.length,
        totalNumbers,
        takenCount,
        tokensCollectedActual,
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
      
      // Add real player counts for each game
      const gamesWithPlayerCounts = await Promise.all(
        games.map(async (game) => {
          const players = await storage.getPlayersByGameId(game.id);
          const uniquePlayers = new Set(players.map(p => p.userId)).size;
          
          
          return {
            ...game,
            playersCount: uniquePlayers
          };
        })
      );
      
      res.json(gamesWithPlayerCounts);
    } catch (error) {
      console.error("Failed to fetch admin games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.post("/api/admin/games", requireAuth, async (req, res) => {
    try {
      const durationHours = req.body.durationHours || 240; // Default to 240 hours if not specified
      const startTime = req.body.startTime ? new Date(req.body.startTime) : new Date();
      const endTime = req.body.endTime 
        ? new Date(req.body.endTime) 
        : new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

      // Convert string dates to Date objects if they exist
      // Derive tokenThreshold from targetRevenue (1 token = $1 of revenue)
      const targetRevenue = req.body.targetRevenue ? parseFloat(req.body.targetRevenue) : null;
      const tokenCostPerEntry = req.body.tokenCostPerEntry ? parseInt(req.body.tokenCostPerEntry) : 10;
      const tokenThreshold = targetRevenue ? Math.round(targetRevenue) : (req.body.tokenThreshold || 4000);

      const processedBody = {
        ...req.body,
        createdBy: req.user!.id,
        startTime: startTime,
        endTime: endTime,
        tokenCostPerEntry,
        tokenThreshold,
        targetRevenue: targetRevenue ? targetRevenue.toFixed(2) : "0",
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
        transactionId: `txn_${tx.id}`,
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

  app.post("/api/admin/users/:id/add-tokens", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { amount } = req.body;
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({ message: "Invalid token amount" });
      }
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      const updated = await storage.updateUserTokenBalance(userId, Number(amount));
      res.json({ message: `Added ${amount} tokens to ${user.email}`, newBalance: updated });
    } catch (error) {
      console.error("Add tokens error:", error);
      res.status(500).json({ message: "Failed to add tokens" });
    }
  });

  // Admin analytics - using only real database data
  // Admin activity feed - Real-time activity data
  app.get("/api/admin/activity", requireAuth, async (req, res) => {
    try {
      // Get recent user activities from transactions and spin results
      const activities = [];

      // Get recent transactions for payment activities
      const recentTransactions = await db
        .select({
          id: transactions.id,
          userId: transactions.userId,
          gameId: transactions.gameId,
          amount: transactions.amount,
          status: transactions.status,
          createdAt: transactions.createdAt
        })
        .from(transactions)
        .orderBy(desc(transactions.createdAt))
        .limit(10);

      // Get recent spin results for game activities
      const recentSpins = await db
        .select({
          id: spinResults.id,
          playerId: spinResults.playerId,
          gameId: spinResults.gameId,
          spunNumber: spinResults.spunNumber,
          amountCharged: spinResults.amountCharged,
          createdAt: spinResults.createdAt
        })
        .from(spinResults)
        .orderBy(desc(spinResults.createdAt))
        .limit(10);

      // Process transactions into activity items
      for (const transaction of recentTransactions) {
        const user = await storage.getUser(transaction.userId);
        const game = transaction.gameId ? await storage.getGame(transaction.gameId) : null;
        
        let actionText = "";
        let activityType = "payment";
        
        if (transaction.status === "COMPLETED") {
          actionText = `Paid $${transaction.amount} for ${game?.name || 'game'}`;
          activityType = "payment";
        } else if (transaction.status === "FAILED") {
          actionText = `Payment failed for ${game?.name || 'game'}`;
          activityType = "error";
        } else {
          actionText = `Transaction for ${game?.name || 'game'}`;
          activityType = "payment";
        }

        activities.push({
          id: `transaction-${transaction.id}`,
          user: user ? `${user.firstName} ${user.lastName}` : `Player #${transaction.userId}`,
          action: actionText,
          time: getTimeAgo(transaction.createdAt),
          type: activityType,
          timestamp: transaction.createdAt
        });
      }

      // Process spin results into activity items
      for (const spin of recentSpins) {
        const player = await storage.getPlayer(spin.playerId);
        const user = player ? await storage.getUser(player.userId) : null;
        const game = await storage.getGame(spin.gameId);
        
        activities.push({
          id: `spin-${spin.id}`,
          user: user ? `${user.firstName} ${user.lastName}` : `Player #${spin.playerId}`,
          action: `Spun number ${spin.spunNumber} in ${game?.name || 'game'}`,
          time: getTimeAgo(spin.createdAt),
          type: "spin",
          timestamp: spin.createdAt
        });
      }

      // Sort all activities by timestamp and return top 15
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 15);

      res.json(sortedActivities);
    } catch (error) {
      console.error("Failed to fetch admin activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

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
      const winners = await storage.getAllWinners();
      res.json(winners);
    } catch (error) {
      console.error("Error fetching winners:", error);
      res.status(500).json({ message: "Failed to fetch winners" });
    }
  });

  // Manually select winner for a game
  app.post("/api/admin/games/:gameId/select-winner", requireAuth, async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const { playerId, reason } = req.body;
      
      const game = await storage.getGame(gameId);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      // Check if game has participants
      const spinResults = await storage.getSpinResultsByGameId(gameId);
      if (spinResults.length === 0) {
        return res.status(400).json({ message: "Game has no participants yet" });
      }

      // Check if winner already selected
      const existingResult = await storage.getGameResult(gameId);
      if (existingResult) {
        return res.status(400).json({ message: "Winner already selected for this game" });
      }

      let winner;
      
      if (playerId) {
        // Manual winner selection - select specific player
        const selectedPlayer = await storage.getPlayer(playerId);
        if (!selectedPlayer) {
          return res.status(404).json({ message: "Selected player not found" });
        }
        
        // Verify player participated in this game
        const playerSpin = spinResults.find(spin => spin.playerId === playerId);
        if (!playerSpin) {
          return res.status(400).json({ message: "Selected player did not participate in this game" });
        }
        
        // Select this specific player as winner
        winner = await storage.selectSpecificWinner(gameId, playerId, reason || "Manual selection by admin");
      } else {
        // Automatic winner selection - select randomly from all participants
        winner = await storage.selectGameWinner(gameId);
      }
      
      if (!winner) {
        return res.status(500).json({ message: "Failed to select winner" });
      }

      // Send completion emails
      await storage.sendGameCompletionEmails(gameId);
      
      // Mark game as inactive since it's complete
      await storage.updateGame(gameId, { isActive: false });

      res.json({ 
        message: "Winner selected successfully",
        winner: {
          id: winner.id,
          playerName: winner.playerName,
          email: winner.email
        }
      });
    } catch (error) {
      console.error("Failed to select winner:", error);
      res.status(500).json({ message: "Failed to select winner" });
    }
  });

  // Get game participants for winner selection
  app.get("/api/admin/games/:gameId/participants", requireAuth, async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const game = await storage.getGame(gameId);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      // Get all spin results for the game
      const spinResults = await storage.getSpinResultsByGameId(gameId);
      
      // Check if game already has a winner
      const existingResult = await storage.getGameResult(gameId);
      const hasWinner = !!existingResult;

      // Build participant list with user information
      const participants = [];
      
      for (const spin of spinResults) {
        const player = await storage.getPlayer(spin.playerId);
        if (player) {
          const user = player.userId ? await storage.getUser(player.userId) : null;
          
          participants.push({
            id: player.id,
            userId: player.userId,
            playerName: player.playerName,
            email: user?.email || "No email",
            spunNumber: spin.spunNumber,
            amountPaid: spin.amountCharged,
            spunAt: spin.createdAt,
            isWinner: player.isWinner || false,
            spinResultId: spin.id
          });
        }
      }

      // Sort by spin date (most recent first)
      participants.sort((a, b) => new Date(b.spunAt).getTime() - new Date(a.spunAt).getTime());

      res.json({
        gameId,
        gameName: game.name,
        totalParticipants: participants.length,
        participants,
        gameCompleted: !game.isActive || hasWinner,
        hasWinner
      });
    } catch (error) {
      console.error("Failed to get game participants:", error);
      res.status(500).json({ message: "Failed to get game participants" });
    }
  });

  // Send winner emails manually
  app.post("/api/admin/send-winner-emails/:gameId", requireAuth, async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      
      // Get game and winner info
      const game = await storage.getGame(gameId);
      const gameResult = await storage.getGameResult(gameId);
      
      if (!game || !gameResult || !gameResult.winnerId) {
        return res.status(404).json({ message: "Game or result not found" });
      }
      
      const winner = await storage.getPlayer(gameResult.winnerId);
      if (!winner) {
        return res.status(404).json({ message: "Winner not found" });
      }
      
      const winnerUser = winner.userId ? await storage.getUser(winner.userId) : null;
      
      console.log(`Sending emails for ${game.name}:`);
      console.log(`Winner: ${winner.playerName} (${winnerUser?.email})`);
      
      // Send winner notification
      if (winnerUser?.email) {
        await emailService.sendWinnerNotification(
          winnerUser.email,
          winnerUser.firstName || winner.playerName,
          game.name,
          gameResult.winningNumber || 0,
          game.prizeValue.toString(),
          game.prizeDescription || ""
        );
        console.log(`✅ Winner notification sent to: ${winnerUser.email}`);
      }
      
      // Send completion notifications to all participants
      const spinResults = await storage.getSpinResultsByGameId(gameId);
      let participantEmailCount = 0;
      
      for (const spin of spinResults) {
        const player = await storage.getPlayer(spin.playerId);
        if (player && player.userId) {
          const user = await storage.getUser(player.userId);
          if (user?.email && user.email !== winnerUser?.email) {
            await emailService.sendGameCompletionNotification(
              user.email,
              user.firstName || player.playerName,
              game.name,
              gameResult.winningNumber || 0,
              winner.playerName,
              game.prizeDescription || ""
            );
            console.log(`✅ Completion notification sent to: ${user.email}`);
            participantEmailCount++;
          }
        }
      }
      
      res.json({ 
        message: "Emails sent successfully",
        winnerEmail: winnerUser?.email || "No email",
        participantEmails: participantEmailCount
      });
      
    } catch (error) {
      console.error("Failed to send winner emails:", error);
      res.status(500).json({ 
        message: "Failed to send emails", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
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

  // Send completion emails for an already completed game (for testing and retroactive emails)
  app.post("/api/admin/games/:id/send-completion-emails", requireAuth, async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      
      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      const gameResult = await storage.getGameResult(gameId);
      if (!gameResult) {
        return res.status(404).json({ message: "Game has no winner yet" });
      }

      // Send emails for this completed game
      await storage.sendGameCompletionEmails(gameId);
      
      res.json({ 
        message: "Completion emails sent successfully",
        gameId,
        gameName: game.name,
        winningNumber: gameResult.winningNumber
      });
    } catch (error) {
      console.error("Failed to send completion emails:", error);
      res.status(500).json({ message: "Failed to send completion emails" });
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

      // Send winner notification email to the winner
      try {
        await emailService.sendWinnerNotification(
          user.email,
          `${user.firstName} ${user.lastName}`,
          game.name,
          winningNumber,
          game.prizeValue?.toString() || "0",
          game.prizeDescription
        );
        console.log(`Winner notification email sent to: ${user.email}`);
      } catch (emailError) {
        console.error("Failed to send winner notification email:", emailError);
      }

      // Send winner announcement email to all participants
      try {
        // Get all participants who made spins in this game
        const allSpinResults = await storage.getSpinResultsByGameId(gameId);
        const participantIds = [...new Set(allSpinResults.map(spin => spin.playerId))];
        
        // Get participant details
        const participantEmails: Array<{email: string, name: string}> = [];
        for (const participantId of participantIds) {
          try {
            const participant = await storage.getPlayer(participantId);
            if (participant && participant.userId > 0) { // Skip guest players
              const participantUser = await storage.getUser(participant.userId);
              if (participantUser) {
                participantEmails.push({
                  email: participantUser.email,
                  name: `${participantUser.firstName} ${participantUser.lastName}`
                });
              }
            }
          } catch (err) {
            console.error(`Failed to get participant details for player ${participantId}:`, err);
          }
        }

        // Send announcement emails to all participants
        if (participantEmails.length > 0) {
          await emailService.sendGameWinnerAnnouncementToAllParticipants(
            game.name,
            `${user.firstName} ${user.lastName}`,
            winningNumber,
            game.prizeDescription,
            participantEmails
          );
          console.log(`Winner announcement emails sent to ${participantEmails.length} participants`);
        }
      } catch (emailError) {
        console.error("Failed to send winner announcement emails to participants:", emailError);
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

  // Session is already configured by setupAuth above - do not add a second session middleware

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

      const spinResultRows = await storage.getSpinResultsByUserId(userId);

      const gameHistory = spinResultRows.map(row => ({
        number: row.spunNumber,
        amount: parseFloat(row.amountCharged?.toString() || "0"),
        isFreePlay: row.isFreePlay,
        createdAt: row.createdAt,
        gameId: row.gameId,
        gameName: row.gameName || `Game #${row.gameId}`,
      }));

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

  // Payment cards stub - returns empty array (payment system being replaced)
  app.get("/api/payment-cards", async (req, res) => {
    res.json([]);
  });

  app.post("/api/card/add", async (req, res) => {
    res.status(503).json({ message: "Payment system is being updated. Please check back soon." });
  });

  app.post("/api/payment-cards", async (req, res) => {
    res.status(503).json({ message: "Payment system is being updated. Please check back soon." });
  });

  app.delete("/api/payment-cards/:cardId", async (req, res) => {
    res.status(503).json({ message: "Payment system is being updated." });
  });

  app.put("/api/payment-cards/:cardId/set-default", async (req, res) => {
    res.status(503).json({ message: "Payment system is being updated." });
  });

  // TOKEN PURCHASE SYSTEM ENDPOINTS

  // Get token packages/pricing endpoint
  app.get("/api/token-packages", async (req, res) => {
    try {
      const tokenPackages = [
        { id: "package_5",   name: "Starter Pack",     tokens: 10,   price: 5,   bonus: 0, popular: false, valueLabel: "$0.50 per token" },
        { id: "package_10",  name: "Player Pack",      tokens: 25,   price: 10,  bonus: 0, popular: false, valueLabel: "$0.40 per token" },
        { id: "package_20",  name: "Power Pack",       tokens: 60,   price: 20,  bonus: 0, popular: false, valueLabel: "$0.33 per token" },
        { id: "package_50",  name: "Winner Pack",      tokens: 175,  price: 50,  bonus: 0, popular: false, valueLabel: "$0.29 per token" },
        { id: "package_100", name: "VIP Pack",         tokens: 400,  price: 100, bonus: 0, popular: false, valueLabel: "$0.25 per token" },
        { id: "package_250", name: "High Roller Pack", tokens: 1200, price: 250, bonus: 0, popular: false, valueLabel: "$0.21 per token" },
        { id: "package_500", name: "Best Value Pack",  tokens: 3000, price: 500, bonus: 0, popular: true,  valueLabel: "$0.17 per token" },
      ];

      res.json(tokenPackages);
    } catch (error: any) {
      console.error("Get token packages error:", error);
      res.status(500).json({ message: "Failed to get token packages" });
    }
  });

  // Purchase tokens endpoint
  app.post("/api/purchase-tokens", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const { packageId, cardId } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (!packageId) {
        return res.status(400).json({ message: "Package ID is required" });
      }

      // Get token package details
      const packages = {
        "package_5":   { tokens: 5,   price: 5.00,   name: "Starter Pack" },
        "package_10":  { tokens: 12,  price: 10.00,  name: "Value Pack" },
        "package_20":  { tokens: 26,  price: 20.00,  name: "Super Pack" },
        "package_50":  { tokens: 70,  price: 50.00,  name: "Mega Pack" },
        "package_100": { tokens: 150, price: 100.00, name: "Ultimate Pack" }
      };

      const tokenPackage = packages[packageId as keyof typeof packages];
      if (!tokenPackage) {
        return res.status(400).json({ message: "Invalid package selected" });
      }

      // Get user and validate
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { opaqueDataDescriptor, opaqueDataValue } = req.body;
      if (!opaqueDataDescriptor || !opaqueDataValue) {
        return res.status(400).json({ message: "Payment data is required" });
      }

      // Charge the card via Authorize.net
      const chargeResult = await chargeCreditCard(
        opaqueDataDescriptor,
        opaqueDataValue,
        tokenPackage.price,
        `Prize Plugz: ${tokenPackage.name} (${tokenPackage.tokens} tokens)`,
        user.email
      );

      if (!chargeResult.success) {
        return res.status(400).json({
          success: false,
          message: chargeResult.message || "Payment declined. Please check your card and try again.",
        });
      }

      // Record the token transaction
      const tokenTransaction = await storage.createTokenTransaction({
        userId,
        transactionType: "purchase",
        amount: tokenPackage.tokens,
        dollarAmount: tokenPackage.price.toString(),
        description: `Purchased ${tokenPackage.name} (${tokenPackage.tokens} tokens) — txn ${chargeResult.transactionId}`,
        status: "completed",
      });

      // Credit tokens to user balance
      const updatedUser = await storage.updateUserTokenBalance(userId, tokenPackage.tokens);

      console.log(`✅ Token purchase: user ${user.email} bought ${tokenPackage.tokens} tokens for $${tokenPackage.price} | txn ${chargeResult.transactionId}`);

      res.json({
        success: true,
        message: `Successfully purchased ${tokenPackage.tokens} tokens!`,
        transaction: {
          id: tokenTransaction.id,
          tokens: tokenPackage.tokens,
          amount: tokenPackage.price,
          transactionId: chargeResult.transactionId,
        },
        newBalance: updatedUser?.tokenBalance || 0,
      });

    } catch (error: any) {
      console.error("Purchase tokens error:", error);
      res.status(500).json({ message: "Failed to purchase tokens", error: error.message });
    }
  });

  // Get user token balance endpoint
  app.get("/api/user/token-balance", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const balance = await storage.getUserTokenBalance(userId);
      res.json({ tokenBalance: balance });
    } catch (error: any) {
      console.error("Get token balance error:", error);
      res.status(500).json({ message: "Failed to get token balance" });
    }
  });

  // Get user token transaction history endpoint  
  app.get("/api/user/token-transactions", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const transactions = await storage.getTokenTransactionsByUserId(userId);
      
      // Format transactions for frontend
      const formattedTransactions = transactions.map(tx => ({
        id: tx.id,
        type: tx.transactionType,
        amount: tx.amount,
        dollarAmount: tx.dollarAmount ? parseFloat(tx.dollarAmount) : null,
        description: tx.description,
        status: tx.status,
        gameId: tx.gameId,
        createdAt: tx.createdAt
      }));

      res.json(formattedTransactions);
    } catch (error: any) {
      console.error("Get token transactions error:", error);
      res.status(500).json({ message: "Failed to get token transactions" });
    }
  });

  // Free play disabled
  app.get("/api/games/:gameId/free-play-status", (_req, res) => {
    res.json({ hasUsedFreePlay: true, canUseFreePlay: false });
  });

  app.post("/api/free-spin", (_req, res) => {
    return res.status(410).json({ message: "Free play is no longer available." });
  });

  // TOKEN-BASED SPIN SYSTEM: Check tokens, deduct, and claim number immediately
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

      // Get token cost for this game (from tokenCostPerEntry field)
      const tokenCost = game.tokenCostPerEntry || 5; // Default to 5 tokens if not set
      
      // Check user's token balance
      const userTokenBalance = await storage.getUserTokenBalance(userId);
      if (userTokenBalance < tokenCost) {
        return res.status(400).json({ 
          message: "Insufficient tokens",
          required: tokenCost,
          current: userTokenBalance,
          code: "INSUFFICIENT_TOKENS"
        });
      }

      // Randomly select a number from available numbers
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const spunNumber = availableNumbers[randomIndex];

      // UPFRONT TOKEN DEDUCTION: Deduct tokens immediately when spinning
      console.log(`Deducting ${tokenCost} tokens from user ${userId} for number ${spunNumber}`);
      
      try {
        await storage.deductUserTokens(userId, tokenCost);
      } catch (tokenError: any) {
        return res.status(400).json({
          message: tokenError.message || "Failed to deduct tokens",
          code: "TOKEN_DEDUCTION_FAILED"
        });
      }

      // Create or get player record (using same logic as process-payment)
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
          ipAddress: req.ip || 'unknown',
          userAgent: req.headers['user-agent'] || "",
          createdAt: new Date()
        });
      }

      // IMMEDIATE NUMBER CLAIMING: Create spin result and claim the number
      const spinResult = await storage.createSpinResultWithNumber(gameId, player.id, spunNumber, "0"); // $0 since using tokens
      
      // Record token transaction for the spin
      await storage.createTokenTransaction({
        userId,
        transactionType: 'spin',
        amount: -tokenCost, // Negative amount for deduction
        gameId: gameId,
        spinResultId: spinResult.id,
        description: `Used ${tokenCost} token(s) for number ${spunNumber} in ${game.name}`,
        status: 'completed'
      });

      // Add tokens to game's collection progress
      await storage.addTokensToGame(gameId, tokenCost);

      // Update user stats
      await storage.updateUser(userId, {
        totalSpent: (parseFloat(user.totalSpent || "0") + tokenCost).toString(),
        gamesPlayed: user.gamesPlayed + 1
      });

      // Get updated token balance for response
      const newTokenBalance = await storage.getUserTokenBalance(userId);

      // AUTO-CLOSE GAME: Check if token threshold reached OR all spots are taken
      const updatedGame = await storage.getGame(gameId);
      const remainingNumbers = await storage.getAvailableNumbers(gameId);
      let gameCompleted = false;
      const allSpotsTaken = remainingNumbers.length === 0;
      const thresholdReached = updatedGame && updatedGame.tokenThreshold > 0 &&
          updatedGame.tokensCollected >= updatedGame.tokenThreshold;
      if (allSpotsTaken || thresholdReached) {
        console.log(`🏁 Game "${game.name}" complete (spots taken: ${allSpotsTaken}, threshold: ${thresholdReached})! Auto-closing...`);
        await storage.updateGame(gameId, { isActive: false });
        gameCompleted = true;

        // Trigger automatic winner selection using fair per-number random draw
        try {
          // selectGameWinner picks a random number from all spin_results (each number = equal chance),
          // creates the game result record, and marks the winner player.
          const winner = await storage.selectGameWinner(gameId);
          if (winner) {
            console.log(`🏆 Winner selected for "${game.name}": Player ${winner.id} (number ${winner.selectedNumber})`);
            // Send winner and completion emails to all participants
            try {
              await storage.sendGameCompletionEmails(gameId);
            } catch (emailErr) {
              console.error("Auto-close winner email error:", emailErr);
            }
          } else {
            console.error(`No winner could be selected for game ${gameId} — no spin results found`);
          }
        } catch (winnerErr) {
          console.error("Auto-close winner selection error:", winnerErr);
        }
      }

      console.log(`✅ Token-based spin completed: User ${userId} claimed number ${spunNumber} using ${tokenCost} tokens`);
      
      // Return success with token information
      res.json({ 
        number: spunNumber,
        tokensUsed: tokenCost,
        newTokenBalance: newTokenBalance,
        gameCompleted,
        success: true
      });

    } catch (error: any) {
      console.error("Token-based spin error:", error);
      res.status(400).json({ message: "Spin failed", error: error.message });
    }
  });

  // DEPRECATED: Process payment after wheel stops (REPLACED BY TOKEN SYSTEM)
  app.post("/api/process-payment", async (req, res) => {
    // TOKEN SYSTEM MIGRATION: This endpoint is no longer used since tokens are deducted upfront in /api/spin
    console.log("⚠️ DEPRECATED: /api/process-payment called - token system handles payment in /api/spin");
    
    return res.status(400).json({ 
      success: false,
      message: "Payment processing has been replaced by the token system. Tokens are deducted when spinning.",
      deprecated: true,
      migrationInfo: "Use the token purchase system to buy tokens, then spin to consume them."
    });
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

  // Get user's default card details (stub - payment system being replaced)
  app.get("/api/user/default-card", async (req, res) => {
    res.status(404).json({ message: "No payment cards configured" });
  });

  // ── Daily Token Claim ────────────────────────────────────────────────────

  app.get("/api/user/daily-token-status", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });

      const lastClaim = await storage.getLastDailyTokenClaim(userId);
      if (!lastClaim) return res.json({ canClaim: true, nextClaimAt: null });

      const now = new Date();
      const nextClaimAt = new Date(lastClaim.claimedAt.getTime() + 24 * 60 * 60 * 1000);
      const canClaim = now >= nextClaimAt;

      res.json({
        canClaim,
        nextClaimAt: canClaim ? null : nextClaimAt.toISOString(),
        lastClaimedAt: lastClaim.claimedAt.toISOString(),
      });
    } catch (error) {
      console.error("Daily token status error:", error);
      res.status(500).json({ message: "Failed to check daily token status" });
    }
  });

  app.post("/api/user/claim-daily-tokens", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });

      const lastClaim = await storage.getLastDailyTokenClaim(userId);
      if (lastClaim) {
        const nextClaimAt = new Date(lastClaim.claimedAt.getTime() + 24 * 60 * 60 * 1000);
        if (new Date() < nextClaimAt) {
          return res.status(400).json({
            message: "Daily tokens already claimed",
            nextClaimAt: nextClaimAt.toISOString(),
          });
        }
      }

      const DAILY_TOKENS = 3;
      await storage.updateUserTokenBalance(userId, DAILY_TOKENS);
      await storage.createDailyTokenClaim(userId);
      await storage.createTokenTransaction({
        userId,
        transactionType: "bonus",
        amount: DAILY_TOKENS,
        description: "Daily free tokens",
        status: "completed",
      });

      const newBalance = await storage.getUserTokenBalance(userId);
      res.json({ message: "Daily tokens claimed!", tokensAdded: DAILY_TOKENS, newBalance });
    } catch (error) {
      console.error("Claim daily tokens error:", error);
      res.status(500).json({ message: "Failed to claim daily tokens" });
    }
  });

  // ── Promo Code Redemption (user) ────────────────────────────────────────

  app.post("/api/user/redeem-promo", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });

      const { code } = req.body;
      if (!code) return res.status(400).json({ message: "Promo code required" });

      const promoCode = await storage.getPromoCodeByCode(code);
      if (!promoCode || !promoCode.isActive) {
        return res.status(404).json({ message: "Invalid or inactive promo code" });
      }

      if (promoCode.expiresAt && new Date() > new Date(promoCode.expiresAt)) {
        return res.status(400).json({ message: "Promo code has expired" });
      }

      const alreadyRedeemed = await storage.hasUserRedeemedPromoCode(userId, promoCode.id);
      if (alreadyRedeemed) {
        return res.status(400).json({ message: "Promo code already redeemed" });
      }

      await storage.updateUserTokenBalance(userId, promoCode.tokenAmount);
      await storage.createPromoCodeRedemption(userId, promoCode.id);
      await storage.incrementPromoCodeUses(promoCode.id);
      await storage.createTokenTransaction({
        userId,
        transactionType: "bonus",
        amount: promoCode.tokenAmount,
        description: `Promo code: ${promoCode.code}`,
        status: "completed",
      });

      const newBalance = await storage.getUserTokenBalance(userId);
      res.json({
        message: `${promoCode.tokenAmount} tokens added to your account!`,
        tokensAdded: promoCode.tokenAmount,
        newBalance,
      });
    } catch (error) {
      console.error("Redeem promo error:", error);
      res.status(500).json({ message: "Failed to redeem promo code" });
    }
  });

  // ── Admin Promo Code Management ─────────────────────────────────────────

  app.get("/api/admin/promo-codes", requireAuth, async (req, res) => {
    try {
      const codes = await storage.getPromoCodes();
      res.json(codes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch promo codes" });
    }
  });

  app.post("/api/admin/promo-codes", requireAuth, async (req, res) => {
    try {
      const { code, tokenAmount, description, expiresAt, maxUses } = req.body;
      if (!code || !tokenAmount) {
        return res.status(400).json({ message: "Code and token amount required" });
      }
      const created = await storage.createPromoCode({
        code,
        tokenAmount: parseInt(tokenAmount),
        description: description || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        isActive: true,
      });
      res.status(201).json(created);
    } catch (error: any) {
      if (error.code === "23505") return res.status(400).json({ message: "Promo code already exists" });
      res.status(500).json({ message: "Failed to create promo code" });
    }
  });

  app.patch("/api/admin/promo-codes/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updatePromoCode(id, req.body);
      if (!updated) return res.status(404).json({ message: "Promo code not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update promo code" });
    }
  });

  app.delete("/api/admin/promo-codes/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePromoCode(id);
      if (!deleted) return res.status(404).json({ message: "Promo code not found" });
      res.json({ message: "Promo code deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete promo code" });
    }
  });

  // ─── WALLET / PENDING PAYMENTS ────────────────────────────────────────────

  // Credit packages (static, no DB needed for MVP)
  const CREDIT_PACKAGES = [
    { id: 1, dollars: 5,   credits: 10   },
    { id: 2, dollars: 10,  credits: 25   },
    { id: 3, dollars: 20,  credits: 60   },
    { id: 4, dollars: 50,  credits: 175  },
    { id: 5, dollars: 100, credits: 400  },
    { id: 6, dollars: 250, credits: 1200 },
    { id: 7, dollars: 500, credits: 3000 },
  ];

  // Default payment destinations (used as fallbacks if not set in DB)
  const DEFAULT_DESTINATIONS: Record<string, { label: string; defaultDest: string; hint: string }> = {
    cashapp:  { label: "Cash App",       defaultDest: "$m2mm",             hint: "Send via Cash App"      },
    venmo:    { label: "Venmo",          defaultDest: "@Daveon-Mcgary",    hint: "Send via Venmo"         },
    chime:    { label: "Chime",          defaultDest: "740-802-4646",      hint: "Send via Chime"         },
    applepay: { label: "Apple Pay/Cash", defaultDest: "+1 (740) 262-3121", hint: "Send via Apple Pay"     },
  };

  async function getPaymentDestinations() {
    const result: Record<string, { label: string; destination: string; hint: string }> = {};
    for (const [id, meta] of Object.entries(DEFAULT_DESTINATIONS)) {
      const setting = await storage.getSystemSetting(`payment_${id}`);
      result[id] = { label: meta.label, destination: setting?.value ?? meta.defaultDest, hint: meta.hint };
    }
    return result;
  }

  app.get("/api/wallet/packages", (req, res) => {
    res.json(CREDIT_PACKAGES);
  });

  app.get("/api/wallet/destinations", async (req, res) => {
    try {
      res.json(await getPaymentDestinations());
    } catch (err) {
      console.error("Failed to fetch payment destinations:", err);
      res.status(500).json({ message: "Failed to fetch payment destinations" });
    }
  });

  // Admin: update payment account destinations
  app.patch("/api/admin/payment-destinations", requireAuth, async (req, res) => {
    try {
      const { cashapp, venmo, chime, applepay } = req.body;
      const updates: Record<string, string> = {};
      if (cashapp  !== undefined) { await storage.upsertSystemSetting("payment_cashapp",  cashapp,  "Cash App destination"); updates.cashapp = cashapp; }
      if (venmo    !== undefined) { await storage.upsertSystemSetting("payment_venmo",    venmo,    "Venmo destination");    updates.venmo   = venmo;   }
      if (chime    !== undefined) { await storage.upsertSystemSetting("payment_chime",    chime,    "Chime destination");    updates.chime   = chime;   }
      if (applepay !== undefined) { await storage.upsertSystemSetting("payment_applepay", applepay, "Apple Pay destination"); updates.applepay = applepay; }
      res.json({ message: "Payment destinations updated", updated: updates });
    } catch (err) {
      console.error("Failed to update payment destinations:", err);
      res.status(500).json({ message: "Failed to update payment destinations" });
    }
  });

  // Admin: get current payment destinations
  app.get("/api/admin/payment-destinations", requireAuth, async (req, res) => {
    try {
      res.json(await getPaymentDestinations());
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch payment destinations" });
    }
  });

  // User submits payment for review
  app.post("/api/wallet/submit-payment", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const { dollarAmount, creditsAmount, paymentMethod, paymentName, paymentHandle } = req.body;
    if (!dollarAmount || !creditsAmount || !paymentMethod || !paymentName || !paymentHandle) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const validMethods = ["cashapp", "venmo", "chime", "applepay"];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }
    // Validate amount/credits match a known package
    const pkg = CREDIT_PACKAGES.find(p => p.dollars === Number(dollarAmount) && p.credits === Number(creditsAmount));
    if (!pkg) return res.status(400).json({ message: "Invalid package selection" });

    try {
      const payment = await storage.createPendingPayment({
        userId,
        dollarAmount: String(dollarAmount),
        creditsAmount: Number(creditsAmount),
        paymentMethod,
        paymentName: paymentName.trim(),
        paymentHandle: paymentHandle.trim(),
      });
      res.status(201).json(payment);
    } catch (err) {
      res.status(500).json({ message: "Failed to submit payment" });
    }
  });

  // User wallet info (balance + recent pending payments)
  app.get("/api/wallet", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    try {
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      const payments = await storage.getPendingPaymentsByUserId(userId);
      const transactions = await storage.getTokenTransactionsByUserId(userId);
      res.json({
        balance: user.tokenBalance,
        payments,
        transactions: transactions.slice(0, 50),
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to load wallet" });
    }
  });

  // ─── ADMIN: Pending Payments ──────────────────────────────────────────────

  app.get("/api/admin/pending-payments", requireAuth, async (req, res) => {
    try {
      const { status, paymentMethod } = req.query as Record<string, string>;
      const payments = await storage.getPendingPayments({
        status: status || undefined,
        paymentMethod: paymentMethod || undefined,
      });
      res.json(payments);
    } catch (err) {
      res.status(500).json({ message: "Failed to load pending payments" });
    }
  });

  app.post("/api/admin/pending-payments/:id/approve", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const payment = await storage.getPendingPayment(id);
      if (!payment) return res.status(404).json({ message: "Payment not found" });
      if (payment.status !== "pending") return res.status(400).json({ message: "Payment already processed" });

      const adminUser = (req as any).adminUser;

      // Add credits to user
      await storage.updateUserTokenBalance(payment.userId, payment.creditsAmount);

      // Create token transaction record
      await storage.createTokenTransaction({
        userId: payment.userId,
        transactionType: "purchase",
        amount: payment.creditsAmount,
        dollarAmount: payment.dollarAmount,
        description: `Tokens purchased via ${payment.paymentMethod} — Payment #${id} approved`,
        status: "completed",
      });

      // Mark payment approved
      const updated = await storage.updatePendingPayment(id, {
        status: "approved",
        processedAt: new Date(),
        processedByAdminId: adminUser?.id || null,
        notes: req.body.notes || null,
      });

      res.json({ success: true, payment: updated });
    } catch (err) {
      console.error("Approve payment error:", err);
      res.status(500).json({ message: "Failed to approve payment" });
    }
  });

  app.post("/api/admin/pending-payments/:id/reject", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const payment = await storage.getPendingPayment(id);
      if (!payment) return res.status(404).json({ message: "Payment not found" });
      if (payment.status !== "pending") return res.status(400).json({ message: "Payment already processed" });

      const adminUser = (req as any).adminUser;
      const updated = await storage.updatePendingPayment(id, {
        status: "rejected",
        processedAt: new Date(),
        processedByAdminId: adminUser?.id || null,
        notes: req.body.notes || "Rejected by staff",
      });

      res.json({ success: true, payment: updated });
    } catch (err) {
      res.status(500).json({ message: "Failed to reject payment" });
    }
  });

  // Bulk approve
  app.post("/api/admin/pending-payments/bulk-approve", requireAuth, async (req, res) => {
    try {
      const { ids } = req.body as { ids: number[] };
      if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ message: "No IDs provided" });
      const adminUser = (req as any).adminUser;
      const results = [];
      for (const id of ids) {
        const payment = await storage.getPendingPayment(id);
        if (!payment || payment.status !== "pending") continue;
        await storage.updateUserTokenBalance(payment.userId, payment.creditsAmount);
        await storage.createTokenTransaction({
          userId: payment.userId,
          transactionType: "purchase",
          amount: payment.creditsAmount,
          dollarAmount: payment.dollarAmount,
          description: `Tokens purchased via ${payment.paymentMethod} — bulk approved`,
          status: "completed",
        });
        const updated = await storage.updatePendingPayment(id, {
          status: "approved",
          processedAt: new Date(),
          processedByAdminId: adminUser?.id || null,
        });
        results.push(updated);
      }
      res.json({ success: true, count: results.length });
    } catch (err) {
      res.status(500).json({ message: "Bulk approve failed" });
    }
  });

  // Bulk reject
  app.post("/api/admin/pending-payments/bulk-reject", requireAuth, async (req, res) => {
    try {
      const { ids, notes } = req.body as { ids: number[]; notes?: string };
      if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ message: "No IDs provided" });
      const adminUser = (req as any).adminUser;
      let count = 0;
      for (const id of ids) {
        const payment = await storage.getPendingPayment(id);
        if (!payment || payment.status !== "pending") continue;
        await storage.updatePendingPayment(id, {
          status: "rejected",
          processedAt: new Date(),
          processedByAdminId: adminUser?.id || null,
          notes: notes || "Bulk rejected by staff",
        });
        count++;
      }
      res.json({ success: true, count });
    } catch (err) {
      res.status(500).json({ message: "Bulk reject failed" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
