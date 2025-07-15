import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin users table
// Sellers table (replaces admin users for peer-to-peer)
export const sellers = pgTable("sellers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  businessName: text("business_name"),
  
  // Seller profile
  profileDescription: text("profile_description"),
  profileImage: text("profile_image"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalGames: integer("total_games").notNull().default(0),
  totalSales: decimal("total_sales", { precision: 10, scale: 2 }).notNull().default("0"),
  
  // Stripe Connect
  stripeAccountId: text("stripe_account_id"),
  stripeOnboarded: boolean("stripe_onboarded").notNull().default(false),
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  isVerified: boolean("is_verified").notNull().default(false),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

// Keep admin users for platform administration
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

// Enhanced games table for peer-to-peer prize platform
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  category: text("category").notNull().default("collectibles"),
  gameType: text("game_type").notNull().default("draw"), // draw, wheel_spin
  prize: text("prize").notNull(),
  prizeValue: decimal("prize_value", { precision: 10, scale: 2 }).notNull(),
  prizeDescription: text("prize_description"),
  prizeImages: text("prize_images").array().notNull().default([]), // Multiple images
  prizeVideos: text("prize_videos").array().notNull().default([]), // Videos
  
  // Entry system
  entryPrice: decimal("entry_price", { precision: 10, scale: 2 }).notNull(),
  totalEntries: integer("total_entries").notNull(),
  entriesRemaining: integer("entries_remaining").notNull(),
  
  // Automated draw system
  drawTime: timestamp("draw_time").notNull(),
  isAutoFill: boolean("is_auto_fill").notNull().default(false),
  isDrawComplete: boolean("is_draw_complete").notNull().default(false),
  
  // Seller information
  sellerId: integer("seller_id").notNull(),
  sellerName: text("seller_name").notNull(),
  sellerEmail: text("seller_email").notNull(),
  sellerStripeAccount: text("seller_stripe_account"),
  
  // Compliance
  termsAccepted: boolean("terms_accepted").notNull().default(false),
  npnEntryUsed: boolean("npn_entry_used").notNull().default(false),
  
  // Status
  status: text("status").notNull().default("pending"), // pending, active, completed, cancelled
  isActive: boolean("is_active").notNull().default(false),
  emoji: text("emoji").notNull().default("🎁"),
  backgroundImage: text("background_image"),
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

// Enhanced players/entries table for peer-to-peer system
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  playerName: text("player_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  
  // Entry tracking
  entryCount: integer("entry_count").notNull().default(0),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).notNull().default("0"),
  isNpnEntry: boolean("is_npn_entry").notNull().default(false), // No Purchase Necessary entry
  
  // Game-specific data
  ownedNumbers: text("owned_numbers").array().notNull().default([]), // For wheel games
  selectedNumber: integer("selected_number"), // Last number selected in wheel spin
  
  // Player profile
  profileId: text("profile_id"), // Links to buyer profile
  referralCount: integer("referral_count").notNull().default(0),
  isWinner: boolean("is_winner").notNull().default(false),
  
  // Tracking
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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

// Spin results table - tracks each individual spin
export const spinResults = pgTable("spin_results", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  playerId: integer("player_id").notNull(),
  spunNumber: integer("spun_number").notNull(),
  isFreePlay: boolean("is_free_play").notNull().default(false),
  amountCharged: decimal("amount_charged", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Admin sessions for JWT alternative
export const adminSessions = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Game entries table for tracking individual entries
export const gameEntries = pgTable("game_entries", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  playerId: integer("player_id").notNull(),
  entryNumber: integer("entry_number").notNull(),
  isPaid: boolean("is_paid").notNull().default(false),
  isNpnEntry: boolean("is_npn_entry").notNull().default(false),
  paymentIntentId: text("payment_intent_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Buyer profiles for tracking across games
export const buyerProfiles = pgTable("buyer_profiles", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  totalEntries: integer("total_entries").notNull().default(0),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).notNull().default("0"),
  gamesWon: integer("games_won").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Notification logs
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id"),
  userId: integer("user_id"),
  userType: text("user_type").notNull().default("buyer"), // buyer, seller, admin
  message: text("message").notNull(),
  type: text("type").notNull().default("info"), // info, success, warning, error
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Schema definitions
// Sellers schema
export const insertSellerSchema = createInsertSchema(sellers).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true,
});

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

// Game entries schema
export const insertGameEntrySchema = createInsertSchema(gameEntries).omit({
  id: true,
  createdAt: true,
});

// Buyer profiles schema
export const insertBuyerProfileSchema = createInsertSchema(buyerProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertSpinResultSchema = createInsertSchema(spinResults).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type InsertSeller = z.infer<typeof insertSellerSchema>;
export type Seller = typeof sellers.$inferSelect;

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
export type InsertGameEntry = z.infer<typeof insertGameEntrySchema>;
export type GameEntry = typeof gameEntries.$inferSelect;

export type InsertBuyerProfile = z.infer<typeof insertBuyerProfileSchema>;
export type BuyerProfile = typeof buyerProfiles.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertSpinResult = z.infer<typeof insertSpinResultSchema>;
export type SpinResult = typeof spinResults.$inferSelect;

// Legacy compatibility
export const users = adminUsers;
export const insertUserSchema = insertAdminUserSchema;
export type InsertUser = InsertAdminUser;
export type User = AdminUser;
