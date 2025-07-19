import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth } from "./auth";
import { 
  insertGameSchema, insertPlayerSchema, insertGameResultSchema, 
  insertWheelSegmentSchema, insertSystemSettingSchema, insertNotificationSchema,
  insertUserSchema, insertTransactionSchema
} from "@shared/schema";
import { z } from "zod";
import { squareService } from "./squareService";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

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
      const gameData = insertGameSchema.parse({
        ...req.body,
        createdBy: req.user!.id,
      });
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
      const id = parseInt(req.params.id);
      const updates = req.body;
      const game = await storage.updateGame(id, updates);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
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
      const games = await storage.getGames();
      const totalSpins = games.reduce((sum, game) => sum + (game.totalNumbers - game.numbersLeft), 0);
      
      // Get all players across all games for user metrics
      const allPlayers = [];
      for (const game of games) {
        const players = await storage.getPlayersByGameId(game.id);
        allPlayers.push(...players);
      }
      
      // Calculate real metrics
      const totalUsers = allPlayers.length;
      const activeUsers = allPlayers.filter(p => {
        // Consider active if created within last hour
        const hourAgo = new Date();
        hourAgo.setHours(hourAgo.getHours() - 1);
        return new Date(p.createdAt) > hourAgo;
      }).length;
      
      // Calculate revenue (users who got paid numbers)
      const todayRevenue = allPlayers.reduce((sum, player) => {
        if (player.selectedNumber && player.selectedNumber <= 150) { // paid range
          return sum + player.selectedNumber;
        }
        return sum;
      }, 0);
      
      const conversionRate = totalUsers > 0 ? (totalSpins / totalUsers) * 100 : 0;
      
      const stats = {
        totalGames: games.length,
        activeGames: games.filter(g => g.isActive).length,
        totalSpins,
        totalPrizeValue: games.reduce((sum, game) => sum + parseFloat(game.prizeValue.toString()), 0),
        todayRevenue,
        activeUsers,
        totalUsers,
        conversionRate: Math.round(conversionRate * 100) / 100
      };

      res.json(stats);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
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

  // User registration endpoint
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Create Square customer
      const squareCustomer = await squareService.createCustomer(
        userData.firstName,
        userData.lastName,
        userData.email
      );

      // Create user in database
      const user = await storage.createUser({
        ...userData,
        squareCustomerId: squareCustomer.id
      });

      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).user = user;

      res.status(201).json({ 
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          cardOnFile: user.cardOnFile
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Registration failed", error: error.message });
    }
  });

  // User login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { email } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).user = user;

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
      res.status(400).json({ message: "Login failed", error: error.message });
    }
  });

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
        cardLast4: user.cardLast4,
        cardBrand: user.cardBrand,
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
      const freeSpins = transactions.filter(t => parseFloat(t.amount.toString()) === 0).length;
      
      // For wins, we'll count transactions where user got a "winning" number (subjective, but let's say numbers 1-50 are "wins")
      const totalWins = transactions.filter(t => t.spinResult && t.spinResult <= 50).length;

      res.json({
        totalSpins,
        totalWins,
        freeSpins,
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
          number: transaction.spinResult || 0,
          amount: amount,
          isFreePlay: amount === 0,
          playedAt: transaction.createdAt,
          gameId: transaction.gameId || 1,
          isWin: transaction.spinResult && transaction.spinResult <= 50 // Consider 1-50 as wins
        };
      }).reverse(); // Show most recent first

      res.json(gameHistory);
    } catch (error) {
      console.error("Error fetching game history:", error);
      res.status(500).json({ message: "Failed to fetch game history" });
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
      if (!user || !user.squareCustomerId) {
        return res.status(404).json({ message: "User not found or no Square customer ID" });
      }

      // For sandbox testing, we'll simulate a successful card setup
      // In production, this would use real Square Web SDK integration
      if (process.env.SQUARE_ENVIRONMENT === 'sandbox') {
        // Simulate successful card verification for testing
        await storage.updateUser(userId, {
          cardOnFile: true,
          cardLast4: '4242',
          cardBrand: 'VISA'
        });

        res.json({ 
          message: "Card added successfully",
          cardLast4: '4242',
          cardBrand: 'VISA'
        });
      } else {
        // Production flow - verify with actual Square API
        const verificationResult = await squareService.verifyCard(cardNonce);
        
        if (!verificationResult.verified) {
          return res.status(400).json({ message: "Card verification failed" });
        }

        // Create card on file
        const card = await squareService.createCard(user.squareCustomerId, cardNonce, cardNonce);
        
        // Update user with card info
        await storage.updateUser(userId, {
          cardOnFile: true,
          cardLast4: card.last4,
          cardBrand: card.cardBrand
        });

        res.json({ 
          message: "Card added successfully",
          cardLast4: card.last4,
          cardBrand: card.cardBrand
        });
      }
    } catch (error) {
      console.error("Add card error:", error);
      res.status(400).json({ message: "Failed to add card", error: error.message });
    }
  });

  // Process payment and spin wheel
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

      // For sandbox environment, bypass card check as we simulate card setup
      if (process.env.SQUARE_ENVIRONMENT === 'sandbox') {
        // Continue with spin logic
      } else if (!user.cardOnFile) {
        return res.status(400).json({ message: "No card on file" });
      }

      const game = await storage.getGame(gameId);
      if (!game || !game.isActive) {
        return res.status(400).json({ message: "Game not found or inactive" });
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

      // Spin the wheel
      const spinResult = await storage.spinWheel(gameId, player.id);
      
      // If it's not a free play, charge the user
      if (!spinResult.isFreePlay) {
        const chargeAmount = parseFloat(spinResult.amountCharged);
        let paymentResult = null;
        
        // For sandbox environment, simulate payment processing
        if (process.env.SQUARE_ENVIRONMENT === 'sandbox') {
          // Simulate successful payment for testing
          console.log(`Simulated charge of $${chargeAmount} for user ${userId}`);
          paymentResult = {
            id: `sandbox_payment_${Date.now()}`,
            status: "COMPLETED",
            receiptUrl: null
          };
        } else {
          // Production payment processing
          const cards = await squareService.getCustomerCards(user.squareCustomerId!);
          if (cards.length === 0) {
            return res.status(400).json({ message: "No cards on file" });
          }

          // Use the first card
          const card = cards[0];
          
          // Process payment
          paymentResult = await squareService.chargeCard(
            chargeAmount,
            "USD",
            card.id!,
            user.squareCustomerId
          );
        }

        // Record transaction
        await storage.createTransaction({
          userId: userId,
          gameId: gameId,
          spinResultId: spinResult.id,
          squarePaymentId: paymentResult.id,
          amount: chargeAmount.toString(),
          currency: "USD",
          status: paymentResult.status || "COMPLETED",
          paymentMethod: "card",
          cardLast4: user.cardLast4 || "4242",
          cardBrand: user.cardBrand || "VISA",
          squareReceiptUrl: paymentResult.receiptUrl || undefined
        });

        // Update user's total spent
        await storage.updateUser(userId, {
          totalSpent: (parseFloat(user.totalSpent) + chargeAmount).toString(),
          gamesPlayed: user.gamesPlayed + 1
        });
      }

      res.json({
        success: true,
        spinResult: {
          number: spinResult.spunNumber,
          isFreePlay: spinResult.isFreePlay,
          amountCharged: spinResult.amountCharged
        }
      });
    } catch (error) {
      console.error("Spin error:", error);
      res.status(400).json({ message: "Spin failed", error: error.message });
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

  const httpServer = createServer(app);

  return httpServer;
}
