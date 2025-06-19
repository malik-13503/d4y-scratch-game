import { 
  games, players, gameResults, adminUsers, wheelSegments, systemSettings, adminSessions, notifications,
  type Game, type InsertGame, type Player, type InsertPlayer, type GameResult, type InsertGameResult, 
  type AdminUser, type InsertAdminUser, type WheelSegment, type InsertWheelSegment,
  type SystemSetting, type InsertSystemSetting, type InsertNotification, type Notification
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
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

  // Session store
  sessionStore: any;

  // Ensure default admin user exists
  ensureDefaultAdminUser(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: any;

  constructor() {
    this.sessionStore = new MemStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

    this.initializeSampleData();
    // Initialize admin user asynchronously without blocking startup
    this.ensureDefaultAdminUser().catch(console.error);
  }

  private async initializeSampleData() {
    // Skip database initialization on startup to avoid blocking the server
    // Database operations will be handled when actually needed
    console.log("Database initialization skipped - will initialize on first use");
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
    const [player] = await db.insert(players).values({
      ...insertPlayer,
      email: insertPlayer.email || null,
      phone: insertPlayer.phone || null,
      selectedSegment: insertPlayer.selectedSegment || null,
      referralCount: insertPlayer.referralCount || 0,
      ipAddress: insertPlayer.ipAddress || null,
      userAgent: insertPlayer.userAgent || null,
    }).returning();
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
}

export const storage = new DatabaseStorage();