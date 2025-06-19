import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin users table
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

// Enhanced games table
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  gameType: text("game_type").notNull().default("number_draw"), // "wheel_spin" | "number_draw"
  prize: text("prize").notNull(),
  prizeValue: decimal("prize_value", { precision: 10, scale: 2 }).notNull(),
  prizeDescription: text("prize_description"),
  totalNumbers: integer("total_numbers").notNull().default(125),
  numbersLeft: integer("numbers_left").notNull(),
  maxParticipants: integer("max_participants"),
  maxWinners: integer("max_winners").notNull().default(1),
  entryFee: decimal("entry_fee", { precision: 10, scale: 2 }).notNull().default("0"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  isScheduled: boolean("is_scheduled").notNull().default(false),
  isFreePlay: boolean("is_free_play").notNull().default(false),
  emoji: text("emoji").notNull().default("🎮"),
  backgroundImage: text("background_image"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Wheel segments for wheel-type games
export const wheelSegments = pgTable("wheel_segments", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  label: text("label").notNull(),
  color: text("color").notNull(),
  weight: integer("weight").notNull().default(1),
  iconUrl: text("icon_url"),
  order: integer("order").notNull(),
});

// Enhanced players table
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  playerName: text("player_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  selectedNumber: integer("selected_number"),
  selectedSegment: text("selected_segment"),
  isWinner: boolean("is_winner").notNull().default(false),
  referralCount: integer("referral_count").notNull().default(0),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

// Game results with enhanced tracking
export const gameResults = pgTable("game_results", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  winningNumber: integer("winning_number"),
  winningSegment: text("winning_segment"),
  winnerId: integer("winner_id"),
  totalParticipants: integer("total_participants").notNull(),
  totalSpins: integer("total_spins").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

// System settings
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Admin sessions for JWT alternative
export const adminSessions = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Notification logs
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id"),
  playerId: integer("player_id"),
  type: text("type").notNull(), // "winner", "game_start", "game_end"
  message: text("message").notNull(),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  status: text("status").notNull().default("pending"), // "pending", "sent", "failed"
});

// Schema definitions
export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  numbersLeft: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWheelSegmentSchema = createInsertSchema(wheelSegments).omit({
  id: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  isWinner: true,
  joinedAt: true,
});

export const insertGameResultSchema = createInsertSchema(gameResults).omit({
  id: true,
  completedAt: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  sentAt: true,
});

// Type exports
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;
export type InsertWheelSegment = z.infer<typeof insertWheelSegmentSchema>;
export type WheelSegment = typeof wheelSegments.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;
export type InsertGameResult = z.infer<typeof insertGameResultSchema>;
export type GameResult = typeof gameResults.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Legacy compatibility
export const users = adminUsers;
export const insertUserSchema = insertAdminUserSchema;
export type InsertUser = InsertAdminUser;
export type User = AdminUser;
