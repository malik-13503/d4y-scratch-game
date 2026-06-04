import { pgTable, text, serial, integer, boolean, timestamp, decimal, json, varchar, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User accounts table for game players
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  password: text("password").notNull(),
  state: text("state"), // For state-based legal compliance
  isActive: boolean("is_active").notNull().default(true),
  cardOnFile: boolean("card_on_file").notNull().default(false),
  defaultCardId: integer("default_card_id"), // Reference to default payment card
  // Token system fields
  tokenBalance: integer("token_balance").notNull().default(0),
  totalTokensPurchased: integer("total_tokens_purchased").notNull().default(0),
  totalTokensUsed: integer("total_tokens_used").notNull().default(0),
  // Legacy spending fields (kept for historical data)
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).notNull().default("0"),
  totalWon: decimal("total_won", { precision: 10, scale: 2 }).notNull().default("0"),
  gamesPlayed: integer("games_played").notNull().default(0),
  gamesWon: integer("games_won").notNull().default(0),
  // Legal compliance fields
  acceptedTermsAt: timestamp("accepted_terms_at"),
  optOutPublicity: boolean("opt_out_publicity").notNull().default(false), // TN residents can opt out
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Payment cards table for multiple card support
export const paymentCards = pgTable("payment_cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  cardNonce: text("card_nonce"),
  cardLast4: text("card_last_4").notNull(),
  cardBrand: text("card_brand").notNull(),
  expiryMonth: integer("expiry_month"),
  expiryYear: integer("expiry_year"),
  cardholderName: text("cardholder_name"),
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

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

// User sessions table
export const userSessions = pgTable("user_sessions", {
  sid: varchar("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Payment transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  gameId: integer("game_id").notNull(),
  spinResultId: integer("spin_result_id"),
  paymentCardId: integer("payment_card_id"), // Reference to payment card used
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull(),
  paymentMethod: text("payment_method").notNull(),
  cardLast4: text("card_last_4"),
  cardBrand: text("card_brand"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Enhanced games table
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  gameType: text("game_type").notNull().default("wheel_spin"), // Only wheel_spin now
  prize: text("prize").notNull(),
  prizeValue: decimal("prize_value", { precision: 10, scale: 2 }).notNull(),
  prizeDescription: text("prize_description"),
  totalNumbers: integer("total_numbers").notNull().default(200),
  numbersLeft: integer("numbers_left").notNull(),
  // Token system fields
  tokenCostPerEntry: integer("token_cost_per_entry").notNull().default(10), // Tokens needed to enter
  tokenThreshold: integer("token_threshold").notNull().default(4000), // Total tokens needed to close game
  tokensCollected: integer("tokens_collected").notNull().default(0), // Tokens collected so far
  targetRevenue: decimal("target_revenue", { precision: 10, scale: 2 }).notNull().default("0"), // Admin-set revenue target; tokenThreshold is derived from this
  // Legacy free play fields (kept for backward compatibility)
  freePlayStart: integer("free_play_start").notNull().default(151), // Free play numbers start
  freePlayEnd: integer("free_play_end").notNull().default(200), // Free play numbers end  

  maxParticipants: integer("max_participants"),
  maxWinners: integer("max_winners").notNull().default(1),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  isScheduled: boolean("is_scheduled").notNull().default(false),
  emoji: text("emoji").notNull().default("🎮"),
  prizeImageUrl: text("prize_image_url"), // New field for real prize images
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

// Enhanced players table (now linked to users)
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Link to users table
  gameId: integer("game_id").notNull(),
  playerName: text("player_name").notNull(),
  ownedNumbers: text("owned_numbers").array().notNull().default([]), // Numbers player owns
  selectedNumber: integer("selected_number"), // Last number selected in wheel spin
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).notNull().default("0"),
  freeSpins: integer("free_spins").notNull().default(0),
  referralCount: integer("referral_count").notNull().default(0),
  isWinner: boolean("is_winner").notNull().default(false),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Legal compliance logs for record keeping
export const complianceLogs = pgTable("compliance_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // Allow null for anonymous free plays
  gameId: integer("game_id"),
  logType: text("log_type").notNull(), // 'winner_selection', 'entry_record', 'tax_document'
  details: json("details").notNull(),
  retentionUntil: timestamp("retention_until").notNull(), // 2-4 years from creation
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Track free play usage by IP address to prevent abuse (kept for legacy)
export const freePlayUsage = pgTable("free_play_usage", {
  id: serial("id").primaryKey(),
  ipAddress: text("ip_address").notNull(),
  gameId: integer("game_id").notNull().references(() => games.id),
  usedAt: timestamp("used_at").notNull().defaultNow(),
});

// Token transactions table - tracks token purchases and usage
export const tokenTransactions = pgTable("token_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  transactionType: text("transaction_type").notNull(), // 'purchase', 'game_entry', 'refund', 'bonus'
  amount: integer("amount").notNull(), // Number of tokens (positive for purchase/bonus, negative for spending)
  gameId: integer("game_id"), // Game ID if tokens were used for game entry
  paymentCardId: integer("payment_card_id"),
  dollarAmount: decimal("dollar_amount", { precision: 10, scale: 2 }),
  description: text("description").notNull(), // Description of the transaction
  status: text("status").notNull().default("completed"), // 'pending', 'completed', 'failed', 'refunded'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User free entries table - tracks free entries per user per game (replacing IP-based system)
export const userFreeEntries = pgTable("user_free_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  gameId: integer("game_id").notNull().references(() => games.id),
  usedAt: timestamp("used_at").notNull().defaultNow(),
  ipAddress: text("ip_address"), // Optional for tracking
  userAgent: text("user_agent"), // Optional for tracking
}, (table) => ({
  uniqueUserGameFreeEntry: uniqueIndex('unique_user_game_free_entry').on(table.userId, table.gameId)
}));

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

// Track claimed numbers per game to prevent duplicates
export const claimedNumbers = pgTable("claimed_numbers", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  number: integer("number").notNull(),
  userId: integer("user_id").notNull(),
  claimedAt: timestamp("claimed_at").notNull().defaultNow(),
});

// Pending payment submissions — manual approval flow
export const pendingPayments = pgTable("pending_payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  dollarAmount: decimal("dollar_amount", { precision: 10, scale: 2 }).notNull(),
  creditsAmount: integer("credits_amount").notNull(), // Credits to be awarded on approval
  paymentMethod: text("payment_method").notNull(), // 'cashapp' | 'venmo' | 'chime' | 'applepay'
  paymentName: text("payment_name").notNull(), // Sender's name on payment
  paymentHandle: text("payment_handle").notNull(), // Sender's handle/tag/email
  status: text("status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected'
  notes: text("notes"), // Staff notes or rejection reason
  processedByAdminId: integer("processed_by_admin_id"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
});

// Daily token claims — one per user per day
export const dailyTokenClaims = pgTable("daily_token_claims", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  claimedAt: timestamp("claimed_at").notNull().defaultNow(),
});

// Promo codes
export const promoCodes = pgTable("promo_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  tokenAmount: integer("token_amount").notNull(),
  description: text("description"),
  expiresAt: timestamp("expires_at"),
  maxUses: integer("max_uses"), // null = unlimited
  usesCount: integer("uses_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Pending payment schema and types
export const insertPendingPaymentSchema = createInsertSchema(pendingPayments).omit({
  id: true,
  submittedAt: true,
  processedAt: true,
  processedByAdminId: true,
  status: true,
  notes: true,
});
export type PendingPayment = typeof pendingPayments.$inferSelect;
export type InsertPendingPayment = z.infer<typeof insertPendingPaymentSchema>;

// Promo code redemptions — one per user per code
export const promoCodeRedemptions = pgTable("promo_code_redemptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  promoCodeId: integer("promo_code_id").notNull(),
  redeemedAt: timestamp("redeemed_at").notNull().defaultNow(),
}, (table) => ({
  uniqueUserCode: uniqueIndex("unique_user_promo_code").on(table.userId, table.promoCodeId),
}));

// Schema definitions
export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
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
}).extend({
  title: z.string().optional(),
});

export const insertSpinResultSchema = createInsertSchema(spinResults).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

// Free play usage types
export type FreePlayUsage = typeof freePlayUsage.$inferSelect;
export type InsertFreePlayUsage = typeof freePlayUsage.$inferInsert;
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
export type InsertSpinResult = z.infer<typeof insertSpinResultSchema>;
export type SpinResult = typeof spinResults.$inferSelect;

// User schema and types
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type ClaimedNumber = typeof claimedNumbers.$inferSelect;

// Payment card schema and types
export const insertPaymentCardSchema = createInsertSchema(paymentCards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PaymentCard = typeof paymentCards.$inferSelect;
export type InsertPaymentCard = z.infer<typeof insertPaymentCardSchema>;

// Token transaction schema and types
export const insertTokenTransactionSchema = createInsertSchema(tokenTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type InsertTokenTransaction = z.infer<typeof insertTokenTransactionSchema>;

// User free entry schema and types
export const insertUserFreeEntrySchema = createInsertSchema(userFreeEntries).omit({
  id: true,
  usedAt: true,
});

export type UserFreeEntry = typeof userFreeEntries.$inferSelect;
export type InsertUserFreeEntry = z.infer<typeof insertUserFreeEntrySchema>;

// Daily token claim schema and types
export const insertDailyTokenClaimSchema = createInsertSchema(dailyTokenClaims).omit({
  id: true,
  claimedAt: true,
});
export type DailyTokenClaim = typeof dailyTokenClaims.$inferSelect;
export type InsertDailyTokenClaim = z.infer<typeof insertDailyTokenClaimSchema>;

// Promo code schema and types
export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({
  id: true,
  usesCount: true,
  createdAt: true,
});
export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;

// Promo code redemption schema and types
export const insertPromoCodeRedemptionSchema = createInsertSchema(promoCodeRedemptions).omit({
  id: true,
  redeemedAt: true,
});
export type PromoCodeRedemption = typeof promoCodeRedemptions.$inferSelect;
export type InsertPromoCodeRedemption = z.infer<typeof insertPromoCodeRedemptionSchema>;
