import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSchema, insertPlayerSchema, insertGameResultSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all active games
  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getGames();
      res.json(games);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  // Get specific game
  app.get("/api/games/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const game = await storage.getGame(id);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
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
      
      // Update player with selected number
      await storage.updatePlayer(playerId, { selectedNumber });

      res.json({ selectedNumber });
    } catch (error) {
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
        winnerId: winner.id
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
        freePlays: players.filter(p => p.playerName.includes('Free')).length,
        referrals: Math.floor(players.length * 0.3), // Mock referral calculation
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game stats" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
