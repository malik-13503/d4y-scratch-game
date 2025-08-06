import { 
  games, players, gameResults, adminUsers, wheelSegments, systemSettings, adminSessions, notifications, spinResults,
  users, transactions, userSessions, complianceLogs, freePlayUsage,
  type Game, type InsertGame, type Player, type InsertPlayer, type GameResult, type InsertGameResult, 
  type AdminUser, type InsertAdminUser, type WheelSegment, type InsertWheelSegment,
  type SystemSetting, type InsertSystemSetting, type InsertNotification, type Notification,
  type SpinResult, type InsertSpinResult, type User, type InsertUser, type Transaction, type InsertTransaction,
  type FreePlayUsage, type InsertFreePlayUsage
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, isNotNull } from "drizzle-orm";
import session from "express-session";
import MemoryStore from "memorystore";
import { hashPassword } from "./utils"; // Import hashPassword

const MemStore = MemoryStore(session);

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

  // Admin user methods
  getAdminUser(id: number): Promise<AdminUser | undefined>;
  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  updateAdminUser(id: number, updates: Partial<AdminUser>): Promise<AdminUser | undefined>;

  // User methods (for game players)
  getUser(id: number): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction | undefined>;

  // Wheel segment methods
  getWheelSegmentsByGameId(gameId: number): Promise<WheelSegment[]>;
  createWheelSegment(segment: InsertWheelSegment): Promise<WheelSegment>;
  updateWheelSegment(id: number, updates: Partial<WheelSegment>): Promise<WheelSegment | undefined>;
  deleteWheelSegment(id: number): Promise<boolean>;

  // System settings methods
  getSystemSettings(): Promise<SystemSetting[]>;
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  updateSystemSetting(key: string, value: string): Promise<SystemSetting>;

  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByGameId(gameId: number): Promise<Notification[]>;

  // Spin result methods
  createSpinResult(spinResult: InsertSpinResult): Promise<SpinResult>;
  getSpinResultsByGameId(gameId: number): Promise<SpinResult[]>;
  getSpinResultsByPlayerId(playerId: number): Promise<SpinResult[]>;

  // Legal compliance methods
  createComplianceLog(userId: number | null, gameId: number | null, logType: string, details: any): Promise<void>;
  
  // Free play tracking
  hasUsedFreePlay(ipAddress: string, gameId: number): Promise<boolean>;
  recordFreePlayUsage(ipAddress: string, gameId: number): Promise<void>;

  // User activity methods
  getUserActivity(userId: number): Promise<any[]>;
  getUserStats(userId: number): Promise<any>;

  // Game logic methods
  spinWheel(gameId: number, playerId: number): Promise<SpinResult>;
  isNumberAvailable(gameId: number, number: number): Promise<boolean>;
  getAvailableNumbers(gameId: number): Promise<number[]>;
  selectGameWinner(gameId: number): Promise<void>;

  // Session store
  sessionStore: any;

  // Ensure default admin user exists
  ensureDefaultAdminUser(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: any;

  constructor() {
    this.sessionStore = new MemStore({
      checkPeriod: 86400000, // prune expired entries every 24h
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days TTL
      stale: false // Don't return stale sessions
    });

    this.initializeSampleData();
    // Initialize admin user asynchronously without blocking startup
    this.ensureDefaultAdminUser().catch(console.error);
  }

  private async initializeSampleData() {
    try {
      // Create sample games if none exist
      const existingGames = await this.getGames();
      if (existingGames.length === 0) {
        const sampleGames = [
          {
            name: "Premium Travel Mug",
            code: "MUG001",
            description: "High-quality travel mug with thermal insulation",
            gameType: "wheel",
            prize: "Premium Travel Mug",
            prizeValue: "89.99",
            prizeDescription: "Stainless steel travel mug with 12-hour heat retention",
            totalNumbers: 150,
            numbersLeft: 142,
            minNumber: 1,
            maxNumber: 150,
            pricePerNumber: 0.60,
            freePlayNumbers: Array.from({ length: 25 }, (_, i) => 126 + i),
            startTime: new Date(),
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
            createdBy: 1,
            isActive: true,
            allowGuestPlay: true,
            maxPlayersPerGame: 500,
            gameStatus: "active" as const,
          },
          {
            name: "Premium Camera",
            code: "CAM001", 
            description: "Professional DSLR camera with premium lens",
            gameType: "wheel",
            prize: "Premium Camera",
            prizeValue: "299.99",
            prizeDescription: "High-resolution camera with multiple shooting modes",
            totalNumbers: 200,
            numbersLeft: 186,
            minNumber: 1,
            maxNumber: 200,
            pricePerNumber: 1.50,
            freePlayNumbers: Array.from({ length: 50 }, (_, i) => 151 + i),
            startTime: new Date(),
            endTime: new Date(Date.now() + 72 * 60 * 60 * 1000),
            createdBy: 1,
            isActive: true,
            allowGuestPlay: true,
            maxPlayersPerGame: 1000,
            gameStatus: "active" as const,
          },
          {
            name: "Gift Card Bundle",
            code: "GFT001",
            description: "Multi-store gift card bundle worth $250",
            gameType: "wheel",
            prize: "Gift Card Bundle",
            prizeValue: "250.00",
            prizeDescription: "Gift cards for popular retailers and restaurants",
            totalNumbers: 200,
            numbersLeft: 194,
            minNumber: 1,
            maxNumber: 200,
            pricePerNumber: 1.25,
            freePlayNumbers: Array.from({ length: 25 }, (_, i) => 176 + i),
            startTime: new Date(),
            endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            createdBy: 1,
            isActive: true,
            allowGuestPlay: true,
            maxPlayersPerGame: 800,
            gameStatus: "active" as const,
          }
        ];

        for (const gameData of sampleGames) {
          await this.createGame(gameData);
        }
        console.log("Sample games created successfully");
      }
    } catch (error) {
      console.error("Failed to initialize sample data:", error);
    }
  }

  // Game methods
  async getGames(): Promise<Game[]> {
    const result = await db.select().from(games).where(eq(games.isActive, true));
    return result;
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game || undefined;
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db.insert(games).values({
      ...insertGame,
      numbersLeft: insertGame.totalNumbers || 125,
      isActive: true, // Make newly created games active by default
    }).returning();
    return game;
  }

  async updateGame(id: number, updates: Partial<Game>): Promise<Game | undefined> {
    const [game] = await db.update(games)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(games.id, id))
      .returning();
    return game || undefined;
  }

  async deleteGame(id: number): Promise<boolean> {
    const result = await db.delete(games).where(eq(games.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Player methods
  async getPlayersByGameId(gameId: number): Promise<Player[]> {
    return await db.select().from(players).where(eq(players.gameId, gameId));
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db.insert(players).values(insertPlayer).returning();
    return player;
  }

  async updatePlayer(id: number, updates: Partial<Player>): Promise<Player | undefined> {
    const [player] = await db.update(players)
      .set(updates)
      .where(eq(players.id, id))
      .returning();
    return player || undefined;
  }

  // Game result methods
  async getGameResult(gameId: number): Promise<GameResult | undefined> {
    const [result] = await db.select().from(gameResults).where(eq(gameResults.gameId, gameId));
    return result || undefined;
  }

  async createGameResult(insertResult: InsertGameResult): Promise<GameResult> {
    const [result] = await db.insert(gameResults).values({
      ...insertResult,
      winnerId: insertResult.winnerId || null,
    }).returning();
    return result;
  }

  // Admin user methods
  async getAdminUser(id: number): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return user || undefined;
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return user || undefined;
  }

  async createAdminUser(insertUser: InsertAdminUser): Promise<AdminUser> {
    const [user] = await db.insert(adminUsers).values(insertUser).returning();
    return user;
  }

  async updateAdminUser(id: number, updates: Partial<AdminUser>): Promise<AdminUser | undefined> {
    const [user] = await db.update(adminUsers)
      .set(updates)
      .where(eq(adminUsers.id, id))
      .returning();
    return user || undefined;
  }

  // Wheel segment methods
  async getWheelSegmentsByGameId(gameId: number): Promise<WheelSegment[]> {
    return await db.select().from(wheelSegments).where(eq(wheelSegments.gameId, gameId));
  }

  async createWheelSegment(segment: InsertWheelSegment): Promise<WheelSegment> {
    const [result] = await db.insert(wheelSegments).values(segment).returning();
    return result;
  }

  async updateWheelSegment(id: number, updates: Partial<WheelSegment>): Promise<WheelSegment | undefined> {
    const [segment] = await db.update(wheelSegments)
      .set(updates)
      .where(eq(wheelSegments.id, id))
      .returning();
    return segment || undefined;
  }

  async deleteWheelSegment(id: number): Promise<boolean> {
    const result = await db.delete(wheelSegments).where(eq(wheelSegments.id, id));
    return (result.rowCount || 0) > 0;
  }

  // System settings methods
  async getSystemSettings(): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings);
  }

  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting || undefined;
  }

  async updateSystemSetting(key: string, value: string): Promise<SystemSetting> {
    const [setting] = await db.update(systemSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(systemSettings.key, key))
      .returning();
    return setting;
  }

  // Notification methods
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [result] = await db.insert(notifications).values(notification).returning();
    return result;
  }

  async getNotificationsByGameId(gameId: number): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.gameId, gameId));
  }

  // Ensure default admin user exists
  async ensureDefaultAdminUser(): Promise<void> {
    try {
      const existingAdmin = await this.getAdminUserByEmail("admin@example.com");
      if (!existingAdmin) {
        console.log("Creating default admin user...");
        const hashedPassword = await hashPassword("admin123");
        await this.createAdminUser({
          email: "admin@example.com",
          password: hashedPassword,
          firstName: "Admin",
          lastName: "User",
        });
        console.log("Default admin user created successfully");
      } else if (existingAdmin.password.startsWith("$2b$")) {
        // Fix existing bcrypt password to use scrypt format
        console.log("Updating default admin user password format...");
        const hashedPassword = await hashPassword("admin123");
        await this.updateAdminUser(existingAdmin.id, { password: hashedPassword });
        console.log("Default admin user password format updated");
      }
    } catch (error) {
      console.error("Failed to ensure default admin user:", error);
    }
  }

  // Spin result methods
  async createSpinResult(spinResult: InsertSpinResult): Promise<SpinResult> {
    const [result] = await db.insert(spinResults).values(spinResult).returning();
    return result;
  }

  async getSpinResultsByGameId(gameId: number): Promise<SpinResult[]> {
    return await db.select().from(spinResults).where(eq(spinResults.gameId, gameId));
  }

  async getSpinResultsByPlayerId(playerId: number): Promise<SpinResult[]> {
    return await db.select().from(spinResults).where(eq(spinResults.playerId, playerId));
  }

  // Game logic methods
  async spinWheel(gameId: number, playerId: number): Promise<SpinResult> {
    const game = await this.getGame(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    // Get all spun numbers for this game
    const existingSpins = await this.getSpinResultsByGameId(gameId);
    const spunNumbers = existingSpins.map(spin => spin.spunNumber);
    
    // Generate available numbers (1 to totalNumbers)
    const availableNumbers = [];
    for (let i = 1; i <= game.totalNumbers; i++) {
      if (!spunNumbers.includes(i)) {
        availableNumbers.push(i);
      }
    }

    if (availableNumbers.length === 0) {
      throw new Error("All numbers have been claimed - game is complete!");
    }

    // Randomly select from available numbers
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const spunNumber = availableNumbers[randomIndex];

    // Determine if it's a free play based on the free play range
    const isFreePlay = spunNumber >= game.freePlayStart && spunNumber <= game.freePlayEnd;
    const amountCharged = isFreePlay ? "0" : spunNumber.toString();

    // Create spin result
    const spinResult = await this.createSpinResult({
      gameId,
      playerId,
      spunNumber,
      isFreePlay,
      amountCharged,
    });

    // Update player's owned numbers and total spent
    const player = await this.getPlayer(playerId);
    if (player) {
      const newOwnedNumbers = [...(player.ownedNumbers || []), spunNumber.toString()];
      const newTotalSpent = parseFloat(player.totalSpent || "0") + parseFloat(amountCharged);
      
      await this.updatePlayer(playerId, {
        ownedNumbers: newOwnedNumbers,
        totalSpent: newTotalSpent.toString(),
        freeSpins: isFreePlay ? (player.freeSpins || 0) + 1 : player.freeSpins,
      });

      // Create compliance log for spin result (only if user is authenticated)
      if (player.userId) {
        await this.createComplianceLog(
          player.userId,
          gameId,
          'spin_result',
          {
            spunNumber,
            isFreePlay,
            amountCharged,
            timestamp: new Date().toISOString(),
            gameTitle: game.name
          }
        );
      }
    }

    // Update game numbers left
    const newNumbersLeft = game.numbersLeft - 1;
    await this.updateGame(gameId, {
      numbersLeft: newNumbersLeft,
    });

    // Check if game is complete (all numbers claimed)
    if (newNumbersLeft === 0) {
      // Game is complete - select winner
      await this.selectGameWinner(gameId);
      await this.updateGame(gameId, { isActive: false });
    }

    return spinResult;
  }

  async isNumberAvailable(gameId: number, number: number): Promise<boolean> {
    const existingSpins = await this.getSpinResultsByGameId(gameId);
    const spunNumbers = existingSpins.map(spin => spin.spunNumber);
    return !spunNumbers.includes(number);
  }

  async getAvailableNumbers(gameId: number): Promise<number[]> {
    const game = await this.getGame(gameId);
    if (!game) return [];

    const existingSpins = await this.getSpinResultsByGameId(gameId);
    const spunNumbers = existingSpins.map(spin => spin.spunNumber);
    
    const availableNumbers = [];
    for (let i = 1; i <= game.totalNumbers; i++) {
      if (!spunNumbers.includes(i)) {
        availableNumbers.push(i);
      }
    }
    return availableNumbers;
  }

  // Winner selection logic
  async selectGameWinner(gameId: number): Promise<void> {
    try {
      const game = await this.getGame(gameId);
      if (!game) {
        throw new Error("Game not found");
      }

      // Get all spin results for this game
      const spinResults = await this.getSpinResultsByGameId(gameId);
      if (spinResults.length === 0) {
        throw new Error("No spin results found for game");
      }

      // Perform final winning draw from all claimed numbers
      const allClaimedNumbers = spinResults.map(spin => spin.spunNumber);
      const winningNumberIndex = Math.floor(Math.random() * allClaimedNumbers.length);
      const winningNumber = allClaimedNumbers[winningNumberIndex];

      // Find the winner (player who owns the winning number)
      const winningSpinResult = spinResults.find(spin => spin.spunNumber === winningNumber);
      if (!winningSpinResult) {
        throw new Error("Could not find winning spin result");
      }

      // Create game result
      await this.createGameResult({
        gameId,
        winningNumber,
        winnerId: winningSpinResult.playerId,
        totalParticipants: new Set(spinResults.map(spin => spin.playerId)).size,
        totalSpins: spinResults.length
      });

      // Update winner status
      await this.updatePlayer(winningSpinResult.playerId, { isWinner: true });

      // Create compliance log for winner selection
      const winner = await this.getPlayer(winningSpinResult.playerId);
      if (winner) {
        await this.createComplianceLog(
          winner.userId,
          gameId,
          'winner_selection',
          {
            winningNumber,
            totalParticipants: new Set(spinResults.map(spin => spin.playerId)).size,
            totalSpins: spinResults.length,
            selectionMethod: 'random_draw_from_claimed_numbers',
            timestamp: new Date().toISOString(),
            gameTitle: game.name,
            prizeValue: game.prizeValue
          }
        );
      }

      console.log(`Game ${gameId} completed. Winner: Player ${winningSpinResult.playerId} with number ${winningNumber}`);
    } catch (error) {
      console.error("Error selecting game winner:", error);
      throw error;
    }
  }

  // User methods (for game players)
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
      return allUsers;
    } catch (error) {
      console.error("Error getting users:", error);
      return [];
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error("Error getting user by email:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    } catch (error: any) {
      console.error("Error creating user:", error);
      
      // Handle PostgreSQL unique constraint violation
      if (error.code === '23505' && error.constraint === 'users_email_unique') {
        throw new Error("Email address is already registered");
      }
      
      // Handle other database errors
      if (error.code === '23505') {
        throw new Error("User with this information already exists");
      }
      
      throw new Error("Failed to create user account");
    }
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    try {
      const [user] = await db.update(users).set({ ...updates, updatedAt: new Date() }).where(eq(users.id, id)).returning();
      return user;
    } catch (error) {
      console.error("Error updating user:", error);
      return undefined;
    }
  }

  // Transaction methods
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    try {
      const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
      return transaction;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    try {
      const result = await db
        .select({
          id: transactions.id,
          userId: transactions.userId,
          gameId: transactions.gameId,
          spinResultId: transactions.spinResultId,
          amount: transactions.amount,
          createdAt: transactions.createdAt,
          updatedAt: transactions.updatedAt,
          status: transactions.status,
          paymentMethod: transactions.paymentMethod,
          cardLast4: transactions.cardLast4,
          cardBrand: transactions.cardBrand,
          squarePaymentId: transactions.squarePaymentId,
          squareReceiptUrl: transactions.squareReceiptUrl,
          currency: transactions.currency,
          spunNumber: spinResults.spunNumber, // Add the actual spun number from spin_results
        })
        .from(transactions)
        .leftJoin(spinResults, eq(transactions.spinResultId, spinResults.id))
        .where(eq(transactions.userId, userId))
        .orderBy(transactions.createdAt);
      
      return result;
    } catch (error) {
      console.error("Error getting transactions by user ID:", error);
      return [];
    }
  }

  async getRecentGameTransactions(gameId: number, limit: number = 6): Promise<any[]> {
    try {
      const result = await db
        .select({
          id: transactions.id,
          userId: transactions.userId,
          gameId: transactions.gameId,
          spinResultId: transactions.spinResultId,
          amount: transactions.amount,
          createdAt: transactions.createdAt,
          spunNumber: spinResults.spunNumber,
        })
        .from(transactions)
        .leftJoin(spinResults, eq(transactions.spinResultId, spinResults.id))
        .where(
          and(
            eq(transactions.gameId, gameId),
            isNotNull(spinResults.spunNumber)
          )
        )
        .orderBy(desc(transactions.createdAt))
        .limit(limit);
      
      return result;
    } catch (error) {
      console.error("Error getting recent game transactions:", error);
      return [];
    }
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    try {
      const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
      return transaction;
    } catch (error) {
      console.error("Error getting transaction:", error);
      return undefined;
    }
  }

  async updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    try {
      const [transaction] = await db.update(transactions).set({ ...updates, updatedAt: new Date() }).where(eq(transactions.id, id)).returning();
      return transaction;
    } catch (error) {
      console.error("Error updating transaction:", error);
      return undefined;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAnalytics() {
    try {
      // Get basic counts
      const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
      const totalGames = await db.select({ count: sql<number>`count(*)` }).from(games);
      const totalTransactions = await db.select({ count: sql<number>`count(*)` }).from(transactions);
      const totalSpins = totalTransactions[0]?.count || 0;
      
      // Calculate total revenue
      const revenueResult = await db.select({ 
        total: sql<number>`coalesce(sum(cast(amount as decimal)), 0)` 
      }).from(transactions);
      const totalRevenue = Number(revenueResult[0]?.total || 0);

      // Get game-specific stats
      const gameStats = await db.select({
        gameId: games.id,
        name: games.name,
        emoji: games.emoji,
        totalPlayers: sql<number>`count(distinct ${players.id})`,
        spins: sql<number>`count(${transactions.id})`,
        revenue: sql<number>`coalesce(sum(cast(${transactions.amount} as decimal)), 0)`
      })
      .from(games)
      .leftJoin(players, eq(games.id, players.gameId))
      .leftJoin(transactions, eq(games.id, transactions.gameId))
      .groupBy(games.id, games.name, games.emoji);

      // Calculate today's metrics
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayRevenue = await db.select({ 
        total: sql<number>`coalesce(sum(cast(amount as decimal)), 0)` 
      })
      .from(transactions)
      .where(sql`created_at >= ${today}`);

      const todayUsers = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`created_at >= ${today}`);

      // Calculate weekly/monthly metrics
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const weeklyRevenue = await db.select({ 
        total: sql<number>`coalesce(sum(cast(amount as decimal)), 0)` 
      })
      .from(transactions)
      .where(sql`created_at >= ${weekAgo}`);

      const monthlyRevenue = await db.select({ 
        total: sql<number>`coalesce(sum(cast(amount as decimal)), 0)` 
      })
      .from(transactions)
      .where(sql`created_at >= ${monthAgo}`);

      const weeklyUsers = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`created_at >= ${weekAgo}`);

      return {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalSpins,
        conversionRate: Math.round((totalSpins / (totalUsers[0]?.count || 1)) * 100),
        revenueGrowth: 15,
        todayRevenue: Math.round(Number(todayRevenue[0]?.total || 0) * 100) / 100,
        weeklyRevenue: Math.round(Number(weeklyRevenue[0]?.total || 0) * 100) / 100,
        monthlyRevenue: Math.round(Number(monthlyRevenue[0]?.total || 0) * 100) / 100,
        avgRevenuePerUser: totalUsers[0]?.count ? Math.round((totalRevenue / totalUsers[0].count) * 100) / 100 : 0,
        dailyActiveUsers: todayUsers[0]?.count || 0,
        weeklyActiveUsers: weeklyUsers[0]?.count || 0,
        avgSessionDuration: "8m 45s",
        retentionRate: "72%",
        todayGrowth: 8,
        gameStats: gameStats.map(stat => ({
          ...stat,
          status: "Active",
          revenue: Math.round(Number(stat.revenue) * 100) / 100
        }))
      };
    } catch (error) {
      console.error("Error calculating analytics:", error);
      return {
        totalRevenue: 0,
        totalSpins: 0,
        conversionRate: 0,
        revenueGrowth: 0,
        gameStats: []
      };
    }
  }

  // User activity methods for admin dashboard
  async getUserActivity(userId: number): Promise<any[]> {
    try {
      // Get user's recent transactions and game activity
      const userTransactions = await db
        .select({
          id: transactions.id,
          gameId: transactions.gameId,
          amount: transactions.amount,
          status: transactions.status,
          createdAt: transactions.createdAt,
          spunNumber: spinResults.spunNumber,
          gameName: games.name,
          prize: games.prize
        })
        .from(transactions)
        .leftJoin(spinResults, eq(transactions.spinResultId, spinResults.id))
        .leftJoin(games, eq(transactions.gameId, games.id))
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.createdAt))
        .limit(10);

      // Format activity data
      const activity = userTransactions.map(tx => ({
        id: tx.id,
        type: tx.spunNumber ? 'game_spin' : 'payment',
        title: tx.spunNumber ? `Spun Number ${tx.spunNumber}` : 'Payment Processed',
        description: tx.gameName ? `Game: ${tx.gameName}` : 'Card verification',
        amount: tx.amount,
        status: tx.status,
        createdAt: tx.createdAt,
        metadata: {
          gameId: tx.gameId,
          spunNumber: tx.spunNumber,
          prize: tx.prize
        }
      }));

      return activity;
    } catch (error) {
      console.error("Error getting user activity:", error);
      return [];
    }
  }

  async getUserStats(userId: number): Promise<any> {
    try {
      const user = await this.getUser(userId);
      if (!user) return null;

      // Get transaction stats
      const transactionStats = await db
        .select({
          totalSpent: sql<number>`coalesce(sum(cast(amount as decimal)), 0)`,
          totalTransactions: sql<number>`count(*)`
        })
        .from(transactions)
        .where(eq(transactions.userId, userId));

      // Get spin stats
      const spinStats = await db
        .select({
          totalSpins: sql<number>`count(*)`
        })
        .from(spinResults)
        .leftJoin(players, eq(spinResults.playerId, players.id))
        .where(eq(players.userId, userId));

      // Get game participation
      const gameParticipation = await db
        .select({
          gameId: games.id,
          gameName: games.name
        })
        .from(games)
        .leftJoin(players, eq(games.id, players.gameId))
        .where(eq(players.userId, userId))
        .groupBy(games.id, games.name)
        .limit(1);

      const stats = transactionStats[0];
      const spins = spinStats[0];
      
      return {
        status: 'active',
        accountAge: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
        totalSpent: Number(stats?.totalSpent || 0),
        totalSpins: Number(spins?.totalSpins || 0),
        winRate: 0, // TODO: Calculate win rate based on actual wins
        favoriteGame: gameParticipation[0]?.gameName || 'None',
        lastActive: user.updatedAt
      };
    } catch (error) {
      console.error("Error getting user stats:", error);
      return null;
    }
  }

  // Legal compliance logging
  async createComplianceLog(userId: number | null, gameId: number | null, logType: string, details: any): Promise<void> {
    try {
      // Set retention period to 4 years from now
      const retentionUntil = new Date();
      retentionUntil.setFullYear(retentionUntil.getFullYear() + 4);

      await db.insert(complianceLogs).values({
        userId,
        gameId,
        logType,
        details,
        retentionUntil,
      });
    } catch (error) {
      console.error("Error creating compliance log:", error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      // Delete related records first (transactions, players, spin results)
      // Delete spin results through players
      await db.delete(spinResults)
        .where(
          sql`player_id IN (SELECT id FROM ${players} WHERE user_id = ${id})`
        );
      
      // Delete players
      await db.delete(players).where(eq(players.userId, id));
      
      // Delete transactions
      await db.delete(transactions).where(eq(transactions.userId, id));
      
      // Finally delete the user
      const result = await db.delete(users).where(eq(users.id, id));
      
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  // Free play tracking methods
  async hasUsedFreePlay(ipAddress: string, gameId: number): Promise<boolean> {
    try {
      const usage = await db.select()
        .from(freePlayUsage)
        .where(
          and(
            eq(freePlayUsage.ipAddress, ipAddress),
            eq(freePlayUsage.gameId, gameId)
          )
        )
        .limit(1);
      
      return usage.length > 0;
    } catch (error) {
      console.error("Error checking free play usage:", error);
      return false; // On error, allow free play to avoid blocking users
    }
  }

  async recordFreePlayUsage(ipAddress: string, gameId: number): Promise<void> {
    try {
      await db.insert(freePlayUsage).values({
        ipAddress,
        gameId,
      });
    } catch (error) {
      console.error("Error recording free play usage:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();