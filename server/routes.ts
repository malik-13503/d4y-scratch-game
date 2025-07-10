import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth } from "./auth";
import { 
  insertGameSchema, insertPlayerSchema, insertGameResultSchema, 
  insertWheelSegmentSchema, insertSystemSettingSchema, insertNotificationSchema 
} from "@shared/schema";
import { z } from "zod";

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

  const httpServer = createServer(app);

  return httpServer;
}
