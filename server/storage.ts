import { games, players, gameResults, users, type Game, type InsertGame, type Player, type InsertPlayer, type GameResult, type InsertGameResult, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  // Game methods
  getGames(): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: number, updates: Partial<Game>): Promise<Game | undefined>;
  deleteGame(id: number): Promise<boolean>;
  
  // Player methods
  getPlayersByGameId(gameId: number): Promise<Player[]>;
  getPlayer(id: number): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, updates: Partial<Player>): Promise<Player | undefined>;
  
  // Game result methods
  getGameResult(gameId: number): Promise<GameResult | undefined>;
  createGameResult(result: InsertGameResult): Promise<GameResult>;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private games: Map<number, Game>;
  private players: Map<number, Player>;
  private gameResults: Map<number, GameResult>;
  private users: Map<number, User>;
  private currentGameId: number;
  private currentPlayerId: number;
  private currentResultId: number;
  private currentUserId: number;

  constructor() {
    this.games = new Map();
    this.players = new Map();
    this.gameResults = new Map();
    this.users = new Map();
    this.currentGameId = 1;
    this.currentPlayerId = 1;
    this.currentResultId = 1;
    this.currentUserId = 1;
    
    // Initialize with sample games
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleGames: Game[] = [
      {
        id: 1,
        name: "Travel Mug",
        code: "G8.604",
        prize: "$10",
        prizeValue: 10,
        totalNumbers: 125,
        numbersLeft: 73,
        endTime: new Date(Date.now() + 5000000), // ~1.4 hours from now
        isActive: true,
        isFreePlay: false,
        emoji: "🍺"
      },
      {
        id: 2,
        name: "Free Play",
        code: "GO.2163",
        prize: "Free Play",
        prizeValue: 0,
        totalNumbers: 125,
        numbersLeft: 122,
        endTime: new Date(Date.now() + 290000000), // ~80 hours from now
        isActive: true,
        isFreePlay: true,
        emoji: "🎁"
      },
      {
        id: 3,
        name: "Camera",
        code: "140.160",
        prize: "$5",
        prizeValue: 5,
        totalNumbers: 125,
        numbersLeft: 36,
        endTime: new Date(Date.now() + 11000000), // ~3 hours from now
        isActive: true,
        isFreePlay: false,
        emoji: "📷"
      }
    ];

    sampleGames.forEach(game => {
      this.games.set(game.id, game);
    });
    this.currentGameId = 4;
  }

  async getGames(): Promise<Game[]> {
    return Array.from(this.games.values()).filter(game => game.isActive);
  }

  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = this.currentGameId++;
    const game: Game = {
      ...insertGame,
      id,
      numbersLeft: insertGame.totalNumbers,
      isActive: true,
    };
    this.games.set(id, game);
    return game;
  }

  async updateGame(id: number, updates: Partial<Game>): Promise<Game | undefined> {
    const game = this.games.get(id);
    if (!game) return undefined;
    
    const updatedGame = { ...game, ...updates };
    this.games.set(id, updatedGame);
    return updatedGame;
  }

  async deleteGame(id: number): Promise<boolean> {
    return this.games.delete(id);
  }

  async getPlayersByGameId(gameId: number): Promise<Player[]> {
    return Array.from(this.players.values()).filter(player => player.gameId === gameId);
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = this.currentPlayerId++;
    const player: Player = {
      ...insertPlayer,
      id,
      isWinner: false,
      joinedAt: new Date(),
    };
    this.players.set(id, player);
    return player;
  }

  async updatePlayer(id: number, updates: Partial<Player>): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    
    const updatedPlayer = { ...player, ...updates };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async getGameResult(gameId: number): Promise<GameResult | undefined> {
    return Array.from(this.gameResults.values()).find(result => result.gameId === gameId);
  }

  async createGameResult(insertResult: InsertGameResult): Promise<GameResult> {
    const id = this.currentResultId++;
    const result: GameResult = {
      ...insertResult,
      id,
      completedAt: new Date(),
    };
    this.gameResults.set(id, result);
    return result;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
